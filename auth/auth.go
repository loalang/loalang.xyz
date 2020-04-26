package auth

import (
	"bytes"
	"cloud.google.com/go/storage"
	"context"
	"database/sql"
	"errors"
	"github.com/golang/protobuf/proto"
	"github.com/golang/protobuf/ptypes/empty"
	"github.com/golang/protobuf/ptypes/wrappers"
	"github.com/google/uuid"
	"github.com/loalang/loalang.xyz/auth/common/events"
	"google.golang.org/grpc"
	"image"
	"image/jpeg"
	"image/png"
	"os"
	"strings"
	"time"
)

func NewServer() (*grpc.Server, error) {
	db, err := sql.Open("postgres", os.Getenv("POSTGRES_URL"))
	if err != nil {
		return nil, err
	}
	eventsClient := events.NewClient(db)

	gcs, err := storage.NewClient(context.Background())
	if err != nil {
		return nil, err
	}

	server := grpc.NewServer()
	RegisterAuthenticationServer(server, &authentication{
		userUpdated:    eventsClient.Produce(events.ProducerOptions{Topic: "user-updated"}),
		db:             db,
		avatarUploader: NewAvatarUploader(gcs.Bucket("cdn.loalang.xyz")),
	})

	return server, nil
}

type authentication struct {
	userUpdated    chan<- proto.Message
	db             *sql.DB
	avatarUploader *AvatarUploader
}

func (a *authentication) Health(ctx context.Context, _ *empty.Empty) (*Healthiness, error) {
	return &Healthiness{
		Healthy: a.db.PingContext(ctx) == nil,
	}, nil
}

func (a *authentication) SignUp(ctx context.Context, req *SignUpRequest) (*SignedInUser, error) {
	if err := ValidateEmail(req.Email); err != nil {
		return nil, err
	}
	if err := ValidatePassword(req.Password); err != nil {
		return nil, err
	}

	id := uuid.New()
	password := Hash(req.Password)
	signedUpAt := time.Now()
	_, err := a.db.ExecContext(ctx, `
		insert into users(id, username, email, password, signed_up_at)
		values ($1, $2, $3, $4, $5)
	`, id, req.Username, req.Email, password, signedUpAt)
	if err != nil {
		switch {
		case strings.Contains(err.Error(), "users_username_key"),
			strings.Contains(err.Error(), "users_email_key"):
			return nil, errors.New("email or username in use")
		default:
			return nil, errors.New("invalid credentials")
		}
	}
	idBytes, _ := id.MarshalBinary()
	user := &User{
		Id:         idBytes,
		Username:   req.Username,
		Email:      req.Email,
		SignedUpAt: floatFromTime(signedUpAt),
	}
	token, err := IssueToken(user)
	if err != nil {
		return nil, err
	}

	a.userUpdated <- &UserUpdated{
		Id:       user.Id,
		Username: user.Username,
	}

	return &SignedInUser{
		Token: token,
		User:  user,
	}, nil
}

func (a *authentication) SignIn(ctx context.Context, req *SignInRequest) (*SignedInUser, error) {
	password := Hash(req.Password)
	userRow := a.db.QueryRowContext(ctx, `
		select id, username, email, signed_up_at, coalesce(name, '') from users
		where (username = $1 or email = $1) and password = $2
	`, req.UsernameOrEmail, password)
	var id uuid.UUID
	var username string
	var email string
	var signedUpAt time.Time
	var name string

	err := userRow.Scan(&id, &username, &email, &signedUpAt, &name)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}
	idBytes, _ := id.MarshalBinary()
	user := &User{
		Id:         idBytes,
		Username:   username,
		Email:      email,
		Name:       name,
		SignedUpAt: 0,
	}
	token, err := IssueToken(user)
	if err != nil {
		return nil, err
	}

	return &SignedInUser{Token: token, User: user}, nil
}

func (a *authentication) Lookup(ctx context.Context, req *LookupRequest) (*User, error) {
	token, err := UnpackVerifiedToken(req.Token)
	if err != nil {
		return nil, err
	}

	id, err := uuid.FromBytes(token.Id)
	if err != nil {
		return nil, err
	}

	userRow := a.db.QueryRowContext(ctx, `
		select username, email, signed_up_at, coalesce(name, ''), coalesce(avatar_512_url, ''), coalesce(avatar_256_url, ''), coalesce(avatar_128_url, '') from users
		where id = $1
	`, id)
	var username string
	var email string
	var signedUpAt time.Time
	var name string
	var avatar ImageSourceSet

	err = userRow.Scan(&username, &email, &signedUpAt, &name, &avatar.Large, &avatar.Medium, &avatar.Small)
	if err != nil {
		return nil, errors.New("not authenticated")
	}

	idBytes, _ := id.MarshalBinary()
	user := &User{
		Id:         idBytes,
		Username:   username,
		Email:      email,
		Name:       name,
		SignedUpAt: 0,
	}

	if avatar.Small != "" {
		user.Avatar = &avatar
	}

	return user, nil
}

func (a *authentication) DeleteAccount(ctx context.Context, req *DeleteAccountRequest) (*AccountDeletionConfirmation, error) {
	token, err := UnpackVerifiedToken(req.Token)
	if err != nil {
		return nil, err
	}

	id, err := uuid.FromBytes(token.Id)
	if err != nil {
		return nil, err
	}

	row := a.db.QueryRowContext(ctx, "delete from users where id = $1 returning username", id)
	var username string
	err = row.Scan(&username)
	if err != nil {
		return nil, err
	}

	a.userUpdated <- &UserUpdated{Id: token.Id, Username: username, Deleted: true}

	return &AccountDeletionConfirmation{Success: true}, nil
}

func (a *authentication) UpdateUser(ctx context.Context, req *UpdateUserRequest) (*User, error) {
	token, err := UnpackVerifiedToken(req.Token)
	if err != nil {
		return nil, err
	}

	id, err := uuid.FromBytes(token.Id)
	if err != nil {
		return nil, err
	}

	var password []byte
	if req.Password != nil {
		password = Hash(req.Password.Value)
	}
	var currentPassword []byte
	if req.CurrentPassword != nil {
		currentPassword = Hash(req.CurrentPassword.Value)
	}

	if len(password) > 0 && len(currentPassword) == 0 {
		return nil, errors.New("current password must be verified to set a new one")
	}

	var avatar *Avatar
	if req.Avatar != nil {
		var img image.Image
		switch req.AvatarFormat {
		case ImageFormat_JPEG:
			img, err = jpeg.Decode(bytes.NewReader(req.Avatar))
		case ImageFormat_PNG:
			img, err = png.Decode(bytes.NewReader(req.Avatar))
		}
		if err != nil {
			return nil, err
		}
		avatar, err = a.avatarUploader.UploadAvatar(img)
		if err != nil {
			return nil, err
		}
	}

	row := a.db.QueryRowContext(ctx, `
		update users set
			name = coalesce($1, name),
			username = case when coalesce($2, '') = '' then username else $2 end,
			email = case when coalesce($3, '') = '' then email else $3 end,
			avatar_512_url = coalesce($7, avatar_512_url),
			avatar_256_url = coalesce($8, avatar_256_url),
			avatar_128_url = coalesce($9, avatar_128_url),
			password = case when $4 = ''::bytea then password else $4 end
		where id = $5 and password =
			case
				when $6 = ''::bytea then password
				else $6
			end
		returning username, email, coalesce(name, ''), signed_up_at, coalesce(avatar_512_url, ''), coalesce(avatar_256_url, ''), coalesce(avatar_128_url, '')
	`, unwrap(req.Name), unwrap(req.Username), unwrap(req.Email), password, id, currentPassword, avatar.Url512(), avatar.Url256(), avatar.Url128())

	var username string
	var email string
	var name string
	var signedUpAt time.Time
	var avatarUrls ImageSourceSet

	err = row.Scan(&username, &email, &name, &signedUpAt, &avatarUrls.Large, &avatarUrls.Medium, &avatarUrls.Small)
	if err != nil {
		return nil, err
	}

	user := &User{
		Id:         token.Id,
		Username:   username,
		Email:      email,
		Name:       name,
		Avatar:     &avatarUrls,
		SignedUpAt: floatFromTime(signedUpAt),
	}

	a.userUpdated <- &UserUpdated{
		Id:       user.Id,
		Username: user.Username,
		Name:     user.Name,
	}

	return user, nil
}

func unwrap(value *wrappers.StringValue) (out sql.NullString) {
	if value != nil {
		out.String = value.Value
		out.Valid = true
	}
	return
}

func (a *authentication) FindUser(ctx context.Context, req *FindUserRequest) (*User, error) {
	row := a.db.QueryRowContext(ctx, `
		select id, email, signed_up_at, coalesce(name, ''), coalesce(avatar_512_url, ''), coalesce(avatar_256_url, ''), coalesce(avatar_128_url, '') from users
		where username = $1
	`, req.Username)

	var uid uuid.UUID
	var email string
	var signedUpAt time.Time
	var name string
	var avatar ImageSourceSet

	err := row.Scan(&uid, &email, &signedUpAt, &name, &avatar.Large, &avatar.Medium, &avatar.Small)
	if err != nil {
		return nil, err
	}

	id, _ := uid.MarshalBinary()

	return &User{
		Id:         id,
		Username:   req.Username,
		Email:      email,
		Name:       name,
		Avatar:     &avatar,
		SignedUpAt: floatFromTime(signedUpAt),
	}, nil
}

func UnpackVerifiedToken(bytes []byte) (*Token, error) {
	token, err := UnpackToken(bytes)
	if err != nil {
		return nil, err
	}
	if token.IsExpired() {
		return nil, errors.New("token has expired")
	}
	return token, nil
}

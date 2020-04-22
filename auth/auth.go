package auth

import (
	"cloud.google.com/go/storage"
	"context"
	"database/sql"
	"errors"
	"fmt"
	"github.com/golang/protobuf/proto"
	"github.com/golang/protobuf/ptypes/empty"
	"github.com/google/uuid"
	"github.com/loalang/loalang.xyz/auth/common/events"
	"google.golang.org/grpc"
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
		userUpdated: eventsClient.Produce(events.ProducerOptions{Topic: "user-updated"}),
		db:          db,
		storage:     gcs.Bucket(os.Getenv("cdn.loalang.xyz")),
	})

	return server, nil
}

type authentication struct {
	userUpdated chan<- proto.Message
	db          *sql.DB
	storage     *storage.BucketHandle
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
		select username, email, signed_up_at, coalesce(avatar_url, ''), coalesce(name, '') from users
		where id = $1
	`, id)
	var username string
	var email string
	var signedUpAt time.Time
	var avatarUrl string
	var name string

	err = userRow.Scan(&username, &email, &signedUpAt, &avatarUrl, &name)
	if err != nil {
		return nil, errors.New("not authenticated")
	}
	idBytes, _ := id.MarshalBinary()
	return &User{
		Id:         idBytes,
		Username:   username,
		Email:      email,
		Name:       name,
		SignedUpAt: 0,
		AvatarUrl:  avatarUrl,
	}, nil
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
	if req.Password != "" {
		password = Hash(req.Password)
	}
	var currentPassword []byte
	if req.CurrentPassword != "" {
		currentPassword = Hash(req.CurrentPassword)
	}

	if len(password) > 0 && len(currentPassword) == 0 {
		return nil, errors.New("current password must be verified to set a new one")
	}

	var avatarUrl string
	if req.Avatar != nil {
		var extension string
		switch req.AvatarFormat {
		case ImageFormat_JPEG:
			extension = "jpg"
		case ImageFormat_PNG:
			extension = "png"
		}
		avatar := a.storage.Object(fmt.Sprintf("avatars/%v.%s", uuid.New(), extension))
		n, err := avatar.NewWriter(ctx).Write(req.Avatar)
		if err != nil {
			return nil, err
		}
		if n < len(req.Avatar) {
			return nil, errors.New("failed to upload avatar")
		}
		avatarUrl = fmt.Sprintf("https://%s/%s", avatar.BucketName(), avatar.ObjectName())
	}

	row := a.db.QueryRowContext(ctx, `
		update users set
			name = case when coalesce($1, '') = '' then name else $1 end,
			username = case when coalesce($2, '') = '' then username else $2 end,
			email = case when coalesce($3, '') = '' then email else $3 end,
			avatar_url = case when coalesce($4, '') = '' then avatar_url else $4 end,
			password = coalesce($5, password)
		where id = $6 and password = coalesce($7, password)
		returning username, email, coalesce(name, ''), coalesce(avatar_url, ''), signed_up_at
	`, req.Name, req.Username, req.Email, avatarUrl, password, id, currentPassword)

	var username string
	var email string
	var name string
	var signedUpAt time.Time

	err = row.Scan(&username, &email, &name, &avatarUrl, &signedUpAt)
	if err != nil {
		return nil, err
	}

	user := &User{
		Id:         token.Id,
		Username:   username,
		Email:      email,
		Name:       name,
		AvatarUrl:  avatarUrl,
		SignedUpAt: floatFromTime(signedUpAt),
	}

	a.userUpdated <- &UserUpdated{
		Id:       user.Id,
		Username: user.Username,
		Name:     user.Name,
	}

	return user, nil
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

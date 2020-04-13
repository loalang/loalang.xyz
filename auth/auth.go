package auth

import (
	"context"
	"database/sql"
	"errors"
	"github.com/golang/protobuf/proto"
	"github.com/google/uuid"
	"github.com/loalang/loalang.xyz/auth/common/events"
	"google.golang.org/grpc"
	"os"
	"time"
)

func NewServer() (*grpc.Server, error) {
	db, err := sql.Open("postgres", os.Getenv("POSTGRES_URL"))
	if err != nil {
		return nil, err
	}
	eventsClient := events.NewClient(db)

	server := grpc.NewServer()
	RegisterAuthenticationServer(server, &authentication{
		userUpdated: eventsClient.Produce(events.ProducerOptions{Topic: "user-updated"}),
		db:          db,
	})

	return server, nil
}

type authentication struct {
	userUpdated chan<- proto.Message
	db          *sql.DB
}

func (a *authentication) SignUp(ctx context.Context, req *SignUpRequest) (*LoggedInUser, error) {
	id := uuid.New()
	password := Hash(req.Password)
	signedUpAt := time.Now()
	_, err := a.db.ExecContext(ctx, `
		insert into users(id, username, email, password, signed_up_at)
		values ($1, $2, $3, $4, $5)
	`, id, req.Username, req.Email, password, signedUpAt)
	if err != nil {
		return nil, err
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

	a.userUpdated <- &UserUpdated{Id: user.Id, Username: user.Username, Deleted: false}

	return &LoggedInUser{
		Token: token,
		User:  user,
	}, nil
}

func (a *authentication) LogIn(ctx context.Context, req *LogInRequest) (*LoggedInUser, error) {
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
		return nil, err
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

	return &LoggedInUser{Token: token, User: user}, nil
}

func (a *authentication) Lookup(ctx context.Context, req *LookupRequest) (*User, error) {
	token, err := UnpackToken(req.Token)
	if err != nil {
		return nil, err
	}
	if token.IsExpired() {
		return nil, errors.New("token has expired")
	}

	id, err := uuid.FromBytes(token.Id)
	if err != nil {
		return nil, err
	}

	userRow := a.db.QueryRowContext(ctx, `
		select username, email, signed_up_at, coalesce(name, '') from users
		where id = $1
	`, id)
	var username string
	var email string
	var signedUpAt time.Time
	var name string

	err = userRow.Scan(&username, &email, &signedUpAt, &name)
	if err != nil {
		return nil, err
	}
	idBytes, _ := id.MarshalBinary()
	return &User{
		Id:         idBytes,
		Username:   username,
		Email:      email,
		Name:       name,
		SignedUpAt: 0,
	}, nil
}

func (a *authentication) DeleteAccount(ctx context.Context, req *DeleteAccountRequest) (*AccountDeletionConfirmation, error) {
	token, err := UnpackToken(req.Token)
	if err != nil {
		return nil, err
	}
	if token.IsExpired() {
		return nil, errors.New("token has expired")
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

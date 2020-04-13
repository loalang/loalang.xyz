package pkg

import (
	"context"
	"database/sql"
	"github.com/golang/protobuf/proto"
	"github.com/loalang/loalang.xyz/pkg/common/events"
	"google.golang.org/grpc"
	"os"
)

func NewServer() (*grpc.Server, error) {
	server := grpc.NewServer()
	db, err := sql.Open("postgres", os.Getenv("POSTGRES_URL"))
	if err != nil {
		return nil, err
	}
	eventsClient := events.NewClient(db)

	RegisterPackageManagerServer(server, &packageManager{
		events: eventsClient.Produce(events.ProducerOptions{ Topic: "test-topic" }),
	})
	return server, nil
}

type packageManager struct {
	events chan<- proto.Message
}

func (s *packageManager) Test(context context.Context, request *TestRequest) (*TestResponse, error) {
	s.events <- &TestTopic{
		Value: "Hello",
	}
	return &TestResponse{
		Value: "Response!",
	}, nil
}

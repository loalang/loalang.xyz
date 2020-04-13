package pkg

import (
	"context"
	"github.com/golang/protobuf/proto"
	"github.com/loalang/loalang.xyz/pkg/common/events"
	"google.golang.org/grpc"
)

func NewServer() (*grpc.Server, error) {
	server := grpc.NewServer()
	e, err := events.NewClient()
	if err != nil {
		return nil, err
	}
	RegisterPackageManagerServer(server, &packageManager{
		events: e.Produce(events.ProducerOptions{
			Topic: "test-topic",
		}),
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

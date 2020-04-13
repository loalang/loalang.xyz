package search

import (
	"github.com/loalang/loalang.xyz/search/common/events"
	"github.com/loalang/loalang.xyz/search/pkg"
	"google.golang.org/grpc"
	"log"
	"reflect"
)

var users = []*User{
	{
		Username: "emilbroman",
	},
}

func NewServer() (*grpc.Server, error) {
	e, err := events.NewClient()
	if err != nil {
		return nil, err
	}

	go func() {
		panic(e.Consume(events.ConsumerOptions{
			Topic:       "test-topic",
			Group:       "search-ingestion",
			MessageType: reflect.TypeOf(pkg.TestTopic{}),
		}, func(events []events.Event) error {
			for _, event := range events {
				user := &User{
					Username: event.Payload.(*pkg.TestTopic).Value,
				}
				users = append(users, user)
			}
			return nil
		}))
	}()

	server := grpc.NewServer()
	RegisterSearchServer(server, &search{})

	return server, nil
}

type search struct {
}

func (s *search) Search(req *SearchRequest, stream Search_SearchServer) (err error) {
	log.Println("search for", req.Term)
	for _, user := range users {
		err = stream.Send(&SearchResponse{
			Result: &SearchResponse_UserResult{
				UserResult: user,
			},
		})
		if err != nil {
			return err
		}
	}
	err = stream.Send(&SearchResponse{
		Result: &SearchResponse_ClassResult{
			ClassResult: &Class{
				QualifiedName: "Some/Class/Over/Here",
			},
		},
	})
	if err != nil {
		return err
	}
	return nil
}

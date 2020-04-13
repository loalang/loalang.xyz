package search

import (
	"database/sql"
	"github.com/loalang/loalang.xyz/search/common/events"
	"github.com/loalang/loalang.xyz/search/pkg"
	"google.golang.org/grpc"
	"log"
	"os"
	"reflect"
)

var users = []*User{
	{
		Username: "emilbroman",
	},
}

func NewServer() (*grpc.Server, error) {
	db, err := sql.Open("postgres", os.Getenv("POSTGRES_URL"))
	if err != nil {
		return nil, err
	}
	eventsClient := events.NewClient(db)

	go func() {
		panic(eventsClient.Consume(events.ConsumerOptions{
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

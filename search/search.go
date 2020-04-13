package search

import (
	"database/sql"
	algolia "github.com/algolia/algoliasearch-client-go/v3/algolia/search"
	"github.com/google/uuid"
	"github.com/loalang/loalang.xyz/search/auth"
	"github.com/loalang/loalang.xyz/search/common/events"
	"google.golang.org/grpc"
	"os"
	"reflect"
)

func NewServer() (*grpc.Server, error) {
	db, err := sql.Open("postgres", os.Getenv("POSTGRES_URL"))
	if err != nil {
		return nil, err
	}
	eventsClient := events.NewClient(db)

	algoliaClient := algolia.NewClient(os.Getenv("ALGOLIA_APP_ID"), os.Getenv("ALGOLIA_API_KEY"))
	index := algoliaClient.InitIndex(os.Getenv("ALGOLIA_INDEX"))

	go func() {
		panic(eventsClient.Consume(events.ConsumerOptions{
			Topic:       "user-updated",
			Group:       "search-ingestion",
			MessageType: reflect.TypeOf(auth.UserUpdated{}),
		}, func(events []events.Event) error {
			for _, event := range events {
				e := event.Payload.(*auth.UserUpdated)
				id, err := uuid.FromBytes(e.Id)
				if err != nil {
					return err
				}
				if e.Deleted {
					_, err := index.DeleteObject(id.String())
					if err != nil {
						return err
					}
				} else {
					user := map[string]interface{}{
						"objectID": id.String(),
						"__type": "USER",
						"username": e.Username,
					}

					_, err := index.SaveObject(user)
					if err != nil {
						return err
					}
				}
			}
			return nil
		}))
	}()

	server := grpc.NewServer()
	RegisterSearchServer(server, &search{index: index})

	return server, nil
}

type search struct {
	index *algolia.Index
}

func (s *search) Search(req *SearchRequest, stream Search_SearchServer) error {
	res, err := s.index.Search(req.Term, stream.Context())
	if err != nil {
		return err
	}
	for _, hit := range res.Hits {
		uid, err := uuid.Parse(hit["objectID"].(string))
		if err != nil {
			return err
		}
		id, _ := uid.MarshalBinary()
		switch hit["__type"] {
		case "USER":
			err = stream.Send(&SearchResponse{
				Result: &SearchResponse_UserResult{
					UserResult: &User{
						Id:       id,
						Username: hit["username"].(string),
					},
				},
			})
		}
		if err != nil {
			return err
		}
	}
	return nil
}

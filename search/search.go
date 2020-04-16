package search

import (
	"database/sql"
	"fmt"
	algolia "github.com/algolia/algoliasearch-client-go/v3/algolia/search"
	"github.com/google/uuid"
	"github.com/loalang/loalang.xyz/search/auth"
	"github.com/loalang/loalang.xyz/search/common/events"
	"github.com/loalang/loalang.xyz/search/pkg"
	"google.golang.org/grpc"
	"log"
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
					log.Printf("DELETING %s (%s)", e.Username, id.String())
					_, err := index.DeleteObject(id.String())
					if err != nil {
						return err
					}
				} else {
					log.Printf("INGESTING %s (%s)", e.Username, id.String())
					user := map[string]interface{}{
						"objectID": id.String(),
						"__type":   "USER",
						"username": e.Username,
						"name":     e.Name,
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

	go func() {
		panic(eventsClient.Consume(events.ConsumerOptions{
			Topic:       "release-published",
			Group:       "search-ingestion",
			MessageType: reflect.TypeOf(pkg.ReleasePublished{}),
		}, func(events []events.Event) error {
			for _, event := range events {
				e := event.Payload.(*pkg.ReleasePublished)

				if err != nil {
					return err
				}
				pack := map[string]interface{}{
					"objectID":      e.Release.Package.QualifiedName,
					"__type":        "PACKAGE",
					"qualifiedName": e.Release.Package.QualifiedName,
					"latestVersion": fmt.Sprintf(
						"%d.%d.%d",
						e.Release.Version.Major,
						e.Release.Version.Minor,
						e.Release.Version.Patch,
					),
				}

				_, err := index.SaveObject(pack)
				if err != nil {
					return err
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
		switch hit["__type"] {
		case "USER":
			uid, err := uuid.Parse(hit["objectID"].(string))
			if err != nil {
				return err
			}
			id, _ := uid.MarshalBinary()
			user := &User{
				Id:       id,
				Username: hit["username"].(string),
			}
			if name, ok := hit["name"]; ok {
				user.Name = name.(string)
			}
			err = stream.Send(&SearchResponse{
				Result: &SearchResponse_UserResult{
					UserResult: user,
				},
			})
		case "PACKAGE":
			err = stream.Send(&SearchResponse{
				Result: &SearchResponse_PackageResult{
					PackageResult: &Package{
						QualifiedName: hit["qualifiedName"].(string),
						LatestVersion: hit["latestVersion"].(string),
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

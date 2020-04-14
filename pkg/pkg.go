package pkg

import (
	"context"
	"database/sql"
	"github.com/golang/protobuf/proto"
	"github.com/loalang/loalang.xyz/pkg/common/events"
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
	RegisterPackageManagerServer(server, &packageManager{
		releasePublished: eventsClient.Produce(events.ProducerOptions{Topic: "release-published"}),
	})
	return server, nil
}

type packageManager struct {
	releasePublished chan<- proto.Message
}

func (p *packageManager) PublishRelease(ctx context.Context, req *PublishReleaseRequest) (*Release, error) {
	release := &Release{
		Package: &Package{
			QualifiedName: req.QualifiedPackageName,
			Authors:       [][]byte{req.Publisher},
		},
		Version:                 req.Version,
		TarballUrl:              req.TarballUrl,
		PublishedAt:             float64(time.Now().UTC().Unix()),
		Dependencies:            []*Dependency{},
		DevelopmentDependencies: []*Dependency{},
		Tags:                    []string{},
		Readme:                  "",
		Website:                 "",
		Repository:              "",
		License:                 "",
	}

	p.releasePublished <- &ReleasePublished{
		Release: release,
	}

	return release, nil
}

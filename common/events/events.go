package events

import (
	"database/sql"
	"github.com/golang/protobuf/proto"
	_ "github.com/lib/pq"
	"log"
	"reflect"
	"time"
)

type Client struct {
	db *sql.DB
}

func NewClient(db *sql.DB) *Client {
	return &Client{db: db}
}

type ConsumerOptions struct {
	Topic       string
	Group       string
	MessageType reflect.Type
}

type Event struct {
	Timestamp time.Time
	Payload   proto.Message
}

func (c *Client) Consume(options ConsumerOptions, cb func([]Event) error) error {
	_, err := c.db.Exec(
		"insert into consumer_groups (name, topic) values ($1, $2) on conflict do nothing",
		options.Group,
		options.Topic,
	)

	if err != nil {
		return err
	}

	pageSize := 10
	for {
		tx, err := c.db.Begin()
		if err != nil {
			return err
		}
		offsetRow := c.db.QueryRow(
			"select \"offset\" from consumer_groups where name = $1 and topic = $2 for update",
			options.Group,
			options.Topic,
		)
		var offset uint64
		err = offsetRow.Scan(&offset)
		if err != nil {
			tx.Rollback()
			return err
		}
		rows, err := c.db.Query(`
				select timestamp, payload from events
                where topic = $1
                offset $2
                limit $3
			`, options.Topic, offset, pageSize)
		if err != nil {
			tx.Rollback()
			return err
		}
		var events []Event
		for rows.Next() {
			var timestamp time.Time
			var payload []byte
			err = rows.Scan(&timestamp, &payload)
			if err != nil {
				log.Println(err)
				continue
			}
			message := (reflect.New(options.MessageType).Interface()).(proto.Message)
			err = proto.Unmarshal(payload, message)
			if err != nil {
				log.Println(err)
				continue
			}
			events = append(events, Event{
				Timestamp: timestamp,
				Payload:   message,
			})
		}

		_, err = c.db.Exec(`
				update consumer_groups
				set "offset" = $1
				where name = $2
				and topic = $3
			`, offset+uint64(len(events)), options.Group, options.Topic)

		if err != nil {
			tx.Rollback()
			return err
		}

		err = cb(events)

		if err != nil {
			tx.Rollback()
			return err
		}

		err = tx.Commit()

		if err != nil {
			return err
		}
	}
}

type ProducerOptions struct {
	Topic string
}

func (c *Client) Produce(options ProducerOptions) chan<- proto.Message {
	messages := make(chan proto.Message)
	go func() {
		for message := range messages {
			payload, err := proto.Marshal(message)
			if err != nil {
				log.Println(err)
				continue
			}

			_, err = c.db.Exec(
				"insert into events (payload, timestamp, topic) values ($1, $2, $3)",
				payload,
				time.Now(),
				options.Topic,
			)

			if err != nil {
				log.Println(err)
			}
		}
	}()
	return messages
}

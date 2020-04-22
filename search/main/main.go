package main

import (
	"fmt"
	"github.com/loalang/loalang.xyz/search"
	"net"
)

func main() {
	socket, err := net.Listen("tcp", ":9093")
	if err != nil {
		panic(err)
	}

	server, err := search.NewServer()
	if err != nil {
		panic(err)
	}

	fmt.Println("Started!")

	server.Serve(socket)
}

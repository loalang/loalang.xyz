package main

import (
	"fmt"
	"github.com/loalang/loalang.xyz/auth"
	"net"
)

func main() {
	socket, err := net.Listen("tcp", ":9094")
	if err != nil {
		panic(err)
	}

	server, err := auth.NewServer()
	if err != nil {
		panic(err)
	}

	fmt.Println("Started!")

	server.Serve(socket)
}

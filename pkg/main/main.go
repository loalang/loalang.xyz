package main

import (
	"fmt"
	"github.com/loalang/loalang.xyz/pkg"
	"net"
)

func main() {
	socket, err := net.Listen("tcp", ":9092")
	if err != nil {
		panic(err)
	}

	server, err := pkg.NewServer()
	if err != nil {
		panic(err)
	}

	fmt.Println("Started!")

	server.Serve(socket)
}

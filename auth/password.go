package auth

import (
	"crypto"
	"os"
)

var salt = os.Getenv("PASSWORD_SALT")

func Hash(password string) []byte {
	hash := crypto.SHA512.New()

	_, _ = hash.Write([]byte(password))

	return hash.Sum([]byte(salt))
}

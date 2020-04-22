package auth

import (
	"errors"
	"strings"
)

func ValidateEmail(email string) error {
	if !strings.Contains(email, "@") {
		return errors.New("invalid email address")
	}
	return nil
}

func ValidatePassword(password string) error {
	if len(password) < 6 {
		return errors.New("invalid password")
	}
	return nil
}

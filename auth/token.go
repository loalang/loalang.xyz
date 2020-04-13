package auth

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/md5"
	"crypto/rand"
	"encoding/hex"
	"github.com/golang/protobuf/proto"
	"io"
	"os"
	"time"
)

func floatFromTime(t time.Time) float64 {
	return float64(t.UTC().Unix())
}

func timeFromFloat(f float64) time.Time {
	return time.Unix(int64(f), 0)
}

var encryptionCipher = newCipher()

func newCipher() cipher.AEAD {
	hash := md5.New()
	hash.Write([]byte(os.Getenv("TOKEN_ENCRYPTION_PASSWORD")))
	password := hex.EncodeToString(hash.Sum(nil))
	block, err := aes.NewCipher([]byte(password))
	if err != nil {
		panic(err)
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		panic(err)
	}
	return gcm
}

func IssueToken(user *User) ([]byte, error) {
	token := Token{
		Id:        user.Id,
		ExpiresAt: floatFromTime(time.Now().AddDate(1, 0, 0)),
	}

	encoded, err := proto.Marshal(&token)
	if err != nil {
		return nil, err
	}

	nonce := make([]byte, encryptionCipher.NonceSize())
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, err
	}

	return encryptionCipher.Seal(nonce, nonce, encoded, nil), nil
}

func UnpackToken(data []byte) (*Token, error) {
	nonceSize := encryptionCipher.NonceSize()
	nonce, ciphertext := data[:nonceSize], data[nonceSize:]
	encoded, err := encryptionCipher.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return nil, err
	}

	var token Token
	err = proto.Unmarshal(encoded, &token)
	if err != nil {
		return nil, err
	}

	return &token, nil
}

func (t *Token) IsExpired() bool {
	expiry := timeFromFloat(t.ExpiresAt)

	return time.Now().After(expiry)
}

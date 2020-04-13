package api

import (
	"bytes"
	"context"
	"encoding/base64"
	"net/http"
	"os"
	"time"
)

const AuthCookie = "LOA_AUTH"

func EncodeToken(token []byte) string {
	var tokenBuf bytes.Buffer
	tokenEncoder := base64.NewEncoder(base64.RawURLEncoding, &tokenBuf)
	tokenEncoder.Write(token)
	tokenEncoder.Close()
	return tokenBuf.String()
}

func DecodeToken(token string) []byte {
	tokenBuf := bytes.NewBufferString(token)
	tokenDecoder := base64.NewDecoder(base64.RawURLEncoding, tokenBuf)
	var decodedBuf bytes.Buffer
	decodedBuf.ReadFrom(tokenDecoder)
	return decodedBuf.Bytes()
}

func SetCookie(ctx context.Context, token []byte) {
	cookie := &http.Cookie{
		Name:     AuthCookie,
		Value:    EncodeToken(token),
		Path:     "/",
		Domain:   os.Getenv("COOKIE_DOMAIN"),
		Expires:  time.Now().AddDate(1, 0, 0),
		Secure:   os.Getenv("COOKIE_SECURE") != "no",
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
	}
	Header(ctx).Set("Set-Cookie", cookie.String())
}

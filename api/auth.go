package api

import (
	"bytes"
	"context"
	"encoding/base64"
	"github.com/loalang/loalang.xyz/api/auth"
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

func SetCookie(ctx context.Context, res *auth.SignedInUser) {
	cookie := &http.Cookie{
		Name:     AuthCookie,
		Value:    EncodeToken(res.Token),
		Path:     "/",
		Domain:   os.Getenv("COOKIE_DOMAIN"),
		Expires:  time.Now().AddDate(1, 0, 0),
		Secure:   os.Getenv("COOKIE_SECURE") != "no",
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
	}
	Header(ctx).Set("Set-Cookie", cookie.String())
	SetCurrentUser(ctx, res.User)
}

func DeleteCookie(ctx context.Context) {
	cookie := &http.Cookie{
		Name:     AuthCookie,
		Value:    "",
		Path:     "/",
		Domain:   os.Getenv("COOKIE_DOMAIN"),
		Expires:  time.Unix(1000, 0),
		Secure:   os.Getenv("COOKIE_SECURE") != "no",
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
	}
	Header(ctx).Set("Set-Cookie", cookie.String())
	SetCurrentUser(ctx, nil)
}

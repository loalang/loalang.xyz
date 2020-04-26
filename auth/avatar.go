package auth

import (
	"cloud.google.com/go/storage"
	"context"
	"database/sql"
	"fmt"
	"github.com/google/uuid"
	"github.com/nfnt/resize"
	"image"
	"image/jpeg"
	"sync"
)

type AvatarUploader struct {
	bucket *storage.BucketHandle
}

func NewAvatarUploader(bucket *storage.BucketHandle) *AvatarUploader {
	return &AvatarUploader{bucket: bucket}
}

type Avatar struct {
	url512 string
	url256 string
	url128 string
}

func (u *Avatar) Url512() (out sql.NullString) {
	if u != nil {
		out.Valid = true
		out.String = u.url512
	}
	return
}

func (u *Avatar) Url256() (out sql.NullString) {
	if u != nil {
		out.Valid = true
		out.String = u.url256
	}
	return
}

func (u *Avatar) Url128() (out sql.NullString) {
	if u != nil {
		out.Valid = true
		out.String = u.url128
	}
	return
}

func (u *AvatarUploader) UploadAvatar(img image.Image) (*Avatar, error) {
	var avatar Avatar
	errs := make(chan error, 3)
	var wg sync.WaitGroup
	id := uuid.New()

	wg.Add(1)
	go func() {
		defer wg.Done()

		var err error
		avatar.url512, err = u.uploadSize(id, img, 512)
		if err != nil {
			errs <- err
		}
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()

		var err error
		avatar.url256, err = u.uploadSize(id, img, 256)
		if err != nil {
			errs <- err
		}
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()

		var err error
		avatar.url128, err = u.uploadSize(id, img, 128)
		if err != nil {
			errs <- err
		}
	}()

	complete := make(chan bool, 1)
	go func() {
		wg.Wait()
		complete <- true
	}()

	defer close(errs)
	defer close(complete)

	select {
	case <-complete:
		return &avatar, nil

	case err := <-errs:
		return nil, err
	}
}

func (u *AvatarUploader) uploadSize(id uuid.UUID, img image.Image, size uint) (string, error) {
	img = resize.Resize(size, 0, img, resize.Lanczos3)
	avatarObject := u.bucket.Object(fmt.Sprintf("avatars/%v_%d.jpg", id, size))
	writer := avatarObject.NewWriter(context.Background())
	err := jpeg.Encode(writer, img, &jpeg.Options{Quality: 80})
	if err != nil {
		return "", err
	}
	err = writer.Close()
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("https://%s/%s", avatarObject.BucketName(), avatarObject.ObjectName()), nil
}

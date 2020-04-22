package api

import (
	"bytes"
	"fmt"
	upload "github.com/eko/graphql-go-upload"
	"github.com/graphql-go/graphql"
	"github.com/loalang/loalang.xyz/api/auth"
	"github.com/loalang/loalang.xyz/api/pkg"
	"mime"
	"strings"
)

var MutationType = graphql.NewObject(graphql.ObjectConfig{
	Name: "Mutation",
	Fields: graphql.Fields{
		"publishRelease": &graphql.Field{
			Type: ReleaseType,
			Args: graphql.FieldConfigArgument{
				"qualifiedPackageName": &graphql.ArgumentConfig{
					Type: graphql.NewNonNull(graphql.String),
				},
				"version": &graphql.ArgumentConfig{
					Type: graphql.NewNonNull(VersionInputType),
				},
				"tarballUrl": &graphql.ArgumentConfig{
					Type: graphql.NewNonNull(graphql.String),
				},
			},
			Resolve: func(p graphql.ResolveParams) (interface{}, error) {
				request := &pkg.PublishReleaseRequest{
					QualifiedPackageName: p.Args["qualifiedPackageName"].(string),
					Version: &pkg.Version{
						Major: uint32(p.Args["version"].(map[string]interface{})["major"].(int)),
						Minor: uint32(p.Args["version"].(map[string]interface{})["minor"].(int)),
						Patch: uint32(p.Args["version"].(map[string]interface{})["patch"].(int)),
					},
					TarballUrl: p.Args["tarballUrl"].(string),
					Publisher:  CurrentUser(p.Context).Id,
				}

				res, err := PkgClient(p.Context).PublishRelease(p.Context, request)
				if err != nil {
					return nil, err
				}

				return Release(res), nil
			},
		},

		// Auth
		"signUp": &graphql.Field{
			Type: UserType,
			Args: graphql.FieldConfigArgument{
				"username": &graphql.ArgumentConfig{
					Type: graphql.NewNonNull(graphql.String),
				},
				"email": &graphql.ArgumentConfig{
					Type: graphql.NewNonNull(graphql.String),
				},
				"password": &graphql.ArgumentConfig{
					Type: graphql.NewNonNull(graphql.String),
				},
			},
			Resolve: func(p graphql.ResolveParams) (interface{}, error) {
				authClient := AuthClient(p.Context)
				res, err := authClient.SignUp(p.Context, &auth.SignUpRequest{
					Username: p.Args["username"].(string),
					Email:    p.Args["email"].(string),
					Password: p.Args["password"].(string),
				})
				if err != nil {
					switch {
					case strings.Contains(err.Error(), "invalid credentials"):
						return nil, NewError("Invalid credentials")
					default:
						return nil, err
					}
				}

				SetCookie(p.Context, res.Token)

				return User(res.User), nil
			},
		},
		"signIn": &graphql.Field{
			Type: UserType,
			Args: graphql.FieldConfigArgument{
				"usernameOrEmail": &graphql.ArgumentConfig{
					Type: graphql.NewNonNull(graphql.String),
				},
				"password": &graphql.ArgumentConfig{
					Type: graphql.NewNonNull(graphql.String),
				},
			},
			Resolve: func(p graphql.ResolveParams) (interface{}, error) {
				authClient := AuthClient(p.Context)
				res, err := authClient.SignIn(p.Context, &auth.SignInRequest{
					UsernameOrEmail: p.Args["usernameOrEmail"].(string),
					Password:        p.Args["password"].(string),
				})
				if err != nil {
					switch {
					case strings.Contains(err.Error(), "invalid credentials"):
						return nil, NewError("Invalid credentials")
					default:
						return nil, err
					}
				}

				SetCookie(p.Context, res.Token)

				return User(res.User), nil
			},
		},
		"signOut": &graphql.Field{
			Type: OKType,
			Resolve: func(p graphql.ResolveParams) (interface{}, error) {
				DeleteCookie(p.Context)
				return OK, nil
			},
		},
		"deleteAccount": &graphql.Field{
			Type: OKType,
			Resolve: func(p graphql.ResolveParams) (interface{}, error) {
				cookie, err := Request(p.Context).Cookie(AuthCookie)
				if err != nil {
					return nil, NewError("Not logged in")
				}
				DeleteCookie(p.Context)
				token := DecodeToken(cookie.Value)
				confirmation, err := AuthClient(p.Context).DeleteAccount(p.Context, &auth.DeleteAccountRequest{
					Token: token,
				})
				if err != nil {
					return nil, err
				}
				if confirmation.Success {
					return OK, nil
				} else {
					return nil, NewError("Not logged in")
				}
			},
		},
		"updateMe": &graphql.Field{
			Type: UserType,
			Args: graphql.FieldConfigArgument{
				"password": &graphql.ArgumentConfig{
					Type: graphql.NewInputObject(graphql.InputObjectConfig{
						Name: "PasswordUpdate",
						Fields: graphql.InputObjectConfigFieldMap{
							"current": &graphql.InputObjectFieldConfig{
								Type: graphql.NewNonNull(graphql.String),
							},
							"new": &graphql.InputObjectFieldConfig{
								Type: graphql.NewNonNull(graphql.String),
							},
						},
					}),
				},
				"username": &graphql.ArgumentConfig{
					Type: graphql.String,
				},
				"email": &graphql.ArgumentConfig{
					Type: graphql.String,
				},
				"name": &graphql.ArgumentConfig{
					Type: graphql.String,
				},
				"avatar": &graphql.ArgumentConfig{
					Type: UploadType,
				},
			},
			Resolve: func(p graphql.ResolveParams) (interface{}, error) {
				cookie, err := Request(p.Context).Cookie(AuthCookie)
				if err != nil {
					return nil, err
				}
				token := DecodeToken(cookie.Value)

				var currentPassword string
				var password string
				if p, ok := p.Args["password"]; ok {
					currentPassword = p.(map[string]interface{})["current"].(string)
					password = p.(map[string]interface{})["new"].(string)
				}

				var username string
				if p, ok := p.Args["username"]; ok {
					username = p.(string)
				}

				var email string
				if p, ok := p.Args["email"]; ok {
					email = p.(string)
				}

				var name string
				if p, ok := p.Args["name"]; ok {
					name = p.(string)
				}

				var avatar bytes.Buffer
				var format auth.ImageFormat
				if p, ok := p.Args["avatar"]; ok {
					upload := p.(*upload.GraphQLUpload)
					fileType, _, err := mime.ParseMediaType(upload.MIMEType)
					if err != nil {
						return nil, err
					}
					switch fileType {
					case "image/png":
						format = auth.ImageFormat_PNG
					case "image/jpeg":
						format = auth.ImageFormat_JPEG
					default:
						return nil, fmt.Errorf("unsupported avatar file type: %v (only image/jpeg and image/png is)", fileType)
					}
					reader, err := upload.GetReader()
					if err != nil {
						return nil, err
					}
					_, err = avatar.ReadFrom(reader)
					if err != nil {
						return nil, err
					}
				}

				user, err := AuthClient(p.Context).UpdateUser(p.Context, &auth.UpdateUserRequest{
					Token:           token,
					Password:        password,
					CurrentPassword: currentPassword,
					Username:        username,
					Email:           email,
					Name:            name,
					Avatar:          avatar.Bytes(),
					AvatarFormat:    format,
				})

				if err != nil {
					return nil, err
				}

				return User(user), nil
			},
		},
	},
})

SERVICE=$1

find $SERVICE -type f -exec shasum {} \; | shasum | awk '{print $1}'
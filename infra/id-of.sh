SERVICE=$1

find $SERVICE -type f -exec sha1sum {} \; | sha1sum | awk '{print $1}'
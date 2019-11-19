SERVICE=$1

find services/$SERVICE -type f -exec md5sum {} \; | md5sum | awk '{print $1}'
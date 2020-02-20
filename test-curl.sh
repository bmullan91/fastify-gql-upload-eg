curl --request POST \
  --url http://localhost:8080/graphql \
  --header 'accept: application/json' \
  --header 'accept-encoding: gzip, deflate, br' \
  --header 'connection: keep-alive' \
  --form 'operations={"query": "mutation UploadImage($image: Upload!) {  uploadImage(image: $image)}",   "variables": { "image": null } }' \
  --form 'map={ "0": ["variables.image"] }' \
  --form 0=@./kitten.jpg
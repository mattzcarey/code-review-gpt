LAMBDA_URL=""
SECRET=""
TMP_DATA_FILE="/tmp/smoke.data"

echo "{\"action\":\"test\"}" >$TMP_DATA_FILE
SIGN=$(openssl dgst -sha1 -hmac $SECRET $TMP_DATA_FILE | cut -d" " -f2)
curl --request POST \
    --header "X-Hub-Signature: sha1=$SIGN" \
    --header "X-Github-Event: test" \
    --header "X-GitHub-Delivery: fake" \
    --header "Content-Type: application/json" \
    --data-binary "@$TMP_DATA_FILE" \
    $LAMBDA_URL

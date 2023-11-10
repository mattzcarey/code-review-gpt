LAMBDA_URL="lambda url"
SECRET="secret"
TMP_DATA_FILE="/tmp/smoke.data"

echo -n "{\"action\":\"test\"}" >$TMP_DATA_FILE
SIGN=$(openssl dgst -sha1 -hmac $SECRET $TMP_DATA_FILE | cut -d" " -f2)
curl --request POST --header "X-Hub-Signature: sha1=$SIGN" --header "X-Github-Event: test" --header "X-GitHub-Delivery: fake" --data-binary "@$TMP_DATA_FILE" $LAMBDA_URL

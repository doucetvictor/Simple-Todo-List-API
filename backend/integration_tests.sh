#!/bin/bash

test() {
    echo "Testing: $TITLE"

    RESPONSE=$(curl -sS -w "%{response_code}" -X "$METHOD" \
        -H "Content-Type: application/json" ${BODY:+-d "$BODY"} \
        "http://localhost:8080/v1$ENDPOINT${QUERY:+?$QUERY}" 2>&1)
    CONTENT="${RESPONSE:: -3}"
    STATUS_CODE="${RESPONSE: -3}"

    if [ "$STATUS_CODE" -ne "$EXPECTED_STATUS_CODE" ]; then
        echo "Test Failed: expected HTTP status $EXPECTED_STATUS_CODE but got $STATUS_CODE with content '$CONTENT'"
        exit 1
    elif [ -n "$EXPECTED_CONTENT" ] && [ "$CONTENT" != "$EXPECTED_CONTENT" ]; then
        echo "Test Failed: expected response '$EXPECTED_CONTENT' but got '$CONTENT'"
        exit 1
    else
        echo "Test Success!"
        echo
    fi

    unset $BODY
    unset $QUERY
}

TITLE='creating a todo successfully'
METHOD='POST'
ENDPOINT='/todos'
BODY='{"title":"New Title","completed":"false"}'
EXPECTED_STATUS_CODE=201
EXPECTED_CONTENT=''
test

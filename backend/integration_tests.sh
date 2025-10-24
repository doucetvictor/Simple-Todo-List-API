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

    unset BODY
    unset QUERY
}

TITLE='Creating a todo successfully'
METHOD='POST'
ENDPOINT='/todos'
BODY='{"title":"New Title","completed":"false"}'
EXPECTED_STATUS_CODE=201
EXPECTED_CONTENT=''
test

TITLE='Updating a todo successfully'
METHOD='PUT'
ENDPOINT='/todos'
BODY='{"id":1,"title":"Updated Title","completed":"true"}'
EXPECTED_STATUS_CODE=200
EXPECTED_CONTENT=''
test

TITLE='Updating a todo without an id returns an error'
METHOD='PUT'
ENDPOINT='/todos'
BODY='{"completed":"true"}'
EXPECTED_STATUS_CODE=404
EXPECTED_CONTENT='Error: Element not found'
test

TITLE='Creating a todo successfully'
METHOD='POST'
ENDPOINT='/todos'
BODY='{"title":"Another Title","completed":"true"}'
EXPECTED_STATUS_CODE=201
EXPECTED_CONTENT=''
test

TITLE='Getting a existent todo successfully'
METHOD='GET'
ENDPOINT='/todos'
QUERY='id=1'
EXPECTED_STATUS_CODE=200
EXPECTED_CONTENT=''
test

TITLE='Getting all existent todos successfully'
METHOD='GET'
ENDPOINT='/todos'
EXPECTED_STATUS_CODE=200
EXPECTED_CONTENT=''
test

TITLE='Getting a non-existent todo returns 404'
METHOD='GET'
ENDPOINT='/todos'
QUERY='id=9'
EXPECTED_STATUS_CODE=404
EXPECTED_CONTENT='Error: Element not found'
test

TITLE='Creating a todo without a title returns an error'
METHOD='POST'
ENDPOINT='/todos'
BODY='{"completed":"false"}'
EXPECTED_STATUS_CODE=400
EXPECTED_CONTENT='Error: Title is required'
test

TITLE='Creating a todo with a blank title returns an error'
METHOD='POST'
ENDPOINT='/todos'
BODY='{"title":"   ","completed":"false"}'
EXPECTED_STATUS_CODE=400
EXPECTED_CONTENT='Error: Title cannot be blank'
test

TITLE='Deleting a todo successfully'
METHOD='DELETE'
ENDPOINT='/todos'
QUERY='id=1'
EXPECTED_STATUS_CODE=204
EXPECTED_CONTENT=''
test

TITLE='Deleting a non-existent todo returns 404'
METHOD='DELETE'
ENDPOINT='/todos'
QUERY='id=1'
EXPECTED_STATUS_CODE=404
EXPECTED_CONTENT='Error: Element not found'
test

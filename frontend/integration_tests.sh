#!/bin/bash

set -e

cd $(dirname $0)
npm ci
npm test run
cd -

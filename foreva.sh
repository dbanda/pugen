#!/bin/sh
echo "starting forever script"
echo "...."
forever --workingDir . -awl ./logs/pugen.log start -p . ./bin/www
forever --workingDir ./routes/stanford-nlp/stanford-postagger-full-2010-05-26/ -p . -awl ./logs/stanford-nlp.log -c bash start ./routes/stanford-nlp/stanford-postagger-full-2010-05-26/run-server.sh ./models/left3words-wsj-0-18.tagger 9000
echo "foreva done"
forever list


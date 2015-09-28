echo "starting forever script"
echo "...."
forever -awl ~/logs/pugen.log --workingDir ~/Desktop/projects/pugen/ start ~/Desktop/projects/pugen/bin/www
forever --workingDir ~/Desktop/projects/pugen/routes/stanford-nlp/stanford-postagger-full-2010-05-26/ -c bash start  ~/Desktop/projects/pugen/routes/stanford-nlp/stanford-postagger-full-2010-05-26/run-server.sh ~/Desktop/projects/pugen/routes/stanford-nlp/stanford-postagger-full-2010-05-26/models/left3words-wsj-0-18.tagger 9000
echo "foreva done"
forever list


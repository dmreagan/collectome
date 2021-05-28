docker-compose up -d
sleep 10 # wait for crate instance to start before issuing commands
docker-compose exec db sh -c  "crash < ../config/schemas.sql" # load tables

# Getting Started
If you dont already have docker installed you'll need to download it from https://www.docker.com/products/docker-desktop/
You can run this repo simply by inputting ```docker compose up``` into the terminal

## Local volumes
This repo has some volumes set up to locally persist a postgres db. In order to wipe the data and start fresh: 
   - CTRL + c out of the running docker task
   - Run the following command ```docker compose down && docker volume rm oasis-backend-task-master_db```
   - This will stop the running services and remove the persising data store, simply ```docker compose up``` to start the service again

## Real-time tracking of Ethereum Mainnet DAI token transfers
I have set up an event watcher to look for new events, it uses Infura and web3 to track any new transactions.
On start up of the application it also goes back and gets previous data. 
Also seen as there is only a requirement for the last 24 hours of data, I have chosen not to load all previous blocks in. The main reason being rate limiting issues & unnecessary requests. However if this was to go live as an application it would be something to consider.
There isn't an accurate timestamp of the event store, the best I could get is a collated time stamp but not the time of the actual transaction.

## Database Management: Store all transfer information within a Postgres database.
I have set up a local postgres database within a docker-compose file.
You can also interact with the db using a tool of your choice, but i have used adminer for a simple connection.
You can access this tool once running the docker-compose file by going to this url - localhost:8080

## REST API Development: Create a simple REST API with the following endpoints:
   ### Public GET endpoint returning the top 10 addresses that spend most DAI within the last 24 hours.
   You can test this endpoint out at localhost:3001/transfer
   It should colate transaction amounts based of sender address and return the top 10 ranked wallets

   ### Authenticated POST endpoint capable of blacklisting addresses from the GET endpoint's results.
   I have added an authenticated route for creating a new blacklist record. You can access this at localhost:3001/blacklist.
   The credentials for testing: 
      - Username: admin
      - Password: pass
   Obviously if this was a service going live I would have a fully fledged auth service, storing password hashes in the db.
   Reason behind keeping this part simple is it shows the technical side of locking down an enpoint using middleware, without the time spent into a replacable auth service. I wanted to use my time on some of the more complex problems.

## Docker-compose file to facilitate the running of both the Postgres database and the API/worker.
Can be found at the route of the repository.
Simply ```docker compose up``` to get started

## Testing
I have added in some basic unit tests for the controllers and some e2e tests.
These E2E tests use a local sqlite file but add some dummy data and test/demonstrate the functionality of the endpoints using black box testing.

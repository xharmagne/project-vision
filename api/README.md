# Austrac API

API backend for Austrac project. The backend is written in
Node.js and utilises the following projects and services:

- koa2
- postgres (via sequelize ORM)

## Getting started

### Run postgres database

First, local postgres instance must be created with the following settings:

- Database name: austrac
- Username: postgres
- Password: postgres

Easiest way to achieve this is to use the following docker command. If you do
not have docker installed, follow the instructions on
https://docs.docker.com/docker-for-mac/

```sh
docker run -d \
  --name austrac-api \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=austrac \
  -p 5432:5432 \
  postgres
```

On the initial run, this will take a while to run as it needs to download
missing images from the internet.

### Create database tables and seed them

Once the database has been instantiated, check that the database connectivity is
good via `postgres` command line client or one of the existing GUI clients such
as [Postico](https://eggerapps.at/postico/).

After verifying connectivity, run following commands from the project root to
migrate database structure:

```sh
npm run -s db:rollback:all
npm run -s db:migrate
npm run -s contracts:deploy
```

You can join them in to one line like this:

```
npm run -s db:rollback:all && npm run -s db:migrate && npm run -s contracts:deploy
```

### Start the server

You may start the server locally via:

```sh
npm run dev
```

### Seed via API

With the server running on http://localhost:5000

```
API_URL=http://localhost:5000 npm run -s api:seed
```

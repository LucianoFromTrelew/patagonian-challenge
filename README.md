Required dependencies

- Node.js and NPM
- Docker and docker-compose

---

Environmental variables needed to be defined in `.env` and `env.test`

- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `POSTGRES_HOST`
- `POSTGRES_PORT`
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`

Customize Express with the `EXPRESS_PORT` env var in `.env`

---

- Install depedencies with

```
npm install
```

- Create containers with

```
docker-compose up -d
```

- Build app with

```
npm run build
```

- Run data loading script with (`.env` file should exist)

```
node dist/load_data <SPOTIFY_ARTIST_ID_0>,<SPOTIFY_ARTIST_ID_1>,...,
```

- Run app with (`.env` file should exist)

```
npm start
```

- Run tests with (`.env.test` file should exist)

```
npm test
```

- Tear down containers

```
docker-compose down
```

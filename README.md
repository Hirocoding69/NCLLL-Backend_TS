## Downloads

- Node version v20.18
- Install Redis
- Install Postgres

We use Golang for migration

- Install Go [Download](https://go.dev/doc/install)
- Install Goose [Download](https://github.com/pressly/goose?tab=readme-ov-file#install)
- Install Go Atlas [Download](https://atlasgo.io/docs#installation)

## Run App:

```
yarn install
cp .env.example .env
yarn dev
```

## 🚓 Migration

We use `Goose` and `Atlas Go` for migration. Read more at: https://github.com/pressly/goose#usage <br>

### Prerequisite

```
- Create 2 dbs name: lottery5d & lottery5d_tmp
- cp ./connection.json.example ./database/migration/connection.json
- Update your connection
```

### Commands

```
Edit schema.hcl. Reference: https://atlasgo.io/atlas-schema/hcl-types#postgresql

- Generate UP migration output (in console) from schema changes:
make diff

- Generate DOWN migration output (in console) from schema changes:
make diff-rev

- Create migration (Dont forget to write DOWN statements!):
make create name=YOUR_MIGRATION_NAME

- Up:
make up

- Down by 1:
make down

- Reset (down all):
make reset
```

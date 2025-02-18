#!/usr/bin/env bash
set -Eeuxo pipefail # https://vaneyckt.io/posts/safer_bash_scripts_with_set_euxo_pipefail/
cd -P -- "$(dirname -- "${BASH_SOURCE[0]}")" # https://stackoverflow.com/a/17744637


docker-compose -p sequelize-yugabytedb-2.4 down --remove-orphans
docker-compose -p sequelize-yugabytedb-2.4 up -d

echo "Local Yugabyte instance is ready for Sequelize tests."

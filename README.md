# microservices-demo

## Part I - 搭建项目结构

### listings-service

* `yarn add -D babel-watch`
* `yarn add @babel/core @babel/polyfill @babel/preset-env babel-plugin-module-resolver`

```json
  "scripts": {
    "watch": "babel-watch -L src/index.js"
  },
```

```js
// babel-config.js
module.exports = {
  plugins: [
    [
      "nodule-resolver",
      {
        alias: {
          "#root": "./src"
        }
      }
    ]
  ],
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          nonde: "current"
        }
      }
    ]
  ]
};

// src/index.js
console.log('!!!!working')
```

```docker
FROM node:12

COPY . /opt/app

WORKDIR /opt/app

RUN yarn

CMD yarn watch
```

> docker build .

### users-service

> copy一份, 改改名称。

### docker-compose

```yml
version: "3"
services:
  listings-service:
    build: "./listings-service"
    depends_on:
      - listings-service-db
    volumes:
      - ./listings-service:/opt/app

  listings-service-db:
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=db
    image: mysql:5.7.20

  users-service:
    build: "./users-service"
    depends_on:
      - users-service-db
    volumes:
      - ./users-service:/opt/app

  users-service-db:
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=db
    image: mysql:5.7.20

```

* `docker-compose up`

## Part II - 使用 sequelize 初始化数据库

分别外开两个数据库的端口，方便测试。

```yml
  listings-service-db:
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=db
    image: mysql:5.7.20
    ports:
      - 0.0.0.0:7200:3306

  users-service-db:
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=db
    image: mysql:5.7.20
    ports:
      - 0.0.0.0:7201:330
```

* `mysql2 sequelize sequelize-cli`

在项目根目录新增 `.sequelizerc` 文件:

```js
const path = require("path");

module.export = {
  config: path.resolve(__dirname, "./sequelize/config.js"),
  "migrations-path": path.resolve(__dirname, "./sequelize/migrations")
};
```

```js
// sequelize/config.js
module.exports.development = {
  dialect: "mysql",
  seederStorage: "sequelize",
  url: process.env.DB_URI
}
```

> 添加完数据库配置文件后到 docker-compose 里添加环境变量

```yml
  listings-service:
    build: "./listings-service"
    depends_on:
      - listings-service-db
    environment:
      - DB_URI=mysql://root:password@listings-service-db/db?charset=UTF8
    volumes:
      - ./listings-service:/opt/app
```

配置数据库初始化脚本

```js
// sequelize/migrations/202001211447-create-listings.js
module.exports.up = (queryInterface, DataTypes) => {
  return queryInterface.createTable(
    "listings",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER.UNSIGNED
      },
      title: {
        allowNull: false,
        type: DataTypes.STRING
      },
      description: {
        allowNull: false,
        type: DataTypes.TEXT
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      deletedAt: {
        allowNull: true,
        type: DataTypes.TEXT
      }
    },
    {
      charset: "utf8"
    }
  );
};
```

修改 `package.json`

```json
  "scripts": {
    "db:migrate": "sequelize db:migrate",
    "db:migrate:undo": "sequelize db:migrate:undo",
    "watch": "babel-watch -L src/index.js"
  },
```

进入服务内迁移数据库表结构

```bash
docker exec -it fa bash
yarn run db:migrate
```

### uses-service

> copy一遍，额外进容器初始化数据表。

# microservices-demo

> 纯手工使用 React、Express、Apollo、GraphQL、MySQL、Sequelze、Docker、AWS、terraform 搭建微服务

## Part O - 架构图

![flow1](http://cdn.jerryshi.com/gtkj/20200121161420.png)

## Part I - 搭建项目结构

### listings-service

- `yarn add -D babel-watch`
- `yarn add @babel/core @babel/polyfill @babel/preset-env babel-plugin-module-resolver`

```json
  "scripts": {
    "watch": "babel-watch -L src/index.js"
  },
```

```bash
## babel-config.js 无法加载，换成 -> .babelrc
module.exports = {
  plugins: [
    [
      'nodule-resolver',
      {
        alias: {
          '#root': './src',
        },
      },
    ],
  ],
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          nonde: 'current',
        },
      },
    ],
  ],
};
```

```js
// src/index.js
console.log('!!!!working');
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

> copy 一份, 改改名称。

### docker-compose

```yml
version: '3'
services:
  listings-service:
    build: './listings-service'
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
    build: './users-service'
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

- `docker-compose up`

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

- `mysql2 sequelize sequelize-cli`

在项目根目录新增 `.sequelizerc` 文件:

```js
const path = require('path');

module.export = {
  config: path.resolve(__dirname, './sequelize/config.js'),
  'migrations-path': path.resolve(__dirname, './sequelize/migrations'),
};
```

```js
// sequelize/config.js
module.exports.development = {
  dialect: 'mysql',
  seederStorage: 'sequelize',
  url: process.env.DB_URI,
};
```

> 添加完数据库配置文件后到 docker-compose 里添加环境变量

```yml
listings-service:
  build: './listings-service'
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
    'listings',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      title: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      description: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      deletedAt: {
        allowNull: true,
        type: DataTypes.TEXT,
      },
    },
    {
      charset: 'utf8',
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

> copy 一遍，额外进容器初始化数据表。

## Part III

`yarn add express cors body-parser`

修改 `src/index.js` 文件

```js
import '@babel/polyfill';

import '#root/db/connection';
import '#root/server/startServer';
```

新建 `src/db/connection.js` 文件

```js
import { Sequelize } from 'sequelize';

import accessEnv from '#root/helpers/accessEnv';

const DB_URI = accessEvn('DB_URI');

const sequelize = new Sequelize(DB_URI, {
  dialectOptions: {
    charset: 'utf8',
    multipleStatements: true,
  },
  logging: false,
});

export default sequelize;
```

新建 `src/helpers/accessEnv.js` 文件，懒加载读环境变量

```js
const cache = {};

const accessEnv = (key, defaultValue) => {
  if (!(key in process.env)) {
    if (defaultValue) return defaultValue;
    throw new Error(`${key} not found in process.env`);
  }

  if (cache[key]) return cache[key];

  return process.env[key];
};

export default accessEnv;
```

新建express路由文件

```js
// src/server/routes.js
const setupRoutes = app => {
  app.get("listings", (_, res) => {
    return res.json({ message: "hi jerry" });
  });
};

// src/server/startServer.js

// ...
import setupRoutes from "./routes";
// ...
setupRoutes(app)
```

新建 models 文件

```js
// src/db/models.js
import { DataTypes, Model } from "sequelize";

import sequelize from "./connection";

export class Listing extends Model {}

Listing.init(
  {
    title: {
      allowNull: false,
      type: DataTypes.STRING
    },
    description: {
      allowNull: false,
      type: DataTypes.TEXT
    }
  },
  {
    modelName: "listings",
    sequelize
  }
);
```

测试接口

```js
import { Listing } from "#root/db/models";

const setupRoutes = app => {
  app.get("/listings", async (_, res) => {
    const listings = await Listing.findAll();
    return res.json(listings);
  });
};
```

### api-getway

- `yarn add -D babel-watch`
- `yarn add -D @babel/core @babel/polyfill @babel/preset-env apollo-server apollo-server-express babel-plugin-module-resolver cookie-parser cors express`

copy `.babelrc`   `Dockerfile`  `package.json`

新增后台启动文件

```js
// src/server/startServer.js
import { ApolloServer } from "apollo-server-express";
import cookieParser from "cookie-parser";
import cors from 'cors'
import express from 'express'

import accessEnv from '#root/helpers/accessEnv'

const PORT = accessEnv("PORT", 7000)


```

新增 GraphQL 相关文件

```js
// src/graphql/typeDefs.js
import { gql } from 'apollo-server'
const typeDefs = gql`
  type Listing {
    description: String!
    id: ID!
    title: String!
  }

  type Query {
    listings: [Listing!]!
  }
`
export default typeDefs;


// src/graphql/resovlers/index.js， 统筹所有 Query Mutation等
import * as Query from "./Query";
const resolvers = { Query };
export default resolvers;


// src/graphql/resolvers/Query/index.js，分别统筹自己名下的Query
export { default as listings } from "./listings";


// src/graphql/resolvers/Query/listings.js，自力更生
const listingsResolver = async () => {
  return [
    {
      description: "desc11111111111",
      id: 11,
      title: "title111"
    }
  ];
};

export default listingsResolver;
```

最后的后端启动文件

```js
import { ApolloServer } from "apollo-server-express";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import typeDefs from "#root/graphql/typeDefs";
import resolvers from "#root/graphql/resolvers";
import accessEnv from "#root/helpers/accessEnv";

const PORT = accessEnv("PORT", 7000);

const apolloServer = new ApolloServer({
  resolvers,
  typeDefs
});

const app = express();

app.use(cookieParser());

app.use(
  cors({
    origin: (origin, cb) => cb(null, true),
    credentials: true
  })
);

apolloServer.applyMiddleware({ app, cors: false });

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API gateway listening on ${PORT}`);
});
```

## Part IV

### api-gateway

- `yarn add got`

使用适配器(adapter) 向 resolvers 提供服务

```js
// src/adapters/ListingsService.js
import got from "got";

const LISTINGS_SERVOCE_URI = "http://listings-service:7100";

export default class ListingsService {
  static async fetchAllListings() {
    const body = await got.get(`${LISTINGS_SERVOCE_URI}/listings`).json();

    return body;
  }
}


// src/graphql/resolvers/Query/listings.js
import ListingsService from '#root/adapters/ListingsService'

const listingsResolver = async () => {
  return await ListingsService.fetchAllListings()
};

export default listingsResolver;
```

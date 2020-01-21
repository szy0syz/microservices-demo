# microservices-demo

## Part I

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

> copy 一份

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

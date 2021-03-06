# microservices-demo

> 纯手工使用 React、Express、Apollo、GraphQL、MySQL、Sequelze、Docker、AWS、terraform 搭建微服务

![img0](http://cdn.jerryshi.com/gtkj/20200122142615.jpg)

> 果真和书上写的一模一样啊。

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

新建 express 路由文件

```js
// src/server/routes.js
const setupRoutes = app => {
  app.get('listings', (_, res) => {
    return res.json({ message: 'hi jerry' });
  });
};

// src/server/startServer.js

// ...
import setupRoutes from './routes';
// ...
setupRoutes(app);
```

新建 models 文件

```js
// src/db/models.js
import { DataTypes, Model } from 'sequelize';

import sequelize from './connection';

export class Listing extends Model {}

Listing.init(
  {
    title: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    description: {
      allowNull: false,
      type: DataTypes.TEXT,
    },
  },
  {
    modelName: 'listings',
    sequelize,
  }
);
```

测试接口

```js
import { Listing } from '#root/db/models';

const setupRoutes = app => {
  app.get('/listings', async (_, res) => {
    const listings = await Listing.findAll();
    return res.json(listings);
  });
};
```

### api-getway

- `yarn add -D babel-watch`
- `yarn add -D @babel/core @babel/polyfill @babel/preset-env apollo-server apollo-server-express babel-plugin-module-resolver cookie-parser cors express`

copy `.babelrc` `Dockerfile` `package.json`

新增后台启动文件

```js
// src/server/startServer.js
import { ApolloServer } from 'apollo-server-express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import accessEnv from '#root/helpers/accessEnv';

const PORT = accessEnv('PORT', 7000);
```

新增 GraphQL 相关文件

```js
// src/graphql/typeDefs.js
import { gql } from 'apollo-server';
const typeDefs = gql`
  type Listing {
    description: String!
    id: ID!
    title: String!
  }

  type Query {
    listings: [Listing!]!
  }
`;
export default typeDefs;

// src/graphql/resovlers/index.js， 统筹所有 Query Mutation等
import * as Query from './Query';
const resolvers = { Query };
export default resolvers;

// src/graphql/resolvers/Query/index.js，分别统筹自己名下的Query
export { default as listings } from './listings';

// src/graphql/resolvers/Query/listings.js，自力更生
const listingsResolver = async () => {
  return [
    {
      description: 'desc11111111111',
      id: 11,
      title: 'title111',
    },
  ];
};

export default listingsResolver;
```

最后的后端启动文件

```js
import { ApolloServer } from 'apollo-server-express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import typeDefs from '#root/graphql/typeDefs';
import resolvers from '#root/graphql/resolvers';
import accessEnv from '#root/helpers/accessEnv';

const PORT = accessEnv('PORT', 7000);

const apolloServer = new ApolloServer({
  resolvers,
  typeDefs,
});

const app = express();

app.use(cookieParser());

app.use(
  cors({
    origin: (origin, cb) => cb(null, true),
    credentials: true,
  })
);

apolloServer.applyMiddleware({ app, cors: false });

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API gateway listening on ${PORT}`);
});
```

## Part IV

### api-gateway

- `yarn add got`

使用适配器(adapter) 向 resolvers 提供服务

```js
// src/adapters/ListingsService.js
import got from 'got';

const LISTINGS_SERVOCE_URI = 'http://listings-service:7100';

export default class ListingsService {
  static async fetchAllListings() {
    const body = await got.get(`${LISTINGS_SERVOCE_URI}/listings`).json();

    return body;
  }
}

// src/graphql/resolvers/Query/listings.js
import ListingsService from '#root/adapters/ListingsService';

const listingsResolver = async () => {
  return await ListingsService.fetchAllListings();
};

export default listingsResolver;
```

### users-service 注册用户

- `yarn add uuid bcryptjs`

```js
// 路由文件 src/server/startServer.js
const setupRoutes = app => {
  app.post('/users', async (req, res) => {
    if (!req.body.email || !req.body.passwor) {
      return next(new Error('Invalid body!'));
    }

    try {
      const newUser = await User.create({
        email: req.body.email,
        id: generateUUID(),
        passwordHash: hashPassword(req.body.password),
      });

      return res.json(newUser);
    } catch (error) {
      return next(error);
    }
  });
};

// src/helpers/generateUUID
import uuidv4 from 'uuid/v4';
const generateUUID = () => uuidv4();

// src/helpers/hashPassword.js
import bcrypt from 'bcryptjs';
const hashPassword = password => bcrypt.hashSync(password, bcrypt.genSaltSync('41@14'));

// src/db/models.js
export class User extends Model {}
User.init(
  {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
    },
    email: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: true,
    },
    passwordHash: {
      allowNull: false,
      type: DataTypes.CHAR(64),
    },
  },
  {
    defaultScope: {
      rawAttributes: { exclude: ['passwordHash'] },
    },
    modelName: 'users',
    sequelize,
  }
);
```

统一处理错误中间件

```js
// src/server/formatGraphQLErrors.js
import _ from 'lodash';
const formatGraphQLErrors = error => {
  const errorDetails = _.get(error, 'originalError.response.body');
  console.log('erroe', error);
  try {
    if (errorDetails) return JSON.parse(errorDetails);
  } catch (e) {
    return e;
  }
  return error;
};
export default formatGraphQLErrors;

// src/server/startServer.js
const apolloServer = new ApolloServer({
  formatError: formatGraphQLErrors,
  resolvers,
  typeDefs,
});
```

## Part V 前端 APP

### classifieds-app

- `yarn add -D parcel-bundler`

> `parcel-bundler` 竟然这么厉害，可以自动分析 js 的依赖并自动安装。

`src/index.html`

```html
<body>
  <div id="app"></div>
  <script src="./index.js"></script>
</body>
```

```js
// src/index.js
import React from 'react';
import { render } from 'react-dom';

render(<h1>working</h1>, document.getElementById('app'));
```

```json
"scripts": {
  "watch": "parcel --port=7001 src/index.html"
}
```

> 初始化 `<Root />` 根组件

```js
import React from 'react';
const Root = () => {
  return <h1>Root Component</h1>;
};
export default Root;

// 修改 src/index.js
import React from 'react';
import { render } from 'react-dom';
import Root from './components/Root';
render(<Root />, document.getElementById('app'));
```

- **使用 style-components 创建全局样式**
- `yarn add styled-components`

> 还可以初始化 html body #app 不错。

```js
// src/index.js
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css?family=Roboto&display=swap');

  html, body, #app {
    height:100%;
    margin: 0;
    padding: 0;
    width: 100%;
  }

  body {
    font-family: Roboto, sans-serif;
  }
`;
```

- Root 根节点组件创建样式

```js
const Wrapper = styled.div`
  box-sizing: border-box;
  height: 100%;
  padding: 1rem;
  width: 100%;
`;

const Container = styled.div`
  display: flex;
  flex-flow: row nowrap;
  margin: 0 auto;
  width: 80rem;
`;

const Content = styled.div`
  background-color: red;
  flex: 1;
  margin-right: 1rem;
`;

const Sidebar = styled.div`
  background-color: blue;
  flex: 0 auto;
  width: 10rem;
`;

const Root = () => {
  return (
    <Wrapper>
      <Container>
        <Content>Content</Content>
        <Sidebar>Sidebar</Sidebar>
      </Container>
    </Wrapper>
  );
};
```

- 管理 sessions
- `yarn add date-fns`

```js
// src/server/routes.js
import { addHours } from 'date-fns';

app.post('/sessions', async (req, res, next) => {
  if (!req.body.email || !req.body.password) {
    return next(new Error('Invalid body!'));
  }

  try {
    const user = await User.findOne({
      attributes: {},
      where: {
        email: req.body.email,
      },
    });

    if (!user) return next(new Error('Invalid email!'));

    if (!passwordCompareSync(req.body.password, user.passwordHash)) {
      return next(new Error('Incorrect password!'));
    }

    const expiresAt = addHours(new Date(), USER_SESSION_EXPIRY_HOURS);
    const sessionToken = generateUUID();

    const userSession = await UserSession.create({
      expiresAt,
      id: sessionToken,
      userId: user.id,
    });

    return res.json(userSession);
  } catch (error) {
    next(error);
  }
});
```

- GraphQL 用户登录

```js
// api-gateway/src/graogql/typeDefs.js
gql`
scalar: Date

type Mutation {
  createUser(email: String!, password: String!): User!
  createUserSession(email: String!, password: String!): UserSession!
}
`;

// src/graphql/resolvers/mutation/createUserSession.js
const createUserSessionReslover = async (_, { email, password }, context) => {
  const userSession = await UsersService.createUserSession({ email, password });

  context.res.cookie('userSessionId', userSession.id, { httpOnly: true });

  return userSession;
};

// src/server/startServer.js
const apolloServer = new ApolloServer({
  context: c => c,
  formatError: formatGraphQLErrors,
  resolvers,
  typeDefs,
});
```

## Part VI

- `styled` 第一层父级选择器 `&` 可省略

```js
const Lable = styled.label`
  display: block;

  :not(:first-child) {
    margin-top: 0.75rem;
  }
`;
```

- 创建公共组件库 `shared`，新建组件 `TextInput`

```js
// src/components/shared/TextInput.js
const TextInput = styled.input`
  box-sizing: border-box;
  display: block;
  font-size: 0.9rem;
  padding: 0.25rem;
  width: 100%;
`;

export default TextInput;
```

- **创建全局样式文件 theme.js**

- `color name & hue` 颜色名称和色调 <https://www.color-blindness.com/color-name-hue/>

```js
// 创建 src/theme.js
export const veryLightGray = '#CCCCCC';

// 【修改】 src/index.js
// ......
render(
  <ThemeProvider theme={theme}>
    <GlobalStyle />
    <Root />
  </ThemeProvider>,
  document.getElementById('app')
);
```

```js
// 最终 Login.js 组件
<form onSubmit={onSubmit}>
  <Lable>
    <LableText>Email</LableText>
    <TextInput disable={isSumbitting} name="email" type="email" ref={register} />
  </Lable>
  <Lable>
    <LableText>Password</LableText>
    <TextInput disable={isSumbitting} name="password" type="password" ref={register} />
    <LoginButton disable={isSumbitting} type="submit">
      Login
    </LoginButton>
  </Lable>
</form>
```

### 初始化 `GraphQL`

- `yarn add apollo-cache-inmemory apollo-client apollo-link-http graphql graphql-tag react-apollo @apollo/react-hooks`

```js
// src/api/graphqlClient.js
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

export const cache = new InMemoryCache();

const client = new ApolloClient({
  cache,
  link: new HttpLink({
    credentials: 'include',
    uri: process.env.SERVICES_URI + '/graphql',
  }),
});

export default client;
```

- 项目根目录创建 `.env` 环境变量文件

```bash
SERVICE_URI=http://localhost:7000
```

```js
// src/index.js
import { ApolloProvider } from 'react-apollo';
import client from '~/api/graphqlClient';
// ......
render(
  <ApolloProvider client={client}>
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Root />
    </ThemeProvider>
  </ApolloProvider>,
  document.getElementById('app')
);
```

- 修改 Login.js 组件

```js
// 执行这条语句时发现报错了
// "message": "Cannot return null for non-nullable field UserSession.user."
// 原来无法解析 user { eamil id }
const mutation = gql`
  mutation($email: String!, $password: String!) {
    createUserSession(email: $email, password: $password) {
      id
      user {
        email
        id
      }
    }
  }
`;
```

- 补充 `mutation` 里 `createUserSession` 能够解析 `user` 对象

```js
// api-gateway/adapters/UsersService.js
import UsersService from '~/adapters/UsersService';

const UserSession = {
  // 注意：这里的 user 才去对应 mutation-createUserSession 里的 user
  user: async userSession => {
    return await UsersService.fetchUser({ userId: userSession.userId });
  },
};

export default UserSession;
```

- 再补充适配器下 src/adapters/UsersService.js 服务里的方法

```js
// ......
  static async fetchUser({ userId }) {
    const body = await got.get(`${USERS_SERVOCE_URI}/users/${userId}`).json();
    return body;
  }
// .......
```

- 再再补充下具体服务提供者的控制器

```js
// users-services/src/server/routes.js
app.get('/users/:userId', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.userId);

    if (!user) return next(new Error('Invalid user ID'));

    return res.json(user);
  } catch (error) {
    return next(error);
  }
});
```

- 最后修改 `resolvers`

```js
import UserSession from './UserSession';

const resolvers = { Query, Mutation, UserSession };
```

### 本节解析

**1、** `typeDefs.js` 里有这么一个 `type`

```js
  type UserSession {
    createdAt: Date!
    expriesAt: Date!
    id: ID!
    user: User!
  }
```

**2、** `mutation` 里的 `createUserSessionReslover` 只负责解析 数据库表 `UserSession` 里的数据，不管怎么解析 `type` 里的 `user`

```js
const createUserSessionReslover = async (_, { email, password }, context) => {
  const userSession = await UsersService.createUserSession({ email, password });

  context.res.cookie('userSessionId', userSession.id, { httpOnly: true });

  return userSession;
};
```

**3、** 补充 resolvers 登场，我负责解析 `type UserSession` 里的 `user` 对象！

```js
// src/graphql/index.js
import * as Query from './Query';
import * as Mutation from './Mutation';
import UserSession from './UserSession';

const resolvers = { Query, Mutation, UserSession };

export default resolvers;

// src/graphql/resolvers/UserSession.js
// [对话]: 小弟来帮你解析 `type UserSession` 下的 `user`
import UsersService from '#root/adapters/UsersService';

const UserSession = {
  user: async userSession => {
    return await UsersService.fetchUser({ userId: userSession.userId });
  },
};

export default UserSession;
```

> 前端使用 async/await 异步函数

在最顶层 index.js 文件加入 `import '@babel/polyfill';`

#### 登录的后端交互

```js
// classifieds-app/src/components/Login.js
const [createUserSession] = useMutation(mutation);

const onSubmit = handleSubmit(async ({ email, password }) => {
  const result = await createUserSession({
    variables: {
      email,
      password,
    },
  });
  console.log(result);
});
```

- 新增根据 `sessionId` 查询接口 `API`

```js
// users-services/src/server/routes.js
app.get('/sessions/:sessionId', async (req, res, next) => {
  try {
    const userSession = await UserSession.findByPk(req.params.sessionId);

    if (!userSession) {
      return next(new Error('Invalid session Id'));
    }

    return res.json(userSession);
  } catch (error) {
    return next(error);
  }
});
```

```js
// `api-gateway` 创建 `session` 注入中间件
// api-gateway/src/server/injectSession.js
import UsersService from '#root/adapters/UsersService';

const injectSession = async (req, res, next) => {
  if (req.cookies.userSessionId) {
    const userSession = await UsersService.fetchUserSession({
      sessionId: req.cookies.userSessionId,
    });
    res.locals.userSession = userSession;
  }

  return next();
};

export default injectSession;


// -----------------
// ★ api-gateway/src/server/startServer.js
app.use(cookieParser());

// 注意顺序，肯定要在拿到了 cookie 后再能启动这个中间件
app.use(injectSession);

apolloServer.applyMiddleware({ app, cors: false });


// -----------------
// 先修改 typeDefs.js
 userSession(me: Boolean!): UserSession


// -----------------
// 再创建Query解析器 graogql/resolvers/Query/userSession.js
const userSessionResolver = async (_, args, context) => {
  if (args.me !== true) throw new Error('Unsupported argument value');
  return context.res.locals.userSession;
};

export default userSessionResolver;



// -----------------
{
  userSession(me: false) {
    id
    createdAt
    user {
      id
      email
    }
  }
}
```

#### 从整体框架来看，如何添加新 Query

1. 具体某个服务添加新控制器，如在 `users-services` 里添加新业务控制器
2. 网关 `api-gateway` adapters 里注册这个接口
3. `graphql` 的 `typeDes.js` 注册这个 `query`

#### GrapgQL Playground 开启 cookie

- Settings

```json
{
  "request.credentials": "include"
}
```

## Part VII Redux

- `yarn add redux react-redux`

### 初始化 redux

```js
// src/store/index.js
import * as ducks from './ducks';
import { combineReducers, createStore } from 'redux';

const reducers = combineReducers(ducks);
const store = createStore(
  reducers,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;

// ------------
// /src/store/ducks/index.js
// actions
const CLEAR = 'session/CLEAR';
const SET = 'session/SET';

const DEFAULT_STATE = null;

// reducer
const sessionReducer = (state = DEFAULT_STATE, action = {}) => {
  switch (action.type) {
    case SET:
      return action.session;
    case CLEAR:
      return null;
    default:
      return state;
  }
};

export default sessionReducer;

// action creators
export const setSession = session => {
  return { session, type: SET };
};

export const clearSession = () => {
  return { type: CLEAR };
};

// -----------
// src/index.js
render(
  <Provider store={store}>
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Root />
      </ThemeProvider>
    </ApolloProvider>
  </Provider>,
  document.getElementById('app')
);
```

### Root 组件新增 cookie 初始化逻辑

> 仅仅只是初始化一个过程而已

```js
const Root = () => {
  const dispatch = useDispatch();
  const [initialised, setInitialised] = useState(false);

  useEffect(() => {
    graphqlClient.query({ query }).then(({ data }) => {
      if (data.userSession) {
        dispatch(setSession(data.userSession));
      }
      setInitialised(true);
    });
  }, []);

  if (!initialised) return 'Loading...';

  return (
    <Wrapper>
      <Container>
        <Content>Content</Content>
        <Sidebar>
          <Login />
        </Sidebar>
      </Container>
    </Wrapper>
  );
};
```

### 构建 AccountDetails 组件

- AccountDetails 组件包含两个子组件：Account 和 Login
- 如果在 Root 顶层组件换到了 session 时，就显示出 Account 组件
- 如果 redux 里没有 session 就显示 Login 组件
- 技巧：useSelector 获取 reudx state

```js
// src/components/AcountDetails
const AccountDetails = () => {
  const session = useSelector(state => state.session);

  if (session) return <Account />;

  return <Login />;
};

// ------------
// src/components/AcountDetails/Account.js
const Wrapper = styled.div`
  color: ${props => props.theme.mortar};
  font-size: 0.9rem;
`;

const Email = styled.div`
  color: ${props => props.theme.nero};
  font-size: 1.2rem;
  margin-top: 0.25rem;
`;

const Account = () => {
  const session = useSelector(state => state.session);
  return (
    <Wrapper>
      Logged in as <Email>{session.user.email}</Email>
    </Wrapper>
  );
};
```

## Part Ⅷ

### 登出功能

- users-service 新增删除 session API 接口
- api-gate 修改 typeDefs.js
- resolvers 新增 deleteUserSession.js
- adapters 修改 UsersService.js
- [前端] 登出 + useMutation

```js
// users-service/src/routes.js
app.delete('/sessions/:sessionId', async (req, res, next) => {
  try {
    const userSession = UserSession.findByPk(req.params.sessionId);

    if (!userSession) return next(new Error('Invalid session Id'));

    await userSession.destroy();

    return res.end();
  } catch (error) {
    return next(error);
  }
});


// ------------
// src/graphql/resolvers/Mutation/deleteUserSession.js
import UsersService from '#root/adapters/UsersService.js';

const deleteUserSessionReslover = async (_, { sessionId }, context) => {
  await UsersService.createUserSession({ sessionId });

  context.res.cleanrCookie('userSessionId');

  return true;
};

export default deleteUserSessionReslover;


// ------------
// src/adapters/UsersService.js
static async deleteUserSession({ sessionId }) {
  const body = await got.delete(`${USERS_SERVICE_URI}/sessions/${sessionId}`, { json: { sessionId } }).json();
  return body;
}


// ------------
// src/components/AccountDetails/Account
const mutation = gql`
  mutation($sessionId: !ID) {
    deleteUserSession(sessionId: $sessionId)
  }
`;

const LogoutLink = styled.a.attrs({ href: '#' })`
  color: blue;
  display: block;
  margin-top: 0.25rem;
`;

const Account = () => {
  const dispatch = useDispatch();
  const [deleteUserSession] = useMutation(mutation);
  const session = useSelector(state => state.session);
  return (
    <Wrapper>
      Logged in as <Email>{session.user.email}</Email>
      <LogoutLink
        onClick={evt => {
          evt.preventDefault();
          dispatch(clearSession());
          deleteUserSession({ variables: { sessionId: session.id } });
        }}
      >
        (登出)
      </LogoutLink>
    </Wrapper>
  );
};
```

> 不管是 graphQL、样式容器、组件全是函数，一点念想都没有。

### 修复正确登录更新 redux

```js
const onSubmit = handleSubmit(async ({ email, password }) => {
  const {
    data: { createUserSession: createdSession },
  } = await createUserSession({
    variables: {
      email,
      password,
    },
  });
  dispatch(setSession(createdSession));
});
```

### 注册

```js
const mutation = gql`
  mutation($email: String!, $password: String!) {
    createUser(email: $email, password: $password) {
      id
    }
  }
`;

const validationSchema = yup.object().shape({
  email: yup.string().required(),
  password: yup
    .string()
    .required()
    .test('sameAsConfirmPassword', '${path} is not the same as the confirmation password', function() {
      return this.parent.password === this.parent.confirmPassword;
    }),
});

const SignUp = ({ onChangeToLogin: pushChangeToLogin }) => {
  const [createUser] = useMutation(mutation);
  const {
    formState: { isSubmitting, isValid },
    handleSubmit,
    register,
    reset,
  } = useForm({ mode: 'onChange', validationSchema });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    await createUser({ variables: { email, password } });
    reset();
    pushChangeToLogin();
  });

  return (
    <form onSubmit={onSubmit}>
      <Lable>
        <LableText>Email</LableText>
        <TextInput disable={isSubmitting} name="email" type="email" ref={register} />
      </Lable>
      <Lable>
        <LableText>Password</LableText>
        <TextInput disable={isSubmitting} name="password" type="password" ref={register} />
      </Lable>
      <Lable>
        <LableText> Confirm Password</LableText>
        <TextInput disable={isSubmitting} name="confirmPassword" type="password" ref={register} />
      </Lable>
      <SignUpButton disabled={isSubmitting || !isValid} type="submit">
        Sign Up
      </SignUpButton> <OrLogin>
        or{' '}
        <a
          href="#"
          onClick={evt => {
            evt.preventDefault();
            pushChangeToLogin();
          }}
        >
          Login
        </a>
      </OrLogin>
    </form>
  );
};
```

## Part Ⅸ

> GraphQL 里 mutation 参数里 String 和 String! 都要校验一致性！

## Part X 部署

### 改造网关的环境变量

```yml
version: "3"
services:
  api-gateway:
    build: "./api-gateway"
    depends_on:
      - users-service
      - listings-service
    environment:
      - USERS_SERVICE_URI=http://users-service:7101
      - LISTINGS_SERVOCE_URI=http://listings-service:7100
    ports:
      - 7000:7000
    volumes:
      - ./api-gateway:/opt/app
```

```js
// api-gateway/src/adapters/ListingsService.js
import accessEnv from '#root/helpers/accessEnv';
const LISTINGS_SERVOCE_URI = accessEnv('LISTINGS_SERVOCE_URI');
```

import { Sequelize } from 'sequelize';

import accessEvn from '#root/helpers/accessEnv';

const DB_URI = accessEvn('DB_URI');

const sequelize = new Sequelize(DB_URI, {
  dialectOptions: {
    charset: 'utf8',
    multipleStatements: true,
  },
  logging: false,
});

export default sequelize;

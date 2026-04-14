import {Sequelize} from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();
const URL = process.env.CONNECTION_URL;
//prettier-ignore
const sequelize = new Sequelize(URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export default sequelize;

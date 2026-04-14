import {Sequelize} from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();
//prettier-ignore
const sequelize = new Sequelize(process.env.CONNECTION_URL,
  {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },  
  });

export default sequelize;

import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config(); 

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('ERRO: variável DATABASE_URL não está definida!');
  process.exit(1);
}

const sequelize = new Sequelize(connectionString, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false
});

async function test() {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco bem sucedida!');
  } catch (error) {
    console.error('Erro ao conectar:', error);
  }
}

test();

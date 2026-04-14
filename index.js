//Importaciones
import 'dotenv/config';
import express from 'express'; //para las solicitudes HTTP
import cookieParser from 'cookie-parser'; //para el manejo de cookies (por aqui se enviará el JWT)
import path from 'path';
import cors from 'cors'; //para la configuracion de CORS
import {Server} from 'socket.io'; //servidor de WebSockets
import http from 'http'; //para crear un servidor HTTP
import Rol from './src/utils/Rol.js';

//importaciones de inicializacion
import bcrypt from 'bcrypt'; //para el hash de las contraseñas
import UserModel from './src/models/Usuario.js';

//Importaciones de rutas
import authRoutes from './src/routes/Authentication.js';
import userRoutes from './src/routes/Usuarios.js';
import productRoutes from './src/routes/Productos.js';
import budgetRoutes from './src/routes/Presupuestos.js';
import brandRoutes from './src/routes/Marcas.js';
import categoryRoutes from './src/routes/Categorias.js';
import auditRoutes from './src/routes/Auditorias.js';
import xlsx from './src/routes/xlsx.js';
//const detailRoutes = require('./src/routes/Detalles'); se gestiona por webSockets

//Importaciones de base de datos
import sequelize from './src/config/sequelize.js';
import setDB from './src/models/index.js';

//configuraciones iniciales
const app = express(); //instancia de express
app.set('trust proxy', 1); //Render expone HTTPS a traves de proxy
const server = http.createServer(app); //creación del servidor HTTP
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'https://ui-presupuestos.vercel.app';
const io = new Server(server, {
  cors: {
    origin: FRONTEND_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true, 
});
import webSocket from './src/webSockets/wsPresupuestos.js';
webSocket(io);

// Configuración de CORS

const corsOptions = {
  origin: FRONTEND_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

// Middleware global (por ejemplo, parseo de JSON)
app.use(express.json());
app.use(cookieParser());

//Definición de rutas de express
app.use('/api', authRoutes);
app.use('/api', productRoutes);
app.use('/api', budgetRoutes);
//app.use('/api', detailRoutes); se gestiona por webSockets
app.use('/api', brandRoutes);
app.use('/api', categoryRoutes);
app.use('/api', userRoutes);
app.use('/api', auditRoutes);
app.use('/api', xlsx);

//Configuracion de Sequelize para la base de datos
setDB();
sequelize
  .authenticate()
  .then(() => console.log('¡Conexión exitosa con PostgreSQL! ✔'))
  .catch((err) => console.error('Error al conectar:', err));

sequelize
  .sync({force: false, alter: true}) // Crea o actualiza las tablas según los modelos
  .then(() => console.log('Tablas enlazadas/creadas exitosamente ✔'))
  .catch((err) => console.error('Error al crear tablas:', err));

//Funcion solo en desarrollo para inicializar la base de datos
const customInfo = async () => {
  console.log('Iniciando base de datos...');
  const userOvalles = {
    nombre: process.env.ADMIN_NAME || null,
    loginNombre: process.env.ADMIN_USER || null,
    clave: process.env.ADMIN_PASSWORD || null,
  };
  const visitante ={
    nombre: process.env.VISITOR_NAME || 'Visitante',
    loginNombre: process.env.VISITOR_USER || null,
    clave: process.env.VISITOR_PASSWORD || null,
  }

  const saltRounds = 10;
  const hashedOvalles = await bcrypt.hash(userOvalles.clave, saltRounds);
  const hashedVisitante = await bcrypt.hash(visitante.clave, saltRounds);

  try {
    //Creacion de usuarios
    if (userOvalles.clave)
      await UserModel.findOrCreate({
        where: {loginNombre: userOvalles.loginNombre},
        defaults: {
          nombre: userOvalles.nombre,
          loginNombre: userOvalles.loginNombre,
          clave: hashedOvalles,
          rol: Rol.SUPERADMIN,
        },
      });
    if (visitante.clave)
      await UserModel.findOrCreate({
        where: {loginNombre: visitante.loginNombre},
        defaults: {
          nombre: visitante.nombre,
          loginNombre: visitante.loginNombre,
          clave: hashedVisitante,
          rol: Rol.USER,
        },
      });
  } catch (error) {
    console.error('Inicializacion de base de datos:', error.message);
  }
};
customInfo()
  .then(() => console.log('Base de datos inicializada correctamente.'))
  .catch((error) => console.error('Error al inicializar la base de datos:', error));

// Inicia el servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT} 🚀`);
});

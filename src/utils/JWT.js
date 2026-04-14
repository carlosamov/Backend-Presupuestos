//Crear y verificar JWTs
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const generateToken = (user) => {
  return jwt.sign(user, process.env.JWT_KEY || 'CLAVE_SECRETA', {expiresIn: '24h'});
};

const checkToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_KEY || 'CLAVE_SECRETA');
  } catch (err) {
    return null;
  }
};

export {generateToken, checkToken};

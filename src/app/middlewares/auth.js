import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import authConfig from './../../config/auth';

export default async (req, res, next) => {
  const authHearer = req.headers.authorization;
  console.log(authHearer);

  if (!authHearer) {
    return res.status(401).json({
      message: 'Token not provided'
    });
  }

  const [, token] = authHearer.split(' ');
  //console.log(token);
  try {
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);
    //console.log(decoded);
    //console.log('logado, token e segredo confirmado!');
    req.userId = decoded.id;
    //console.log(req.userId);
  } catch (error) {
    return res.status(401).json({
      message: 'Token invalid'
    });
  }
  next();
};

import jwt from 'jsonwebtoken';
import UserAccounts from '../models/UserAccount.js';

export const requireAuth = (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    jwt.verify(token, process.env.MY_SECRET, (error, decodedToken) => {
      if (error) {
        console.log(error.message);
        res.redirect('/login');
      } else {
        next();
      }
    });
  } else {
    res.redirect('/login');
  }
};

export const checkUser = (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    jwt.verify(token, process.env.MY_SECRET, async (error, decodedToken) => {
      if (error) {
        res.locals.user = null;
        next();
      } else {
        const user = await UserAccounts.findById(decodedToken.id);
        res.locals.user = user;
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};

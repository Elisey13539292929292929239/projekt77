import UserAccount from '../models/UserAccount.js';
import jwt from 'jsonwebtoken';

const handleErrors = (err) => {
  console.log(err.message, err.code);

  const errors = { name: '', email: '', password: '' };

  if (err.message === 'Incorrect email')      errors.email    = 'That email is not registered';
  if (err.message === 'Incorrect password')   errors.password = 'That password is incorrect';

  if (err.code === 11000) {                   
    errors.email = 'That email is already registered';
    return errors;
  }

  if (err.message.includes('User validation failed')) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }
  return errors;
};

const createToken = (id) =>
  jwt.sign({ id }, process.env.MY_SECRET, { expiresIn: '1h' });

export function getSignUpUser(req, res) {
  try {
    res.render('signup', { message: 'Hello' });
  } catch (err) {
    console.error('Error loading Sign Up page:', err);
  }
}

export function getLoginUser(req, res) {
  try {
    res.render('login', { message: 'Hello' });
  } catch (err) {
    console.error('Error loading Login page:', err);
  }
}

export async function postingSignup(req, res) {
  const { name, email, password } = req.body;
  try {
    const userData = await UserAccount.create({ name, email, password });
    const token = createToken(userData._id);

    res.cookie('token', token, { httpOnly: true, maxAge: 60 * 60 * 1000 });
    res.status(201).json({ user: userData._id });
  } catch (err) {
    res.status(400).json({ errors: handleErrors(err) });
  }
}

export async function postingLogin(req, res) {
  const { email, password } = req.body;
  try {
    const user = await UserAccount.login(email, password);
    const token = createToken(user._id);

    res.cookie('token', token, { httpOnly: true, maxAge: 60 * 60 * 1000 });
    res.status(200).json({ user: user._id });
  } catch (err) {
    res.status(400).json({ errors: handleErrors(err) });
  }
}

export function getLogoutUser(req, res) {
  res.cookie('token', '', { maxAge: 1 });
  res.redirect('/');
}

const accountController = {
  getSignUpUser,
  getLoginUser,
  postingSignup,
  postingLogin,
  getLogoutUser,
};

export default accountController;

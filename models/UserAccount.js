import mongoose from 'mongoose';
import validator from 'validator';  // 👈 импортируем как default
import bcrypt from 'bcrypt';

const { isEmail } = validator;      // 👈 вытаскиваем isEmail


const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter a name']
  },
  email: {
    type: String,
    required: [true, 'Please enter an email'],
    unique: true,
    lowercase: true,
    validate: [isEmail, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minlength: [6, 'Minimum password length is 6 characters'],
  },
  liked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AnimeSync' }]
});

UserSchema.pre('save', async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.statics.login = async function(email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) return user;
    throw Error('Incorrect password');
  }
  throw Error('Incorrect email');
};

UserSchema.methods.addToFavorites = async function(animeId) {
  if (!this.liked.includes(animeId)) {
    this.liked.push(animeId);
    await this.save();
  }
};

const UserAccount = mongoose.model('User', UserSchema);
export default UserAccount;

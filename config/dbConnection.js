import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI);
    console.log('✅ MongoDB подключён');
  } catch (err) {
    console.error('❌ Ошибка подключения к MongoDB:', err.message);
  }
};

export default connectDB;

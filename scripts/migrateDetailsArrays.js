import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AnimeList from '../models/AnimeList.js';

dotenv.config();

const migrate = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI);
    console.log('✅ Connected to DB');

    const animeList = await AnimeList.find({});

    for (const anime of animeList) {
      let updated = false;

      anime.details = anime.details.map(detail => {
        if (typeof detail.studio === 'string') {
          detail.studio = [detail.studio];
          updated = true;
        }
        if (typeof detail.year === 'string') {
          detail.year = [detail.year];
          updated = true;
        }
        return detail;
      });

      if (updated) {
        await anime.save();
        console.log(`✔ Updated: ${anime.title}`);
      }
    }

    console.log('🎉 Migration complete.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration error:', err);
    process.exit(1);
  }
};

migrate();

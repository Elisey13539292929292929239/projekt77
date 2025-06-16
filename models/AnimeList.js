import mongoose from 'mongoose';

const detailsSchema = new mongoose.Schema({
  genre:    [String],
  episodes: Number,
  studio:   [String],    
  year:     [String]   
});


const commentsSchema = new mongoose.Schema({
  commenter: { type: String, required: true },
  text:      { type: String, required: true },
  rating:    { type: Number, min: 1, max: 5, default: null },
  createdAt: { type: Date, default: Date.now }
});

const AnimeSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  imageUrl:   String,
  overview:   String,
  details:    [detailsSchema],
  trailerUrl: { type: String },

  ratings:  [Number], 
  comments: [commentsSchema]
});

AnimeSchema.methods.calculateAverageRating = function () {
  const rated = this.comments.filter(c => c.rating !== null && c.rating !== undefined);
  const sum   = rated.reduce((acc, c) => acc + c.rating, 0);
  const avg   = sum / rated.length;
  if (!this.ratings) this.ratings = [];
  this.ratings[0] = isNaN(avg) ? null : parseFloat(avg.toFixed(1));
};

AnimeSchema.pre('save', function (next) {
  if (this.isModified('comments') || this.isNew) {
    this.calculateAverageRating();
  }
  next();
});

const AnimeList = mongoose.model('Anime', AnimeSchema);
export default AnimeList;

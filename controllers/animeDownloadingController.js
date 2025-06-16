import AnimeList from '../models/AnimeList.js';
import axios from 'axios';

export async function downloadAnimeToDB(req, res, next) {
  try {
    for (let page = 1; page <= 3; page++) {
      const response = await axios.get(`https://api.jikan.moe/v4/anime?sfw=true&page=${page}`);
      const animeData = response.data;

      for (let i = 0; i < animeData.data.length; i++) {
        const anime = {
          title: animeData.data[i].title_english || animeData.data[i].title,
          imageUrl: animeData.data[i].images.jpg.large_image_url,
          overview: animeData.data[i].synopsis,
          details: [{
            genre: animeData.data[i].genres.map(g => g.name),
            episodes: animeData.data[i].episodes,
            studio: animeData.data[i].studios.map(s => s.name),
            year: animeData.data[i].year || animeData.data[i].aired.prop.from.year
          }],
          trailerUrl: animeData.data[i].trailer?.embed_url
        };

        try {
          await AnimeList.create(anime);
        } catch (error) {
          console.error('DB insert error:', error.message);
        }
      }
    }
    res.redirect('/');
  } catch (error) {
    console.error('Fetch error:', error.message);
    next(error);
  }
}

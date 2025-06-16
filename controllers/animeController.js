import AnimeList from '../models/AnimeList.js';

export async function getAnimeList(req, res) {
  try {
    const anime = await AnimeList.aggregate([{ $sample: { size: 9 } }]);
    res.render('main', { anime, liked: [] });
  } catch (err) {
    res.status(500).send('Ошибка при загрузке главной страницы: ' + err.message);
  }
}

export async function getAnimeInfoById(req, res) {
  try {
    const { id } = req.query;
    const anime  = await AnimeList.findById(id);
    if (!anime) return res.status(404).json({ error: 'Anime not found' });

    const commentReviews = anime.comments ?? [];
    const user          = res.locals.user;
    const isFavorite    = user ? user.liked?.includes(id) : false;

    res.render('anime-information', {
      anime,
      commentReviews,
      isFavorite
    });
  } catch (err) {
    console.error('❌ getAnimeInfoById:', err);
    res.status(500).send('Internal Server Error');
  }
}

export async function searchAnimeByName(req, res) {
  try {
    const q = req.query.q || req.query.title;
    if (!q) return res.status(400).json({ error: 'Missing query param q' });

    const regex  = new RegExp(q, 'i');
    const result = await AnimeList.find({ title: regex });

    res.render('search', { anime: result });
  } catch (err) {
    res.status(500).send('Ошибка сервера при поиске: ' + err.message);
  }
}

/* ---------- список всех аниме ---------- */
export async function getAllAnimeList(req, res) {
  try {
    const anime = await AnimeList.find({});
    res.render('all', { anime });
  } catch (err) {
    res.status(500).send('Ошибка при загрузке списка всех аниме: ' + err.message);
  }
}

export function getAddingAnime(req, res) {
  res.render('add-anime', { edit: false });
}

export async function postAddingAnime(req, res) {
  try {
    const data = req.body;
    await AnimeList.create(data);
    res.redirect('/');
  } catch (err) {
    res.status(400).json({ error: 'Bad request' });
  }
}

export async function getEditingAnime(req, res) {
  try {
    const { id } = req.query;
    if (!id) return res.status(404).send('Anime not found');

    const anime = await AnimeList.findById(id);
    if (!anime) return res.status(404).send('Anime not found');

    res.render('edit-anime', { anime });
  } catch (err) {
    res.status(500).send('Server error');
  }
}

export async function postEditingAnime(req, res) {
  try {
    const { id, title, imageUrl, overview, genre, episodes, studio, year, trailerUrl } = req.body;

    const updatedData = {
      title,
      imageUrl,
      overview,
      trailerUrl,
      details: [{
        genre: genre ? genre.split(',').map(g => g.trim()) : [],
        episodes: episodes ? parseInt(episodes) : null,
        studio: studio ? studio.split(',').map(s => s.trim()) : [],
        year: year ? year.split(',').map(y => y.trim()) : []
      }]
    };

    await AnimeList.findByIdAndUpdate(id, updatedData);
    res.redirect('/');
  } catch (err) {
    res.status(400).json({ error: 'Bad request' });
  }
}

export async function toggleFavorite(req, res) {
  try {
    const user = res.locals.user;
    if (!user) {
      console.error('toggleFavorite: user is not authenticated');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { idAnime } = req.body;
    if (!idAnime) {
      console.error('toggleFavorite: missing idAnime in request body');
      return res.status(400).json({ error: 'Missing anime ID' });
    }

    console.log(`toggleFavorite: user ${user._id} toggling anime ${idAnime}`);

    const index = user.liked.findIndex(id => id.toString() === idAnime);
    if (index === -1) {
      user.liked.push(idAnime);
      console.log('toggleFavorite: anime added to favorites');
    } else {
      user.liked.splice(index, 1);
      console.log('toggleFavorite: anime removed from favorites');
    }

    await user.save();
    console.log('toggleFavorite: user saved successfully');

    res.status(200).json({ liked: user.liked });
  } catch (err) {
    console.error('toggleFavorite error:', err);
    res.status(500).json({ error: 'Error updating favorites' });
  }
}

export async function postingComment(req, res) {
  try {
    const { idAnime, comment, rating } = req.body;
    const user = res.locals.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    if (!idAnime || !comment) return res.status(400).json({ error: 'Missing data' });

    const anime = await AnimeList.findById(idAnime);
    if (!anime)  return res.status(404).json({ error: 'Anime not found' });

    anime.comments.push({
      commenter: user.name,
      text: comment,
      rating: rating ? Number(rating) : null
    });

    await anime.save();
    res.status(200).json({ message: 'Comment added' });
  } catch (err) {
    console.error('postingComment error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}



const animeController = {
  getAnimeList,
  getAnimeInfoById,
  searchAnimeByName,
  getAllAnimeList,
  getAddingAnime,
  postAddingAnime,
  getEditingAnime,
  postEditingAnime,
  toggleFavorite,
  postingComment,
};

export default animeController;

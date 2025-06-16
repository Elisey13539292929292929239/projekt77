import express from 'express';
const router = express.Router();

import { requireAuth, checkUser } from '../middleware/authMiddleware.js';
import animeController           from '../controllers/animeController.js';
import { downloadAnimeToDB }     from '../controllers/animeDownloadingController.js';
import accountController         from '../controllers/accountController.js';

/* ------------------------------------------------------------------ */
/*                        SWAGGER-КОММЕНТАРИИ                         */
/* ------------------------------------------------------------------ */

/**
 * @swagger
 * tags:
 *   - name: Anime
 *     description: Операции с аниме
 *   - name: Auth
 *     description: Регистрация и логин
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /search:
 *   get:
 *     tags: [Anime]
 *     summary: Поиск аниме по названию
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Например "Naruto"
 *     responses:
 *       200: { description: Список тайтлов }
 *       400: { description: Отсутствует параметр q }
 */
router.get('/search', animeController.searchAnimeByName);

/**
 * @swagger
 * /anime-info:
 *   get:
 *     tags: [Anime]
 *     summary: Детали аниме по ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: MongoDB ID тайтла
 *     responses:
 *       200: { description: Детали найдены }
 *       401: { description: Нужен JWT }
 *       404: { description: Не найдено }
 */
router.get('/anime-info', requireAuth, animeController.getAnimeInfoById);

/**
 * @swagger
 * /toggle-favorite:
 *   post:
 *     tags: [Anime]
 *     summary: Добавить/убрать тайтл из избранного
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idAnime: { type: string, example: 60f1b02c9a5c1234567890ab }
 *     responses:
 *       200: { description: Избранное обновлено }
 *       401: { description: Неавторизован }
 */
router.post(
  '/toggle-favorite',
  requireAuth,
  checkUser,
  animeController.toggleFavorite
);


router.get('*', checkUser);

router.get('/',        animeController.getAnimeList);
router.get('/all',     animeController.getAllAnimeList);

router.get('/add',  requireAuth, animeController.getAddingAnime);
router.post('/add', requireAuth, animeController.postAddingAnime);
router.get('/edit', requireAuth, animeController.getEditingAnime);
router.post('/edit', requireAuth, animeController.postEditingAnime);

router.post('/anime-info', requireAuth, checkUser, animeController.postingComment);

router.get('/download', downloadAnimeToDB);

router.get('/signup',  accountController.getSignUpUser);
router.get('/login',   accountController.getLoginUser);
router.post('/signup', accountController.postingSignup);
router.post('/login',  accountController.postingLogin);
router.get('/logout',  accountController.getLogoutUser);

export default router;

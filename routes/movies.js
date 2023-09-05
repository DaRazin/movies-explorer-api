const router = require('express').Router();

const {
  getMovies, createMovie, deleteMovie,
} = require('../controllers/movies');

const {
  validMovieId, validCreateMovie,
} = require('../middlewares/validator');

router.get('/movies', getMovies);
router.post('/movies', validCreateMovie, createMovie);
router.delete('/movies/:movieId', validMovieId, deleteMovie);

module.exports = router;

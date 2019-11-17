const models = require('../models');
const query = require('querystring');
const url = require('url');

const Quiz = models.Quiz;

const createQuiz = (req, res) => {
  if (!req.body.name || !req.body.description || !req.body.questions || !req.body.outcomes) {
    return res.status(400).json({ error: 'Missing required field' });
  }

  const quizData = {
    name: req.body.name,
    description: req.body.description,
    owner: req.session.account._id,
    questions: req.body.questions,
    outcomes: req.body.outcomes,
  };

  const newQuiz = new Quiz.QuizModel(quizData);

  const quizPromise = newQuiz.save();

  quizPromise.then(() => res.json({ redirect: '/' }));

  quizPromise.catch((err) => {
    console.log(err);
    return res.status(400).json({ error: 'An error occurred' });
  });

  return quizPromise;
};

const makeQuizPage = (req, res) => res.render('makeQuiz', { csrfToken: req.csrfToken() });

const takeQuizPage = (req, res) => {
  const parsedUrl = url.parse(req.url);
  const params = query.parse(parsedUrl.query);
  if (!params.name || !params.description) {
    return res.status(400).json({ error: 'Missing name or description' });
  }

  return res.render('takeQuiz', { csrfToken: req.csrfToken(), name: params.name,
    description: params.description });
};

const getQuiz = (req, res) => {
  const parsedUrl = url.parse(req.url);
  const params = query.parse(parsedUrl.query);
  if (!params.name || !params.description) {
    return res.status(400).json({ error: 'Missing name or description' });
  }

  return Quiz.QuizModel.findByNameAndDescription(params.name, params.description, (err, doc) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    return res.status(200).json({ quiz: doc[0] });
  });
};

const getQuizzes = (req, res) => Quiz.QuizModel.getAllQuizzes((err, docs) => {
  if (err) {
    console.log(err);
    return res.status(400).json({ error: 'An error occurred' });
  }

  return res.json({ quizzes: docs });
});

module.exports.createQuiz = createQuiz;
module.exports.makeQuizPage = makeQuizPage;
module.exports.takeQuizPage = takeQuizPage;
module.exports.getQuizzes = getQuizzes;
module.exports.getQuiz = getQuiz;

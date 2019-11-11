const models = require('../models');
const Quiz = models.Quiz;

const createQuiz = (req, res) => {
  if (!req.body.name || !req.body.description || !req.body.questions) {
    return res.status(400).json({ error: 'Missing required field' });
  }

  const quizData = {
    name: req.body.name,
    description: req.body.description,
    owner: req.session.account._id,
    questions: req.body.questions,
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
  Quiz.QuizModel.findById(req.quizId, (err, doc) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    return res.render('takeQuiz', { csrfToken: req.csrfToken(), quiz: doc });
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

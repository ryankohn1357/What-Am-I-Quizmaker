const models = require('../models');

const Quiz = models.Quiz;

// store a quiz in the database with the given name/description/questions/outcomes
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

  quizPromise.then(() => res.status(201).json({ redirect: '/' }));

  quizPromise.catch((err) => {
    console.log(err);
    return res.status(400).json({ error: 'An error occurred' });
  });

  return quizPromise;
};

const updateQuiz = (req, res) => {
  if (!req.body.quizId || !req.body.name || !req.body.description
    || !req.body.questions || !req.body.outcomes) {
    return res.status(400).json({ error: 'Missing required field' });
  }

  const quizData = {
    name: req.body.name,
    description: req.body.description,
    questions: req.body.questions,
    outcomes: req.body.outcomes,
  };

  return Quiz.QuizModel.updateQuiz(req.body.quizId, quizData, (err) => {
    if (err) {
      return res.status(400).json({ error: 'Failed to update quiz' });
    }
    return res.status(200).json({ redirect: '/' });
  });
};

const deleteQuiz = (req, res) => {
  if (!req.body.quizId) {
    return res.status(400).json({ error: 'Missing quiz id' });
  }

  return Quiz.QuizModel.deleteQuiz(req.body.quizId, (err) => {
    if (err) {
      return res.status(400).json({ error: 'Failed to delete quiz' });
    }
    return res.status(200).json({ message: 'Quiz deleted' });
  });
};

// returns makeQuiz view
const makeQuizPage = (req, res) => {
  let quizToChange = '';
  if (req.query.quizToChange) {
    quizToChange = req.query.quizToChange;
  }
  return res.render('makeQuiz', { csrfToken: req.csrfToken(), quizToChange });
};


// returns takeQuiz view with the given quiz name and description
const takeQuizPage = (req, res) => {
  if (!req.query.quizName || !req.query.quizDescription || !req.query.quizId) {
    return res.status(400).json({ error: 'Missing name, description, or id' });
  }

  return res.render('takeQuiz', {
    csrfToken: req.csrfToken(), quizName: req.query.quizName,
    quizDescription: req.query.quizDescription, quizId: req.query.quizId,
  });
};

// returns a quiz from the database with the given name and description
const getQuiz = (req, res) => {
  if (!req.query.quizId) {
    return res.status(400).json({ error: 'Missing quiz id' });
  }

  return Quiz.QuizModel.findById(req.query.quizId, (err, doc) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    return res.status(200).json({ quiz: doc[0] });
  });
};

// returns all quizzes from the database
const getQuizzes = (req, res) => {
  if (req.query.filterByOwner) {
    return Quiz.QuizModel.findByOwner(req.session.account._id, (err, docs) => {
      if (err) {
        console.log(err);
        return res.status(400).json({ error: 'An error occurred' });
      }

      return res.status(200).json({ quizzes: docs });
    });
  }
  return Quiz.QuizModel.getAllQuizzes((err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    return res.json({ quizzes: docs });
  });
};

module.exports.createQuiz = createQuiz;
module.exports.makeQuizPage = makeQuizPage;
module.exports.takeQuizPage = takeQuizPage;
module.exports.getQuizzes = getQuizzes;
module.exports.getQuiz = getQuiz;
module.exports.deleteQuiz = deleteQuiz;
module.exports.updateQuiz = updateQuiz;

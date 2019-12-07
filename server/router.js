const controllers = require('./controllers');
const mid = require('./middleware');

// route all requests to the appropriate controller
const router = (app) => {
  app.get('/getToken', mid.requiresSecure, controllers.Account.getToken);
  app.get('/main', mid.requiresSecure, controllers.Account.mainPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
  app.post('/changePassword', mid.requiresSecure, mid.requiresLogin,
                                controllers.Account.changePassword);
  app.get('/logout', mid.requiresLogin, controllers.Account.logout);
  app.get('/makeQuiz', mid.requiresSecure, mid.requiresLogin, controllers.Quiz.makeQuizPage);
  app.post('/makeQuiz', mid.requiresLogin, controllers.Quiz.createQuiz);
  app.post('/deleteQuiz', mid.requiresLogin, controllers.Quiz.deleteQuiz);
  app.post('/updateQuiz', mid.requiresSecure, controllers.Quiz.updateQuiz);
  app.get('/getQuizzes', mid.requiresSecure, controllers.Quiz.getQuizzes);
  app.get('/getQuiz', mid.requiresSecure, controllers.Quiz.getQuiz);
  app.get('/takeQuiz', mid.requiresSecure, controllers.Quiz.takeQuizPage);
  app.get('/', mid.requiresSecure, controllers.Account.mainPage);
};

module.exports = router;

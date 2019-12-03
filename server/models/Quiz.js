const mongoose = require('mongoose');
const _ = require('underscore');

mongoose.Promise = global.Promise;
let QuizModel = {};

const convertId = mongoose.Types.ObjectId;
const setName = (name) => _.escape(name).trim();

// all information contained by a quiz to be stored in the database
const QuizSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    set: setName,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  questions: {
    type: [
      {
        question: String,
        answers: [
          {
            answer: String,
            weights: [
              {
                outcome: String,
                weight: Number,
              },
            ],
          },
        ],
      },
    ],
    required: true,
  },
  outcomes: {
    type: [{ name: String, description: String }],
    required: true,
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

// information to send about a quiz to the client
QuizSchema.statics.toAPI = doc => ({
  name: doc.name,
  description: doc.description,
  questions: doc.questions,
  outcomes: doc.outcomes,
  _id: doc._id,
});

// search the database for a quiz with a specific owner
QuizSchema.statics.findByOwner = (ownerId, callback) => {
  const search = {
    owner: convertId(ownerId),
  };

  return QuizModel.find(search).select('name description questions outcomes').exec(callback);
};

// search the database for a quiz with a specific name + description
QuizSchema.statics.findByNameAndDescription = (name, description, callback) => {
  const search = {
    name,
    description,
  };
  return QuizModel.find(search).select('name description questions outcomes').exec(callback);
};

// search for a quiz with the given id
QuizSchema.statics.findById = (id, callback) => {
  const search = {
    _id: id,
  };
  return QuizModel.find(search).select('name description questions outcomes').exec(callback);
};

// returns all quizzes in the database
QuizSchema.statics.getAllQuizzes = (callback) => {
  QuizModel.find(callback);
};

QuizModel = mongoose.model('Quiz', QuizSchema);

module.exports.QuizModel = QuizModel;
module.exports.QuizSchema = QuizSchema;

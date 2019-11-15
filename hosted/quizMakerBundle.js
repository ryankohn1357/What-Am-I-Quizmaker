"use strict";

var quiz = {};
var quizName = "";
var quizDescription = "";
var numQuestions = 1;
var numOutcomes = 1;
var answersPerQuestion = 4;
var questionPos = 0;
var outcomes = [];

var handleInitialWindow = function handleInitialWindow() {
    var name = document.querySelector("#quizName").value;
    var description = document.querySelector("#quizDescription").value;

    if (name == '' || description == '') {
        handleError("Missing quiz name or description");
        return false;
    }

    quizName = name;
    quizDescription = description;
    numQuestions = Number(document.querySelector("#numQuestions").value);
    numOutcomes = Number(document.querySelector("#numOutcomes").value);
    answersPerQuestion = Number(document.querySelector("#answersPerQuestion").value);
    document.querySelector("#content").innerHTML = "";
    createOutcomesWindow();
};

var handleQuizOutcomes = function handleQuizOutcomes() {
    for (var i = 0; i < numOutcomes; i++) {
        var outcome = document.querySelector("#outcome" + i);
        var outcomeName = outcome.querySelector("#outcomeName" + i).value;
        var outcomeDescription = outcome.querySelector("#outcomeDescription" + i).value;
        if (outcomeName == "" || outcomeDescription == "") {
            handleError("Missing outcome name or description");
            outcomes = [];
            return false;
        }
        outcomes.push({ name: outcomeName, description: outcomeDescription });
    }
    document.querySelector("#content").innerHTML = "";
    createQuestionsWindow();
};

var InitialWindow = function InitialWindow() {
    return React.createElement(
        "div",
        { id: "initialQuizWindow" },
        React.createElement(
            "label",
            null,
            "Quiz Name:",
            React.createElement("input", { id: "quizName" })
        ),
        React.createElement(
            "label",
            null,
            "Quiz Description:",
            React.createElement("textarea", { id: "quizDescription" })
        ),
        React.createElement(
            "label",
            null,
            "Number of Questions:",
            React.createElement("input", { id: "numQuestions", type: "range", min: "1", max: "50" }),
            React.createElement(
                "label",
                { id: "questionSliderLabel" },
                "1"
            )
        ),
        React.createElement(
            "label",
            null,
            "Answers Per Question:",
            React.createElement("input", { id: "answersPerQuestion", type: "range", min: "2", max: "6" }),
            React.createElement(
                "label",
                { id: "answersPerQuestionSliderLabel" },
                "4"
            )
        ),
        React.createElement(
            "label",
            null,
            "Number of Possible Outcomes:",
            React.createElement("input", { id: "numOutcomes", type: "range", min: "2", max: "15" }),
            React.createElement(
                "label",
                { id: "outcomeSliderLabel" },
                "2"
            )
        ),
        React.createElement(
            "button",
            { id: "initialSubmitButton" },
            "Next"
        )
    );
};

var OutcomesWindow = function OutcomesWindow() {
    var outcomeArray = [];
    for (var i = 0; i < numOutcomes; i++) {
        outcomeArray.push(i);
    }

    var outcomeNodes = outcomeArray.map(function (num) {
        return React.createElement(
            "div",
            { id: "outcome" + num },
            React.createElement(
                "label",
                null,
                "Outcome Name:",
                React.createElement("input", { id: "outcomeName" + num })
            ),
            React.createElement(
                "label",
                null,
                "Outcome Description:",
                React.createElement("input", { id: "outcomeDescription" + num })
            )
        );
    });

    return React.createElement(
        "div",
        null,
        React.createElement(
            "div",
            null,
            outcomeNodes
        ),
        React.createElement(
            "button",
            { id: "outcomeSubmitButton" },
            "Next"
        )
    );
};

var QuestionsWindow = function QuestionsWindow() {
    var questionArray = [];
    for (var i = 0; i < numQuestions; i++) {
        questionArray.push(i);
    }
    var answerArray = [];
    for (var _i = 0; _i < answersPerQuestion; _i++) {
        answerArray.push(_i);
    }
    var outcomeArray = [];
    for (var _i2 = 0; _i2 < numOutcomes; _i2++) {
        outcomeArray.push(_i2);
    }

    var outcomeNodes = outcomeArray.map(function (num) {
        return React.createElement(
            "div",
            { className: "outcomeContainer", id: "outcomeContainer" + num },
            React.createElement(
                "div",
                null,
                React.createElement(
                    "h3",
                    { className: "outcome" },
                    outcomes[num].name
                ),
                React.createElement(
                    "label",
                    null,
                    "Weight:",
                    React.createElement("input", { className: "weight", type: "range", min: "0", max: "100" }),
                    React.createElement(
                        "label",
                        { className: "weightSliderLabel" },
                        "0"
                    )
                )
            )
        );
    });

    var answerNodes = answerArray.map(function (num) {
        return React.createElement(
            "div",
            { "class": "answerContainer", id: "answerContainer" + num },
            React.createElement(
                "label",
                null,
                "Answer ",
                num + 1,
                ":",
                React.createElement("textarea", { className: "answer" })
            ),
            React.createElement(
                "div",
                { className: "outcomeNodes" },
                outcomeNodes
            )
        );
    });

    var questionNodes = questionArray.map(function (num) {
        return React.createElement(
            "div",
            { className: "questionContainer", id: "questionContainer" + num },
            React.createElement(
                "label",
                null,
                "Question:",
                React.createElement("textarea", { className: "question" })
            ),
            React.createElement(
                "label",
                null,
                "Answers:",
                React.createElement(
                    "div",
                    { className: "answerContainers" },
                    answerNodes
                )
            )
        );
    });

    return React.createElement(
        "div",
        null,
        React.createElement(
            "div",
            { id: "questions" },
            questionNodes
        ),
        React.createElement(
            "button",
            { id: "questionSubmitButton" },
            "Submit Quiz"
        )
    );
};

var createQuestionsWindow = function createQuestionsWindow() {
    ReactDOM.render(React.createElement(QuestionsWindow, null), document.querySelector("#content"));

    var questions = document.querySelector("#questions");
    for (var i = 0; i < numQuestions; i++) {
        var questionContainer = questions.querySelector("#questionContainer" + i);
        var answerContainers = questionContainer.querySelector(".answerContainers");
        for (var j = 0; j < answersPerQuestion; j++) {
            var answerContainer = answerContainers.querySelector("#answerContainer" + j);

            var _loop = function _loop(k) {
                var outcomeContainer = answerContainer.querySelector("#outcomeContainer" + k);
                var weightSlider = outcomeContainer.querySelector(".weight");
                weightSlider.value = 0;
                weightSlider.addEventListener("input", function (e) {
                    outcomeContainer.querySelector(".weightSliderLabel").innerHTML = e.target.value;
                });
            };

            for (var k = 0; k < numOutcomes; k++) {
                _loop(k);
            }
        }
    }

    document.querySelector("#questionSubmitButton").addEventListener("click", function () {
        getToken(handleQuizSubmission);
    });
};

var handleQuizSubmission = function handleQuizSubmission(csrf) {
    quiz.name = quizName;
    quiz.description = quizDescription;
    quiz.outcomes = outcomes;
    quiz.questions = [];

    var questions = document.querySelector("#questions");
    for (var i = 0; i < numQuestions; i++) {
        var newQuestion = {};
        var questionContainer = questions.querySelector("#questionContainer" + i);
        newQuestion.question = questionContainer.querySelector(".question").value;
        var answers = [];
        var answerContainers = questionContainer.querySelector(".answerContainers");
        for (var j = 0; j < answersPerQuestion; j++) {
            var answerContainer = answerContainers.querySelector("#answerContainer" + j);
            var newAnswer = {};
            newAnswer.answer = answerContainer.querySelector(".answer").value;
            var _outcomes = answerContainer.querySelector(".outcomeNodes");
            var weights = [];
            for (var k = 0; k < numOutcomes; k++) {
                var _outcomeContainer = _outcomes.querySelector("#outcomeContainer" + k);
                var newWeight = {};
                newWeight.outcome = _outcomeContainer.querySelector(".outcome").innerHTML;
                newWeight.weight = _outcomeContainer.querySelector(".weight").value;
                weights.push(newWeight);
            }
            newAnswer.weights = weights;
            answers.push(newAnswer);
        }
        newQuestion.answers = answers;
        quiz.questions.push(newQuestion);
    }

    console.log(quiz);
};

var createInitialWindow = function createInitialWindow() {
    ReactDOM.render(React.createElement(InitialWindow, null), document.querySelector("#content"));
    document.querySelector("#initialSubmitButton").addEventListener("click", handleInitialWindow);

    var numQuestionsSlider = document.querySelector("#numQuestions");
    numQuestionsSlider.value = 1;
    numQuestionsSlider.addEventListener("input", function (e) {
        document.querySelector("#questionSliderLabel").innerHTML = e.target.value;
    });
    var numOutcomesSlider = document.querySelector("#numOutcomes");
    numOutcomesSlider.value = 2;
    numOutcomesSlider.addEventListener("input", function (e) {
        document.querySelector("#outcomeSliderLabel").innerHTML = e.target.value;
    });
    var answersPerQuestionSlider = document.querySelector("#answersPerQuestion");
    answersPerQuestionSlider.value = 4;
    answersPerQuestionSlider.addEventListener("input", function (e) {
        document.querySelector("#answersPerQuestionSliderLabel").innerHTML = e.target.value;
    });
};

var createOutcomesWindow = function createOutcomesWindow() {
    ReactDOM.render(React.createElement(OutcomesWindow, null), document.querySelector("#content"));
    document.querySelector("#outcomeSubmitButton").addEventListener("click", handleQuizOutcomes);
};

var setup = function setup() {
    createInitialWindow();
};

var getToken = function getToken(callback) {
    sendAjax('GET', '/getToken', null, function (result) {
        callback(result.csrfToken);
    });
};

$(document).ready(function () {
    setup();
});
"use strict";

var handleError = function handleError(message) {
    console.log(message);
};

var redirect = function redirect(response) {
    window.location = response.redirect;
};

var sendAjax = function sendAjax(type, action, data, success) {
    $.ajax({
        cache: false,
        type: type,
        url: action,
        data: data,
        dataType: "json",
        success: success,
        error: function error(xhr, status, _error) {
            var messageObj = JSON.parse(xhr.responseText);
            handleError(messageObj.error);
        }
    });
};

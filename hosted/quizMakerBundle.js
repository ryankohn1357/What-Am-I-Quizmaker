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
    var csrf = document.querySelector("#_csrf").value;

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
    createOutcomesWindow(csrf);
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
    var csrf = document.querySelector("#_csrf").value;
    document.querySelector("#content").innerHTML = "";
    createQuestionsWindow(csrf);
};

var handleQuizSubmission = function handleQuizSubmission() {
    quiz.name = quizName;
    quiz.description = quizDescription;
    quiz.outcomes = outcomes;
    quiz.questions = [];

    var questions = document.querySelector("#questions");
    for (var i = 0; i < numQuestions; i++) {
        var newQuestion = {};
        var questionContainer = questions.querySelector("#questionContainer" + i);
        newQuestion.question = questionContainer.querySelector(".question").value;
        if (newQuestion.question == '') {
            handleError("Missing question");
            quiz = {};
            return false;
        }
        var answers = [];
        var answerContainers = questionContainer.querySelector(".answerContainers");
        for (var j = 0; j < answersPerQuestion; j++) {
            var answerContainer = answerContainers.querySelector("#answerContainer" + j);
            var newAnswer = {};
            newAnswer.answer = answerContainer.querySelector(".answer").value;
            if (newAnswer.answer == '') {
                handleError("Missing answer");
                quiz = {};
                return false;
            }
            var _outcomes = answerContainer.querySelector(".outcomeNodes");
            var weights = [];
            for (var k = 0; k < numOutcomes; k++) {
                var outcomeContainer = _outcomes.querySelector("#outcomeContainer" + k);
                var newWeight = {};
                newWeight.outcome = outcomeContainer.querySelector(".outcome").innerHTML;
                newWeight.weight = outcomeContainer.querySelector(".weight").value;
                weights.push(newWeight);
            }
            newAnswer.weights = weights;
            answers.push(newAnswer);
        }
        newQuestion.answers = answers;
        quiz.questions.push(newQuestion);
    }

    var csrf = document.querySelector("#_csrf").value;

    sendAjax('POST', "/makeQuiz", {
        _csrf: csrf, questions: quiz.questions,
        name: quiz.name, description: quiz.description, outcomes: quiz.outcomes
    }, redirect);
};

var InitialWindow = function InitialWindow(props) {
    return React.createElement(
        "div",
        { id: "initialQuizWindow" },
        React.createElement("input", { id: "quizName", placeholder: "Quiz Name" }),
        React.createElement("textarea", { id: "quizDescription", placeholder: "Quiz Description" }),
        React.createElement(
            "label",
            null,
            "Number of Questions:"
        ),
        React.createElement("input", { id: "numQuestions", type: "range", min: "1", max: "50" }),
        React.createElement(
            "label",
            { id: "questionSliderLabel" },
            "1"
        ),
        React.createElement(
            "label",
            null,
            "Answers Per Question:"
        ),
        React.createElement("input", { id: "answersPerQuestion", type: "range", min: "2", max: "6" }),
        React.createElement(
            "label",
            { id: "answersPerQuestionSliderLabel" },
            "4"
        ),
        React.createElement(
            "label",
            null,
            "Number of Possible Outcomes:"
        ),
        React.createElement("input", { id: "numOutcomes", type: "range", min: "2", max: "15" }),
        React.createElement(
            "label",
            { id: "outcomeSliderLabel" },
            "2"
        ),
        React.createElement(
            "button",
            { id: "initialSubmitButton" },
            "Next"
        ),
        React.createElement("input", { type: "hidden", value: props.csrf, id: "_csrf" })
    );
};

var OutcomesWindow = function OutcomesWindow(props) {
    var outcomeArray = [];
    for (var i = 0; i < numOutcomes; i++) {
        outcomeArray.push(i);
    }

    var outcomeNodes = outcomeArray.map(function (num) {
        return React.createElement(
            "div",
            { id: "outcome" + num, className: "outcome" },
            React.createElement("input", { id: "outcomeName" + num, placeholder: "Outcome " + num + " Name" }),
            React.createElement("input", { id: "outcomeDescription" + num, placeholder: "Outcome " + num + " Description" })
        );
    });

    return React.createElement(
        "div",
        null,
        React.createElement(
            "div",
            { id: "outcomeWindow" },
            outcomeNodes
        ),
        React.createElement(
            "button",
            { id: "outcomeSubmitButton" },
            "Next"
        ),
        React.createElement("input", { type: "hidden", value: props.csrf, id: "_csrf" })
    );
};

var QuestionsWindow = function QuestionsWindow(props) {
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
            React.createElement("textarea", { className: "answer", placeholder: "Answer" + (num + 1) }),
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
            React.createElement("textarea", { className: "question", placeholder: "Question" }),
            React.createElement(
                "div",
                { className: "answerContainers" },
                answerNodes
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
        ),
        React.createElement("input", { type: "hidden", value: props.csrf, id: "_csrf" })
    );
};

var createQuestionsWindow = function createQuestionsWindow(csrf) {
    ReactDOM.render(React.createElement(QuestionsWindow, { csrf: csrf }), document.querySelector("#content"));

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
        handleQuizSubmission();
    });
};

var createInitialWindow = function createInitialWindow(csrf) {
    ReactDOM.render(React.createElement(InitialWindow, { csrf: csrf }), document.querySelector("#content"));
    document.querySelector("#initialSubmitButton").addEventListener("click", function () {
        handleInitialWindow();
    });
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

var createOutcomesWindow = function createOutcomesWindow(csrf) {
    ReactDOM.render(React.createElement(OutcomesWindow, { csrf: csrf }), document.querySelector("#content"));
    document.querySelector("#outcomeSubmitButton").addEventListener("click", function () {
        handleQuizOutcomes();
    });
};

var setup = function setup(csrf) {
    createInitialWindow(csrf);
};

var getToken = function getToken() {
    sendAjax('GET', '/getToken', null, function (result) {
        setup(result.csrfToken);
    });
};

$(document).ready(function () {
    getToken();
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

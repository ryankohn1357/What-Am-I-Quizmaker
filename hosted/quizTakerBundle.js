"use strict";

var quiz = {};
var currentQuestion = 0;
var outcomeProgress = {};

var QuestionWindow = function QuestionWindow(props) {
    var answerNodes = props.answers.map(function (answerObj) {
        return React.createElement(
            "div",
            null,
            React.createElement(
                "p",
                { className: "answerOption" },
                answerObj.answer
            )
        );
    });
    return React.createElement(
        "div",
        { id: "questionWindow" },
        React.createElement(
            "h4",
            null,
            props.question
        ),
        React.createElement(
            "div",
            null,
            answerNodes
        )
    );
};

var ResultWindow = function ResultWindow(props) {
    return React.createElement(
        "div",
        { id: "resultWindow" },
        React.createElement(
            "h1",
            null,
            "You are a ",
            props.result,
            "!"
        ),
        React.createElement(
            "p",
            null,
            props.description
        ),
        React.createElement(
            "button",
            { className: "formSubmit", id: "returnButton" },
            "Return"
        )
    );
};

var createQuestionWindow = function createQuestionWindow() {
    var questionObj = quiz.questions[currentQuestion];
    var answersObj = questionObj.answers;
    ReactDOM.render(React.createElement(QuestionWindow, { question: questionObj.question, answers: answersObj }), document.querySelector("#content"));

    setupQuestionWindowEvents();
};

var setupQuestionWindowEvents = function setupQuestionWindowEvents() {
    var questionObj = quiz.questions[currentQuestion];
    var answersObj = questionObj.answers;
    var answerOptions = document.querySelectorAll(".answerOption");

    var _loop = function _loop(i) {
        var answer = answerOptions[i].innerHTML;
        answerOptions[i].onclick = function () {
            for (var j = 0; j < answersObj.length; j++) {
                var answerObj = answersObj[j];
                if (answerObj.answer == answer) {
                    var weights = answerObj.weights;
                    for (var k = 0; k < weights.length; k++) {
                        var weightObj = weights[k];
                        outcomeProgress[weightObj.outcome] += weightObj.weight;
                    }
                }
            }

            if (currentQuestion == quiz.questions.length - 1) {
                currentQuestion = 0;
                createResultWindow();
            } else {
                currentQuestion++;
                createQuestionWindow();
            }
        };
    };

    for (var i = 0; i < answerOptions.length; i++) {
        _loop(i);
    }
};

var createResultWindow = function createResultWindow() {
    var maxWeight = 0;
    var quizResult = "";
    var outcomeDescription = "";
    for (var outcome in outcomeProgress) {
        if (outcomeProgress[outcome] > maxWeight) {
            quizResult = outcome;
            maxWeight = outcomeProgress[outcome];
        }
    }
    for (var i = 0; i < quiz.outcomes.length; i++) {
        var outcomeObj = quiz.outcomes[i];
        if (outcomeObj.name == quizResult) {
            outcomeDescription = outcomeObj.description;
            break;
        }
    }

    console.log(quizResult);
    ReactDOM.render(React.createElement(ResultWindow, { result: quizResult, description: outcomeDescription }), document.querySelector("#content"));

    document.querySelector("#returnButton").addEventListener("click", function () {
        window.location = "/";
    });
};

var loadQuizFromServer = function loadQuizFromServer() {
    var quizName = document.querySelector("#title").innerHTML;
    var quizDescription = document.querySelector("#description").innerHTML;
    var url = "/getQuiz?name=" + quizName + "&description=" + quizDescription;
    sendAjax("GET", url, null, function (result) {
        quiz = result.quiz;
        var outcomes = quiz.outcomes;
        for (var i = 0; i < outcomes.length; i++) {
            outcomeProgress[outcomes[i].name] = 0;
        }
        createQuestionWindow();
    });
};

$(document).ready(function () {
    loadQuizFromServer();
});
"use strict";

var handleError = function handleError(message) {
    var error = document.querySelector("#error");
    if (error) {
        error.innerHTML = message;
    }
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
            if (xhr.responseJSON) {
                handleError(xhr.responseJSON.error);
            } else {
                handleError(_error);
            }
        }
    });
};

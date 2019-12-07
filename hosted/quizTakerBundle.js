"use strict";

var quiz = {};
var currentQuestion = 0;

// When each question is answered, store the answer's weights
// for each outcome in outcome progress. At the end of the quiz,
// whatever outcome has the heighest weight is the result.
var outcomeProgress = {};

// react element for a quiz question
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
            { id: "quizTakerQuestion" },
            props.question
        ),
        React.createElement(
            "div",
            null,
            answerNodes
        )
    );
};

// react element for displaying results of quiz
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

// render question window to screen and setup events
var createQuestionWindow = function createQuestionWindow() {
    var questionObj = quiz.questions[currentQuestion];
    var answersObj = questionObj.answers;
    ReactDOM.render(React.createElement(QuestionWindow, { question: questionObj.question, answers: answersObj }), document.querySelector("#content"));

    setupQuestionWindowEvents();
};

// setup events for clicking on the answer to a question
var setupQuestionWindowEvents = function setupQuestionWindowEvents() {
    var questionObj = quiz.questions[currentQuestion];
    var answersObj = questionObj.answers;
    var answerOptions = document.querySelectorAll(".answerOption");

    var _loop = function _loop(i) {
        var answer = answerOptions[i].innerHTML;
        answerOptions[i].onclick = function () {
            // increment progress towards different outcomes based on
            // the weights of the chosen answer
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
            // render next question or results, depending on where the
            // user is in the quiz
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

// determine result and render results window to content
var createResultWindow = function createResultWindow() {
    // find which outcome had the highest weight
    var maxWeight = 0;
    var quizResult = "";
    var outcomeDescription = "";
    for (var outcome in outcomeProgress) {
        if (outcomeProgress[outcome] >= maxWeight) {
            quizResult = outcome;
            maxWeight = outcomeProgress[outcome];
        }
    }
    // find the description for the result
    for (var i = 0; i < quiz.outcomes.length; i++) {
        var outcomeObj = quiz.outcomes[i];
        if (outcomeObj.name == quizResult) {
            outcomeDescription = outcomeObj.description;
            break;
        }
    }
    ReactDOM.render(React.createElement(ResultWindow, { result: quizResult, description: outcomeDescription }), document.querySelector("#content"));

    // setup event for return button
    document.querySelector("#returnButton").addEventListener("click", function () {
        window.location = "/";
    });
};

// get the quiz with the given name and description from the server
var loadQuizFromServer = function loadQuizFromServer() {
    var quizId = document.querySelector("#quizId").value;
    var url = "/getQuiz?quizId=" + quizId;
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

// display error messages in error section of view
var handleError = function handleError(message) {
    var error = document.querySelector("#error");
    if (error) {
        error.innerHTML = message;
    }
};

// go to given web page
var redirect = function redirect(response) {
    window.location = response.redirect;
};

// send an ajax request
var sendAjax = function sendAjax(type, action, data, success) {
    $.ajax({
        cache: false,
        type: type,
        url: action,
        data: data,
        dataType: "json",
        success: success,
        error: function error(xhr, status, _error) {
            console.log(xhr.responseText);
            handleError(JSON.parse(xhr.responseText).error);
        }
    });
};

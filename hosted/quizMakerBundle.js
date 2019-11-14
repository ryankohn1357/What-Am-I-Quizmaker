"use strict";

var quiz = {};
var numQuestions = 1;
var numOutcomes = 1;
var questionPos = 0;
var outcomes = [];

var handleInitialWindow = function handleInitialWindow() {
    var name = document.querySelector("#quizName").value;
    var description = document.querySelector("#quizDescription").value;

    if (name == '' || description == '') {
        handleError("Missing quiz name or description");
        return false;
    }

    quiz.name = name;
    quiz.description = description;

    numQuestions = Number(document.querySelector("#numQuestions").value);
    numOutcomes = Number(document.querySelector("#numOutcomes").value);
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
            "Number of Possible Outcomes:",
            React.createElement("input", { id: "numOutcomes", type: "range", min: "1", max: "15" }),
            React.createElement(
                "label",
                { id: "outcomeSliderLabel" },
                "1"
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

    return React.createElement(
        "div",
        null,
        React.createElement(
            "div",
            { id: "questionContainers" },
            questionArray.map(function (questionNum) {
                return React.createElement(
                    "div",
                    { id: "questionContainer" + questionNum },
                    React.createElement(
                        "label",
                        null,
                        "Question:",
                        React.createElement("textarea", { id: "question" + questionNum })
                    ),
                    React.createElement(
                        "label",
                        null,
                        "Outcome Weights:",
                        React.createElement("div", { id: "outcomeWeightContainer" + questionNum })
                    )
                );
            })
        ),
        React.createElement(
            "button",
            { id: "questionSubmitButton" },
            "Submit Quiz"
        )
    );
};

var OutcomeWeights = function OutcomeWeights() {
    var outcomeNodes = outcomes.map(function (outcome) {
        return React.createElement(
            "div",
            null,
            React.createElement(
                "h3",
                null,
                outcome.name
            ),
            React.createElement(
                "label",
                null,
                "Weight:",
                React.createElement("input", { id: "weight", type: "range", min: "0", max: "100" }),
                React.createElement(
                    "label",
                    { id: "weightSliderLabel" },
                    "0"
                )
            )
        );
    });

    return React.createElement(
        "div",
        { id: "outcomeWeightsContainer" },
        outcomeNodes
    );
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
    numOutcomesSlider.value = 1;
    numOutcomesSlider.addEventListener("input", function (e) {
        document.querySelector("#outcomeSliderLabel").innerHTML = e.target.value;
    });
};

var createOutcomesWindow = function createOutcomesWindow() {
    ReactDOM.render(React.createElement(OutcomesWindow, null), document.querySelector("#content"));
    document.querySelector("#outcomeSubmitButton").addEventListener("click", handleQuizOutcomes);
};

var createQuestionsWindow = function createQuestionsWindow() {
    ReactDOM.render(React.createElement(QuestionsWindow, null), document.querySelector("#content"));

    for (var i = 0; i < numQuestions; i++) {
        ReactDOM.render(React.createElement(OutcomeWeights, null), document.querySelector("#outcomeWeightContainer" + i));
    }
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

"use strict";

var quiz = {};
var quizName = "";
var quizDescription = "";
var numQuestions = 5;
var numOutcomes = 2;
var answersPerQuestion = 4;
var outcomes = [];
var quizLoaded = false;

// store information from initial window and move to the outcome window
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
    createOutcomesWindow(csrf);
};

// store information from outcomes window and move to question window
var handleQuizOutcomes = function handleQuizOutcomes() {
    outcomes = [];
    for (var i = 0; i < numOutcomes; i++) {
        var outcome = document.querySelector("#outcome" + i);
        var outcomeName = outcome.querySelector("#outcomeName" + i).value;
        var outcomeDescription = outcome.querySelector("#outcomeDescription" + i).value;
        if (outcomeName == "" || outcomeDescription == "") {
            handleError("Missing outcome name or description");
            return false;
        }
        outcomes.push({ name: outcomeName, description: outcomeDescription });
    }
    var csrf = document.querySelector("#_csrf").value;
    createQuestionsWindow(csrf);
};

// build up quiz object and send it to the server
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
                var outcomeLabel = outcomeContainer.querySelector(".outcomeWeightsLabel").innerHTML;
                newWeight.outcome = outcomeLabel.split(" ")[0];
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

    // if modifying an existing quiz, update it, otherwise create new quiz
    if (quizLoaded) {
        var quizToChange = document.querySelector("#quizToChange").value;
        sendAjax('POST', "/updateQuiz", {
            _csrf: csrf, quizId: quizToChange, questions: quiz.questions,
            name: quiz.name, description: quiz.description, outcomes: quiz.outcomes
        }, redirect);
    } else {
        sendAjax('POST', "/makeQuiz", {
            _csrf: csrf, questions: quiz.questions,
            name: quiz.name, description: quiz.description, outcomes: quiz.outcomes
        }, redirect);
    }
};

// react element for getting initial information for making a quiz
var InitialWindow = function InitialWindow(props) {
    return React.createElement(
        "div",
        { id: "initialQuizWindow" },
        React.createElement("input", { id: "quizName", placeholder: "Quiz Name" }),
        React.createElement("textarea", { id: "quizDescription", placeholder: "Quiz Description",
            rows: "8", cols: "40" }),
        React.createElement(
            "div",
            { className: "sliderPlusLabel" },
            React.createElement(
                "label",
                null,
                "Number of Questions:"
            ),
            React.createElement(
                "div",
                { className: "sliderContainer" },
                React.createElement("input", { id: "numQuestions", type: "range", min: "1", max: "50" }),
                React.createElement(
                    "label",
                    { id: "questionSliderLabel" },
                    "5"
                )
            )
        ),
        React.createElement(
            "div",
            { className: "sliderPlusLabel" },
            React.createElement(
                "label",
                null,
                "Answers Per Question:"
            ),
            React.createElement(
                "div",
                { className: "sliderContainer" },
                React.createElement("input", { id: "answersPerQuestion", type: "range", min: "2", max: "6" }),
                React.createElement(
                    "label",
                    { id: "answersPerQuestionSliderLabel" },
                    "4"
                )
            )
        ),
        React.createElement(
            "div",
            { className: "sliderPlusLabel" },
            React.createElement(
                "label",
                null,
                "Number of Possible Outcomes:"
            ),
            React.createElement(
                "div",
                { className: "sliderContainer" },
                React.createElement("input", { id: "numOutcomes", type: "range", min: "2", max: "15" }),
                React.createElement(
                    "label",
                    { id: "outcomeSliderLabel" },
                    "2"
                )
            )
        ),
        React.createElement(
            "button",
            { id: "initialSubmitButton", className: "formSubmit" },
            "Next"
        ),
        React.createElement("p", { id: "error" }),
        React.createElement("input", { type: "hidden", value: props.csrf, id: "_csrf" })
    );
};

// react element for getting outcome information from the user
var OutcomesWindow = function OutcomesWindow(props) {
    var outcomeArray = [];
    for (var i = 0; i < numOutcomes; i++) {
        outcomeArray.push(i);
    }

    var outcomeNodes = outcomeArray.map(function (num) {
        return React.createElement(
            "div",
            { id: "outcome" + num, className: "outcome" },
            React.createElement("input", { id: "outcomeName" + num, placeholder: "Outcome " + (num + 1) + " Name" }),
            React.createElement("textarea", { id: "outcomeDescription" + num,
                placeholder: "Outcome " + (num + 1) + " Description",
                rows: "8", cols: "40" })
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
            { id: "outcomeSubmitButton", className: "formSubmit" },
            "Next"
        ),
        React.createElement("p", { id: "error" }),
        React.createElement("input", { type: "hidden", value: props.csrf, id: "_csrf" })
    );
};

// react element for getting question information from the user
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
                    "label",
                    { className: "outcomeWeightsLabel" },
                    outcomes[num].name + " Weight"
                ),
                React.createElement(
                    "div",
                    { className: "sliderContainer" },
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
            { className: "answerContainer", id: "answerContainer" + num },
            React.createElement("textarea", { className: "answer", placeholder: "Answer " + (num + 1), rows: "4", cols: "40" }),
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
            React.createElement("textarea", { className: "question", placeholder: "Question " + (num + 1), rows: "6", cols: "50" }),
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
            { id: "questionSubmitButton", className: "formSubmit" },
            "Submit Quiz"
        ),
        React.createElement("p", { id: "error" }),
        React.createElement("input", { type: "hidden", value: props.csrf, id: "_csrf" })
    );
};

// render question window to content and setup events for the sliders/buttons
var createQuestionsWindow = function createQuestionsWindow(csrf) {
    ReactDOM.render(React.createElement(QuestionsWindow, { csrf: csrf }), document.querySelector("#content"));

    var questions = document.querySelector("#questions");
    for (var i = 0; i < numQuestions; i++) {
        var questionContainer = questions.querySelector("#questionContainer" + i);
        // set value of question to existing value if modifying a quiz
        if (quizLoaded) {
            var questionTextArea = questionContainer.querySelector(".question");
            questionTextArea.value = quiz.questions[i].question;
        }
        var answerContainers = questionContainer.querySelector(".answerContainers");
        for (var j = 0; j < answersPerQuestion; j++) {
            var answerContainer = answerContainers.querySelector("#answerContainer" + j);
            // set value of answer to existing value if modifying a quiz
            if (quizLoaded) {
                var answerTextArea = answerContainer.querySelector(".answer");
                answerTextArea.value = quiz.questions[i].answers[j].answer;
            }

            var _loop = function _loop(k) {
                var outcomeContainer = answerContainer.querySelector("#outcomeContainer" + k);
                var weightSlider = outcomeContainer.querySelector(".weight");
                // set weights to existing value if modifying a quiz
                if (quizLoaded) {
                    var weightSliderLabel = outcomeContainer.querySelector(".weightSliderLabel");
                    weightSlider.value = quiz.questions[i].answers[j].weights[k].weight;
                    weightSliderLabel.innerHTML = weightSlider.value;
                } else {
                    weightSlider.value = 0;
                }
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

// render intitial window, setup events, and set initial values
var createInitialWindow = function createInitialWindow(csrf) {
    ReactDOM.render(React.createElement(InitialWindow, { csrf: csrf, quizName: quizName, quizDescription: quizDescription,
        numQuestions: numQuestions, answersPerQuestion: answersPerQuestion, numOutcomes: numOutcomes }), document.querySelector("#content"));
    document.querySelector("#initialSubmitButton").addEventListener("click", function () {
        handleInitialWindow();
    });

    // add initial slider/label values and setup events
    var numQuestionsSlider = document.querySelector("#numQuestions");
    var numQuestionsLabel = document.querySelector("#questionSliderLabel");
    numQuestionsSlider.value = numQuestions;
    numQuestionsLabel.innerHTML = numQuestions;
    numQuestionsSlider.addEventListener("input", function (e) {
        numQuestionsLabel.innerHTML = e.target.value;
    });

    var numOutcomesSlider = document.querySelector("#numOutcomes");
    var numOutcomesLabel = document.querySelector("#outcomeSliderLabel");
    numOutcomesSlider.value = numOutcomes;
    numOutcomesLabel.innerHTML = numOutcomes;
    numOutcomesSlider.addEventListener("input", function (e) {
        numOutcomesLabel.innerHTML = e.target.value;
    });

    var answersPerQuestionSlider = document.querySelector("#answersPerQuestion");
    var answersPerQuestionLabel = document.querySelector("#answersPerQuestionSliderLabel");
    answersPerQuestionSlider.value = answersPerQuestion;
    answersPerQuestionLabel.innerHTML = answersPerQuestion;
    answersPerQuestionSlider.addEventListener("input", function (e) {
        answersPerQuestionLabel.innerHTML = e.target.value;
    });

    // set initial quiz name/quiz description values if modifying an existing quiz
    if (quizLoaded) {
        var quizNameInput = document.querySelector("#quizName");
        var quizDescriptionTextArea = document.querySelector("#quizDescription");
        quizNameInput.value = quizName;
        quizDescriptionTextArea.value = quizDescription;
    }
};

// render outcomes window to content, setup button events, and set initial values
var createOutcomesWindow = function createOutcomesWindow(csrf) {
    ReactDOM.render(React.createElement(OutcomesWindow, { csrf: csrf }), document.querySelector("#content"));
    document.querySelector("#outcomeSubmitButton").addEventListener("click", function () {
        handleQuizOutcomes();
    });

    if (quizLoaded) {
        for (var i = 0; i < numOutcomes; i++) {
            var outcomeNameInput = document.querySelector("#outcomeName" + i);
            var outcomeDescriptionTextArea = document.querySelector("#outcomeDescription" + i);
            outcomeNameInput.value = outcomes[i].name;
            outcomeDescriptionTextArea.value = outcomes[i].description;
        }
    }
};

var loadQuizToChange = function loadQuizToChange(quizToChange, csrf) {
    sendAjax("GET", "/getQuiz", { quizId: quizToChange }, function (result) {
        quiz = result.quiz;
        quizName = quiz.name;
        quizDescription = quiz.description;
        numQuestions = quiz.questions.length;
        numOutcomes = quiz.outcomes.length;
        answersPerQuestion = quiz.questions[0].answers.length;
        outcomes = quiz.outcomes;
        quizLoaded = true;
        createInitialWindow(csrf);
    });
};

var setup = function setup(csrf) {
    var quizToChange = document.querySelector("#quizToChange").value;
    if (quizToChange != "") {
        loadQuizToChange(quizToChange, csrf);
    } else {
        createInitialWindow(csrf);
    }
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

let quiz = {};
let quizName = "";
let quizDescription = "";
let numQuestions = 1;
let numOutcomes = 1;
let answersPerQuestion = 4;
let questionPos = 0;
let outcomes = [];

// store information from initial window and move to the outcome window
const handleInitialWindow = () => {
    const name = document.querySelector("#quizName").value;
    const description = document.querySelector("#quizDescription").value;
    const csrf = document.querySelector("#_csrf").value;

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
const handleQuizOutcomes = () => {
    for (let i = 0; i < numOutcomes; i++) {
        let outcome = document.querySelector(`#outcome${i}`);
        let outcomeName = outcome.querySelector(`#outcomeName${i}`).value;
        let outcomeDescription = outcome.querySelector(`#outcomeDescription${i}`).value;
        if (outcomeName == "" || outcomeDescription == "") {
            handleError("Missing outcome name or description");
            outcomes = [];
            return false;
        }
        outcomes.push({ name: outcomeName, description: outcomeDescription });
    }
    const csrf = document.querySelector("#_csrf").value;
    createQuestionsWindow(csrf);
};

// build up quiz object and send it to the server
const handleQuizSubmission = () => {
    quiz.name = quizName;
    quiz.description = quizDescription;
    quiz.outcomes = outcomes;
    quiz.questions = [];

    const questions = document.querySelector("#questions");
    for (let i = 0; i < numQuestions; i++) {
        const newQuestion = {};
        const questionContainer = questions.querySelector(`#questionContainer${i}`);
        newQuestion.question = questionContainer.querySelector(".question").value;
        if (newQuestion.question == '') {
            handleError("Missing question");
            quiz = {};
            return false;
        }
        let answers = [];
        const answerContainers = questionContainer.querySelector(".answerContainers");
        for (let j = 0; j < answersPerQuestion; j++) {
            const answerContainer = answerContainers.querySelector(`#answerContainer${j}`);
            const newAnswer = {};
            newAnswer.answer = answerContainer.querySelector(".answer").value;
            if (newAnswer.answer == '') {
                handleError("Missing answer");
                quiz = {};
                return false;
            }
            const outcomes = answerContainer.querySelector(".outcomeNodes");
            let weights = [];
            for (let k = 0; k < numOutcomes; k++) {
                const outcomeContainer = outcomes.querySelector(`#outcomeContainer${k}`);
                const newWeight = {};
                let outcomeLabel = outcomeContainer.querySelector(".outcomeWeightsLabel").innerHTML;
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

    const csrf = document.querySelector("#_csrf").value;

    sendAjax('POST', "/makeQuiz", {
        _csrf: csrf, questions: quiz.questions,
        name: quiz.name, description: quiz.description, outcomes: quiz.outcomes
    }, redirect);
};

// react element for getting initial information for making a quiz
const InitialWindow = (props) => {
    return (
        <div id="initialQuizWindow">
            <input id="quizName" placeholder="Quiz Name"></input>
            <textarea id="quizDescription" placeholder="Quiz Description" rows="8" cols="40">
            </textarea>
            <div className="sliderPlusLabel">
                <label>Number of Questions:</label>
                <div className="sliderContainer">
                    <input id="numQuestions" type="range" min="1" max="50" />
                    <label id="questionSliderLabel">5</label>
                </div>
            </div>
            <div className="sliderPlusLabel">
                <label>Answers Per Question:</label>
                <div className="sliderContainer">
                    <input id="answersPerQuestion" type="range" min="2" max="6" />
                    <label id="answersPerQuestionSliderLabel">4</label>
                </div>
            </div>
            <div className="sliderPlusLabel">
                <label>Number of Possible Outcomes:</label>
                <div className="sliderContainer">
                    <input id="numOutcomes" type="range" min="2" max="15" />
                    <label id="outcomeSliderLabel">2</label>
                </div>
            </div>
            <button id="initialSubmitButton" className="formSubmit">Next</button>
            <p id="error"></p>
            <input type="hidden" value={props.csrf} id="_csrf" />
        </div>
    );
};

// react element for getting outcome information from the user
const OutcomesWindow = (props) => {
    let outcomeArray = [];
    for (let i = 0; i < numOutcomes; i++) {
        outcomeArray.push(i);
    }

    const outcomeNodes = outcomeArray.map(function (num) {
        return (
            <div id={"outcome" + num} className="outcome">
                <input id={"outcomeName" + num} placeholder={"Outcome " + (num + 1) + " Name"}></input>
                <textarea id={"outcomeDescription" + num}
                    placeholder={"Outcome " + (num + 1) + " Description"}
                    rows="8" cols="40"></textarea>
            </div>
        );
    });

    return (
        <div>
            <div id="outcomeWindow">
                {outcomeNodes}
            </div>
            <button id="outcomeSubmitButton" className="formSubmit">Next</button>
            <p id="error"></p>
            <input type="hidden" value={props.csrf} id="_csrf" />
        </div>
    );
};

// react element for getting question information from the user
const QuestionsWindow = (props) => {
    let questionArray = [];
    for (let i = 0; i < numQuestions; i++) {
        questionArray.push(i);
    }
    let answerArray = [];
    for (let i = 0; i < answersPerQuestion; i++) {
        answerArray.push(i);
    }
    let outcomeArray = [];
    for (let i = 0; i < numOutcomes; i++) {
        outcomeArray.push(i);
    }

    const outcomeNodes = outcomeArray.map(function (num) {
        return (
            <div className="outcomeContainer" id={"outcomeContainer" + num}>
                <div>
                    <label className="outcomeWeightsLabel">{outcomes[num].name + " Weight"}</label>
                    <div className="sliderContainer">
                        <input className="weight" type="range" min="0" max="100" />
                        <label className="weightSliderLabel">0</label>
                    </div>
                </div>
            </div>
        );
    });

    const answerNodes = answerArray.map(function (num) {
        return (
            <div className="answerContainer" id={"answerContainer" + num}>
                <textarea className="answer" placeholder={"Answer " + (num + 1)} rows="4" cols="40"></textarea>
                <div className="outcomeNodes">
                    {outcomeNodes}
                </div>
            </div>
        );
    });

    const questionNodes = questionArray.map(function (num) {
        return (
            <div className="questionContainer" id={"questionContainer" + num}>
                <textarea className="question" placeholder={"Question " + (num + 1)} rows="6" cols="50"></textarea>
                <div className="answerContainers">
                    {answerNodes}
                </div>
            </div>
        );
    });

    return (
        <div>
            <div id="questions">
                {questionNodes}
            </div>
            <button id="questionSubmitButton" className="formSubmit">Submit Quiz</button>
            <p id="error"></p>
            <input type="hidden" value={props.csrf} id="_csrf" />
        </div>
    );
};

// render question window to content and setup events for the sliders/buttons
const createQuestionsWindow = (csrf) => {
    ReactDOM.render(
        <QuestionsWindow csrf={csrf} />,
        document.querySelector("#content")
    );

    const questions = document.querySelector("#questions");
    for (let i = 0; i < numQuestions; i++) {
        const questionContainer = questions.querySelector(`#questionContainer${i}`);
        const answerContainers = questionContainer.querySelector(".answerContainers");
        for (let j = 0; j < answersPerQuestion; j++) {
            const answerContainer = answerContainers.querySelector(`#answerContainer${j}`);
            for (let k = 0; k < numOutcomes; k++) {
                const outcomeContainer = answerContainer.querySelector(`#outcomeContainer${k}`);
                const weightSlider = outcomeContainer.querySelector(".weight");
                weightSlider.value = 0;
                weightSlider.addEventListener("input", e => {
                    outcomeContainer.querySelector(".weightSliderLabel").innerHTML = e.target.value;
                });
            }
        }
    }

    document.querySelector("#questionSubmitButton").addEventListener("click", () => {
        handleQuizSubmission();
    });
};

// render intitial window and setup events for the sliders/buttons
const createInitialWindow = (csrf) => {
    ReactDOM.render(
        <InitialWindow csrf={csrf} />,
        document.querySelector("#content")
    );
    document.querySelector("#initialSubmitButton").addEventListener("click", () => {
        handleInitialWindow();
    });
    let numQuestionsSlider = document.querySelector("#numQuestions");
    numQuestionsSlider.value = 5;
    numQuestionsSlider.addEventListener("input", e => {
        document.querySelector("#questionSliderLabel").innerHTML = e.target.value;
    });
    let numOutcomesSlider = document.querySelector("#numOutcomes");
    numOutcomesSlider.value = 2;
    numOutcomesSlider.addEventListener("input", e => {
        document.querySelector("#outcomeSliderLabel").innerHTML = e.target.value;
    });
    let answersPerQuestionSlider = document.querySelector("#answersPerQuestion");
    answersPerQuestionSlider.value = 4;
    answersPerQuestionSlider.addEventListener("input", e => {
        document.querySelector("#answersPerQuestionSliderLabel").innerHTML = e.target.value;
    });
};

// render outcomes window to content and setup button event
const createOutcomesWindow = (csrf) => {
    ReactDOM.render(
        <OutcomesWindow csrf={csrf} />,
        document.querySelector("#content")
    );
    document.querySelector("#outcomeSubmitButton").addEventListener("click", () => {
        handleQuizOutcomes();
    });
};

const setup = (csrf) => {
    createInitialWindow(csrf);
};

const getToken = () => {
    sendAjax('GET', '/getToken', null, (result) => {
        setup(result.csrfToken);
    });
};

$(document).ready(function () {
    getToken();
});
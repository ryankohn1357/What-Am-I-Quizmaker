let quiz = {};
let quizName = "";
let quizDescription = "";
let numQuestions = 1;
let numOutcomes = 1;
let answersPerQuestion = 4;
let questionPos = 0;
let outcomes = [];

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
    document.querySelector("#content").innerHTML = "";
    createOutcomesWindow(csrf);
};

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
    document.querySelector("#content").innerHTML = "";
    createQuestionsWindow(csrf);
};

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

    const csrf = document.querySelector("#_csrf").value;

    sendAjax('POST', "/makeQuiz", {
        _csrf: csrf, questions: quiz.questions,
        name: quiz.name, description: quiz.description, outcomes: quiz.outcomes
    }, redirect);
};

const InitialWindow = (props) => {
    return (
        <div id="initialQuizWindow">
            <input id="quizName" placeholder="Quiz Name"></input>
            <textarea id="quizDescription" placeholder="Quiz Description"></textarea>
            <label>Number of Questions:</label>
            <input id="numQuestions" type="range" min="1" max="50" />
            <label id="questionSliderLabel">1</label>
            <label>Answers Per Question:</label>
            <input id="answersPerQuestion" type="range" min="2" max="6" />
            <label id="answersPerQuestionSliderLabel">4</label>
            <label>Number of Possible Outcomes:</label>
            <input id="numOutcomes" type="range" min="2" max="15" />
            <label id="outcomeSliderLabel">2</label>
            <button id="initialSubmitButton">Next</button>
            <input type="hidden" value={props.csrf} id="_csrf" />
        </div>
    );
};

const OutcomesWindow = (props) => {
    let outcomeArray = [];
    for (let i = 0; i < numOutcomes; i++) {
        outcomeArray.push(i);
    }

    const outcomeNodes = outcomeArray.map(function (num) {
        return (
            <div id={"outcome" + num} className="outcome">
                <input id={"outcomeName" + num} placeholder={"Outcome " + num + " Name"}></input>
                <input id={"outcomeDescription" + num} placeholder={"Outcome " + num + " Description"}></input>
            </div>
        );
    });

    return (
        <div>
            <div id="outcomeWindow">
                {outcomeNodes}
            </div>
            <button id="outcomeSubmitButton">Next</button>
            <input type="hidden" value={props.csrf} id="_csrf" />
        </div>
    );
};

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
                    <h3 className="outcome">{outcomes[num].name}</h3>
                    <label>Weight:
                    <input className="weight" type="range" min="0" max="100" />
                        <label className="weightSliderLabel">0</label>
                    </label>
                </div>
            </div>
        );
    });

    const answerNodes = answerArray.map(function (num) {
        return (
            <div class="answerContainer" id={"answerContainer" + num}>
                    <textarea className="answer" placeholder={"Answer" + (num + 1)}></textarea>
                <div className="outcomeNodes">
                    {outcomeNodes}
                </div>
            </div>
        );
    });

    const questionNodes = questionArray.map(function (num) {
        return (
            <div className="questionContainer" id={"questionContainer" + num}>
                <textarea className="question" placeholder="Question"></textarea>
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
            <button id="questionSubmitButton">Submit Quiz</button>
            <input type="hidden" value={props.csrf} id="_csrf" />
        </div>
    );
};

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

const createInitialWindow = (csrf) => {
    ReactDOM.render(
        <InitialWindow csrf={csrf} />,
        document.querySelector("#content")
    );
    document.querySelector("#initialSubmitButton").addEventListener("click", () => {
        handleInitialWindow();
    });
    let numQuestionsSlider = document.querySelector("#numQuestions");
    numQuestionsSlider.value = 1;
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
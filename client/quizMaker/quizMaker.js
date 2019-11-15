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
    document.querySelector("#content").innerHTML = "";
    createQuestionsWindow();
};

const InitialWindow = () => {
    return (
        <div id="initialQuizWindow">
            <label>Quiz Name:
                <input id="quizName"></input>
            </label>
            <label>Quiz Description:
                <textarea id="quizDescription"></textarea>
            </label>
            <label>Number of Questions:
                <input id="numQuestions" type="range" min="1" max="50" />
                <label id="questionSliderLabel">1</label>
            </label>
            <label>Answers Per Question:
                <input id="answersPerQuestion" type="range" min="2" max="6" />
                <label id="answersPerQuestionSliderLabel">4</label>
            </label>
            <label>Number of Possible Outcomes:
                <input id="numOutcomes" type="range" min="2" max="15" />
                <label id="outcomeSliderLabel">2</label>
            </label>
            <button id="initialSubmitButton">Next</button>
        </div>
    );
};

const OutcomesWindow = () => {
    let outcomeArray = [];
    for (let i = 0; i < numOutcomes; i++) {
        outcomeArray.push(i);
    }

    const outcomeNodes = outcomeArray.map(function (num) {
        return (
            <div id={"outcome" + num}>
                <label>Outcome Name:
                    <input id={"outcomeName" + num}></input>
                </label>
                <label>Outcome Description:
                    <input id={"outcomeDescription" + num}></input>
                </label>
            </div>
        );
    });

    return (
        <div>
            <div>
                {outcomeNodes}
            </div>
            <button id="outcomeSubmitButton">Next</button>
        </div>
    );
};

const QuestionsWindow = () => {
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
                <label>Answer {num + 1}:
                    <textarea className="answer"></textarea>
                </label>
                <div className="outcomeNodes">
                    {outcomeNodes}
                </div>
            </div>
        );
    });

    const questionNodes = questionArray.map(function (num) {
        return (
            <div className="questionContainer" id={"questionContainer" + num}>
                <label>Question:
                <textarea className="question"></textarea>
                </label>
                <label>Answers:
                    <div className="answerContainers">
                        {answerNodes}
                    </div>
                </label>
            </div>
        );
    });

    return (
        <div>
            <div id="questions">
                {questionNodes}
            </div>
            <button id="questionSubmitButton">Submit Quiz</button>
        </div>
    );
};

const createQuestionsWindow = () => {
    ReactDOM.render(
        <QuestionsWindow />,
        document.querySelector("#content")
    );

    const questions = document.querySelector("#questions");
    for (let i = 0; i < numQuestions; i++) {
        const questionContainer = questions.querySelector(`#questionContainer${i}`);
        const answerContainers = questionContainer.querySelector(".answerContainers");
        for(let j = 0; j < answersPerQuestion; j++) {
            const answerContainer = answerContainers.querySelector(`#answerContainer${j}`);
            for(let k = 0; k < numOutcomes; k++) {
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
        getToken(handleQuizSubmission);
    });
};

const handleQuizSubmission = (csrf) => {
    quiz.name = quizName;
    quiz.description = quizDescription;
    quiz.outcomes = outcomes;
    quiz.questions = [];

    const questions = document.querySelector("#questions");
    for(let i = 0; i < numQuestions; i++)
    {
        const newQuestion = {};
        const questionContainer = questions.querySelector(`#questionContainer${i}`);
        newQuestion.question = questionContainer.querySelector(".question").value;
        let answers = [];
        const answerContainers = questionContainer.querySelector(".answerContainers");
        for(let j = 0; j < answersPerQuestion; j++) {
            const answerContainer = answerContainers.querySelector(`#answerContainer${j}`);
            const newAnswer = {};
            newAnswer.answer = answerContainer.querySelector(".answer").value;
            const outcomes = answerContainer.querySelector(".outcomeNodes");
            let weights = [];
            for(let k = 0; k < numOutcomes; k++) {
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

    console.log(quiz);
};

const createInitialWindow = () => {
    ReactDOM.render(
        <InitialWindow />,
        document.querySelector("#content")
    );
    document.querySelector("#initialSubmitButton").addEventListener("click", handleInitialWindow);

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

const createOutcomesWindow = () => {
    ReactDOM.render(
        <OutcomesWindow />,
        document.querySelector("#content")
    );
    document.querySelector("#outcomeSubmitButton").addEventListener("click", handleQuizOutcomes);
};

const setup = () => {
    createInitialWindow();
};

const getToken = (callback) => {
    sendAjax('GET', '/getToken', null, (result) => {
        callback(result.csrfToken);
    });
};

$(document).ready(function () {
    setup();
});
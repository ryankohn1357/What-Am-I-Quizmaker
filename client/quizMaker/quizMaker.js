let quiz = {};
let quizName = "";
let quizDescription = "";
let numQuestions = 5;
let numOutcomes = 2;
let answersPerQuestion = 4;
let outcomes = [];
let quizLoaded = false;

// store information from initial window and move to the outcome window
const handleInitialWindow = () => {
    let name = document.querySelector("#quizName").value;
    let description = document.querySelector("#quizDescription").value;
    let csrf = document.querySelector("#_csrf").value;

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
    outcomes = [];
    for (let i = 0; i < numOutcomes; i++) {
        let outcome = document.querySelector(`#outcome${i}`);
        let outcomeName = outcome.querySelector(`#outcomeName${i}`).value;
        let outcomeDescription = outcome.querySelector(`#outcomeDescription${i}`).value;
        if (outcomeName == "" || outcomeDescription == "") {
            handleError("Missing outcome name or description");
            return false;
        }
        outcomes.push({ name: outcomeName, description: outcomeDescription });
    }
    let csrf = document.querySelector("#_csrf").value;
    createQuestionsWindow(csrf);
};

// build up quiz object and send it to the server
const handleQuizSubmission = () => {
    quiz.name = quizName;
    quiz.description = quizDescription;
    quiz.outcomes = outcomes;
    quiz.questions = [];

    let questions = document.querySelector("#questions");
    for (let i = 0; i < numQuestions; i++) {
        let newQuestion = {};
        let questionContainer = questions.querySelector(`#questionContainer${i}`);
        newQuestion.question = questionContainer.querySelector(".question").value;
        if (newQuestion.question == '') {
            handleError("Missing question");
            quiz = {};
            return false;
        }
        let answers = [];
        let answerContainers = questionContainer.querySelector(".answerContainers");
        for (let j = 0; j < answersPerQuestion; j++) {
            let answerContainer = answerContainers.querySelector(`#answerContainer${j}`);
            let newAnswer = {};
            newAnswer.answer = answerContainer.querySelector(".answer").value;
            if (newAnswer.answer == '') {
                handleError("Missing answer");
                quiz = {};
                return false;
            }
            let outcomes = answerContainer.querySelector(".outcomeNodes");
            let weights = [];
            for (let k = 0; k < numOutcomes; k++) {
                let outcomeContainer = outcomes.querySelector(`#outcomeContainer${k}`);
                let newWeight = {};
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

    let csrf = document.querySelector("#_csrf").value;

    // if modifying an existing quiz, update it, otherwise create new quiz
    if(quizLoaded) {
        let quizToChange = document.querySelector("#quizToChange").value;
        sendAjax('POST', "/updateQuiz", {
            _csrf: csrf, quizId: quizToChange, questions: quiz.questions,
            name: quiz.name, description: quiz.description, outcomes: quiz.outcomes
        }, redirect);
    }
    else {
        sendAjax('POST', "/makeQuiz", {
            _csrf: csrf, questions: quiz.questions,
            name: quiz.name, description: quiz.description, outcomes: quiz.outcomes
        }, redirect);
    }
};

// react element for getting initial information for making a quiz
const InitialWindow = (props) => {
    return (
        <div id="initialQuizWindow">
            <input id="quizName" placeholder="Quiz Name"></input>
            <textarea id="quizDescription" placeholder="Quiz Description"
                rows="8" cols="40">
            </textarea>
            <div className="sliderPlusLabel">
                <label>Number of Questions:</label>
                <div className="sliderContainer">
                    <input id="numQuestions" type="range" min="1" max="50"/>
                    <label id="questionSliderLabel">5</label>
                </div>
            </div>
            <div className="sliderPlusLabel">
                <label>Answers Per Question:</label>
                <div className="sliderContainer">
                    <input id="answersPerQuestion" type="range" min="2" max="6"/>
                    <label id="answersPerQuestionSliderLabel">4</label>
                </div>
            </div>
            <div className="sliderPlusLabel">
                <label>Number of Possible Outcomes:</label>
                <div className="sliderContainer">
                    <input id="numOutcomes" type="range" min="2" max="15"/>
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

    let outcomeNodes = outcomeArray.map(function (num) {
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

    let outcomeNodes = outcomeArray.map(function (num) {
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

    let answerNodes = answerArray.map(function (num) {
        return (
            <div className="answerContainer" id={"answerContainer" + num}>
                <textarea className="answer" placeholder={"Answer " + (num + 1)} rows="4" cols="40"></textarea>
                <div className="outcomeNodes">
                    {outcomeNodes}
                </div>
            </div>
        );
    });

    let questionNodes = questionArray.map(function (num) {
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

    let questions = document.querySelector("#questions");
    for (let i = 0; i < numQuestions; i++) {
        let questionContainer = questions.querySelector(`#questionContainer${i}`);

        // set value of question to existing value if modifying a quiz
        if(quizLoaded) {
            let questionTextArea = questionContainer.querySelector(".question");
            questionTextArea.value = quiz.questions[i].question;
        }
        let answerContainers = questionContainer.querySelector(".answerContainers");
        for (let j = 0; j < answersPerQuestion; j++) {
            let answerContainer = answerContainers.querySelector(`#answerContainer${j}`);
            // set value of answer to existing value if modifying a quiz
            if(quizLoaded) {
                let answerTextArea = answerContainer.querySelector(".answer");
                answerTextArea.value = quiz.questions[i].answers[j].answer;
            }
            for (let k = 0; k < numOutcomes; k++) {
                let outcomeContainer = answerContainer.querySelector(`#outcomeContainer${k}`);
                let weightSlider = outcomeContainer.querySelector(".weight");
                // set weights to existing value if modifying a quiz
                if(quizLoaded) {
                    let weightSliderLabel = outcomeContainer.querySelector(".weightSliderLabel");
                    weightSlider.value = quiz.questions[i].answers[j].weights[k].weight;
                    weightSliderLabel.innerHTML = weightSlider.value;
                }
                else {
                    weightSlider.value = 0;
                }
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

// render intitial window, setup events, and set initial values
const createInitialWindow = (csrf) => {
    ReactDOM.render(
        <InitialWindow csrf={csrf} quizName={quizName} quizDescription={quizDescription}
            numQuestions={numQuestions} answersPerQuestion={answersPerQuestion} numOutcomes={numOutcomes} />,
        document.querySelector("#content")
    );
    document.querySelector("#initialSubmitButton").addEventListener("click", () => {
        handleInitialWindow();
    });

    // add initial slider/label values and setup events
    let numQuestionsSlider = document.querySelector("#numQuestions");
    let numQuestionsLabel = document.querySelector("#questionSliderLabel");
    numQuestionsSlider.value = numQuestions;
    numQuestionsLabel.innerHTML = numQuestions;
    numQuestionsSlider.addEventListener("input", e => {
        numQuestionsLabel.innerHTML = e.target.value;
    });

    let numOutcomesSlider = document.querySelector("#numOutcomes");
    let numOutcomesLabel = document.querySelector("#outcomeSliderLabel");
    numOutcomesSlider.value = numOutcomes;
    numOutcomesLabel.innerHTML = numOutcomes;
    numOutcomesSlider.addEventListener("input", e => {
        numOutcomesLabel.innerHTML = e.target.value;
    });

    let answersPerQuestionSlider = document.querySelector("#answersPerQuestion");
    let answersPerQuestionLabel = document.querySelector("#answersPerQuestionSliderLabel");
    answersPerQuestionSlider.value = answersPerQuestion;
    answersPerQuestionLabel.innerHTML = answersPerQuestion;
    answersPerQuestionSlider.addEventListener("input", e => {
        answersPerQuestionLabel.innerHTML = e.target.value;
    });

    // set initial quiz name/quiz description values if modifying an existing quiz
    if(quizLoaded) {
        let quizNameInput = document.querySelector("#quizName");
        let quizDescriptionTextArea = document.querySelector("#quizDescription");
        quizNameInput.value = quizName;
        quizDescriptionTextArea.value = quizDescription;
    }
};

// render outcomes window to content, setup button events, and set initial values
const createOutcomesWindow = (csrf) => {
    ReactDOM.render(
        <OutcomesWindow csrf={csrf} />,
        document.querySelector("#content")
    );
    document.querySelector("#outcomeSubmitButton").addEventListener("click", () => {
        handleQuizOutcomes();
    });

    if(quizLoaded) {
        for(let i = 0; i < numOutcomes; i++) {
            let outcomeNameInput = document.querySelector(`#outcomeName${i}`);
            let outcomeDescriptionTextArea = document.querySelector(`#outcomeDescription${i}`)
            outcomeNameInput.value = outcomes[i].name;
            outcomeDescriptionTextArea.value = outcomes[i].description;
        }
    }
};

const loadQuizToChange = (quizToChange, csrf) => {
    sendAjax("GET", "/getQuiz", { quizId: quizToChange }, (result) => {
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

const setup = (csrf) => {
    let quizToChange = document.querySelector("#quizToChange").value;
    if (quizToChange != "") {
        loadQuizToChange(quizToChange, csrf);
    }
    else {
        createInitialWindow(csrf);
    }
};

const getToken = () => {
    sendAjax('GET', '/getToken', null, (result) => {
        setup(result.csrfToken);
    });
};

$(document).ready(function () {
    getToken();
});
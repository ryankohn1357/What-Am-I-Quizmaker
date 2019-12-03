let quiz = {};
let currentQuestion = 0;

// When each question is answered, store the answer's weights
// for each outcome in outcome progress. At the end of the quiz,
// whatever outcome has the heighest weight is the result.
let outcomeProgress = {};

// react element for a quiz question
const QuestionWindow = (props) => {
    const answerNodes = props.answers.map(function (answerObj) {
        return (
            <div>
                <p className="answerOption">{answerObj.answer}</p>
            </div>
        );
    });
    return (
        <div id="questionWindow">
            <h4>{props.question}</h4>
            <div>
                {answerNodes}
            </div>
        </div>
    );
};

// react element for displaying results of quiz
const ResultWindow = (props) => {
    return (
        <div id="resultWindow">
            <h1>You are a {props.result}!</h1>
            <p>{props.description}</p>
            <button className="formSubmit" id="returnButton">Return</button>
        </div>
    );
};

// render question window to screen and setup events
const createQuestionWindow = () => {
    let questionObj = quiz.questions[currentQuestion];
    let answersObj = questionObj.answers;
    ReactDOM.render(
        <QuestionWindow question={questionObj.question} answers={answersObj} />,
        document.querySelector("#content")
    );

    setupQuestionWindowEvents();
};

// setup events for clicking on the answer to a question
const setupQuestionWindowEvents = () => {
    let questionObj = quiz.questions[currentQuestion];
    let answersObj = questionObj.answers;
    let answerOptions = document.querySelectorAll(".answerOption");
    for (let i = 0; i < answerOptions.length; i++) {
        let answer = answerOptions[i].innerHTML;
        answerOptions[i].onclick = () => {
            // increment progress towards different outcomes based on
            // the weights of the chosen answer
            for (let j = 0; j < answersObj.length; j++) {
                let answerObj = answersObj[j];
                if (answerObj.answer == answer) {
                    let weights = answerObj.weights;
                    for (let k = 0; k < weights.length; k++) {
                        let weightObj = weights[k];
                        outcomeProgress[weightObj.outcome] += weightObj.weight;
                    }
                }
            }
            // render next question or results, depending on where the
            // user is in the quiz
            if(currentQuestion == quiz.questions.length - 1) {
                currentQuestion = 0;
                createResultWindow();
            }
            else {
                currentQuestion++;
                createQuestionWindow();
            }
        };
    }
}

// determine result and render results window to content
const createResultWindow = () => {
    // find which outcome had the highest weight
    let maxWeight = 0;
    let quizResult = "";
    let outcomeDescription = "";
    for(let outcome in outcomeProgress) {
        if(outcomeProgress[outcome] >= maxWeight) {
            quizResult = outcome;
            maxWeight = outcomeProgress[outcome];
        }
    }
    // find the description for the result
    for (let i = 0; i < quiz.outcomes.length; i++) {
        let outcomeObj = quiz.outcomes[i];
        if(outcomeObj.name == quizResult) {
            outcomeDescription = outcomeObj.description;
            break;
        }
    }
    ReactDOM.render(
        <ResultWindow result={quizResult} description={outcomeDescription} />,
        document.querySelector("#content")
    );

    // setup event for return button
    document.querySelector("#returnButton").addEventListener("click", () => {
        window.location = "/";
    })
};

// get the quiz with the given name and description from the server
const loadQuizFromServer = () => {
    let quizName = document.querySelector("#title").innerHTML;
    let quizDescription = document.querySelector("#description").innerHTML;
    let quizId = document.querySelector("#quizId").value;
    let url = `/getQuiz?name=${quizName}&description=${quizDescription}&quizId=${quizId}`;
    sendAjax("GET", url, null, (result) => {
        quiz = result.quiz;
        let outcomes = quiz.outcomes;
        for (let i = 0; i < outcomes.length; i++) {
            outcomeProgress[outcomes[i].name] = 0;
        }
        createQuestionWindow();
    })
};

$(document).ready(function () {
    loadQuizFromServer();
});
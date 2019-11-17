let quiz = {};
let currentQuestion = 0;
let outcomeProgress = {};

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

const ResultWindow = (props) => {
    return (
        <div id="resultWindow">
            <h1>You are a {props.result}!</h1>
            <p>{props.description}</p>
            <button className="formSubmit" id="returnButton">Return</button>
        </div>
    );
};

const createQuestionWindow = () => {
    let questionObj = quiz.questions[currentQuestion];
    let answersObj = questionObj.answers;
    ReactDOM.render(
        <QuestionWindow question={questionObj.question} answers={answersObj} />,
        document.querySelector("#content")
    );

    setupQuestionWindowEvents();
};

const setupQuestionWindowEvents = () => {
    let questionObj = quiz.questions[currentQuestion];
    let answersObj = questionObj.answers;
    let answerOptions = document.querySelectorAll(".answerOption");
    for (let i = 0; i < answerOptions.length; i++) {
        let answer = answerOptions[i].innerHTML;
        answerOptions[i].onclick = () => {
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

const createResultWindow = () => {
    let maxWeight = 0;
    let quizResult = "";
    let outcomeDescription = "";
    for(let outcome in outcomeProgress) {
        if(outcomeProgress[outcome] > maxWeight) {
            quizResult = outcome;
            maxWeight = outcomeProgress[outcome];
        }
    }
    for (let i = 0; i < quiz.outcomes.length; i++) {
        let outcomeObj = quiz.outcomes[i];
        if(outcomeObj.name == quizResult) {
            outcomeDescription = outcomeObj.description;
            break;
        }
    }

    console.log(quizResult);
    ReactDOM.render(
        <ResultWindow result={quizResult} description={outcomeDescription} />,
        document.querySelector("#content")
    );

    document.querySelector("#returnButton").addEventListener("click", () => {
        window.location = "/";
    })
};

const loadQuizFromServer = () => {
    let quizName = document.querySelector("#title").innerHTML;
    let quizDescription = document.querySelector("#description").innerHTML;
    let url = "/getQuiz?name=" + quizName + "&description=" + quizDescription;
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
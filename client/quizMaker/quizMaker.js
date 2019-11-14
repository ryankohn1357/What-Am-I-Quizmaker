let quiz = {};
let numQuestions = 1;
let numOutcomes = 1;
let questionPos = 0;
let outcomes = [];

const handleInitialWindow = () => {
    const name = document.querySelector("#quizName").value;
    const description = document.querySelector("#quizDescription").value;

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
            <label>Number of Possible Outcomes:
                <input id="numOutcomes" type="range" min="1" max="15" />
                <label id="outcomeSliderLabel">1</label>
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

    return (
        <div>
            <div id="questionContainers">
                {questionArray.map(questionNum =>
                    <div id={"questionContainer" + questionNum}>
                        <label>Question:
                            <textarea id={"question" + questionNum}></textarea>
                        </label>
                        <label>Outcome Weights:
                            <div id={"outcomeWeightContainer" + questionNum}>
                            </div>
                        </label>
                    </div>
                )}
            </div>
            <button id="questionSubmitButton">Submit Quiz</button>
        </div>
    );
};

const OutcomeWeights = () => {
    const outcomeNodes = outcomes.map(function (outcome) {
        return (
            <div>
                <h3>{outcome.name}</h3>
                <label>Weight:
                    <input id="weight" type="range" min="0" max="100" />
                    <label id="weightSliderLabel">0</label>
                </label>
            </div>
        );
    });

    return (
        <div id="outcomeWeightsContainer">
            {outcomeNodes}
        </div>
    );

}

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
    numOutcomesSlider.value = 1;
    numOutcomesSlider.addEventListener("input", e => {
        document.querySelector("#outcomeSliderLabel").innerHTML = e.target.value;
    });
};

const createOutcomesWindow = () => {
    ReactDOM.render(
        <OutcomesWindow />,
        document.querySelector("#content")
    );
    document.querySelector("#outcomeSubmitButton").addEventListener("click", handleQuizOutcomes);
};

const createQuestionsWindow = () => {
    ReactDOM.render(
        <QuestionsWindow />,
        document.querySelector("#content")
    );

    for(let i = 0; i < numQuestions; i++)
    {
        ReactDOM.render(
            <OutcomeWeights />,
            document.querySelector(`#outcomeWeightContainer${i}`)
        );
    }
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
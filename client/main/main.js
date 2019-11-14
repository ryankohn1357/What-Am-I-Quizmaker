const handleLogin = (e) => {
    e.preventDefault();

    if($("#user").val() == '' || $("#pass").val() == '') {
        handleError("Username or password is empty");
        return false;
    }

    sendAjax('POST', $("#loginForm").attr("action"), $("#loginForm").serialize(), redirect);

    return false;
};

const handleSignup = (e) => {
    e.preventDefault();

    if($("#user").val() == '' || $("#pass").val() == '' || $("#pass2").val() == '') {
        handleError("All fields are required");
        return false;
    }

    if($("#pass").val() !== $("#pass2").val()) {
        handleError("Passwords do not match");
        return false;
    }

    sendAjax('POST', $("#signupForm").attr("action"), $("#signupForm").serialize(), redirect);

    return false;
};

const LoginWindow = (props) => {
    return (
        <form id="loginForm" name="loginForm"
              onSubmit={handleLogin}
              action="/login"
              method="POST"
              className="mainForm"
        >
            <label htmlFor="username">Username: </label>
            <input id="user" type="text" name="username" placeholder="username" />
            <label htmlFor="pass">Password: </label>
            <input id="pass" type="password" name="pass" placeholder="password" />
            <input type="hidden" name="_csrf" value={props.csrf} />
            <input className="formSubmit" type="submit" value="Sign in" />
        </form>
    );
};

const SignupWindow = (props) => {
    return (
        <form id="signupForm" name="signupForm"
              onSubmit={handleSignup}
              action="/signup"
              method="POST"
              className="mainForm"
        >
            <label htmlFor="username">Username: </label>
            <input id="user" type="text" name="username" placeholder="username" />
            <label htmlFor="pass">Password: </label>
            <input id="pass" type="password" name="pass" placeholder="password" />
            <label htmlFor="pass2">Password: </label>
            <input id="pass2" type="password" name="pass2" placeholder="retype password" />
            <input type="hidden" name="_csrf" value={props.csrf} />
            <input className="formSubmit" type="submit" value="Sign up" />
        </form>
    );
};

const QuizList = function(props) {
    if(props.quizzes.length === 0) {
        return (
            <div className ="quizList">
                <h3 className = "emptyQuizzes">No quizzes yet</h3>
            </div>
        );
    }

    const quizNodes = props.quizzes.map(function(quiz) {
        return (
            <div key={quiz._id} className = "quiz">
                <h3 className="quizName"> {quiz.name} </h3>
                <h3 className = "quizDescription"> {quiz.description} </h3>
            </div>
        );
    });

    return (
        <div className="quizList">
            {quizNodes}
        </div>
    );
};

const loadQuizzesFromServer = () => {
    sendAjax('GET', '/getQuizzes', null, (data) => {
        ReactDOM.render(
            <QuizList quizzes={data.quizzes} />, document.querySelector("#content")
        );
    });
};

const createLoginWindow = (csrf) => {
    ReactDOM.render(
        <LoginWindow csrf={csrf} />,
        document.querySelector("#content")
    );
};

const createSignupWindow = (csrf) => {
    ReactDOM.render(
        <SignupWindow csrf={csrf} />,
        document.querySelector("#content")
    );
};

const setup = (csrf) => {
    const linkOptions = document.querySelector("#linkOptions");
    const loggedIn = document.querySelector("#isLoggedIn").innerHTML == "true";
    if(!loggedIn) {
        linkOptions.innerHTML = "<div class='navlink'><a href='/login' id='loginButton'>Log In</a></div>";
        linkOptions.innerHTML += "<div class='navlink'><a href='/signup' id='signupButton'>Sign Up</a></div>"
    }
    else {
        linkOptions.innerHTML = "<div class='navlink'><a href='/logout' id='logoutButton'>Log Out</a></div>";
        linkOptions.innerHTML += "<div class='navlink'><a href='/makeQuiz' id='makeQuizButton'>Make Quiz</a></div>";
    }

    const loginButton = document.querySelector("#loginButton");
    const signupButton = document.querySelector("#signupButton");

    if(signupButton) {
        signupButton.addEventListener("click", (e) => {
            e.preventDefault();
            createSignupWindow(csrf);
            return false;
        });
    }

    if(loginButton) {
        loginButton.addEventListener("click", (e) => {
            e.preventDefault();
            createLoginWindow(csrf);
            return false;
        });
    }

    loadQuizzesFromServer(); // default view
};

const getToken = () => {
    sendAjax('GET', '/getToken', null, (result) => {
        setup(result.csrfToken);
    });
};

$(document).ready(function() {
    getToken();
});
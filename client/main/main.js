// get information from login form and send a login request to the server
const handleLogin = (e) => {
    e.preventDefault();

    if ($("#user").val() == '' || $("#pass").val() == '') {
        handleError("Username or password is empty");
        return false;
    }

    sendAjax('POST', $("#loginForm").attr("action"), $("#loginForm").serialize(), redirect);

    return false;
};

// get information from signup form and send a signup request to the server
const handleSignup = (e) => {
    e.preventDefault();

    if ($("#user").val() == '' || $("#pass").val() == '' || $("#pass2").val() == '') {
        handleError("All fields are required");
        return false;
    }

    if ($("#pass").val() !== $("#pass2").val()) {
        handleError("Passwords do not match");
        return false;
    }

    sendAjax('POST', $("#signupForm").attr("action"), $("#signupForm").serialize(), redirect);

    return false;
};

// get information from password change form and send a change password request to the server
const handleChangePassword = (e) => {
    e.preventDefault();

    if ($("#oldPassword").val() == '' || $("#newPassword").val() == '') {
        handleError("All fields are required");
        return false;
    }

    sendAjax('POST', $("#changePasswordForm").attr("action"), $("#changePasswordForm").serialize(), () => {
        window.location = "/logout";
    });

    return false;
};

// react element for logging in
const LoginWindow = (props) => {
    return (
        <form id="loginForm" name="loginForm"
            onSubmit={handleLogin}
            action="/login"
            method="POST"
            className="mainForm"
        >
            <input id="user" type="text" name="username" placeholder="Username" />
            <input id="pass" type="password" name="pass" placeholder="Password" />
            <input type="hidden" name="_csrf" value={props.csrf} />
            <input className="formSubmit" type="submit" value="Log In" />
            <p id="error"></p>
        </form>
    );
};

// react element for signing up
const SignupWindow = (props) => {
    return (
        <form id="signupForm" name="signupForm"
            onSubmit={handleSignup}
            action="/signup"
            method="POST"
            className="mainForm"
        >
            <input id="user" type="text" name="username" placeholder="Username" />
            <input id="pass" type="password" name="pass" placeholder="Password" />
            <input id="pass2" type="password" name="pass2" placeholder="Retype Password" />
            <input type="hidden" name="_csrf" value={props.csrf} />
            <input className="formSubmit" type="submit" value="Sign Up" />
            <p id="error"></p>
        </form>
    );
};

// react element for seeing account information and making changes
// currently only is able to change passwords
const MyAccountWindow = (props) => {
    return (
        <form id="changePasswordForm" name="changePasswordForm"
            onSubmit={handleChangePassword}
            action="/changePassword"
            method="POST"
            className="mainForm"
        >
            <input id="oldPassword" type="password" name="oldPassword" placeholder="Old Password" />
            <input id="newPassword" type="password" name="newPassword" placeholder="New Password" />
            <input type="hidden" name="_csrf" value={props.csrf} />
            <input className="formSubmit" type="submit" value="Change Password" />
            <p id="error"></p>
        </form>
    );
};

// react element to display a list of all the quizzes that have been made
const QuizList = function (props) {
    if (props.quizzes.length === 0) {
        return (
            <div className="quizList">
                <h3 className="emptyQuizzes">No quizzes yet</h3>
            </div>
        );
    }

    const quizNodes = props.quizzes.map(function (quiz) {
        return (
            <div key={quiz._id} className="quiz">
                <h3 className="quizName"> {quiz.name} </h3>
                <h3 className="quizDescription"> {quiz.description} </h3>
                <input hidden className="quizId" value={quiz._id}></input>
            </div>
        );
    });

    return (
        <div className="quizList">
            {quizNodes}
            <p id="error"></p>
        </div>
    );
};

// get all the quizzes that have been made to the server and 
// create QuizList react element to display them
const loadQuizzesFromServer = () => {
    sendAjax('GET', '/getQuizzes', null, (data) => {
        ReactDOM.render(
            <QuizList quizzes={data.quizzes} />, document.querySelector("#content")
        );

        // setup event listeners to let users take a quiz when they click on it
        let quizzes = document.querySelectorAll(".quiz");
        for (let i = 0; i < quizzes.length; i++) {
            let quiz = quizzes[i];
            let quizName = quiz.querySelector(".quizName").innerText;
            let quizDescription = quiz.querySelector(".quizDescription").innerText;
            quiz.addEventListener("click", () => {
                let url = "/takeQuiz?name=" + quizName + "&description=" + quizDescription;
                window.location = url;
            });
        }
    });
};

// render login window to content
const createLoginWindow = (csrf) => {
    ReactDOM.render(
        <LoginWindow csrf={csrf} />,
        document.querySelector("#content")
    );
};

// render signup window to content
const createSignupWindow = (csrf) => {
    ReactDOM.render(
        <SignupWindow csrf={csrf} />,
        document.querySelector("#content")
    );
};

// render account window to content
const createMyAccountWindow = (csrf) => {
    ReactDOM.render(
        <MyAccountWindow csrf={csrf} />,
        document.querySelector("#content")
    );
};

const setup = (csrf) => {
    // setup nav bar based on whether the user is logged in or not
    const linkOptions = document.querySelector("#linkOptions");
    const loggedIn = document.querySelector("#isLoggedIn").innerHTML == "true";
    if (!loggedIn) {
        linkOptions.innerHTML = "<li class='navlink'><a id='loginButton'>Log In</a></li>";
        linkOptions.innerHTML += "<li class='navlink'><a id='signupButton'>Sign Up</a></li>"
    }
    else {
        linkOptions.innerHTML = "<li class='navlink'><a href='/logout' id='logoutButton'>Log Out</a></li>";
        linkOptions.innerHTML += "<li class='navlink'><a href='/makeQuiz' id='makeQuizButton'>Make Quiz</a></li>";
        linkOptions.innerHTML += "<li class='navlink'><a id='myAccountButton'>Change Password</a></li>";
    }

    const loginButton = document.querySelector("#loginButton");
    const signupButton = document.querySelector("#signupButton");
    const myAccountButton = document.querySelector("#myAccountButton");
    if (signupButton) {
        signupButton.addEventListener("click", (e) => {
            e.preventDefault();
            createSignupWindow(csrf);
            return false;
        });
    }
    if (loginButton) {
        loginButton.addEventListener("click", (e) => {
            e.preventDefault();
            createLoginWindow(csrf);
            return false;
        });
    }
    if (myAccountButton) {
        myAccountButton.addEventListener("click", (e) => {
            e.preventDefault();
            createMyAccountWindow(csrf);
            return false;
        });
    }

    loadQuizzesFromServer(); // default view
};

// get csrf token from server
const getToken = () => {
    sendAjax('GET', '/getToken', null, (result) => {
        setup(result.csrfToken);
    });
};

$(document).ready(function () {
    getToken();
});
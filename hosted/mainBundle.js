"use strict";

var handleLogin = function handleLogin(e) {
    e.preventDefault();

    if ($("#user").val() == '' || $("#pass").val() == '') {
        handleError("Username or password is empty");
        return false;
    }

    sendAjax('POST', $("#loginForm").attr("action"), $("#loginForm").serialize(), redirect);

    return false;
};

var handleSignup = function handleSignup(e) {
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

var LoginWindow = function LoginWindow(props) {
    return React.createElement(
        "form",
        { id: "loginForm", name: "loginForm",
            onSubmit: handleLogin,
            action: "/login",
            method: "POST",
            className: "mainForm"
        },
        React.createElement(
            "label",
            { htmlFor: "username" },
            "Username: "
        ),
        React.createElement("input", { id: "user", type: "text", name: "username", placeholder: "username" }),
        React.createElement(
            "label",
            { htmlFor: "pass" },
            "Password: "
        ),
        React.createElement("input", { id: "pass", type: "password", name: "pass", placeholder: "password" }),
        React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
        React.createElement("input", { className: "formSubmit", type: "submit", value: "Sign in" })
    );
};

var SignupWindow = function SignupWindow(props) {
    return React.createElement(
        "form",
        { id: "signupForm", name: "signupForm",
            onSubmit: handleSignup,
            action: "/signup",
            method: "POST",
            className: "mainForm"
        },
        React.createElement(
            "label",
            { htmlFor: "username" },
            "Username: "
        ),
        React.createElement("input", { id: "user", type: "text", name: "username", placeholder: "username" }),
        React.createElement(
            "label",
            { htmlFor: "pass" },
            "Password: "
        ),
        React.createElement("input", { id: "pass", type: "password", name: "pass", placeholder: "password" }),
        React.createElement(
            "label",
            { htmlFor: "pass2" },
            "Password: "
        ),
        React.createElement("input", { id: "pass2", type: "password", name: "pass2", placeholder: "retype password" }),
        React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
        React.createElement("input", { className: "formSubmit", type: "submit", value: "Sign up" })
    );
};

var QuizList = function QuizList(props) {
    if (props.quizzes.length === 0) {
        return React.createElement(
            "div",
            { className: "quizList" },
            React.createElement(
                "h3",
                { className: "emptyQuizzes" },
                "No quizzes yet"
            )
        );
    }

    var quizNodes = props.quizzes.map(function (quiz) {
        return React.createElement(
            "div",
            { key: quiz._id, className: "quiz" },
            React.createElement(
                "h3",
                { className: "quizName" },
                " ",
                quiz.name,
                " "
            ),
            React.createElement(
                "h3",
                { className: "quizDescription" },
                " ",
                quiz.description,
                " "
            )
        );
    });

    return React.createElement(
        "div",
        { className: "quizList" },
        quizNodes
    );
};

var loadQuizzesFromServer = function loadQuizzesFromServer() {
    sendAjax('GET', '/getQuizzes', null, function (data) {
        ReactDOM.render(React.createElement(QuizList, { quizzes: data.quizzes }), document.querySelector("#content"));
    });
};

var createLoginWindow = function createLoginWindow(csrf) {
    ReactDOM.render(React.createElement(LoginWindow, { csrf: csrf }), document.querySelector("#content"));
};

var createSignupWindow = function createSignupWindow(csrf) {
    ReactDOM.render(React.createElement(SignupWindow, { csrf: csrf }), document.querySelector("#content"));
};

var setup = function setup(csrf) {
    var linkOptions = document.querySelector("#linkOptions");
    var loggedIn = document.querySelector("#isLoggedIn").innerHTML == "true";
    if (!loggedIn) {
        linkOptions.innerHTML = "<div class='navlink'><a href='/login' id='loginButton'>Log In</a></div>";
        linkOptions.innerHTML += "<div class='navlink'><a href='/signup' id='signupButton'>Sign Up</a></div>";
    } else {
        linkOptions.innerHTML = "<div class='navlink'><a href='/logout' id='logoutButton'>Log Out</a></div>";
        linkOptions.innerHTML += "<div class='navlink'><a href='/makeQuiz' id='makeQuizButton'>Make Quiz</a></div>";
    }

    var loginButton = document.querySelector("#loginButton");
    var signupButton = document.querySelector("#signupButton");

    if (signupButton) {
        signupButton.addEventListener("click", function (e) {
            e.preventDefault();
            createSignupWindow(csrf);
            return false;
        });
    }

    if (loginButton) {
        loginButton.addEventListener("click", function (e) {
            e.preventDefault();
            createLoginWindow(csrf);
            return false;
        });
    }

    loadQuizzesFromServer(); // default view
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

var handleError = function handleError(message) {
    console.log(message);
};

var redirect = function redirect(response) {
    window.location = response.redirect;
};

var sendAjax = function sendAjax(type, action, data, success) {
    $.ajax({
        cache: false,
        type: type,
        url: action,
        data: data,
        dataType: "json",
        success: success,
        error: function error(xhr, status, _error) {
            var messageObj = JSON.parse(xhr.responseText);
            handleError(messageObj.error);
        }
    });
};

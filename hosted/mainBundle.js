"use strict";

// get information from login form and send a login request to the server
var handleLogin = function handleLogin(e) {
    e.preventDefault();

    if ($("#user").val() == '' || $("#pass").val() == '') {
        handleError("Username or password is empty");
        return false;
    }

    sendAjax('POST', $("#loginForm").attr("action"), $("#loginForm").serialize(), redirect);

    return false;
};

// get information from signup form and send a signup request to the server
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

// get information from password change form and send a change password request to the server
var handleChangePassword = function handleChangePassword(e) {
    e.preventDefault();

    if ($("#oldPassword").val() == '' || $("#newPassword").val() == '') {
        handleError("All fields are required");
        return false;
    }

    sendAjax('POST', $("#changePasswordForm").attr("action"), $("#changePasswordForm").serialize(), function () {
        window.location = "/logout";
    });

    return false;
};

var handleDeleteQuiz = function handleDeleteQuiz(e, csrf, quizId) {
    e.preventDefault();

    sendAjax('POST', '/deleteQuiz', { quizId: quizId, _csrf: csrf }, function () {
        return loadOwnedQuizzesFromServer(true);
    });
    return false;
};

// react element for logging in
var LoginWindow = function LoginWindow(props) {
    return React.createElement(
        "form",
        { id: "loginForm", name: "loginForm",
            onSubmit: handleLogin,
            action: "/login",
            method: "POST",
            className: "mainForm"
        },
        React.createElement("input", { id: "user", type: "text", name: "username", placeholder: "Username" }),
        React.createElement("input", { id: "pass", type: "password", name: "pass", placeholder: "Password" }),
        React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
        React.createElement("input", { className: "formSubmit", type: "submit", value: "Log In" }),
        React.createElement("p", { id: "error" })
    );
};

// react element for signing up
var SignupWindow = function SignupWindow(props) {
    return React.createElement(
        "form",
        { id: "signupForm", name: "signupForm",
            onSubmit: handleSignup,
            action: "/signup",
            method: "POST",
            className: "mainForm"
        },
        React.createElement("input", { id: "user", type: "text", name: "username", placeholder: "Username" }),
        React.createElement("input", { id: "pass", type: "password", name: "pass", placeholder: "Password" }),
        React.createElement("input", { id: "pass2", type: "password", name: "pass2", placeholder: "Retype Password" }),
        React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
        React.createElement("input", { className: "formSubmit", type: "submit", value: "Sign Up" }),
        React.createElement("p", { id: "error" })
    );
};

// react element for seeing account information and making changes
// currently only is able to change passwords
var MyAccountWindow = function MyAccountWindow(props) {
    return React.createElement(
        "div",
        { id: "myAccount" },
        React.createElement("p", { id: "error" }),
        React.createElement("input", { hidden: true, id: "csrf", value: props.csrf }),
        React.createElement(
            "h4",
            { id: "changePasswordButton", className: "accountButton" },
            "Change Password"
        ),
        React.createElement(
            "form",
            { id: "changePasswordForm", name: "changePasswordForm",
                onSubmit: handleChangePassword,
                action: "/changePassword",
                method: "POST",
                className: "mainForm"
            },
            React.createElement("input", { id: "oldPassword", type: "password", name: "oldPassword", placeholder: "Old Password" }),
            React.createElement("input", { id: "newPassword", type: "password", name: "newPassword", placeholder: "New Password" }),
            React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
            React.createElement("input", { className: "formSubmit", type: "submit", value: "Submit" })
        ),
        React.createElement(
            "h4",
            { id: "ownedQuizzesButton", className: "accountButton" },
            "My Quizzes"
        ),
        React.createElement("div", { id: "ownedQuizzes" })
    );
};

// react element to display a list of all the quizzes that have been made
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
            ),
            React.createElement("input", { hidden: true, className: "quizId", value: quiz._id })
        );
    });

    return React.createElement(
        "div",
        { className: "quizList" },
        quizNodes,
        React.createElement("p", { id: "error" })
    );
};

var OwnedQuizList = function OwnedQuizList(props) {
    if (props.quizzes.length === 0) {
        return React.createElement(
            "div",
            { className: "quizList" },
            React.createElement(
                "p",
                { id: "noOwnedQuizzes" },
                "No quizzes yet"
            )
        );
    }

    var quizNodes = props.quizzes.map(function (quiz) {
        return React.createElement(
            "div",
            { key: quiz._id, className: "ownedQuiz" },
            React.createElement(
                "h3",
                { className: "quizName" },
                " ",
                quiz.name,
                " "
            ),
            React.createElement(
                "p",
                { className: "changeButton" },
                "Change"
            ),
            React.createElement(
                "p",
                { className: "deleteButton" },
                "Delete"
            ),
            React.createElement("input", { hidden: true, className: "quizId", value: quiz._id })
        );
    });

    return React.createElement(
        "div",
        { className: "quizList" },
        quizNodes
    );
};

// get all the quizzes that have been made to the server and 
// create QuizList react element to display them
var loadQuizzesFromServer = function loadQuizzesFromServer() {
    sendAjax('GET', '/getQuizzes', null, function (data) {
        ReactDOM.render(React.createElement(QuizList, { quizzes: data.quizzes }), document.querySelector("#content"));

        // setup event listeners to let users take a quiz when they click on it
        var quizzes = document.querySelectorAll(".quiz");

        var _loop = function _loop(i) {
            var quiz = quizzes[i];
            var quizName = quiz.querySelector(".quizName").innerText;
            var quizDescription = quiz.querySelector(".quizDescription").innerText;
            var quizId = quiz.querySelector(".quizId").value;
            quiz.addEventListener("click", function () {
                var url = "/takeQuiz?quizId=" + quizId + "&quizName=" + quizName + "&quizDescription=" + quizDescription;
                window.location = url;
            });
        };

        for (var i = 0; i < quizzes.length; i++) {
            _loop(i);
        }
    });
};

var loadOwnedQuizzesFromServer = function loadOwnedQuizzesFromServer() {
    var refresh = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    var filterByOwner = true;
    sendAjax('GET', '/getQuizzes', filterByOwner, function (data) {
        ReactDOM.render(React.createElement(OwnedQuizList, { quizzes: data.quizzes }), document.querySelector("#ownedQuizzes"));
        var ownedQuizzesButton = document.querySelector("#ownedQuizzesButton");
        var ownedQuizzesDiv = document.querySelector("#ownedQuizzes");
        if (!refresh) {
            ownedQuizzesDiv.style.maxHeight = 0;
            ownedQuizzesDiv.style.padding = 0;
            ownedQuizzesDiv.style.margin = 0;
        }
        ownedQuizzesButton.onclick = function () {
            if (ownedQuizzesDiv.style.maxHeight == "0px") {
                var numQuizzes = ownedQuizzesDiv.querySelectorAll(".ownedQuiz").length;
                if (numQuizzes == 0) {
                    ownedQuizzesDiv.style.maxHeight = "70px";
                } else {
                    ownedQuizzesDiv.style.maxHeight = numQuizzes * 200 + "px";
                }
                ownedQuizzesDiv.style.padding = "auto";
                ownedQuizzesDiv.style.margin = "auto";
            } else {
                ownedQuizzesDiv.style.maxHeight = 0;
                ownedQuizzesDiv.style.padding = 0;
                ownedQuizzesDiv.style.margin = 0;
                document.querySelector("#error").innerText = "";
            }
        };
        var ownedQuizzes = ownedQuizzesDiv.querySelectorAll(".ownedQuiz");
        var csrf = document.querySelector("#csrf").value;

        var _loop2 = function _loop2(i) {
            var deleteButton = ownedQuizzes[i].querySelector(".deleteButton");
            var changeButton = ownedQuizzes[i].querySelector(".changeButton");
            var ownedQuizId = ownedQuizzes[i].querySelector(".quizId").value;
            deleteButton.onclick = function (e) {
                handleDeleteQuiz(e, csrf, ownedQuizId);
            };
            changeButton.onclick = function (e) {
                var url = "/makeQuiz?quizToChange=" + ownedQuizId;
                window.location = url;
            };
        };

        for (var i = 0; i < ownedQuizzes.length; i++) {
            _loop2(i);
        }
    });
};

// render login window to content
var createLoginWindow = function createLoginWindow(csrf) {
    ReactDOM.render(React.createElement(LoginWindow, { csrf: csrf }), document.querySelector("#content"));
};

// render signup window to content
var createSignupWindow = function createSignupWindow(csrf) {
    ReactDOM.render(React.createElement(SignupWindow, { csrf: csrf }), document.querySelector("#content"));
};

// render account window to content
var createMyAccountWindow = function createMyAccountWindow(csrf, ownedQuizzes) {
    ReactDOM.render(React.createElement(MyAccountWindow, { csrf: csrf, ownedQuizzes: ownedQuizzes }), document.querySelector("#content"));

    var changePasswordButton = document.querySelector("#changePasswordButton");
    var changePasswordForm = document.querySelector("#changePasswordForm");
    changePasswordForm.style.maxHeight = 0;
    changePasswordForm.style.padding = 0;
    changePasswordForm.style.margin = 0;

    changePasswordButton.onclick = function () {
        if (changePasswordForm.style.maxHeight == "0px") {
            changePasswordForm.style.maxHeight = "150px";
            changePasswordForm.style.padding = "auto";
            changePasswordForm.style.margin = "auto";
            document.querySelector("#error").innerText = "";
        } else {
            changePasswordForm.style.maxHeight = 0;
            changePasswordForm.style.padding = 0;
            changePasswordForm.style.margin = 0;
        }
    };
    loadOwnedQuizzesFromServer();
};

var setup = function setup(csrf) {
    // setup nav bar based on whether the user is logged in or not
    var linkOptions = document.querySelector("#linkOptions");
    var loggedIn = document.querySelector("#isLoggedIn").innerHTML == "true";
    if (!loggedIn) {
        linkOptions.innerHTML = "<li class='navlink'><a id='loginButton'>Log In</a></li>";
        linkOptions.innerHTML += "<li class='navlink'><a id='signupButton'>Sign Up</a></li>";
    } else {
        linkOptions.innerHTML = "<li class='navlink'><a href='/logout' id='logoutButton'>Log Out</a></li>";
        linkOptions.innerHTML += "<li class='navlink'><a href='/makeQuiz' id='makeQuizButton'>Make Quiz</a></li>";
        linkOptions.innerHTML += "<li class='navlink'><a id='myAccountButton'>My Account</a></li>";
    }

    var loginButton = document.querySelector("#loginButton");
    var signupButton = document.querySelector("#signupButton");
    var myAccountButton = document.querySelector("#myAccountButton");
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
    if (myAccountButton) {
        myAccountButton.addEventListener("click", function (e) {
            e.preventDefault();
            createMyAccountWindow(csrf, null);
            return false;
        });
    }

    loadQuizzesFromServer(); // default view
};

// get csrf token from server
var getToken = function getToken() {
    sendAjax('GET', '/getToken', null, function (result) {
        setup(result.csrfToken);
    });
};

$(document).ready(function () {
    getToken();
});
"use strict";

// display error messages in error section of view
var handleError = function handleError(message) {
    var error = document.querySelector("#error");
    if (error) {
        error.innerHTML = message;
    }
};

// go to given web page
var redirect = function redirect(response) {
    window.location = response.redirect;
};

// send an ajax request
var sendAjax = function sendAjax(type, action, data, success) {
    $.ajax({
        cache: false,
        type: type,
        url: action,
        data: data,
        dataType: "json",
        success: success,
        error: function error(xhr, status, _error) {
            console.log(xhr.responseText);
            handleError(JSON.parse(xhr.responseText).error);
        }
    });
};

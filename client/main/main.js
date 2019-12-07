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

const handleDeleteQuiz = (e, csrf, quizId) => {
    e.preventDefault();

    sendAjax('POST', '/deleteQuiz', { quizId, _csrf: csrf }, () => loadOwnedQuizzesFromServer(true));
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
        <div id="myAccount">
            <p id="error"></p>
            <input hidden id="csrf" value={props.csrf} />
            <h4 id="changePasswordButton" className="accountButton">Change Password</h4>
            <form id="changePasswordForm" name="changePasswordForm"
                onSubmit={handleChangePassword}
                action="/changePassword"
                method="POST"
                className="mainForm"
            >
                <input id="oldPassword" type="password" name="oldPassword" placeholder="Old Password" />
                <input id="newPassword" type="password" name="newPassword" placeholder="New Password" />
                <input type="hidden" name="_csrf" value={props.csrf} />
                <input className="formSubmit" type="submit" value="Submit" />
            </form>
            <h4 id="ownedQuizzesButton" className="accountButton">My Quizzes</h4>
            <div id="ownedQuizzes"></div>
        </div>
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

    let quizNodes = props.quizzes.map(function (quiz) {
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

const OwnedQuizList = function (props) {
    if (props.quizzes.length === 0) {
        return (
            <div className="quizList">
                <p id="noOwnedQuizzes">No quizzes yet</p>
            </div>
        );
    }

    let quizNodes = props.quizzes.map(function (quiz) {
        return (
            <div key={quiz._id} className="ownedQuiz">
                <h3 className="quizName"> {quiz.name} </h3>
                <p className="changeButton">Change</p>
                <p className="deleteButton">Delete</p>
                <input hidden className="quizId" value={quiz._id}></input>
            </div>
        );
    });

    return (
        <div className="quizList">
            {quizNodes}
        </div>
    );
}

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
            let quizId = quiz.querySelector(".quizId").value;
            quiz.addEventListener("click", () => {
                let url = `/takeQuiz?quizId=${quizId}&quizName=${quizName}&quizDescription=${quizDescription}`
                window.location = url;
            });
        }
    });
};

const loadOwnedQuizzesFromServer = (refresh = false) => {
    let filterByOwner = true;
    sendAjax('GET', '/getQuizzes', filterByOwner, (data) => {
        ReactDOM.render(
            <OwnedQuizList quizzes={data.quizzes} />,
            document.querySelector("#ownedQuizzes")
        );
        let ownedQuizzesButton = document.querySelector("#ownedQuizzesButton");
        let ownedQuizzesDiv = document.querySelector("#ownedQuizzes");
        if (!refresh) {
            ownedQuizzesDiv.style.maxHeight = 0;
            ownedQuizzesDiv.style.padding = 0;
            ownedQuizzesDiv.style.margin = 0;
        }
        ownedQuizzesButton.onclick = () => {
            if (ownedQuizzesDiv.style.maxHeight == "0px") {
                let numQuizzes = ownedQuizzesDiv.querySelectorAll(".ownedQuiz").length;
                if (numQuizzes == 0) {
                    ownedQuizzesDiv.style.maxHeight = "70px";
                }
                else {
                    ownedQuizzesDiv.style.maxHeight = `${numQuizzes * 200}px`;
                }
                ownedQuizzesDiv.style.padding = "auto";
                ownedQuizzesDiv.style.margin = "auto";
            }
            else {
                ownedQuizzesDiv.style.maxHeight = 0;
                ownedQuizzesDiv.style.padding = 0;
                ownedQuizzesDiv.style.margin = 0;
                document.querySelector("#error").innerText = "";
            }
        };
        let ownedQuizzes = ownedQuizzesDiv.querySelectorAll(".ownedQuiz");
        let csrf = document.querySelector("#csrf").value;
        for (let i = 0; i < ownedQuizzes.length; i++) {
            let deleteButton = ownedQuizzes[i].querySelector(".deleteButton");
            let changeButton = ownedQuizzes[i].querySelector(".changeButton");
            let ownedQuizId = ownedQuizzes[i].querySelector(".quizId").value;
            deleteButton.onclick = (e) => {
                handleDeleteQuiz(e, csrf, ownedQuizId);
            };
            changeButton.onclick = (e) => {
                let url = `/makeQuiz?quizToChange=${ownedQuizId}`;
                window.location = url;
            };
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
const createMyAccountWindow = (csrf, ownedQuizzes) => {
    ReactDOM.render(
        <MyAccountWindow csrf={csrf} ownedQuizzes={ownedQuizzes} />,
        document.querySelector("#content")
    );

    let changePasswordButton = document.querySelector("#changePasswordButton");
    let changePasswordForm = document.querySelector("#changePasswordForm");
    changePasswordForm.style.maxHeight = 0;
    changePasswordForm.style.padding = 0;
    changePasswordForm.style.margin = 0;

    changePasswordButton.onclick = () => {
        if (changePasswordForm.style.maxHeight == "0px") {
            changePasswordForm.style.maxHeight = "150px";
            changePasswordForm.style.padding = "auto";
            changePasswordForm.style.margin = "auto";
            document.querySelector("#error").innerText = "";
        }
        else {
            changePasswordForm.style.maxHeight = 0;
            changePasswordForm.style.padding = 0;
            changePasswordForm.style.margin = 0;
        }
    };
    loadOwnedQuizzesFromServer();
};

const setup = (csrf) => {
    // setup nav bar based on whether the user is logged in or not
    let linkOptions = document.querySelector("#linkOptions");
    let loggedIn = document.querySelector("#isLoggedIn").innerHTML == "true";
    if (!loggedIn) {
        linkOptions.innerHTML = "<li class='navlink'><a id='loginButton'>Log In</a></li>";
        linkOptions.innerHTML += "<li class='navlink'><a id='signupButton'>Sign Up</a></li>"
    }
    else {
        linkOptions.innerHTML = "<li class='navlink'><a href='/logout' id='logoutButton'>Log Out</a></li>";
        linkOptions.innerHTML += "<li class='navlink'><a href='/makeQuiz' id='makeQuizButton'>Make Quiz</a></li>";
        linkOptions.innerHTML += "<li class='navlink'><a id='myAccountButton'>My Account</a></li>";
    }

    let loginButton = document.querySelector("#loginButton");
    let signupButton = document.querySelector("#signupButton");
    let myAccountButton = document.querySelector("#myAccountButton");
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
            createMyAccountWindow(csrf, null);
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
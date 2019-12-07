
// display error messages in error section of view
const handleError = (message) => {
    let error = document.querySelector("#error");
    if(error) {
        error.innerHTML = message;
    }
};

// go to given web page
const redirect = (response) => {
    window.location = response.redirect;
};

// send an ajax request
const sendAjax = (type, action, data, success) => {
    $.ajax({
        cache: false,
        type: type,
        url: action,
        data: data,
        dataType: "json",
        success: success,
        error: function(xhr, status, error) {
            console.log(xhr.responseText);
            handleError(JSON.parse(xhr.responseText).error);
        }
    });
};
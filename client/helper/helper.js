const handleError = (message) => {
    let error = document.querySelector("#error");
    if(error) {
        error.innerHTML = message;
    }
};

const redirect = (response) => {
    window.location = response.redirect;
};

const sendAjax = (type, action, data, success) => {
    $.ajax({
        cache: false,
        type: type,
        url: action,
        data: data,
        dataType: "json",
        success: success,
        error: function(xhr, status, error) {
            if(xhr.responseJSON) {
                handleError(xhr.responseJSON.error);
            }
            else {
                handleError(error);
            }
        }
    });
};
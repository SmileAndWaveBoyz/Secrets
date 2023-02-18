console.log("Script is working");

//Form elements
const email = document.getElementById("EMAIL");
const password = document.getElementById("PASSWORD");
const passwordRepeat = document.getElementById("confirm_password");
const form = document.getElementById("form");

//Labels
const errorEmailElement = document.getElementById("errorEmailElement");
const errorPasswordElement = document.getElementById("errorPasswordElement");
const errorPasswordRepeatElement = document.getElementById("errorPasswordRepeatElement");

form.addEventListener("submit", function (e) {
    let passwordErrorMessages = [];
    let passwordRepeatErrorMessages = [];
    let emailErrorMessages = [];

    //Email errors
    if (email.value === "" || email.value == null) {
        emailErrorMessages.push("Can't be empty");
        email.classList.add("error");
    }

    if (email.value.length >= 320) {
        emailErrorMessages.push("Must be less than 320 characters");
        email.classList.add("error");
    }

    if (validateEmail(email.value) === false) {
        emailErrorMessages.push("Sorry, invalid format here");
        email.classList.add("error");
    }

    if (emailErrorMessages.length > 0) {
        e.preventDefault();
        errorEmailElement.innerText = emailErrorMessages.join(", ");
    }

    //Password errors
    if (password.value === "" || password.value == null) {
        passwordErrorMessages.push("Can't be empty");
        password.classList.add("error");
    }

    if (password.value.length > 100) {
        passwordErrorMessages.push("Must be less than 100 characters");
        password.classList.add("error");
    }

    if (passwordErrorMessages.length > 0) {
        e.preventDefault();
        errorPasswordElement.innerText = passwordErrorMessages.join(", ");
    }

    //Repeat password errors
    if (passwordRepeat.value === "" || passwordRepeat.value == null) {
        passwordRepeatErrorMessages.push("Can't be empty");
        passwordRepeat.classList.add("error");
    }

    if (passwordRepeat.value.length > 100) {
        passwordRepeatErrorMessages.push("Must be less than 100 characters");
        passwordRepeat.classList.add("error");
    }

    if(password.value != confirm_password.value) {
        passwordRepeatErrorMessages.push("Passwords don't match");
        passwordErrorMessages.push("Passwords don't match");
        password.classList.add("error");
        passwordRepeat.classList.add("error");
    }

    if (passwordRepeatErrorMessages.length > 0) {
        e.preventDefault();
        errorPasswordRepeatElement.innerText = passwordRepeatErrorMessages.join(", ");
    }
    
});

function validateEmail(inputText)
{
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if(inputText.match(mailformat)){
            return true;
        }
        else{
            return false;
        }
}
console.log("Script is working");

//Form elements
const email = document.getElementById("EMAIL");
const password = document.getElementById("PASSWORD");
const form = document.getElementById("form");

//Labels
const errorEmailElement = document.getElementById("errorEmailElement");
const errorPasswordElement = document.getElementById("errorPasswordElement");

form.addEventListener("submit", function (e) {
    let passwordErrorMessages = [];
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

    //password errors
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
console.log("Script is working");

const form = document.getElementById("form");
const password = document.getElementById("password");
const confirm_password = document.getElementById("confirm_password");


form.addEventListener("click", function () {
    console.log("click");
    if(password.value != confirm_password.value) {
        confirm_password.setCustomValidity("Passwords don't match");
    } else{
        confirm_password.setCustomValidity(''); // It won't work without this line 
    }
});

$(document).ready(function () {
    
    $(".bookmarkButtonForm").on("submit", function (event) {
        event.preventDefault();
        let formButtonID = event.target.id;
        let bookmarkButton = document.getElementById(formButtonID + " button");
        let bookmarkButtonValue = bookmarkButton.value;
        console.log(bookmarkButton);
        
        $.ajax({
            url: "/bookmarkButton",
            method: "POST",
            data: {bookmarkButtonValue: bookmarkButtonValue},
            success: function (res) {
                    bookmarkButton.classList.toggle("true");
                    bookmarkButton.classList.toggle("false");
            }
        })
        
    })
})
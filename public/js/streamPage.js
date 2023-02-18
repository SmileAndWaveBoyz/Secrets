console.log("Script is working");

let ejsData = document.querySelector(".ejsData").innerHTML;
console.log(ejsData);

let searchInput = document.querySelector(".searchInput");
let thumb = document.querySelector(".thumb");

searchInput.addEventListener("input", function () {
    searchFunction(this.value);
});

function searchFunction(listToSort) {
    // Declare variables
    var  filter, thumbnailContainer, thumb, title, i, txtValue;
    filter = listToSort.toUpperCase();
    thumbnailContainer = document.querySelectorAll(".thumbnailContainer");

    for (let index = 0; index < 2; index++) {

      thumb = thumbnailContainer[index].getElementsByClassName('thumb');
  
      // Loop through all list items, and hide those who don't match the search query
      for (i = 0; i < thumb.length; i++) {
        title = thumb[i].getElementsByClassName("title")[0];
        txtValue = title.textContent || title.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          thumb[i].style.display = "";
        } else {
          thumb[i].style.display = "none";
        }
      }
    }

  }

  const buttonLeft = document.querySelector('.buttonLeft');
  const buttonRight = document.querySelector('.buttonRight');

  buttonRight.onclick = function () {
    document.getElementById('container').scrollLeft += 400;
    console.log("Right");
  };

  buttonLeft.onclick = function () {
    document.getElementById('container').scrollLeft -= 400;
    console.log("Left");
  };
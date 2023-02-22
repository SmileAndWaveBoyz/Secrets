console.log("Script is working");

//Search box
let ejsData = document.querySelector(".ejsData").innerHTML;
// console.log(ejsData);

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


  //Horizontal scroll buttons
  const buttonLeft = document.querySelector('.buttonLeft');
  const buttonRight = document.querySelector('.buttonRight');
  const container = document.getElementById('container');

  container.addEventListener("scroll", function () {
    if (container.scrollLeft <= 1) {
      buttonLeft.classList.add("invisable");
    } else {
      buttonLeft.classList.remove("invisable");
    }

    if (container.scrollLeft == 2324) {
      buttonRight.classList.add("invisable");
    } else {
      buttonRight.classList.remove("invisable");
    }
  });

  if (container.scrollLeft <= 1) {
    buttonLeft.classList.add("invisable");
  } else {
    buttonLeft.classList.remove("invisable");
  }

  buttonRight.onclick = function () {
    container.scrollLeft += 400;
  };

  buttonLeft.onclick = function () {
    container.scrollLeft -= 400;
  };


//Category icons
console.log("ejsData" + ejsData.length);
for (let i = 0; i < ejsData.length; i++) {
  
  const category = document.querySelectorAll(".category");
  const seriesIcon = document.querySelectorAll(".seriesIcon");
  const filmIcon = document.querySelectorAll(".filmIcon");

  if (category[i].innerHTML === "Movie") {
    seriesIcon[i].classList.toggle("invisable");
  }

  if (category[i].innerHTML === "TV Series") {
    filmIcon[i].classList.toggle("invisable");
}

}
// Sticky Navigation

window.addEventListener("scroll", function(){

    const header = document.querySelector(".header");

    if(window.scrollY > 80){

        header.classList.add("scrolled");

    }else{

        header.classList.remove("scrolled");

    }

});
// =========================================
// JK WINNERS INVESTMENT ECOSYSTEM
// =========================================

const ecosystem = document.querySelector(".ecosystem-container");

if (ecosystem) {

    const nodes = document.querySelectorAll(".node");

    // Mouse 3D Effect
    ecosystem.addEventListener("mousemove", (e) => {

        const rect = ecosystem.getBoundingClientRect();

        const x = e.clientX - rect.left;

        const y = e.clientY - rect.top;

        const rotateY = ((x / rect.width) - 0.5) * 16;

        const rotateX = ((0.5 - y / rect.height)) * 16;

        ecosystem.style.transform =
            `perspective(1800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

    });

    ecosystem.addEventListener("mouseleave", () => {

        ecosystem.style.transform =
            "perspective(1800px) rotateX(0deg) rotateY(0deg)";

    });

    // Floating Animation Delay
    nodes.forEach((node, index) => {

        node.style.animationDelay = `${index * 0.25}s`;

    });

}

// =========================================
// FADE IN ON SCROLL
// =========================================

const observer = new IntersectionObserver(entries => {

    entries.forEach(entry => {

        if(entry.isIntersecting){

            entry.target.classList.add("show");

        }

    });

},{
    threshold:0.2
});

document.querySelectorAll(".node,.center-logo").forEach(el=>{

    observer.observe(el);

});
/* ==========================================
   JK WINNERS INVESTMENT
   BUSINESS ECOSYSTEM
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const cards = document.querySelectorAll(".division-card");

    // Scroll reveal
    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if(entry.isIntersecting){

                entry.target.classList.add("active");

            }

        });

    },{

        threshold:0.15

    });

    cards.forEach(card=>observer.observe(card));

    // Magnetic Hover
    cards.forEach(card=>{

        card.addEventListener("mousemove",(e)=>{

            const rect = card.getBoundingClientRect();

            const x = e.clientX - rect.left;

            const y = e.clientY - rect.top;

            const moveX = (x - rect.width/2)/25;

            const moveY = (y - rect.height/2)/25;

            card.style.transform =
            `translate(${moveX}px,${moveY}px) translateY(-12px)`;

        });

        card.addEventListener("mouseleave",()=>{

            card.style.transform="translate(0,0)";

        });

    });

});
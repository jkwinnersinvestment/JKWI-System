const chatForm =
    document.getElementById("chatForm");

const messageInput =
    document.getElementById("messageInput");

const messages =
    document.getElementById("messages");

const typing =
    document.getElementById("typing");

const sendButton =
    document.getElementById("sendButton");

const suggestions =
    document.querySelectorAll(
        ".suggestions button"
    );



/* =========================================
   ADD MESSAGE
========================================= */

function addMessage(
    message,
    sender
) {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        `message ${sender}`;


    const content =
        document.createElement("div");

    content.className =
        "message-content";


    content.textContent =
        message;


    wrapper.appendChild(content);

    messages.appendChild(wrapper);


    messages.scrollTop =
        messages.scrollHeight;

}



/* =========================================
   AI DEMO RESPONSE
========================================= */

function getDemoResponse(message) {

    const text =
        message.toLowerCase();


    if (
        text.includes("division") ||
        text.includes("divisions")
    ) {

        return `
JK Winners Investment operates across several
business areas including Mining, Infrastructure,
Finance, Legal, Media, Social Development,
Professional Services and Farming.
        `.trim();

    }


    if (
        text.includes("market") ||
        text.includes("price")
    ) {

        return `
I can help you with JKWI local and international
market information. Live pricing will be connected
to the JKWI Market Manager when the backend is
connected.
        `.trim();

    }


    if (
        text.includes("news")
    ) {

        return `
I can help you find JKWI news across Local Business,
International Business, Local Markets and
International Markets.
        `.trim();

    }


    if (
        text.includes("quote") ||
        text.includes("quotation")
    ) {

        return `
I can help you start a quotation request. The full
quotation system will be connected to JKWI's backend
later.
        `.trim();

    }


    if (
        text.includes("specialist")
    ) {

        return `
JKWI can help customers connect with specialists
and partners for specialised services and sourcing.
        `.trim();

    }


    return `
Thanks for contacting JK Winners Investment.

I'm the JKWI AI Assistant. I can help you learn
about our divisions, services, markets, news and
business opportunities.

The live AI connection will be activated when the
JKWI backend is connected.
    `.trim();

}



/* =========================================
   SEND MESSAGE
========================================= */

async function sendMessage(message) {

    if (!message.trim()) {
        return;
    }


    addMessage(
        message,
        "user"
    );


    messageInput.value = "";

    sendButton.disabled = true;

    typing.classList.add("active");


    await new Promise(
        resolve =>
            setTimeout(
                resolve,
                700
            )
    );


    const response =
        getDemoResponse(message);


    typing.classList.remove("active");


    addMessage(
        response,
        "ai"
    );


    sendButton.disabled = false;

    messageInput.focus();

}



/* =========================================
   FORM
========================================= */

chatForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        sendMessage(
            messageInput.value
        );

    }
);



/* =========================================
   SUGGESTIONS
========================================= */

suggestions.forEach(
    button => {

        button.addEventListener(
            "click",
            function() {

                sendMessage(
                    button.dataset.question
                );

            }
        );

    }
);
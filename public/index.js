const socket = new WebSocket("ws://localhost:8000/");

socket.addEventListener("open", (event) => {
    document.body.style.backgroundColor = "red";

    const request = new Request("./api/register", {
        method: "POST",
        headers: {"content-type": "application/json"},
        body: JSON.stringify({
            name: "Leo",
            password: "admin"
        })
    });

    fetch(request);
});

socket.addEventListener("messages", (event) => {
    console.log(event);
});

socket.addEventListener("closed", (event) => {
    console.log("connection closed");
});
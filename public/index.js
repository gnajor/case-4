import { renderStartPage } from "./ui/startPage/startPage.js";
import * as apiCom from "./apiCom/apiCom.js";

const socket = new WebSocket("ws://localhost:8000/");

socket.addEventListener("open", () => {
    const loginState = localStorage.getItem("token");

    if(!loginState){
        renderStartPage("wrapper")
    }

    /* socket.send(JSON.stringify({
        action: "user:current",
        data: {
            id: "dasfdasdf",
            name: "leo",
        }
    })) */
});

socket.addEventListener("message", (event) => {

});

socket.addEventListener("close", () => {
    console.log("connection closed");
});
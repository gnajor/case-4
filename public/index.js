import { renderStartPage } from "./ui/startPage/startPage.js";
import * as apiCom from "./apiCom/apiCom.js";
import { PubSub } from "./utils/pubsub.js";

const socket = new WebSocket("ws://localhost:8000/");

socket.addEventListener("open", () => {
    handleStart();

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


function handleStart(){
    const token = localStorage.getItem("token");

    if(!token){
        renderStartPage("wrapper");
    }
    else{
        PubSub.subscribe({
            event: "authorizeToken",
            details: {
                token: token,
                action: "token:authorization"
            }
        });

        
    }
}
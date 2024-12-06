import { renderStartPage } from "./ui/startPage/startPage.js";
import * as apiCom from "./apiCom/apiCom.js";
import { PubSub } from "./utils/pubsub.js";

const socket = new WebSocket("ws://localhost:8000/");

socket.addEventListener("open", () => {
    handleStart();
});

socket.addEventListener("message", (event) => {

});

socket.addEventListener("close", () => {
    console.log("connection closed");
});


function handleStart(){
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("name");

    if(!token && !name){
        renderStartPage("wrapper");
    }
    else{
        PubSub.publish({
            event: "authorizeTokenName",
            details: {
                token: token,
                name: name,
                action: "token-name:authorization"
            }
        });

        PubSub.subscribe({
            event: "unauthorizedTokenName",
            listener: (message) => {
                localStorage.clear();
                renderStartPage("wrapper");
            }
        })
    }
}

function redirectToLogin(parentId = "wrapper"){

}


//from component PubSub to apiCom, check if login is correct and pubsub to a redirectFile. This file redirects the path that is needed

//For example Login Pubsub to apicom and from apicom Pubsub to 
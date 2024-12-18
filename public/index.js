import { handleRoute, pageHandler, navigateTo} from "./pageHandler/pageHandler.js";
import { PubSub } from "./utils/pubsub.js";

const socket = new WebSocket("ws://localhost:8000/");

//to be able to use reload and the arrows you need to store the page history in either localStorage or sessionStorage

window.addEventListener("popstate", () => { //popstate AKA using the website arrows 
    handleRoute(); 
});

window.addEventListener("load", () => {
    handleRoute();

    socket.addEventListener("open", () => {
        pageHandler.handleEntry();
        pageHandler.handleCategories();
    });
});


socket.addEventListener("message", (event) => {
    const serverToClientMessage = JSON.parse(event.data);
    
    switch(serverToClientMessage){
        case "user:recieved":{
            PubSub.publish({
                event: "user:recieved",
                details: serverToClientMessage.data
            })
            break;
        } 

        case "user:img-changed": {
            PubSub.publish({
                event: "user:img-changed",
                details: serverToClientMessage.data
            });
            break;
        }

        case "user:unreadied": {
            console.log(serverToClientMessage.data);
            break;
        }

        case "user:you-unreadied": {
            console.log(serverToClientMessage.data);
            break
        }

        case "user:readied": {
            console.log(serverToClientMessage.data);
            break;
        }

        case "user:you-readied": {
            console.log(serverToClientMessage.data); 
            break
        }

        case "room:readied": {
            startGame(serverToClientMessage.data);
            break;
        }

        case "room:user-joined": {
            PubSub.publish({
                event: "room:user-joined",
                details: serverToClientMessage.data
            });
            break;
        }

        case "room:you-joined": {
            navigateTo("lobby", serverToClientMessage.data);
            break
        }

        case "room:created": {
            navigateTo("lobby", serverToClientMessage.data);
            break;
        }

        case "game:started": {   
            PubSub.publish({
                event: "category:chooser-chosen",
                details: serverToClientMessage.data
            })    
            navigateTo("category", serverToClientMessage.data);
            break;
        }

        case "timer:ticking": {
            PubSub.publish({
                event: "timer:ticking",
                details: serverToClientMessage.data.timer
            });
            break;
        }
    }
});

socket.addEventListener("close", () => {
    console.log("connection closed");
});

function startGame(data){
    const message = {
        action: "start:game", //no duplication
        data: data
    }

    socket.send(JSON.stringify(message));
}

export function chosenCategory(data){
    const message = {
        action: "category:chosen",
        data: data
    }
    socket.send(JSON.stringify(message));
} 

export function makeUserReady(user){
    const message = {
        action: "user:ready",
        data: user
    }
    socket.send(JSON.stringify(message));
}

export function makeUserUnready(user){
    const message = {
        action: "user:unready",
        data: user
    }
    socket.send(JSON.stringify(message));
}

export function addUserToWs(user){
    //might check later if user is already in the array

    const message = {
        action: "user:join",
        data: {
            id: user.id,
            name: user.name,
        }
    }
    socket.send(JSON.stringify(message));
}

export function joinRoom(data){
    const message = {
        action: "room:join",
        data: data
    }
    socket.send(JSON.stringify(message));
}

export function createRoom(user){
    const message = {
        action: "room:create",
        data: user
    }

    socket.send(JSON.stringify(message));
}

export function addNewUserImage(user){
    const message = {
        action: "user:new-image",
        data: user
    }

    socket.send(JSON.stringify(message));
}




//from component PubSub to apiCom, check if login is correct and pubsub to a redirectFile. This file redirects the path that is needed

//For example Login Pubsub to apicom and from apicom Pubsub to 
import { handleRoute, pageHandler, navigateTo} from "./pageHandler/pageHandler.js";
import { User } from "./entities/user.js";

const socket = new WebSocket("ws://localhost:8000/");

//to be able to use reload and the arrows you need to store the page history in either localStorage or sessionStorage

document.addEventListener("DOMContentLoaded", () => {
    handleRoute();
});

window.addEventListener("popstate", () => { //popstate AKA using the website arrows 
    handleRoute(); 
});

socket.addEventListener("open", () => {
    pageHandler.handleEntry();
});

socket.addEventListener("message", (event) => {
    const serverToClientMessage = JSON.parse(event.data);
    
    switch(serverToClientMessage.event){
        case "user:recieved":{
            const user = serverToClientMessage.data;
            new User(user.id, user.name);
            break;
        } 

        case "user:list": {
            navigateTo("lobby", serverToClientMessage.data);
            break;
        }

        case "room:user-joined": {
            navigateTo("lobby", serverToClientMessage.data);
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
    }
});

socket.addEventListener("close", () => {
    console.log("connection closed");
});

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




//from component PubSub to apiCom, check if login is correct and pubsub to a redirectFile. This file redirects the path that is needed

//For example Login Pubsub to apicom and from apicom Pubsub to 
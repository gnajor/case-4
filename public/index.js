import { handleRoute, pageHandler, navigateTo} from "./pageHandler/pageHandler.js";
import { PubSub } from "./utils/pubsub.js";

const socket = new WebSocket(`ws://${window.location.hostname}:8000/`);

//to be able to use reload and the arrows you need to store the page history in either localStorage or sessionStorage
//right now I have a shared state: one in the server and one in the classes which is kinda stupid and has led to a lot of problems so I will fix : )

window.addEventListener("popstate", () => { //popstate AKA using the website arrows 
    handleRoute(); 
});

window.addEventListener("load", () => {
    handleRoute();

    socket.addEventListener("open", () => {
        pageHandler.handleEntry();
    });
});


socket.addEventListener("message", (event) => {
    const serverToClientMessage = JSON.parse(event.data);
    console.log(serverToClientMessage.event);
    
    switch(serverToClientMessage.event){
        case "user:recieved":{
            PubSub.publish({
                event: "user:recieved",
                details: serverToClientMessage.data
            });
            break;
        } 

        case "user:img-changed": {
            PubSub.publish({
                event: "user:img-changed",
                details: serverToClientMessage.data
            });
            break;
        }

        case "user:you-img-changed": {
            PubSub.publish({
                event: "user:you-img-changed",
                details: serverToClientMessage.data.img
            });
            break;
        }

        case "user:unreadied": {
            PubSub.publish({
                event: "user:unreadied",
                details: serverToClientMessage.data
            });
            break;
        }

        case "user:you-unreadied": {
            break
        }

        case "user:left": {
            navigateTo("entry");
            break;
        }

        case "user:readied": {
            PubSub.publish({
                event: "user:readied",
                details: serverToClientMessage.data
            });
            break;
        }

        case "user:you-readied": {
            console.log(serverToClientMessage.data); 
            break
        }

        case "user:voted": {
            PubSub.publish({
                event:"user:voted",
                details: serverToClientMessage.data
            });
            break;
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

        case "category:chosen": {
            PubSub.publish({
                event: "category:chosen",
                details: serverToClientMessage.data
            });

            PubSub.publish({
                event: "timer:ticking",
                details: serverToClientMessage.data.time
            })
           break;
        }

        case "game:start-match":{
            navigateTo("prompt", serverToClientMessage.data);
            break;
        }

        case "game:show-prompt": {
            PubSub.publish({
                event: "game:show-prompt",
                details: serverToClientMessage.data
            });

            PubSub.publish({
                event: "timer:ticking",
                details: serverToClientMessage.data.time
            });
            break;
        }

        case "game:voting":{
            navigateTo("voting", serverToClientMessage.data);
            break;
        }

        case "game:everybody-voted": {
            navigateTo("results", serverToClientMessage.data);
            break;
        }

        case "game:leaderboard": {
            navigateTo("leaderboard", serverToClientMessage.data);
            break;
        }

        case "game:gone-to-menu": {
            navigateTo("home", serverToClientMessage.data);
            break;
        }

        case "game:gone-play-again": {
            console.log(serverToClientMessage.data);
            navigateTo("lobby", serverToClientMessage.data);
            break;
        }
    }
});

socket.addEventListener("close", () => {
    console.log("connection closed");
});

export function userLeave(data){
    const message = {
        action: "user:leave",
        data: data
    }

    socket.send(JSON.stringify(message));
}

function startGame(data){
    const message = {
        action: "start:game", 
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
        data: user
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

export function userVote(data){
    const message = {
        action: "game:user-vote",
        data: data
    }
    socket.send(JSON.stringify(message));
}

export function goBackToMenu(data){
    const message = {
        action: "game:go-to-menu",
        data: data
    }
    socket.send(JSON.stringify(message));
}

export function playAgain(data){
    const message = {
        action: "game:go-play-again",
        data: data
    }
    socket.send(JSON.stringify(message));
}




//from component PubSub to apiCom, check if login is correct and pubsub to a redirectFile. This file redirects the path that is needed

//For example Login Pubsub to apicom and from apicom Pubsub to 
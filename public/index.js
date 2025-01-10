import { handleRoute, pageHandler, navigateTo} from "./pageHandler/pageHandler.js";
import { PubSub } from "./utils/pubsub.js";

const socket = new WebSocket(`ws://${window.location.hostname}:8000/`);

window.addEventListener("load", () => {
    socket.addEventListener("open", () => {
        pageHandler.handleEntry();
    });
});


socket.addEventListener("message", (event) => {
    const serverToClientMessage = JSON.parse(event.data);
    
    switch(serverToClientMessage.event){
        case "user:sent-room-state": {
            handleRoute(true, serverToClientMessage.data.state);
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
            PubSub.publish({
                event: "user:left",
                details: serverToClientMessage.data
            });
            break;
        }

        case "user:logged-out": {
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
            PubSub.publish({
                event: "user:you-readied",
                details: serverToClientMessage.data.ready
            });
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

        case "room:render": {
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
            });
           break;
        }

        case "game:start-match":{
            navigateTo("prompt", serverToClientMessage.data);
            break;
        }

        case "game:action-countdown": {
            PubSub.publish({
                event: "game:action-countdown",
                details: null,
            });
            break;
        }

        case "game:action": {
            PubSub.publish({
                event: "game:action",
                details: serverToClientMessage.data.action
            });
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
            navigateTo("home", serverToClientMessage.data.name);
            break;
        }

        case "game:gone-play-again": {
            navigateTo("lobby", serverToClientMessage.data);
            break;
        }
    }
});

socket.addEventListener("close", () => {
    console.log("ok I'm leaving");
});

export function userLogout(data){
    const message = {
        action: "user:logout",
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

//

export function getRoomData(id){
    const message = {
        action: "room:get-current-data",
        data: {
            id
        }
    }
    socket.send(JSON.stringify(message));
}

export function getRoomCategoryChooser(id){
    const message = {
        action: "room:get-category-data",
        data: {
            id
        }
    }
    socket.send(JSON.stringify(message));
}

export function getRoomPromptData(id){
    const message = {
        action: "room:get-prompt-data",
        data: {
            id
        }
    }
    socket.send(JSON.stringify(message));
}

export function getRoomVotingData(id){
    const message = {
        action: "room:get-voting-data",
        data: {
            id
        }
    }
    socket.send(JSON.stringify(message));
}

export function getRoomResultsData(id){
    const message = {
        action: "room:get-results-data",
        data: {
            id
        }
    }
    socket.send(JSON.stringify(message));
}

export function getRoomLeaderboardData(id){
    const message = {
        action: "room:get-leaderboard-data",
        data: {
            id
        }
    }
    socket.send(JSON.stringify(message));
}

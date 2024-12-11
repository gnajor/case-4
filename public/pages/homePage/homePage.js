import { pageHandler } from "../../pageHandler/pageHandler.js";

export function renderHomePage(parentId, data){
    const parent = document.querySelector("#" + parentId);

    if(!parent){
        return console.error("Parent Not Found");
    }

    parent.innerHTML = `<div id="home-page">
                            <div id="rule-button"></div>
                            <div class="page-title">
                                <h1>Welcome <br> ${data}</h1>
                            </div>
                            <div class="big-button-container">
                                <button id="join-button">Join Game</button>
                                <button id="host-button">Host Game</button>
                            </div>
                        </div>`;

    const joinButton = parent.querySelector("#join-button");
    const hostButton = parent.querySelector("#host-button");

    joinButton.addEventListener("click", () => {
        pageHandler.handleJoinRoom();
    });

    hostButton.addEventListener("click", () => {
        pageHandler.handleCreateRoom();
    });
}

/* 
parent.innerHTML = `<div id="home-page">
<input type="text">
<button id="join">Join</button>
<button id="createRoom">Create Room</button>
</div>`;

const createRoomButton = parent.querySelector("#createRoom");
const joinButton = parent.querySelector("#join");


createRoomButton.addEventListener("click", () => {
pageHandler.handleCreateRoom();
});

joinButton.addEventListener("click", () => {
const inputPwd = parent.querySelector("input").value;

if(!inputPwd){
return console.error("error: code input cannot be empty")
}
pageHandler.handleJoinRoom(inputPwd);
}); */
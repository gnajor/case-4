import { pageHandler } from "../../pageHandler/pageHandler.js";

export function renderHomePage(parentId){
    const parent = document.querySelector("#" + parentId);

    if(!parent){
        return console.error("Parent Not Found");
    }

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
    });
}
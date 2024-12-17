import { pageHandler } from "../../pageHandler/pageHandler.js";
import { renderBackArrow } from "../../components/backArrow.js";

export function renderJoinPage(parentId){
    const parent = document.querySelector("#" + parentId);

    if(!parent){
        return console.error("Parent Not Found");
    }

    parent.innerHTML = `<div id="join-page">
                            <div class="arrow-back-container"></div>
                            <div class="input-container">
                                <div class="name-label">Room Code:</div>
                                <input type="text">
                            </div>
                            <div class="button-container">
                                <button class="yellow-button">Join lobby</button>
                            </div>
                        </div>`;

    const joinLobbyButton = parent.querySelector(".yellow-button");
    const arrowBack = parent.querySelector(".arrow-back-container");
    
    joinLobbyButton.addEventListener("click", () => {
        const roomCodeInput = parent.querySelector("input").value;
        pageHandler.handleJoinRoom(roomCodeInput);
    });
}
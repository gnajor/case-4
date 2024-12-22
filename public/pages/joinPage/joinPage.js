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
                                <div class="label">Room Code:</div>
                                <input type="text">
                            </div>
                            <div class="big-button-container">
                                <button id="join-button">Join Lobby</button>
                            </div>
                        </div>`;

    const joinLobbyButton = parent.querySelector("#join-button");
    const arrowBack = parent.querySelector(".arrow-back-container");
    renderBackArrow(arrowBack, "home")
    
    joinLobbyButton.addEventListener("click", () => {
        const roomCodeInput = parent.querySelector("input").value;
        pageHandler.handleJoinRoom(roomCodeInput);
    });
}
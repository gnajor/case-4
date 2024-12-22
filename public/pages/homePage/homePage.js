import { pageHandler } from "../../pageHandler/pageHandler.js";

export function renderHomePage(parentId, data){
    const parent = document.querySelector("#" + parentId);

    if(!parent){
        return console.error("Parent Not Found");
    }

    parent.innerHTML = `<div id="home-page">
                            <div id="top">
                                <div id="logout-button">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="29" viewBox="0 0 28 29" fill="none">
                                        <path d="M6.13993 16.1025L8.73983 19.4524L6.74038 21L-2.84124e-07 14.5L6.74042 8L10.3583 9.23809L6.10237 12.9335L18.9312 12.9335L19.4656 14.518L20 16.1025L6.13993 16.1025Z" fill="white"/>
                                        <path d="M8.5 0.5H12.5V7.5L9 5.5L8.5 0.5Z" fill="white"/>
                                        <path d="M8 22L12.5 21.5V28.5H8.5L8 22Z" fill="white"/>
                                        <rect x="12.5" y="25.5" width="15" height="3" fill="white"/>
                                        <path d="M12.5 0.5L27.5 0V3.5H12.5V0.5Z" fill="white"/>
                                        <path d="M24.5 2L27.5 3.5V28.5H24.5V2Z" fill="white"/>
                                    </svg>
                                </div>
                                <div id="rules-button">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="23" height="29" viewBox="0 0 23 29" fill="none">
                                        <path d="M10 11.6672L13 12.5812V22.6345L10 23.0001V11.6672Z" fill="white"/>
                                        <path d="M10 6L13 6.28561V9.42728L10 9.54152V6Z" fill="white"/>
                                        <path d="M1.83958 27.4414L1.51856 2.32186L21.5 1.55841V26.6783L1.83958 27.4414Z" stroke="white" stroke-width="3"/>
                                    </svg>
                                </div>
                            </div>
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
    const logoutButton = parent.querySelector("#logout-button");

    logoutButton.addEventListener("click", () => {
        pageHandler.handleLogout();
    });

    joinButton.addEventListener("click", () => {
        pageHandler.handleJoinRoom();
    });

    hostButton.addEventListener("click", () => {
        pageHandler.handleRoomSettings();
    });
}

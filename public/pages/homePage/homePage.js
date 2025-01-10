import { renderBackArrow } from "../../components/backArrow.js";
import { pageHandler } from "../../pageHandler/pageHandler.js";
import { userState } from "../../userState/userState.js";

export function renderHomePage(parentId){
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
                                <h1>Welcome <br> ${userState.currentUser.name}</h1>
                            </div>
                            <div class="big-button-container">
                                <button id="join-button">Join Game</button>
                                <button id="host-button">Host Game</button>
                            </div>
                        </div>`;

    const joinButton = parent.querySelector("#join-button");
    const hostButton = parent.querySelector("#host-button");
    const logoutButton = parent.querySelector("#logout-button");
    const rulesButton = parent.querySelector("#rules-button");

    logoutButton.addEventListener("click", () => {
        pageHandler.handleLogout();
    });

    joinButton.addEventListener("click", () => {
        pageHandler.handleJoinRoom();
    });

    hostButton.addEventListener("click", () => {
        pageHandler.handleRoomSettings();
    });
    
    rulesButton.addEventListener("click", () => {
        renderRules(parentId);
    });
}

function renderRules(parentId){
    const parent = document.querySelector("#" + parentId);

    if(!parent){
        return console.error("Parent Not Found");
    }

    parent.innerHTML = `<div id="home-page-rules">
                            <div class="arrow-back-container"></div>
                            <div class="page-title">
                                <h1>Rules</h1>
                            </div>
                            <div id="text-container">
                                <p>The game is all about tricking the other players! Here’s how it works:</p>
                                <p>Each round, a random player picks a category, and everyone else gets a question based on it. Players will answer by pointing, holding up fingers, or raising their hands. However, one player is the Faker and does not receive the question— their goal is to blend in and avoid being caught.</p>
                                <div>
                                    <p>Points are awarded based on how well everyone does:</p>
                                    <ul>
                                        <li>If everyone guesses the Faker correctly, everyone earns 200 points.</li>
                                        <li>If not everyone agrees on the same Faker, everyone who voted right earns 150 points.</li>
                                        <li>The Faker earns 200 points for each player they successfully trick, but loses 50 points for each player who guesses correctly.</li>
                                    </ul>
                                </div>
                                <p>At the end of each round, players vote on who they think the Faker is. Be convincing, stay sharp, and try to fool everyone to win!</p>
                            </div>
                        </div>`;

    const arrowBack = parent.querySelector(".arrow-back-container");
    renderBackArrow(arrowBack, "home");
}

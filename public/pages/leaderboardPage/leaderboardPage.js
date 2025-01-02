import { User } from "../../entities/user.js";
import { pageHandler } from "../../pageHandler/pageHandler.js";

export function renderLeaderboardPage(parentId, data){
    const parent = document.querySelector("#" + parentId);

    if(!parent){
        return console.error("Parent Not Found");
    }

    parent.innerHTML = `<div id="leaderboard-page">
                            <div class="page-title">
                                <h1>Leaderboard</h1>
                            </div>
                            <div id="leaderboard">
                                <div id="top-three-container">
                                    <div id="second"></div>
                                    <div id="first"></div>
                                    <div id="third"></div>
                                </div>
                                <div id="other-users-container"></div>
                            </div>
                            <div class="button-container">
                                <button id="play-again">Play again</button>
                                <button id="back-to-menu">Back to menu</button>
                            </div>
                        </div>`;

    const playAgainButton = parent.querySelector("#play-again");
    const backToMenu = parent.querySelector("#back-to-menu");

    for(let i = 0; i < data.users.length; i++){
        const user = data.users[i];
        let parentId = "";

        switch(i){
            case 0: {
                parentId = "first";
                break;
            }
            
            case 1: {
                parentId = "second";
                break;
            }

            case 2: {
                parentId = "third";
                break;
            }

            default:{
                parentId = "other-users-container";
                break;
            }
        }   

        const userInst = new User(user.id, user.name, user.img, parentId); 
        userInst.renderScore(user.score);  
    }

    playAgainButton.addEventListener("click", () => {
        pageHandler.handlePlayAgain();
    });

    backToMenu.addEventListener("click", () => {
        pageHandler.handleBackToMenu();
    });
}
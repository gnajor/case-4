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

    console.log(data.users)

    for(let i = 0; i < data.users.length; i++){
        const user = data.users[i];
        const userInstance = User.userInstances.find(userInst => userInst.id === user.id);
        userInstance.reset();

        switch(i){
            case 0:
                userInstance.render("first");   
                break;
            
            case 1: 
                userInstance.render("second");
                break;

            case 2:
                userInstance.render("third");
                break;

            default:
                userInstance.render("other-users-container");
                break;
        }

        userInstance.renderCurrentImg();   
        userInstance.renderScore(user.score);
    }

    playAgainButton.addEventListener("click", () => {
        pageHandler.handlePlayAgain();
    });

    backToMenu.addEventListener("click", () => {
        pageHandler.handleBackToMenu();
    });
}
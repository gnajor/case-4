import { navigateTo } from "../../pageHandler/pageHandler.js";

export function renderEntryPage(parentId){
    const parent = document.querySelector("#" + parentId);

    if(!parent){
        return console.error("Parent Not Found");
    }

    parent.innerHTML = `<div id="entry-page" class="page">
                            <div id="game-title">
                                <h1>WELCOME TO LYIN'N SPY'N</h1>
                            </div>
                            <div class="button-container">
                                <button class="yellow-button">LOGIN</button>
                                <button class="blue-button">REGISTER</button>
                            </div>
                        </div>`

    const loginButton = parent.querySelector(".yellow-button");
    const registerButton = parent.querySelector(".blue-button");

    loginButton.addEventListener("click", () => {
        navigateTo("login");
    });
    
    registerButton.addEventListener("click", () => {
        navigateTo("register");
    });
}
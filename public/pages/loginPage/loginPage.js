import { pageHandler } from "../../pageHandler/pageHandler.js";
import { renderBackArrow } from "../../components/backArrow.js";

export function renderLoginPage(parentId){
    const parent = document.querySelector("#" + parentId);

    if(!parent){
        return console.error("Parent Not Found");
    }

    parent.innerHTML = `<div id="login-page" class="page">
                            <div class="arrow-back-container"></div>
                            <div class="page-title">
                                <h1 id="login-title">LOGIN</h1>
                            </div>
                            <div id="bottom-half">
                                <div class="input-container">
                                    <div class="input-name-container">
                                        <div class="name-label">USERNAME</div>
                                        <input type="text">
                                    </div>
                                    <div class="input-pwd-container">
                                        <div class="pwd-label"></div>
                                        <input type="password">
                                    </div>
                                </div>

                                <div class="button-container">
                                    <button class="login-button">LOGIN</button>
                                </div>
                            </div>
                        </div>`;

    const loginButton = parent.querySelector(".login-button");
    const arrowBackContainer = parent.querySelector(".arrow-back-container");
    renderBackArrow(arrowBackContainer, "entry");

    loginButton.addEventListener("click", () => {
        const inputName = parent.querySelector(".input-name-container input").value;
        const inputPwd = parent.querySelector(".input-pwd-container input").value;

        if(!inputName || !inputPwd){
            return console.error("error: name or password cannnot be empty")
        }

        pageHandler.handleLogin({
            name: inputName,
            password: inputPwd
        });
    });
}
import { renderBackArrow } from "../../components/backArrow.js";
import { pageHandler } from "../../pageHandler/pageHandler.js";

export function renderRegisterPage(parentId){
    const parent = document.querySelector("#" + parentId);

    if(!parent){
        return console.error("Parent Not Found");
    }

    parent.innerHTML = `<div id="register-page" class="page">
                            <div id="top">
                                <div class="arrow-back-container"></div>
                                <div class="page-title">
                                    <h1>Create Your Account</h1>
                                </div>
                                <div class="input-container">
                                    <div class="input-name-container">
                                        <div class="label">USERNAME</div>
                                        <input type="text">
                                    </div>
                                    <div class="input-pwd-container">
                                        <div class="label">PASSWORD</div>
                                        <input type="password">
                                    </div>
                                </div>
                            </div>
                            <div class="button-container">
                                <button class="blue-button">REGISTER</button>
                            </div>
                        </div>`;

    const registerButton = parent.querySelector(".blue-button");
    const arrowBackContainer = parent.querySelector(".arrow-back-container");
    renderBackArrow(arrowBackContainer, "entry");

    registerButton.addEventListener("click", () => {
        const inputName = parent.querySelector(".input-name-container input").value;
        const inputPwd = parent.querySelector(".input-pwd-container input").value;

        if(!inputName || !inputPwd){
            return console.error("error: name or password cannnot be empty")
        }

        pageHandler.handleRegister({
            name: inputName,
            password: inputPwd
        });
    });
}
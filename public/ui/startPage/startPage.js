import {PubSub} from "../../utils/pubsub.js";

export function renderStartPage(parentId){
    let login = true;
    const parent = document.querySelector("#" + parentId);

    if(!parent){
        return console.error("Parent Not Found");
    }

    parent.innerHTML = `<div id="login">
                            <input id="name-input" type="text">
                            <input id="pwd-input" type="password">
                        </div>
                        <button id="login-button">Login</button>
                        <div id="register">
                            <input id="name-input" type="text">
                            <input id="pwd-input" type="password">
                        </div>
                        <button id="register-button">Register</button>`;

    const registerButton = parent.querySelector("#register-button");
    const loginButton = parent.querySelector("#login-button");


    loginButton.addEventListener("click", () => {
        const inputName = parent.querySelector("#login > #name-input").value;
        const inputPwd = parent.querySelector("#login > #pwd-input").value;

        PubSub.publish({
            event: "sendUserLoginData",
            details: {
                name: inputName,
                password: inputPwd
            }
        })

    });

    registerButton.addEventListener("click", () => {
        const inputName = parent.querySelector("#register > #name-input").value;
        const inputPwd = parent.querySelector("#register > #pwd-input").value;

        PubSub.publish({
            event: "sendUserRegData",
            details: {
                name: inputName,
                password: inputPwd
            }
        })
    });
}
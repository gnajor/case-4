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
                                <button class="login-button">LOGIN</button>
                                <button class="register-button">REGISTER</button>
                            </div>
                        </div>`

    const loginButton = parent.querySelector(".login-button");
    const registerButton = parent.querySelector(".register-button");

    loginButton.addEventListener("click", () => {
        navigateTo("login");
    });
    
    registerButton.addEventListener("click", () => {
        navigateTo("register");
    });
}

/*                         <div id="login">
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

        if(!inputName || !inputPwd){
            return console.error("error: name or password cannnot be empty")
        }

        pageHandler.handleLogin({
            name: inputName,
            password: inputPwd
        });
    });

    registerButton.addEventListener("click", () => {
        const inputName = parent.querySelector("#register > #name-input").value;
        const inputPwd = parent.querySelector("#register > #pwd-input").value;

        if(!inputName || !inputPwd){
            return console.error("error: name or password cannnot be empty")
        }

        pageHandler.handleRegister({
            name: inputName,
            password: inputPwd
        });
    }); */
import { apiCom } from "../apiCom/apiCom.js";
import { addUserToWs, createRoom, joinRoom } from "../index.js";
import { renderEntryPage } from "../pages/entryPage/entryPage.js";
import { renderHomePage } from "../pages/homePage/homePage.js";
import { renderLobbyPage } from "../pages/lobbyPage/lobbyPage.js";
import { renderLoginPage } from "../pages/loginPage/loginPage.js";
import { renderRegisterPage } from "../pages/registerPage/registerPage.js";
import { renderJoinPage } from "../pages/joinPage/joinPage.js";

const pageParent = "wrapper";

export const pageHandler = {
    currentUser: null,

    async handleEntry(){
        const token = localStorage.getItem("token");
        const name = localStorage.getItem("name");
    
        if(!token && !name){
            navigateTo("entry", pageParent);
            return;
        }

        const resource = await apiCom({token, name}, "token-name:authorization");

        if(resource){
            this.currentUser = {
                id: resource.id,
                name: resource.name,
                token: resource.token
            }

            navigateTo("home", this.currentUser.name);
            addUserToWs(this.currentUser);

        }
        else{
            localStorage.clear();
            navigateTo("entry");
        }
    },

    async handleLogin(user){
        const resource = await apiCom(user, "user:login");

        if(resource){
            this.currentUser = {
                id: resource.id,
                name: resource.name,
                token: resource.token
            }

            localStorage.setItem("token", this.currentUser.token);
            localStorage.setItem("name", this.currentUser.name);
            navigateTo("home", this.currentUser.name);
            addUserToWs(this.currentUser);
        }
    },

    async handleRegister(user){
        const resource = await apiCom(user, "user:register");
        console.log(resource);
    },

    handleJoinRoom(roomPwd){
        if(roomPwd){
            const data = {
                "userId": this.currentUser.id,
                "roomPwd": roomPwd
            };

            joinRoom(data);
        }
        else{
            navigateTo("join")
        }
    },

    handleCreateRoom(){
        const user = {
            "id": this.currentUser.id,
            "host": true,
        }

        createRoom(user); 
    },


}


export function navigateTo(page, data){
    const parent = document.querySelector(pageParent);

    if(parent){
        parent.innerHTML = "";
    }

    switch(page){
        case "entry": {
            renderEntryPage(pageParent);
            window.history.pushState({}, "", "/");
            break;
        }

        case "login": {
            renderLoginPage(pageParent);
            window.history.pushState({}, "", "/login");
            break;
        }

        case "register": {
            renderRegisterPage(pageParent);
            window.history.pushState({}, "", "/register");
            break;
        }

        case "home": {
            renderHomePage(pageParent, data);
            window.history.pushState({}, "", "/home");
            break;
        }

        case "join": {
            renderJoinPage(pageParent);
            window.history.pushState({}, "", "/join");
            break;
        }

        case "lobby": {
            renderLobbyPage(pageParent, data);
            window.history.pushState({}, "", "/room");
            break;
        }
    }
}

export function handleRoute(){
    const path = window.location.pathname;

    switch(path){
        case "/home":
            navigateTo("home", pageParent);
            break;

        case "/login":
            navigateTo("login", pageParent);
            break;

        case "/register":
            navigateTo("register", pageParent);
            break;

        case "/room":
            navigateTo("room", pageParent);
            break;

        default: 
            navigateTo("entry", pageParent);
            break;
    }
}
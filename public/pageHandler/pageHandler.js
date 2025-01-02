import { apiCom } from "../apiCom/apiCom.js";
import { addUserToWs, createRoom, joinRoom, addNewUserImage, makeUserReady, makeUserUnready, chosenCategory, userVote, goBackToMenu, playAgain, userLeave} from "../index.js";
import { renderEntryPage } from "../pages/entryPage/entryPage.js";
import { renderHomePage } from "../pages/homePage/homePage.js";
import { renderLobbyPage } from "../pages/lobbyPage/lobbyPage.js";
import { renderLoginPage } from "../pages/loginPage/loginPage.js";
import { renderRegisterPage } from "../pages/registerPage/registerPage.js";
import { renderJoinPage } from "../pages/joinPage/joinPage.js";
import { renderPreGamePage } from "../pages/preGamePage/preGamepage.js";
import { renderCategoryPage } from "../pages/categoryPage/categoryPage.js";
import * as category from "../entities/category.js";
import * as categoryPage from "../pages/categoryPage/categoryPage.js";
import { PubSub } from "../utils/pubsub.js";
import { renderPromptPage } from "../pages/promptPage/promptPage.js";
import { renderVotingPage } from "../pages/votingPage/votingPage.js";
import { renderVotingResultPage } from "../pages/votingResultPage/votingResultPage.js";
import { renderLeaderboardPage } from "../pages/leaderboardPage/leaderboardPage.js";
import { userState } from "../userState/userState.js";
import { User } from "../entities/user.js";

const pageParent = "wrapper";

export const pageHandler = {
/*     async handleCategories(){
        const resource = await apiCom("all", "category:all");

        if(resource){
            PubSub.publish({
                event: "setCategories",
                details: resource
            });
        }
    }, */

    async handleEntry(){
        const token = localStorage.getItem("token");
        const name = localStorage.getItem("name");
    
        if(!token && !name){
            navigateTo("entry", pageParent);
            return;
        }

        const resource = await apiCom({token, name}, "token-name:authorization");

        if(resource){
            userState.initFromStorage({
                id: resource.id,
                name: resource.name,
                img: resource.img,
            });

            navigateTo("home", resource.name);
            addUserToWs(userState.currentUser);

        }
        else{
            localStorage.clear();
            navigateTo("entry");
        }
    },

    /* The top two methods should probably not be in this file as this does not go from component => server but client => server */

    async handleLogin(user){
        const resource = await apiCom(user, "user:login");

        if(resource){
            userState.initFromStorage({
                id: resource.id,
                name: resource.name,
                img: resource.img,
            });

            localStorage.setItem("token", resource.token);
            localStorage.setItem("name", resource.name);
            navigateTo("home", resource.name);
            addUserToWs(userState.currentUser);
        }
    },

    handleLogout(){
        const data = {
            "userId": userState.getId()
        }
        
        localStorage.clear();
        userLeave(data);
    },

    async handleRegister(user){
        const resource = await apiCom(user, "user:register");
    },

    handleJoinRoom(roomPwd){
        if(roomPwd){
            const data = {
                "userId": userState.getId(),
                "roomPwd": roomPwd
            };

            joinRoom(data);
        }
        else{
            navigateTo("join");
        }
    },

    handleRoomSettings(setting){
        if(setting){
            this.handleCreateRoom(setting);
        }
        else{
            navigateTo("roomsettings");
        }
    },

    handleCreateRoom(setting){
        const user = {
            "id": userState.getId(),
            "matchAmount": setting,
            "host": true,
        }

        createRoom(user); 
    },

    handleProfileChange(img){
        const user = {
            "id": userState.getId(),
            "img": img
        }
        addNewUserImage(user);
    },

    handleUserReadyStatus(status){
        const user = {
            "id": userState.getId(),
            "ready": status
        }

        if(status){
            makeUserReady(user);
        }
        else{
            makeUserUnready(user);
        }
    },

    handleChosenCategory(category){
        const data = {
            "userId": userState.getId(),
            "categoryId": category.id,
        }
        chosenCategory(data);
    },

    handleVoting(userId){
        const data = {
            "voteId": userId,
            "votedId": userState.getId(),
        }
        userVote(data);
    },

    handlePlayAgain(){
        const data = {
            "userId": userState.getId()
        }
        playAgain(data);
    },

    handleBackToMenu(){
        const data = {
            "userId": userState.getId()
        }
        goBackToMenu(data);
    }
}


export function navigateTo(page, data){
    const parent = document.querySelector(pageParent);

    if(parent){
        parent.innerHTML = "";
    }

    switch(page){
        case "entry": 
            renderEntryPage(pageParent);
            window.history.pushState({}, "", "/");
            break;

        case "login": 
            renderLoginPage(pageParent);
            window.history.pushState({}, "", "/login");
            break;

        case "register": 
            renderRegisterPage(pageParent);
            window.history.pushState({}, "", "/register");
            break;

        case "home": 
            renderHomePage(pageParent, data);
            window.history.pushState({}, "", "/home");
            break;

        case "roomsettings": 
            renderPreGamePage(pageParent)
            window.history.pushState({}, "", "/room/settings");
            break;

        case "join": 
            renderJoinPage(pageParent);
            window.history.pushState({}, "", "/join");
            break;
        

        case "lobby": 
            renderLobbyPage(pageParent, data);
            window.history.pushState({}, "", "/room");
            break;
        
        case "category":
            renderCategoryPage(pageParent, data);
            window.history.pushState({}, "", "/room/category");
            break;

        case "prompt":
            renderPromptPage(pageParent, data);
            window.history.pushState({}, "", "/room/prompt");
            break;

        case "voting":
            renderVotingPage(pageParent, data);
            window.history.pushState({}, "", "/room/voting");
            break;

        case "results":
            renderVotingResultPage(pageParent, data);
            window.history.pushState({}, "", "/room/voting/results");
            break;

        case "leaderboard":
            renderLeaderboardPage(pageParent, data);
            window.history.pushState({}, "", "/room/leaderboard");
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

        case "/room/settings":
            navigateTo("home", pageParent);
            break;

        case "/room":
            navigateTo("room", pageParent);
            break;

        default: 
            navigateTo("entry", pageParent);
            break;
    }
}
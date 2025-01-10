import { apiCom } from "../apiCom/apiCom.js";
import { addUserToWs, createRoom, joinRoom, addNewUserImage, makeUserReady, makeUserUnready, chosenCategory, userVote, goBackToMenu, playAgain, userLogout, getRoomData, getRoomCategoryChooser, getRoomPromptData, getRoomVotingData, getRoomResultsData, getRoomLeaderboardData} from "../index.js";
import { renderEntryPage } from "../pages/entryPage/entryPage.js";
import { renderHomePage } from "../pages/homePage/homePage.js";
import { renderLobbyPage } from "../pages/lobbyPage/lobbyPage.js";
import { renderLoginPage } from "../pages/loginPage/loginPage.js";
import { renderRegisterPage } from "../pages/registerPage/registerPage.js";
import { renderJoinPage } from "../pages/joinPage/joinPage.js";
import { renderPreGamePage } from "../pages/preGamePage/preGamepage.js";
import { renderCategoryPage } from "../pages/categoryPage/categoryPage.js";
import * as categoryPage from "../pages/categoryPage/categoryPage.js";
import { renderPromptPage } from "../pages/promptPage/promptPage.js";
import { renderVotingPage } from "../pages/votingPage/votingPage.js";
import { renderVotingResultPage } from "../pages/votingResultPage/votingResultPage.js";
import { renderLeaderboardPage } from "../pages/leaderboardPage/leaderboardPage.js";
import { userState } from "../userState/userState.js";
import { decrypt, encrypt } from "../utils/utils.js";

const pageParent = "wrapper";

export const pageHandler = {
    async handleEntry(){
        const encryptedToken = localStorage.getItem("token");
        const encryptedName = localStorage.getItem("name");
    
        if(!encryptedToken && !encryptedName){
            handleRoute();
            return;
        }

        const token = decrypt(encryptedToken);
        const name = decrypt(encryptedName);

        const resource = await apiCom({token, name}, "token-name:authorization");

        if(resource){
            userState.initFromStorage({
                id: decrypt(resource.id),
                name: decrypt(resource.name),
                img: decrypt(resource.img),
            });

            addUserToWs(userState.currentUser);
        }
        else{
            localStorage.clear();
            handleRoute();
        }
    },

    async handleLogin(user){
        const resource = await apiCom(user, "user:login");

        if(resource){
            userState.initFromStorage({
                id: decrypt(resource.id),
                name: decrypt(resource.name),
                img: decrypt(resource.img),
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
        userLogout(data);
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
            navigateTo("settings");
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
            apiCom({ //set user img to database, when game starts
                id: userState.getId(), 
                img: userState.currentUser.img,
            }, "user:patch-new-image");

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
            renderHomePage(pageParent);
            window.history.pushState({}, "", "/home");
            break;

        case "settings": 
            renderPreGamePage(pageParent)
            window.history.pushState({}, "", "/room/settings");
            break;

        case "join": 
            renderJoinPage(pageParent);
            window.history.pushState({}, "", "/room");
            break;

        case "lobby": 
            renderLobbyPage(pageParent, data);
            window.history.pushState({}, "", `/room`);
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
            window.history.pushState({}, "", "/room/results");
            break;

        case "leaderboard":
            renderLeaderboardPage(pageParent, data);
            window.history.pushState({}, "", "/room/leaderboard");
    }
}

export function handleRoute(loggedIn = undefined, state = undefined){
    const path = window.location.pathname;

    if(!loggedIn && !state){
        switch(path){
            case "/register":
                navigateTo("register");
                break;

            case "/login":
                navigateTo("login");
                break;

            default: 
                navigateTo("entry", pageParent);
                break;
        }
    }

    if(!state && loggedIn){
        navigateTo("home");
    }

    if(state){
        if(state.includes("lobby")){
            getRoomData(userState.getId());
        }
        else if(state.includes("category")){
            getRoomCategoryChooser(userState.getId());
        }
        else if(state.includes("prompt")){
            getRoomPromptData(userState.getId());
        }
        else if(state.includes("voting")){
            getRoomVotingData(userState.getId());   
        }
        else if(state.includes("results")){
            getRoomResultsData(userState.getId());
        }
        else if(state.includes("leaderboard")){
            getRoomLeaderboardData(userState.getId());
        }
        else{
            navigateTo("entry", pageParent);
        }
    }
}
import { pageHandler } from "../../pageHandler/pageHandler.js";
import { User } from "../../entities/user.js";
import { PubSub } from "../../utils/pubsub.js";
import { userState } from "../../userState/userState.js";
import { renderBackArrow } from "../../components/backArrow.js";

export function renderLobbyPage(parentId, data){
    const parent = document.querySelector("#" + parentId);

    if(!parent){
        return console.error("Parent Not Found");
    }

    parent.innerHTML = `<div id="lobby-page">
                            <div class="arrow-back-container"></div>
                            <div id="content-container">
                                <div class="page-title">
                                    <h1>Room Code: <span id="code"> ${data.roomPwd}</span></h1>
                                </div>
                                <div id="you-container">
                                    <div id="arrow-left" class="arrow"><</div>
                                    <div id="you"></div>
                                    <div id="arrow-right" class="arrow">></div>
                                </div>
                                <div id="users-container"></div>
                            </div>
                            <div class="button-container">
                                <button class="yellow-button" id="ready-button">Ready</button>
                            </div>
                        </div>`;

    let currentUserImg = "";
    userState.render("you");
    
    if(data.users){
        User.renderUsers(data.users, "users-container", userState.getId());
        currentUserImg = data.users.find(user => user.id === userState.getId()).img;
    }

    userState.renderProfileImgs("you", data.imgs, currentUserImg);
    User.renderProfileShapes();
    
    const readyButton = parent.querySelector("#ready-button");
    const arrowLeft = parent.querySelector("#arrow-left");
    const arrowRight = parent.querySelector("#arrow-right");
    const profilePics = parent.querySelectorAll("#you .profile-pic");
    const arrowBack = parent.querySelector(".arrow-back-container");

    profilePics[0].classList.add("active");
    let isTransitioning = false; 

    arrowLeft.addEventListener("click", () => {
        if (isTransitioning) return; 
        isTransitioning = true;
    
        for(let i = 0; i < profilePics.length; i++) {
            if (profilePics[i].classList.contains("active")) {
                profilePics[i].classList.remove("active");
                let next = 0;
    
                if (i !== 0) {
                    next = i - 1;
                    profilePics[next].classList.add("active");
                    pageHandler.handleProfileChange(data.imgs[next])
                } 
                else{
                    next = profilePics.length - 1;
                    profilePics[next].classList.add("active");
                    pageHandler.handleProfileChange(data.imgs[next]);
                }
                break; 
            }
        }
    
        setTimeout(() => {
            isTransitioning = false;
        }, 200); 
    });

    arrowRight.addEventListener("click", () => {
        if (isTransitioning) return; 
        isTransitioning = true;
    

        for(let i = 0; i < profilePics.length; i++){
            if(profilePics[i].classList.contains("active")){
                profilePics[i].classList.remove("active");
                let next = 0;

                if(i !== profilePics.length - 1){
                    next = i + 1;
                    profilePics[next].classList.add("active");  
                    pageHandler.handleProfileChange(data.imgs[next]);
                }
                else{
                    next = 0;
                    profilePics[next].classList.add("active");
                    pageHandler.handleProfileChange(data.imgs[next]);
                }
                break; 
            }
        }

        setTimeout(() => {
            isTransitioning = false;
        }, 200); 
    });
    
    readyButton.addEventListener("click", (event) => {
        if(userState.currentUser.ready){
            event.target.classList.remove("ready");
            event.target.textContent = "Ready";
            userState.setReady(false);
        }
        else{
            event.target.classList.add("ready");
            event.target.textContent = "Unready";
            userState.setReady(true);
        }

        pageHandler.handleUserReadyStatus(userState.currentUser.ready);
    });

    renderBackArrow(arrowBack, "home", () => {
        pageHandler.handleBackToMenu()
    });

    if(userState.currentUser.ready){
        readyButton.classList.add("ready");
        readyButton.textContent = "Unready";
    }
}

PubSub.subscribe({
    event: "room:user-joined",
    listener: (user) => {
        const newUser = new User(user.id, user.name, user.img, "users-container");
        User.renderProfileShapes();
    }
});

PubSub.subscribe({
    event: "user:you-readied",
    listener: (ready) => {
        userState.setReady(ready);
    } 
});
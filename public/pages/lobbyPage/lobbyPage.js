import { pageHandler } from "../../pageHandler/pageHandler.js";
import { User } from "../../entities/user.js";
import { PubSub } from "../../utils/pubsub.js";
import { userState } from "../../userState/userState.js";

export function renderLobbyPage(parentId, data){
    const parent = document.querySelector("#" + parentId);

    if(!parent){
        return console.error("Parent Not Found");
    }

    parent.innerHTML = `<div id="lobby-page">
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

    const currentUser = userState.currentUser;
    userState.setReady(false);
    userState.render("you");
    userState.renderProfileImgs("you", data.imgs);
                    
    if(data.users){
        User.renderUsers(data.users, "users-container", userState.getId());
    }

    User.renderProfileShapes();
    
    const readyButton = parent.querySelector("#ready-button");
    const arrowLeft = parent.querySelector("#arrow-left");
    const arrowRight = parent.querySelector("#arrow-right");
    const profilePics = parent.querySelectorAll("#you .profile-pic");

    profilePics[0].classList.add("active");
    let isTransitioning = false; 

    arrowLeft.addEventListener("click", () => {
        if (isTransitioning) return; 
        isTransitioning = true;
    
        for (let i = 0; i < profilePics.length; i++) {
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
        if(currentUser.ready){
            event.target.classList.remove("ready");
            event.target.textContent = "Ready";
            userState.setReady(false);
        }
        else{
            event.target.classList.add("ready");
            event.target.textContent = "Unready";
            userState.setReady(true);
        }

        pageHandler.handleUserReadyStatus(currentUser.ready);
    });
}

PubSub.subscribe({
    event: "room:user-joined",
    listener: (user) => {
        const newUser = new User(user.id, user.name, user.img, "users-container");
        User.renderProfileShapes();
    }
});
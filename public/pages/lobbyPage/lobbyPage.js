import { pageHandler } from "../../pageHandler/pageHandler.js";
import { User } from "../../entities/user.js";
import { PubSub } from "../../utils/pubsub.js";

export function renderLobbyPage(parentId, data){
    const parent = document.querySelector("#" + parentId);

    if(!parent){
        return console.error("Parent Not Found");
    }

    parent.innerHTML = `<div id="lobby-page">
                            <div class="page-title">
                                <h1>Room Code: ${data.roomPwd}</h1>
                            </div>
                            <div id="you-container">
                                <div id="arrow-left" class="arrow"><</div>
                                <div id="you"></div>
                                <div id="arrow-right" class="arrow">></div>
                            </div>
                            <div id="users-container"></div>
                            <div class="button-container">
                                <button class="yellow-button" id="ready-button">Ready</button>
                            </div>
                        </div>`;

    const you = User.userInstances[0];
    you.render("you");
    you.renderYourProfileImgs();

    if(data.users){
        for(const user of data.users){
            if(user.id !== you.id){
                const userInstance = new User(user.id, user.name);
                userInstance.render("users-container");
                userInstance.renderCurrentImg();
            }
        }
    }
    
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
                    pageHandler.handleProfileChange(User.profileImages[next])
                } 
                else{
                    next = profilePics.length - 1;
                    profilePics[next].classList.add("active");
                    pageHandler.handleProfileChange(User.profileImages[next]);
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
                    pageHandler.handleProfileChange(User.profileImages[next]);
                }
                else{
                    next = 0;
                    profilePics[next].classList.add("active");
                    pageHandler.handleProfileChange(User.profileImages[next]);
                }
                break; 
            }
        }

        setTimeout(() => {
            isTransitioning = false;
        }, 200); 
    });

    readyButton.addEventListener("click", (event) => {
        if(you.ready){
            event.target.classList.remove("ready");
            event.target.textContent = "Ready";
            you.setReady(false);
        }
        else{
            event.target.classList.add("ready");
            event.target.textContent = "Unready";
            you.setReady(true);
        }

        pageHandler.handleUserReadyStatus(you.ready);
    });
}

PubSub.subscribe({
    event: "room:user-joined",
    listener: (user) => {
        const newUser = new User(user.id, user.name);
        newUser.render("users-container");
        newUser.renderCurrentImg();
    }
});

PubSub.subscribe({
    event: "user:img-changed",
    listener: (data) => {

        const user = User.userInstances.find(user => user.id === data.id);
        user.setImage(data.img);
        user.renderCurrentImg();
    }
});
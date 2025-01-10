import { PubSub } from "../utils/pubsub.js";

export class User{

    static renderProfileShapes(){
        const profiles = document.querySelectorAll(".profile");

        for(let i = 0; i < profiles.length; i++){
            const profile = profiles[i];
            if(profile.id !== "profile-shape-" + (i + 1)){
                profile.id = "profile-shape-" + (i + 1);
            }
        }
    }

    static getUserElementById(id){
        const lobbyUser = document.querySelector(`#lobby-page [data-user-id="${id}"]`);
        const votingUser = document.querySelector(`#voting-page [data-user-id="${id}"]`);

        if(lobbyUser){
            return lobbyUser;
        }
        else if(votingUser){
            return votingUser;
        }
        else{
            return undefined;
        }
    }

    static renderNewProfilePic(id, img){
        const path = "../../media/profiles/";
        const user = User.getUserElementById(id);

        if(user){
            user.querySelector("img").setAttribute("src", path + img);
        }

    }

    static renderUsers(users, parentId, userId = undefined){
        for(const user of users){
            if(user.id !== userId){
                const userInst = new User(
                    user.id,
                    user.name,
                    user.img,
                    parentId
                );

                if(user.ready){
                    User.setReady(userInst.element);
                    
                }
            }
        }
    }

    static renderUsersVotes(users, userId, listener, parentId){
        for(const user of users){
            const userInst = new User(
                user.id,
                user.name,
                user.img,
                parentId
            );
    
            if(user.votes !== 0){
                userInst.renderVotes(user.votes);
            }
    
            if(user.id !== userId){
                userInst.addClickListener(() => {
                    listener(user.id);
                });
            }
        }
        User.renderProfileShapes();
    }

    static setReady(parent){        
        if(!parent){
            return console.error("Parent Not Found");
        }

        const ready = parent.querySelector(".ready");
        ready.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="47" height="42" viewBox="0 0 47 42" fill="none">
                               <path d="M10.5074 1.4891L46.2249 8.06763L33.6733 36.4704L5.59499 35.1771L10.5074 1.4891Z" fill="#B7BF9B"/>
                               <path d="M36.6777 13.3778L30.9014 10.0965L22.456 23.7532L17.6229 16.8381L14.2899 22.6104L18.3285 26.5251L22.5271 30.9317L36.6777 13.3778Z" fill="white"/>
                           </svg>`;
    }

    static setUnready(parent){
        parent.querySelector(".ready").innerHTML = "";
    }

    constructor(id, name, img, parentId){
        this.id = id;
        this.name = name;
        this.img = img;
        this.parentId = parentId;
        this.element = this.render();
    }

    render(){
        const parent = document.querySelector("#" + this.parentId);
        
        if(!parent){
            return console.error("Parent Not Found");
        }
        
        const path = "../../media/profiles/";
        const userElement = document.createElement("div");
        userElement.id = this.name;
        userElement.className = "user";
        userElement.setAttribute("data-user-id", this.id);

        userElement.innerHTML =`<div class="ready"></div>
                                <div class="votes-container"></div>
                                <div class="profile">
                                    <div class="profile-pic-container">
                                        <div class="profile-pic">
                                            <img src="${path + this.img}">
                                        </div>
                                    </div>
                                </div>
                                <div class="name">${this.name}</div>
                                <div class="score"></div>`;

        parent.appendChild(userElement);
        return userElement;
    } 

    renderVotes(votes){
        if(votes){
            const votesContainer = this.element.querySelector(".votes-container");
            votesContainer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="32" viewBox="0 0 44 32" fill="none">
                                            <path d="M4.5793 0.313969L43.9998 6.81283L31.0569 31.814L0.182458 30.1503L4.5793 0.313969Z" fill="#6F2929"/>
                                            <text x="15" y="22" fill="white"></text>
                                        </svg>`;
            votesContainer.querySelector("text").textContent = votes;
        }
    }

    renderScore(score){
        this.element.querySelector(".score").textContent = score;
    }

    addClickListener(func){
        this.element.addEventListener("click", func);
    }
}

PubSub.subscribe({
    event: "user:img-changed",
    listener: (data) => {
        User.renderNewProfilePic(data.id, data.img);
    }
});

PubSub.subscribe({
    event: "user:readied",
    listener: (data) => {
        const user = User.getUserElementById(data.id);

        if(user){
            User.setReady(user);
        }
    }
});

PubSub.subscribe({
    event: "user:unreadied",
    listener: (data) => {
        const user = User.getUserElementById(data.id);

        if(user){
            User.setUnready(user);
        }
    }
});

PubSub.subscribe({
    event: "user:left",
    listener: (data) => {
        console.log("cum")

        const user = User.getUserElementById(data.id);

        if(user){
            user.remove();
        }
    }
})




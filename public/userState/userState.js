import { PubSub } from "../utils/pubsub.js";

export const userState = {
    currentUser: null,
    
    initFromStorage(data){
        this.currentUser = {
            "id": data.id,
            "name": data.name,
            "img": data.img,
        }
    },

    render(parentId){
        const parent = document.querySelector("#" + parentId);
        
        if(!parent){
            return console.error("Parent Not Found");
        }
        
        const userElement = document.createElement("div");
        userElement.id = this.currentUser.name;
        userElement.className = "user";
        userElement.setAttribute("data-user-id", this.currentUser.id);

        userElement.innerHTML =`<div class="ready"></div>
                                <div class="votes-container"></div>
                                <div class="profile">
                                    <div class="profile-pic-container"></div>
                                </div>
                                <div class="name">${this.currentUser.name}</div>
                                <div class="score"></div>`;

        parent.appendChild(userElement);
    }, 

    renderProfileImgs(parentId, profileImgs){
        const parent = document.querySelector("#" + parentId);

        if(!parent){
            return console.error("parent does not exist");
        }

        const imgsContainer = parent.querySelector(".profile-pic-container");

        if(!imgsContainer){
            return console.error("parent does not fit the criteria");
        }

        const path = "../media/profiles/";
        const index = profileImgs.indexOf(this.currentUser.img);

        if(index !== -1){
            profileImgs.splice(index, 1);
            profileImgs.unshift(this.currentUser.img);
        }

        for(const profileImg of profileImgs){
            imgsContainer.innerHTML += `<div class="profile-pic">
                                            <img src="${path + profileImg}">
                                        </div>`;
        }
    },

    getId(){
        return this.currentUser.id;
    },

    setReady(value){
        this.currentUser.ready = value;
    }, 

    setImage(img){
        this.currentUser.img = img;
    },

    removeUser(){
        this.currentUser = null;
    }, 

}

PubSub.subscribe({
    event: "user:you-img-changed",
    listener: (img) => {
        userState.setImage(img);
    }
});
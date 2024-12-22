import { PubSub } from "../utils/pubsub.js";

export class User{
    static userInstances = [];
    static profileImages = [];

    constructor(id, name){
        this.id = id;
        this.name = name;
        this.img = null;
        this.parent = null;
        this.ready = false;
        this.listener = null;
        this.categoryChooser = false;
        this.element = this.create();
        User.userInstances.push(this);
    }

    create(){
        const userElement = document.createElement("div");
        userElement.id = this.name;
        userElement.className = "user";

        userElement.innerHTML =`<div class="ready"></div>
                                <div class="votes-container"></div>
                                <div class="profile">
                                    <div class="profile-pic-container"></div>
                                </div>
                                <div class="name">${this.name}</div>
                                <div class="score"></div>`;
        return userElement;
    }

    render(parentId){
        const parent = document.querySelector("#" + parentId);
        
        if(!parent){
            return console.error("Parent Not Found");
        }
        this.parent = parent;
        this.parent.appendChild(this.element);
    }

    renderYourProfileImgs(){
        const path = "../media/profiles/";
        const imgsContainer = this.element.querySelector(".profile-pic-container");

        const index = User.profileImages.indexOf(this.img);

        if(index !== -1){
            User.profileImages.splice(index, 1);
            User.profileImages.unshift(this.img);
        }

        imgsContainer.innerHTML = "";
        for(const image of User.profileImages){
            imgsContainer.innerHTML += `<div class="profile-pic">
                                            <img src="${path + image}">
                                        </div>`;
        }
    }

    renderCurrentImg(){
        const path = "../../media/profiles/";

        if(!this.img){
            this.img = User.profileImages[0];
        } 

        const imgsContainer = this.element.querySelector(".profile-pic-container");
        imgsContainer.innerHTML = `<div class="profile-pic">
                                        <img src="${path + this.img}">
                                    </div>`;
    }   

    renderProfileShape(){
        const profiles = document.querySelectorAll(".profile");

        for(let i = 0; i < profiles.length; i++){
            const profile = profiles[i];
            if(profile.id !== "profile-shape-" + (i + 1)){
                profile.id = "profile-shape-" + (i + 1);
            }
        }
    }

    markReady(){
        const ready = this.element.querySelector(".ready");
        
        ready.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="47" height="42" viewBox="0 0 47 42" fill="none">
                               <path d="M10.5074 1.4891L46.2249 8.06763L33.6733 36.4704L5.59499 35.1771L10.5074 1.4891Z" fill="#B7BF9B"/>
                               <path d="M36.6777 13.3778L30.9014 10.0965L22.456 23.7532L17.6229 16.8381L14.2899 22.6104L18.3285 26.5251L22.5271 30.9317L36.6777 13.3778Z" fill="white"/>
                           </svg>`;
    }

    markUnready(){
        this.element.querySelector(".ready").innerHTML = "";
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
        this.listener = func;
        this.element.addEventListener("click", func);
    }

    reset(){
        this.ready = false;
        this.categoryChooser = false;
        this.element.querySelector(".profile").id ="";
        this.element.removeEventListener("click", this.listener);
        this.removeVote();
        this.markUnready();
        this.element.querySelector(".score").innerHTML = "";
    }

    resetEachRound(){
        this.categoryChooser = false;
        this.element.removeEventListener("click", this.listener);
        this.removeVote();
    }

    removeVote(){
        this.element.querySelector(".votes-container").innerHTML = "";
    }

    setReady(value){
        this.ready = value;
    }

    setImage(image){
        this.img = image;
    }
}

PubSub.subscribe({
    event: "user:recieved",
    listener: (user) => {
        const you = new User(user.id, user.name);
        User.profileImages = user.images
    }   
});

PubSub.subscribe({
    event: "category:chooser-chosen",
    listener: (data) => {
        for(const user of User.userInstances){
            if(user.id === data.id){
                user.categoryChooser = true;
            }
        }
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

PubSub.subscribe({
    event: "user:readied",
    listener: (data) => {
        const specificUser = User.userInstances.find(user => user.id === data.id);

        if(specificUser){
            specificUser.markReady();
        }
    }
});

PubSub.subscribe({
    event: "user:unreadied",
    listener: (data) => {
        const specificUser = User.userInstances.find(user => user.id === data.id);

        if(specificUser){
            specificUser.markUnready();
        }
    }
});

PubSub.subscribe({
    event: "user:reset",
    listener:(users) => {
        for(const user of users){
            const userInstance = User.userInstances.find(userInst => userInst.id === user.id);
            userInstance.reset();
        }
    }
})



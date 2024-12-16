import { PubSub } from "../utils/pubsub.js";

export class User{
    static userInstances = [];
    static profileImages = [];

    constructor(id, name){
        this.id = id;
        this.name = name;
        this.img = null;
        this.parent = null;
        this.host = false;
        this.ready = false;
        this.categoryChooser = false;
        this.element = this.create();
        User.userInstances.push(this);
    }

    create(){
        const userElement = document.createElement("div");
        userElement.id = this.name;
        userElement.className = "user";

        userElement.innerHTML =`<div class="profile">
                                    <div class="profile-pic-container"></div>
                                </div>
                                <div class="name">${this.name}</div>`;
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

        for(const image of User.profileImages){
            imgsContainer.innerHTML += `<div class="profile-pic">
                                            <img src="${path + image}">
                                        </div>`;
        }
    }

    renderCurrentImg(){
        const path = "../media/profiles/";

        if(!this.img){
            this.img = User.profileImages[0];
        } 

        const imgsContainer = this.element.querySelector(".profile-pic-container");
        imgsContainer.innerHTML = `<div class="profile-pic">
                                        <img src="${path + this.img}">
                                    </div>`;
    }

    setImage(image){
        this.img = image;
    }

    setReady(value){
        this.ready = value;
    }

    setHost(){
        this.host = true;
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



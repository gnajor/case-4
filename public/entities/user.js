export class User{
    static userInstances = [];

    constructor(id, name){
        this.id = id;
        this.name = name;
        this.imgs = null;
        this.host = false;
        this.parent = null;
        this.element = this.create();
        this.img = null;
        this.imgContainer = null;
        User.userInstances.push(this);
    }

    create(){
        const userElement = document.createElement("div");
        userElement.id = this.name;
        userElement.className = "user";

        userElement.innerHTML =`<div class="profile">
                                    <div class="profile-pics"></div>
                                </div>
                                <div class="name">${this.name}</div>`;

        const profilePics = userElement.querySelector(".profile-pics");
        this.imgContainer = profilePics;

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

    renderProfileImgs(){
        const path = "../media/profiles/";

        for(const image of this.imgs){
            this.imgContainer.innerHTML += `<img src="${path + image}">`;
        }
    }

    setImages(images){
        this.imgs = images;
    }

    becomeHost(){
        this.host = true;
    }

    setCurrentImage(){

    }
}
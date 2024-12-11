export class User{
    static userInstances = [];

    constructor(id, name){
        this.id = id;
        this.name = name;
        this.host = false;
        this.parent = null;
        this.element = null;
        this.img = null;
        User.userInstances.push(this);
    }

    create(imgSrc){
        const userElement = document.createElement("div");
        userElement.id = this.name;
        userElement.className = "user";

        userElement.innerHTML =`<div id="profile">
                                    <div id="profile-pic">
                                        <img src="${imgSrc}">
                                    </div>
                                </div>
                                <div id="name">${this.name}</div>`;

        this.element = userElement;
    }

    render(parentId){
        const parent = document.querySelector("#" + parentId);
        
        if(!parent){
            return console.error("Parent Not Found");
        }
        this.parent = parent;
        this.parent.appendChild(this.element);
    }

    becomeHost(){
        this.host = true;
    }

    deleteUser(){
        
    }
}
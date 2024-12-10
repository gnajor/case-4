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

    create(parentId, imgSrc){
        const parent = document.querySelector("#" + parentId);

        if(!parent){
            return console.error("Parent Not Found");
        }
        this.parent = parent;
        this.img = imgSrc;

        const userElement = document.createElement("div");
        const userProfile = document.createElement("img");
        userProfile.setAttribute("src", imgSrc);

        this.element = userElement;
    }

    render(){
        this.parent.appendChild(this.element);
    }

    becomeHost(){
        this.host = true;
    }

    deleteUser(){
        
    }
}
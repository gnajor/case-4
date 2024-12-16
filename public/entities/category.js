import { PubSub } from "../utils/pubsub.js";

export class Category{
    static categoryInstances = [];

    constructor(category){
        this.id = category.id;
        this.name = category.name;
        this.questions = category.questions;
        this.img = category.img;
        this.element = this.create();
         
        Category.categoryInstances.push(this);
    }

    create(){
        const categoryElement = document.createElement("button");
        categoryElement.id = this.name;
        categoryElement.className = "category";
        categoryElement.textContent = this.name;

        return categoryElement;
    }

    render(parentId){
        const parent = document.querySelector("#" + parentId);
        
        if(!parent){
            return console.error("Parent Not Found");
        }
        this.parent = parent;
        this.parent.appendChild(this.element);
    }

    addClickListener(func){
        this.element.addEventListener("click", func);
    }
}

PubSub.subscribe({
    event: "setCategories",
    listener: (categories) => {
        for(const category of categories){
            const categoryInstance = new Category(category);
        }
    }
});
import { PubSub } from "../utils/pubsub.js";

export class Category{
    static categoryInstances = [];
    static intervalId = 0;

    static renderCategoryAnimation(){
        let counter = 0;

        Category.intervalId = setInterval(() => {
            const categories = Category.categoryInstances;

            if(counter === 0){
                categories[categories.length - 1].element.classList.remove("active");
            }
            else{
                categories[counter - 1].element.classList.remove("active");
            }

            categories[counter].element.classList.add("active");

            if(counter === categories.length - 1){
                counter = 0;
            }
            else{
                counter++;
            }
        }, 600);
    }

    static stopAnimation(){
        Category.categoryInstances.forEach(category => {
            category.element.classList.add("active");
        });

        clearInterval(Category.intervalId);
    }

    constructor(category){
        this.id = category.id;
        this.name = category.name;
        this.questions = category.questions;
        this.img = category.img;
        this.element = this.create();
        this.chosenCategory = false,
         
        Category.categoryInstances.push(this);
    }

    create(){
        const categoryElement = document.createElement("button");
        categoryElement.id = this.name.toLowerCase();
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
        this.element.addEventListener("click", func, {once: true});
    }

    delete(){
        this.element.remove();
    }

    setchosenCategory(){
        this.chosenCategory = true;
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

PubSub.subscribe({
    event: "category:chosen",
    listener: (categoryId) => {
        const specificCategory = Category.categoryInstances.find(category => category.id === categoryId);

        if(specificCategory){
            specificCategory.setchosenCategory = true;
        }
    }
})
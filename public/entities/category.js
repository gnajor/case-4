export class Category{
    static intervalId = 0;

    static renderCategoryAnimation(categories){
        let counter = 0;

        Category.intervalId = setInterval(() => {
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
        clearInterval(Category.intervalId);
    }

    constructor(id, name, parentId){
        this.id = id;
        this.name = name;
        this.parentId = parentId;
        this.element = this.render();
    }

    render(){
        const parent = document.querySelector("#" + this.parentId);
        
        if(!parent){
            return console.error("Parent Not Found");
        }

        const categoryElement = document.createElement("button");
        categoryElement.id = this.name.toLowerCase();
        categoryElement.className = "category";
        categoryElement.textContent = this.name;
        
        if(this.id){
            categoryElement.setAttribute("data-category-id", this.id);
        }

        parent.appendChild(categoryElement);
        return categoryElement;
    }

    addClickListener(func){
        this.element.addEventListener("click", func, {once: true});
    }
}

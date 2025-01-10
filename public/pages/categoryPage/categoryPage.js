import { Category } from "../../entities/category.js";
import { pageHandler } from "../../pageHandler/pageHandler.js";
import { renderTimer } from "../../components/timer.js";
import { PubSub } from "../../utils/pubsub.js";
import { userState } from "../../userState/userState.js";

export function renderCategoryPage(parentId, data){
    const parent = document.querySelector("#" + parentId);

    if(!parent){
        return console.error("Parent Not Found");
    }

    parent.innerHTML = `<div id="category-page">
                            <div class="timer-container"></div>
                            <div id="main-content">
                                <div class="page-title">
                                    </h1><h1>
                                </div>
                                <div id="categories"></div>
                            </div>
                        </div>`;

    const pageTitle = parent.querySelector(".page-title h1");
    const categoriesElement = parent.querySelector("#categories");
    const timerContainer = parent.querySelector(".timer-container");
    renderTimer(timerContainer, data.time);
    userState.setReady(false);

    if(userState.getId() === data.id){
        pageTitle.textContent = "Categories";

        for(const category of data.categories){
            const categoryInstance = new Category(category.id, category.name, "categories");
            categoryInstance.addClickListener(() => {
                pageHandler.handleChosenCategory({id: category.id});
            });
        }
    }

    else{
        categoriesElement.classList.add("picking-category");
        pageTitle.textContent = data.name + " picks category...";
        const categoryInstances = [];

        for(let i = 0; i < data.categories.length; i++){
            const category = data.categories[i];
            const categoryInstance = new Category(category.id, category.name, "categories");
            categoryInstances.push(categoryInstance);

            if(i === (data.categories.length - 1)){
                categoryInstance.element.classList.add("active");
            }
        }
        Category.renderCategoryAnimation(categoryInstances);
    }
}

PubSub.subscribe({
    event: "category:chosen",
    listener: (data) => {             
        const pageTitle = document.querySelector("#category-page h1");
        const categoriesElement = document.querySelector("#categories");
        const categories = document.querySelectorAll(".category");

        categoriesElement.classList.remove("picking-category")
        Category.stopAnimation();

        categories.forEach(category => {
            if(category.getAttribute("data-category-id") === data.categoryId){
                pageTitle.textContent = data.userName + " picked ";
            }

            else{
                category.remove();
            }
        });

        if(userState.getId() === data.userId){
            pageTitle.textContent = "You picked"
        } 
    }
});
import { Category } from "../../entities/category.js";
import { User } from "../../entities/user.js";
import { pageHandler } from "../../pageHandler/pageHandler.js";
import { renderTimer } from "../../components/timer.js";
import { PubSub } from "../../utils/pubsub.js";

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
    const categories = parent.querySelector("#categories");
    const timerContainer = parent.querySelector(".timer-container");
    renderTimer(timerContainer, data.time);
    const you = User.userInstances[0];

    if(you.categoryChooser){
        pageTitle.textContent = "Categories";

        for(const category of Category.categoryInstances){
            category.render("categories");
            category.addClickListener((event) => {
                pageHandler.handleChosenCategory({
                        id: category.id, 
                });
            });
        }
    }

    else{
        const categoryChooser = User.userInstances.find(user => user.categoryChooser);
        categories.classList.add("picking-category");
        pageTitle.textContent = categoryChooser.name + " picks category...";


        for(let i = 0; i < Category.categoryInstances.length; i++){
            const category = Category.categoryInstances[i];
            category.render("categories");

            if(i === (Category.categoryInstances.length - 1)){
                category.element.classList.add("active");
            }
            else{
                category.element.classList.remove("active");
            }
        }

        Category.renderCategoryAnimation();
    }
}

PubSub.subscribe({
    event: "category:chosen",
    listener: (categoryId) => {
        const categoryChooser = User.userInstances.find(user => user.categoryChooser);
        const you = User.userInstances[0];
        const pageTitle = document.querySelector("#category-page h1");
        const timerContainer = document.querySelector("#category-page .timer-container");
        Category.stopAnimation();

        for(const category of Category.categoryInstances){
            if(category.id === categoryId){
                pageTitle.textContent = categoryChooser.name + " picked ";
                timerContainer.remove();
            }
            else{
                category.delete();
            }
        }

        if(categoryChooser === you){
            pageTitle.textContent = "You picked"
        }
    }
});
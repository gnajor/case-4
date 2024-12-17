import { Category } from "../../entities/category.js";
import { User } from "../../entities/user.js";
import { pageHandler } from "../../pageHandler/pageHandler.js";
import { renderTimer } from "../../components/timer.js";

export function renderCategoryPage(parentId, data){
    const parent = document.querySelector("#" + parentId);

    if(!parent){
        return console.error("Parent Not Found");
    }

    parent.innerHTML = `<div id="category-page">
                            <div class="timer-container"></div>
                            <div class="page-title"></div>
                            <div id="categories"></div>
                        </div>`;

    const pageTitle = parent.querySelector(".page-title");
    const categories = parent.querySelector("#categories");
    const timerContainer = parent.querySelector(".timer-container");
    renderTimer(timerContainer, data.time);
    const you = User.userInstances[0];

    if(you.categoryChooser){
        for(const category of Category.categoryInstances){
            category.render("categories");
            category.addClickListener((event) => {
                pageHandler.handleChosenCategory({
                        id: category.id, 
                });
            });
        }
    }
}
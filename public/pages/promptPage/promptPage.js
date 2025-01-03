import { renderTimer } from "../../components/timer.js";
import { Category } from "../../entities/category.js";
import { User } from "../../entities/user.js";
import { userState } from "../../userState/userState.js";
import { PubSub } from "../../utils/pubsub.js";

export function renderPromptPage(parentId, data){
    const parent = document.querySelector("#" + parentId);

    if(!parent){
        return console.error("Parent Not Found");
    }

    const imgId = data.img.split(".")[0];

    parent.innerHTML = `<div id="prompt-page">
                            <div class="timer-container"></div>
                            <div id="categories"></div>
                            <div id="prompt">${data.question}</div>
                            <div id="image-container">
                                <img id="${imgId}" src="../../media/icons/${data.img}">
                            </div>
                        </div>`;
    
    const timerContainer = parent.querySelector(".timer-container");

    renderTimer(timerContainer, data.time);
    const category = new Category(undefined, data.categoryName, "categories");

    if(data.villain === userState.getId()){
        const prompt = parent.querySelector("#prompt");
        prompt.textContent = "You are The Villain. Blend in and don't get caught";
    }
}

PubSub.subscribe({
    event: "game:show-prompt",
    listener: (data) => {
        const prompt = document.querySelector("#prompt");
        prompt.textContent = data.question;

        const imageContainer = document.querySelector("#image-container");
        imageContainer.classList.add("disappear")
    }
})
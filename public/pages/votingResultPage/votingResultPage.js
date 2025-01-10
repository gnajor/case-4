import { renderTimer } from "../../components/timer.js";
import { User } from "../../entities/user.js";
import { userState } from "../../userState/userState.js";

export function renderVotingResultPage(parentId, data){
    const parent = document.querySelector("#" + parentId);

    if(!parent){
        return console.error("Parent Not Found");
    }

    parent.innerHTML = `<div id="voting-result-page">
                            <div class="timer-container"></div>
                            <div id="main">
                                <div id="img-container">
                                    <img>
                                </div>
                                <div class="page-subtitle">
                                    <h2></h2>
                                </div>
                            </div>
                        </div>`;

    const subTitle = parent.querySelector(".page-subtitle h2");
    const img = parent.querySelector("img");
    const timerContainer = parent.querySelector(".timer-container");
    renderTimer(timerContainer, data.time);

    if(data.villainId){
        if(userState.getId() === data.villainId){
            subTitle.textContent = "You got caught";
            img.setAttribute("src", "../../media/icons/villain.png");
        }
        else{
            subTitle.textContent = "The villain has been caught";
            img.setAttribute("src", "../../media/icons/villain.png");
        }
    }
    else if(data.userId){
        if(data.userId === userState.getId()){
            subTitle.textContent = "You are not the villain";
            img.setAttribute("src","../../media/profiles/" + data.userImg);
            img.classList.add("user");
        }
        else{
            subTitle.textContent = data.userName + " is not the villain";
            img.setAttribute("src", "../../media/profiles/" + data.userImg);
            img.classList.add("user");
        }
    }

    else if(!data.villainId){
        subTitle.textContent = "The villain got away this time!";
        img.setAttribute("src", "../../media/icons/got-away.png");
    }
}
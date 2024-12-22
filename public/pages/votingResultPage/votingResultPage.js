import { User } from "../../entities/user.js";

export function renderVotingResultPage(parentId, data){
    const parent = document.querySelector("#" + parentId);

    if(!parent){
        return console.error("Parent Not Found");
    }

    parent.innerHTML = `<div id="voting-result-page">
                            <div id="main">
                                <img>
                                <div id="page-subtitle">
                                    <h2></h2>
                                </div>
                            </div>
                        </div>`;

    const subTitle = parent.querySelector("#page-subtitle h2");
    const img = parent.querySelector("img");
    const you = User.userInstances[0];

    if(data.villainId){
        if(you.id === data.villainId){
            subTitle.textContent = "You got caught";
            img.setAttribute("src", "../../media/icons/villain.png");
        }
        else{
            subTitle.textContent = "The villain has been caught";
            img.setAttribute("src", "../../media/icons/villain.png");
        }
    }
    else if(data.userId){
        if(data.userId === you.id){
            subTitle.textContent = "You are not the villain";
            img.setAttribute("src","../../media/profiles/" + you.img);
        }
        else{
            const user = User.userInstances.find(user => data.userId === user.id);
            subTitle.textContent = user.name + " is not the villain";
            img.setAttribute("src", "../../media/profiles/" + user.img);
        }
    }

    else if(!data.villainId){
        subTitle.textContent = "The villain got away this time!";
        img.setAttribute("src", "../../media/icons/got-away.png");
    }

    for(const user of User.userInstances){
        user.resetEachRound();
    }
}
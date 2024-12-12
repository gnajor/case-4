import { User } from "../../entities/user.js";

export function renderLobbyPage(parentId, data){
    console.log(data)

    const parent = document.querySelector("#" + parentId);

    if(!parent){
        return console.error("Parent Not Found");
    }

    parent.innerHTML = `<div id="lobby-page">
                            <div class="page-title">
                                <h1>Room Code: ${data.roomPwd}</h1>
                            </div>
                            <div id="you-container">
                                <div id="arrow-left" class="arrow"><</div>
                                <div id="you"></div>
                                <div id="arrow-right" class="arrow">></div>
                            </div>
                            <div id="users-container"></div>
                            <div class="button-container">
                                <button class="yellow-button" id="ready-button">Ready</button>
                            </div>
                        </div>`;

    const you = User.userInstances[0];
    you.render("you");

    console.log(you.imgContainer)

    you.renderProfileImgs();


    console.log(data.users);
    if(data.users){
        for(const user of data.users){
            if(user.id !== you.id){
                const userInstance = new User(user.id, user.name);
                userInstance.render("users-container");
            }
        }
    }
    
    const readyButton = parent.querySelector("#ready-button");
    readyButton.addEventListener("click", () => {

    });
}
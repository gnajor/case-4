import { renderTimer } from "../../components/timer.js";
import { User } from "../../entities/user.js";
import { pageHandler } from "../../pageHandler/pageHandler.js";
import { userState } from "../../userState/userState.js";
import { PubSub } from "../../utils/pubsub.js";

export function renderVotingPage(parentId, data){
    const parent = document.querySelector("#" + parentId);

    if(!parent){
        return console.error("Parent Not Found");
    }

    parent.innerHTML = `<div id="voting-page">
                            <div class="timer-container"></div>
                            <div id="title-and-users">
                                <div id="title">
                                    <div class="page-title">
                                        <h1>Vote now!</h1>
                                    </div>
                                    <div class="page-subtitle">
                                        <h2>Who do you think is the villain?</h2>
                                    </div>
                                </div>
                                <div id="users-container"></div>
                            </div>
                        </div>`;

    const timerContainer = parent.querySelector(".timer-container");
    renderTimer(timerContainer, data.time);
    User.renderUsersVotes(
        data.users, 
        userState.getId(), 
        pageHandler.handleVoting, 
        "users-container"
    );
}

PubSub.subscribe({
    event: "user:voted",
    listener: (data) => {
        document.querySelector("#users-container").innerHTML = "";
        User.renderUsersVotes(
            data.users, 
            userState.getId(), 
            pageHandler.handleVoting, 
            "users-container"
        );
    }
});
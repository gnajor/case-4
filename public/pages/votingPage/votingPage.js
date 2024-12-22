import { renderTimer } from "../../components/timer.js";
import { User } from "../../entities/user.js";
import { pageHandler } from "../../pageHandler/pageHandler.js";
import { PubSub } from "../../utils/pubsub.js";

export function renderVotingPage(parentId, data){
    const parent = document.querySelector("#" + parentId);

    if(!parent){
        return console.error("Parent Not Found");
    }

    parent.innerHTML = `<div id="voting-page">
                            <div class="timer-container"></div>
                            <div id="title-n-users">
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
    renderTimer(timerContainer);
    const you = User.userInstances[0];

    for(const user of User.userInstances){
        user.render("users-container");
        user.renderCurrentImg();
        user.removeVote();
        user.markUnready();

        user.addClickListener((event) => {
            if(user !== you){
                pageHandler.handleVoting(user.id);
            }
        });
    }
}

PubSub.subscribe({
    event: "user:voted",
    listener: (data) => {
        for(const user of data.users){
            const userInstance = User.userInstances.find(instance => instance.id === user.id);
            userInstance.removeVote();
            userInstance.renderVotes(user.votes);
        }
    }
});
import { PubSub } from "../utils/pubsub.js";

export function renderTimer(parent, time){
    const timerContainer = document.createElement("div");
    timerContainer.id = "timer";
    timerContainer.textContent = time;
    parent.appendChild(timerContainer);
}

PubSub.subscribe({
    event: "timer:ticking",
    listener: (timeLeft) => {
        const timer = document.querySelector("#timer");
        timer.textContent = timeLeft;
    }
});
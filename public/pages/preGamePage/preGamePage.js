import { pageHandler } from "../../pageHandler/pageHandler.js";

export function renderPreGamePage(parentId){
    const parent = document.querySelector("#" + parentId);

    if(!parent){
        return console.error("Parent Not Found");
    }

    parent.innerHTML = `<div id="pre-game-page">
                            <div class="page-title">Choose how long you want to play</div>
                            <div class="big-button-container">
                                <button id="two-matches">2 MATCHES</button>
                                <button id="four-matches">4 MATCHES</button>
                                <button id="six-matches">6 MATCHES</button>
                            </div>
                        </div>`;

    const twoMatches = parent.querySelector("#two-matches");
    const fourMatches = parent.querySelector("#four-matches");
    const sixMatches = parent.querySelector("#six-matches");
    
    twoMatches.addEventListener("click", chooseMatchesAmount);
    fourMatches.addEventListener("click", chooseMatchesAmount);
    sixMatches.addEventListener("click", chooseMatchesAmount);

    function chooseMatchesAmount(event){
        const text = event.target.textContent;
        
        for(let i = 0; i < text.length; i++){
            if(Number(text[i])){
                const numMatches = Number(text[i]);
                pageHandler.handleRoomSettings(numMatches);
            }
        }
    }
}
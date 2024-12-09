import { navigateTo } from "../pageHandler/pageHandler.js";

export function renderBackArrow(parent, page){
    parent.innerHTML = `<div class="arrow-back">    
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="19" viewBox="0 0 28 19" fill="none">
                                <path d="M8.5959 11.8421L12.2358 16.7381L9.43653 19L-4.15258e-07 9.5L9.43659 1.49486e-06L14.5016 1.80952L8.54332 7.21053L26.5037 7.21053L27.2518 9.52632L28 11.8421L8.5959 11.8421Z" fill="white"/>
                            </svg>
                        </div>`;

    const arrowBack = parent.querySelector(".arrow-back");

    parent.addEventListener("click", () => {
        navigateTo(page);
    });
}
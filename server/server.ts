import { serveFileOrDir } from "./serveFileOrDir.ts";
import { ClientToServerMessage } from "../protocols/protocols.ts";
import { addUser, handleCreateRoom, handleJoinRoom , handleProfileChange, handleUserReady, handleUserUnready, handleCategoryChosen, handleStartMatch, handleUserLeaveRoom, handleUserVote, handleGoToMenu, handlePlayAgain, handleUserLogout, handleUserLeaveByClosing} from "./wsHandlers.ts";
import { wsDataGetter } from "./wsDataGetter.ts";

function handleWsRequests(request: Request) {
    const { socket, response } = Deno.upgradeWebSocket(request);

    socket.onopen = () => {
        console.log("hello")
    };

    socket.onmessage = (event) => {
        const clientMessage: ClientToServerMessage = JSON.parse(event.data);

        switch(clientMessage.action){
            case "user:join":
                addUser(socket, clientMessage.data);
                break;

            case "user:new-image":
                handleProfileChange(socket, clientMessage.data);
                break;

            case "user:ready": 
                handleUserReady(socket, clientMessage.data);
                break;

            case "user:unready":
                handleUserUnready(socket, clientMessage.data);
                break;

            case "user:logout":
                handleUserLogout(socket, clientMessage.data);
                break;

            case "game:user-vote":
                handleUserVote(socket, clientMessage.data);
                break;

            case "room:create":
                handleCreateRoom(socket, clientMessage.data);
                break;

            case "room:join":
                handleJoinRoom(socket, clientMessage.data);
                break;

            case "start:game": 
                handleStartMatch(socket, clientMessage.data);
                break;

            case "category:chosen":
                handleCategoryChosen(socket, clientMessage.data);
                break;

            case "game:go-to-menu":
                handleGoToMenu(socket, clientMessage.data);
                handleUserLeaveRoom(socket, clientMessage.data);
                break;

            case "game:go-play-again":
                handlePlayAgain(socket, clientMessage.data);
                break;
        }

        if(clientMessage.action.includes("room:get")){
            wsDataGetter(socket, clientMessage.action, clientMessage.data);
        }
    };

    socket.onclose = () => {
        handleUserLeaveByClosing(socket);
    };

    return response;
}

function server(req: Request){
    if(req.headers.get("upgrade") === "websocket") {
        return handleWsRequests(req);
    }
    
    return serveFileOrDir(req);
}

Deno.serve(server);
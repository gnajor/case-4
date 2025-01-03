import { serveFileOrDir } from "./serveFileOrDir.ts";
import { ClientToServerMessage } from "../protocols/protocols.ts";
import { addUser, handleCreateRoom, handleJoinRoom , handleProfileChange, handleUserReady, handleUserUnready, handleCategoryChosen, handleStartMatch, handleUserLeave, handleUserVote, handleGoToMenu, handlePlayAgain} from "./wsHandlers.ts";

function handleWsRequests(request: Request) {
    const { socket, response } = Deno.upgradeWebSocket(request);

    socket.onopen = () => {
        console.log("hello")
    };

    socket.onmessage = (event) => {
        const clientMessage: ClientToServerMessage = JSON.parse(event.data);
        console.log(clientMessage.action);

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

            case "user:leave":
                handleUserLeave(socket, clientMessage.data);
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
                break;

            case "game:go-play-again":
                handlePlayAgain(socket, clientMessage.data);
                break;
        }
    };

    socket.onclose = () => {
        console.log("Goodbye...");
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
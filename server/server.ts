import { serveFileOrDir } from "./serveFileOrDir.ts";
import { ServerToClientMessage, ClientToServerMessage } from "../protocols/protocols.ts";
import { addUser, handleCreateRoom, handleJoinRoom, send } from "./wsHandlers.ts";

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

            case "room:create":
                handleCreateRoom(socket, clientMessage.data);
                break;

            case "room:join":
                handleJoinRoom(socket, clientMessage.data);
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
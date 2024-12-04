import { serveFileOrDir } from "./serveFileOrDir.ts";
import { ServerToClientMessage, ClientToServerMessage } from "../protocols/protocols.ts";
import { handleUser } from "./wsHandlers.ts";
import { send } from "./wsHandlers.ts";

function handleWsRequests(request: Request) {
    const { socket, response } = Deno.upgradeWebSocket(request);

    socket.onopen = () => {
        
    };

    socket.onmessage = (event) => {
        const clientMessage: ClientToServerMessage = JSON.parse(event.data);

        switch(clientMessage.action){
            case "user:current":
                handleUser(socket, event.data);
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
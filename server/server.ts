import { serveFileOrDir } from "./serveFileOrDir.ts";
import { ServerToClientMessage, ClientToServerMessage } from "../protocols/protocols.ts";

function handleWsRequests(request: Request) {
    const { socket, response } = Deno.upgradeWebSocket(request);

    socket.addEventListener("open", (event) => {
        console.log("Someone connected to our server!");
    });

    socket.addEventListener("message", (event) => {
        /* const clientMessage: ClientToServerMessage = JSON.parse(event.data);
        socket.send(event.data); */
    });

    socket.addEventListener("close", (event) => {
        console.log("Goodbye...");
    });

    return response;
}

function server(req: Request){
    if(req.headers.get("upgrade") === "websocket") {
        return handleWsRequests(req);
    }
    
    return serveFileOrDir(req);
}

Deno.serve(server);
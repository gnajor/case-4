import { serveFileOrDir } from "./serveFileOrDir.ts";
import { ServerToClientMessage, ClientToServerMessage } from "./protocols.ts";

function handleWsRequests(request: Request) {
    if (request.headers.get("upgrade") === "websocket") {
        const { socket, response } = Deno.upgradeWebSocket(request);

        socket.addEventListener("open", (event) => {
            console.log("Someone connected to our server!");
        });

        socket.addEventListener("message", (event) => {
            const clientMessage: ClientToServerMessage = JSON.parse(event.data);
            console.log("Someone sent us the message: ", clientMessage);

            const serverMessage: ServerToClientMessage = {
                "event": "eventExample",
                "data": {
                    "id": "10",
                    "status": "success"
                }
            }

            console.log("Lets send it back.");
            socket.send(event.data);
        });

        socket.addEventListener("close", (event) => {
            console.log("Goodbye...");
        });

        return response;
    }
    return serveFileOrDir(request);
}

Deno.serve(handleWsRequests);



/* 
//server => client
    "event": "startGame"
    "data": {
        "roomId" 
    }


//client => server
    "action": "submitVote",
    "data": {
        "playerId"
    }


*/
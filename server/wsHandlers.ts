import { state } from "../protocols/protocols.ts";
import { ServerToClientMessage } from "../protocols/protocols.ts";

const State: state = {
    users: [],
    rooms: []
}

function broadcastToRoom(payload:ServerToClientMessage){
    const roomUsers = State.users.filter(user => user.roomId === payload.data.roomId); 

    for(let user of roomUsers){
        send(user.socket, )
    }
}

function handleJoinRoom(socket: WebSocket, user: Record<string, unknown>): void{
    
}

/* function handleLeaveRoom(socket, user){

}

function handleCreateRoom(socket, user){

}

function handleProfileChange(socket, user){

} */

function send(socket:WebSocket, payload:ServerToClientMessage): void{
    socket.send(JSON.stringify(payload));
}
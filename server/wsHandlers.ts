import { State, OnlineUser } from "../protocols/protocols.ts";
import { ServerToClientMessage } from "../protocols/protocols.ts";

const state: State = {
    users: [],
    rooms: []
}

function broadcastToRoom(payload:ServerToClientMessage){
    const roomUsers = state.users.filter((user: OnlineUser) => user.roomId === payload.data.roomId); 

    for(const user of roomUsers){
        send(user.socket, payload);
    }
}

export function handleUser(socket: WebSocket, user: Record<string, string>): void{
    const onlineUser: OnlineUser = {
        name: user.name,
        socket: socket
    }

    state.users.push(onlineUser);

    send(socket, {
        event: "user:recieved",
        data: {success: "User was recieved"}
    });
}

export function handleCreateRoom(socket: WebSocket, user: OnlineUser): void{

}

export function handleJoinRoom(socket: WebSocket, user: OnlineUser): void{
    
}

function handleLeaveRoom(socket: WebSocket, user: OnlineUser): void{

}


function handleProfileChange(socket: WebSocket, user: OnlineUser): void{

}

export function send(socket:WebSocket, payload:ServerToClientMessage): void{
    socket.send(JSON.stringify(payload));
}
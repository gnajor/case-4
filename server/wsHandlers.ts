import { State, OnlineUser, Room } from "../protocols/protocols.ts";
import { ServerToClientMessage } from "../protocols/protocols.ts";
import { generateId, generateRoomPassword } from "../utils/utils.ts";

const state: State = {
    users: [],
    rooms: [],

    getUser(userId){
        return this.users.find(user => user.id === userId);
    },

    getUsers(roomId){
        return this.users.filter(user => user.roomId === roomId);
    },

    getRoom(password){
        return this.rooms.find(room => room.password === password);
    },

    makeUserHost(user, value){
        user.host = value;
    },

    addUserToRoom(user, roomId){
        user.roomId = roomId;
    },

    createRoom(room){
        this.rooms.push(room);
    },

    createUser(user){
        this.users.push(user);
    }
}

function broadcastToRoom(payload:ServerToClientMessage){
    const roomUsers = state.getUsers(payload.data.roomId as string);

    if(!roomUsers){
        return;
    }

    delete payload.data.roomId;

    for(const user of roomUsers){
        send(user.socket, payload);
    }
}

export function addUser(socket: WebSocket, user: Record<string, string>): void{
    const onlineUser: OnlineUser = {
        id: user.id,
        name: user.name,
        socket: socket
    }

    state.createUser(onlineUser);

    send(socket, {
        event: "user:recieved",
        data: {success: "User was recieved"}
    });
}

export function handleCreateRoom(socket: WebSocket, user: Record<string, string | boolean>): void{
    const id = generateId();
    const password = generateRoomPassword();
    const foundUser = state.getUser(user.id as string);

    if(!foundUser){
        console.error("User not found");
        return;
    }

    const room: Room = {
        id: id,
        password: password,
    }

    state.createRoom(room);
    state.makeUserHost(foundUser, user.host as boolean);
    state.addUserToRoom(foundUser, id);

    console.log(state.rooms)

    send(socket, {
        event: "room:created",
        data: {
            success: "Room was created",
            roomPassword: password,
        }
    });
}

export function handleJoinRoom(socket: WebSocket, data:Record<string, string>): void{
    const specificUser = state.getUser(data.userId) ;
    const specificRoom = state.getRoom(data.roomPwd);

    if(!specificRoom){
        console.error("room not found");
        return;
    }

    if(!specificUser){
        console.error("user not found");
        return;
    }

    broadcastToRoom({
        event: "room:joined",
        data: {
            "roomId": specificRoom.id,
            "roomPwd": specificRoom.password,
            "name": specificUser.name,
        }
    });

    state.addUserToRoom(specificUser, specificRoom.id);
    const users = state.getUsers(specificRoom.id); 

    if(!users){
        console.error("Users does not exist")
        return;
    }

    send(socket, {
        event: "user:list",
        data: {
            users: users,
        }
    });
}

function handleLeaveRoom(socket: WebSocket, user: OnlineUser): void{

}


function handleProfileChange(socket: WebSocket, user: OnlineUser): void{
    
}

export function send(socket:WebSocket, payload:ServerToClientMessage): void{
    socket.send(JSON.stringify(payload));
}
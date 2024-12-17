import { State, OnlineUser, Room, ServerToClientMessage } from "../protocols/protocols.ts";
import { generateId, generateRoomPassword, getImages, getRandomInt } from "../utils/utils.ts";

const state: State = {
    users: [],
    rooms: [],
    categories: JSON.parse(await Deno.readTextFile("./db/categories.json")),
    timer: {
        duration: 20,
    },

    getUser(userId){
        return this.users.find(user => user.id === userId);
    },

    getRandomUser(users){
        const randomIndex = getRandomInt(0, this.users.length);
        return this.users[randomIndex];
    },

    getUsers(roomId){
        return this.users.filter(user => user.roomId === roomId);
    },

    getRoomByPwd(pwd){
        return this.rooms.find(room => room.password === pwd);
    },

    getRoomById(id){
        return this.rooms.find(room => room.id === id);
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
        const specificUser = state.users.find(stateUser => user.id === stateUser.id);

        if(!specificUser){
            this.users.push(user);
        }
        else{
            specificUser.socket = user.socket;
        }
    },

    editUserReadyStatus(user, value){
        user.ready = value;
    },

    checkAllUsersReady(users){
        for(const user of users as OnlineUser[]){
            if(user.ready){
                continue;
            }
            else{
                return false;
            }
        }
        return true;
    },

    makeUserCategoryChooser(user){
        user.categoryChooser = true;
    }
}

function broadcastToRoom(socket: WebSocket | undefined, roomId: string, payload:ServerToClientMessage): void{
    const roomUsers = state.getUsers(roomId as string);

    if(!roomUsers){
        return;
    }

    for(const user of roomUsers){
        if(user.socket !== socket){
            if(payload.event === "game:start"){
                console.log(user);
            }

            send(user.socket, payload);
        }
    }
}

export async function addUser(socket: WebSocket, user: Record<string, string>): Promise<void>{
    const onlineUser: OnlineUser = {
        id: user.id,
        name: user.name,
        ready: false,
        socket: socket
    }

    state.createUser(onlineUser);

    const images = await getImages("./public/media/profiles"); //should probably be used by the api and not the server 

    send(socket, {
        event: "user:recieved",
        data: {
            id: user.id,
            name: user.name,
            images: images
        }
    });
}

export function handleCreateRoom(socket: WebSocket, user: Record<string, string | boolean | number>): void{
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
        matches: user.matchAmount as number,
        rounds: 3,
    }

    console.log(room);

    state.createRoom(room);
    state.makeUserHost(foundUser, user.host as boolean);
    state.addUserToRoom(foundUser, id);

    send(socket, {
        event: "room:created",
        data: {
            roomPwd: password,
        }
    });
}

export function handleJoinRoom(socket: WebSocket, data:Record<string, string>): void{
    const specificUser = state.getUser(data.userId);
    const specificRoom = state.getRoomByPwd(data.roomPwd);

    if(!specificRoom){
        console.error("room not found");
        return;
    }

    if(!specificUser){
        console.error("user not found");
        return;
    }

    state.addUserToRoom(specificUser, specificRoom.id);

    broadcastToRoom(socket, specificUser.roomId as string, {
        event: "room:user-joined",
        data: {
            id: specificUser.id,
            name: specificUser.name,
        }
    });

    const users = state.getUsers(specificRoom.id); 

    if(!users){
        console.error("Users does not exist")
        return;
    }

    send(socket, {
        event: "room:you-joined",
        data: {
            users: users,
            roomPwd: specificRoom.password,
        }
    });
}

export function handleProfileChange(socket: WebSocket, data:Record<string, string>): void{
    const specificUser = state.getUser(data.id);
    
    if(!specificUser){
        return;
    }

    broadcastToRoom(socket, specificUser.roomId as string,{
        event: "user:img-changed",
        data: {
            id: data.id,
            img: data.img
        }
    });
}

export function handleUserUnready(socket: WebSocket, data:Record<string, string | boolean>){
    const specificUser = state.getUser(data.id as string);
    
    if(!specificUser){
        return;
    }

    state.editUserReadyStatus(specificUser, data.ready as boolean);

    broadcastToRoom(socket, specificUser.roomId as string,{
        event: "user:unreadied",
        data: {
            "id": specificUser.id,
            "ready": specificUser.ready, 
        }
    });

    send(socket, {
        event: "user:you-unreadied",
        data: {
            "ready": specificUser.ready,
        }
    });
}

export function handleUserReady(socket: WebSocket, data:Record<string, string | boolean>): void{
    const specificUser = state.getUser(data.id as string);
    
    if(!specificUser){
        return;
    }
    
    state.editUserReadyStatus(specificUser, data.ready as boolean);

    broadcastToRoom(socket, specificUser.roomId as string, {
        event: "user:readied",
        data: {
            "id": specificUser.id,
            "ready": specificUser.ready,
        }
    });

    send(socket, {
        event: "user:you-readied",
        data: {
            "ready": specificUser.ready,
        }
    });

    const users = state.getUsers(specificUser.roomId as string);
    console.log(users?.length);

    if(!users){
        return console.error("no users in room");
    }

    else if(users.length === 1){
        return console.error("You have to be more than one player");
    }
    
    const everybodyReady = state.checkAllUsersReady(users);

    if(everybodyReady){
        send(specificUser.socket, {
            event: "room:readied",
            data: {
                "roomId": specificUser.roomId as string,
            }
        });
    }

    //make users unready later//
}

export function handleStartGame(socket: WebSocket, data:Record<string, string>){
    const roomId = data.roomId;
    const roomUsers = state.getUsers(roomId);
    const timerStartTime: number = Date.now();
    const event = "timer:ticking";
    
    if(!roomUsers){
        return;
    }

    const randomRoomUser = state.getRandomUser(roomUsers);
    state.makeUserCategoryChooser(randomRoomUser);

    const timerId = setInterval(() => {
        TimerHandler(
            timerStartTime,
            data.roomId,
            timerId,
            event,
            () => {},
        );
    }, 1000);


    broadcastToRoom(undefined, roomId as string, {
        event: "game:started",
        data: {
            "id": randomRoomUser.id,
            "roomId": roomId,
            "time": state.timer.duration,
        }
    });
}


function TimerHandler(startTime: number, roomId: string, timerId: number, event: string, onTimeOut: VoidFunction){ 
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    const remainingTime = Math.max(state.timer.duration - elapsedTime, 0);

    if(remainingTime === 0){
        broadcastToRoom(undefined, roomId, {
            event: "lobby-timer:ended",
            data: {}
        });

        clearInterval(timerId);
    }
    else{
        broadcastToRoom(undefined, roomId, {
            event: event,
            data: {
                "timer": remainingTime,
            }
        });
    }
}

export function handleLobbyTimer(socket: WebSocket, data:Record<string, string>){
    const timerStartTime: number = Date.now();
    const event = "timer:ticking";

    broadcastToRoom(undefined, data.roomId, {
        event: "game:start",
        data: {
            time: state.timer.duration,
        }
    });

    const timerId = setInterval(() => {
        TimerHandler(
            timerStartTime,
            data.roomId,
            timerId,
            event,
            () => {},
        );
    }, 1000);
}

export function handleCategoryChoose(socket: WebSocket, data:Record<string, string>){
    const user = state.getUser(data.userId);

    if(!user){
        return;
    }

    const roomId = user.roomId;

    if(user.categoryChooser !== true || !user){
        broadcastToRoom(undefined, roomId as string, {
            event: "category:chosen",
            data: {
                roomId: userId.
            }
        });
    }
}

function handleLeaveRoom(socket: WebSocket, user: OnlineUser): void{

}

export function send(socket:WebSocket, payload:ServerToClientMessage): void{
    socket.send(JSON.stringify(payload));
}



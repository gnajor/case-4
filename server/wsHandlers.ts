import { OnlineUser, Room, ServerToClientMessage} from "../protocols/protocols.ts";
import {generateId, generateRoomPassword, send } from "../utils/utils.ts";
import { state } from "./wsState.ts";

function broadcastToRoom(socket: WebSocket | undefined, roomId: string, payload:ServerToClientMessage): void{
    const roomUsers = state.getUsers(roomId as string);

    if(!roomUsers){
        return console.error("users does not exist");
    }

    for(const user of roomUsers){
        if(user.socket !== socket){
            send(user.socket, payload);
        }
    }
}

export function addUser(socket: WebSocket, user: Record<string, string>): void{
    const onlineUser: OnlineUser = {
        id: user.id,
        name: user.name,
        ready: false,
        socket: socket,
        score: 0,
        votes: 0,
        villain: false,
        categoryChooser: false,
        host: false,
        img: user.img,
        leaveTimerId: 0,
    }

    state.createUser(onlineUser);
    const currentUser = state.getUser(user.id);
    const data: Record<string, string | boolean | number> = {}

    if(currentUser?.leaveTimerId !== 0){
        clearInterval(currentUser?.leaveTimerId);
    }

    if(currentUser?.roomId){
        const room = state.getRoomById(currentUser.roomId);
        if(!room){
            return console.error("room does not exist");
        }

        data.state = room.currentState;
    }

    send(socket, {
        event: "user:sent-room-state",
        data: data
    });
}

export function handleUserLogout(socket: WebSocket, data: Record<string, string>): void {
    const user = state.getUser(data.userId);
    
    if(!user){
        return console.error("user does not exist");
    }

    state.deleteUser(user);

    send(socket, {
        event: "user:logged-out",
        data: {}
    });
}

export function handleUserLeaveRoom(socket: WebSocket, data: Record<string, string>): void{
    const user = state.getUser(data.userId);
    
    if(!user){
        return console.error("user does not exist");
    }

    const room = state.getRoomById(user.roomId as string);

    if(!room){
        return console.error("room does not exist");
    }

    const roomUsers = state.getUsers(room.id);
    state.resetUser(user);

    if(roomUsers.length === 0){
        state.deleteRoomById(room.id);
    }

    broadcastToRoom(socket, room.id, {
        event: "user:left",
        data: {
            id: user.id
        }
    });
}

export function handleUserLeaveByClosing(socket: WebSocket){
    const user = state.getUserBySocket(socket);
    
    if(!user){
        return console.error("user does not exist");
    }

    const timerStartTime: number = Date.now();
    const timerId = setInterval(() => {
        timerHandler(
            timerStartTime,
            undefined,
            timerId,
            state.settings.timer.durationM,
            undefined,
            () => {
                if(user.roomId){
                    handleUserLeaveRoom(socket, {
                        userId: user.id
                    });
                }
                state.deleteUser(user)
            },
        )
    }, 1000);

    state.setLeaveTimerId(user, timerId);
}

export function handleCreateRoom(socket: WebSocket, user: Record<string, string | boolean | number>): void{
    const id = generateId();
    const password = generateRoomPassword();
    const foundUser = state.getUser(user.id as string);

    if(!foundUser){
        return console.error("User not found");
    }

    const room: Room = {
        id: id,
        password: password,
        matches: user.matchAmount as number,
        currentRound: 0,
        currentMatch: 0,
        rounds: state.settings.room.rounds,
        currentTime: 0,
        currentState: state.order[0]
    }

    state.createRoom(room);
    state.makeUserHost(foundUser, user.host as boolean);
    state.addUserToRoom(foundUser, id);

    send(socket, {
        event: "room:render",
        data: {
            roomPwd: password,
            imgs: state.profilePics
        }
    });
}

export function handleJoinRoom(socket: WebSocket, data:Record<string, string>): void{
    const specificUser = state.getUser(data.userId);
    const specificRoom = state.getRoomByPwd(data.roomPwd);

    if(!specificRoom){
        return console.error("room not found");
    }

    if(!specificUser){
        return console.error("user not found");
    }

    state.addUserToRoom(specificUser, specificRoom.id);

    broadcastToRoom(socket, specificUser.roomId as string, {
        event: "room:user-joined",
        data: {
            id: specificUser.id,
            img: specificUser.img,
            name: specificUser.name,
        }
    });

    const users = state.getUsers(specificRoom.id); 

    if(!users){
        return console.error("Users does not exist");
    }

    send(socket, {
        event: "room:you-joined",
        data: {
            users: users,
            roomPwd: specificRoom.password,
            imgs: state.profilePics,
        }
    });
}

export function handleProfileChange(socket: WebSocket, data:Record<string, string>): void{
    const specificUser = state.getUser(data.id);

    
    if(!specificUser){
        return console.error("user not found");
    }

    state.setNewUserImg(specificUser, data.img);

    broadcastToRoom(undefined, specificUser.roomId as string,{
        event: "user:img-changed",
        data: {
            id: data.id,
            img: data.img
        }
    });

    send(socket, {
        event: "user:you-img-changed",
        data: {
            img: data.img
        }
    });
}

export function handleUserUnready(socket: WebSocket, data:Record<string, string | boolean>){
    const specificUser = state.getUser(data.id as string);
    
    if(!specificUser){
        return console.error("user not found");
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
}


function timerHandler(startTime: number, roomId: string | undefined, timerId: number, duration:number, event: string | undefined, onTimeOut: VoidFunction, onCurrentTime: Record<string, number | VoidFunction> | undefined = undefined){ 
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    const remainingTime = Math.max(duration - elapsedTime, 0);

    if(event && roomId){
        const room = state.getRoomById(roomId);

        if(!room){
            return console.error("room does not exist");
        }

        state.setCurrentTimer(room, remainingTime);
        broadcastToRoom(undefined, roomId, {
            event: event,
            data: {
                "timer": remainingTime,
            }
        });
    }

    if(onCurrentTime){
        if(remainingTime === onCurrentTime.time){
            if(typeof(onCurrentTime.func) === "function"){
                onCurrentTime.func();
            }
        }
    }

    if(remainingTime === 0){
        onTimeOut();
        clearInterval(timerId);
    }
}

export function handleStartMatch(socket: WebSocket | undefined, data:Record<string, string>){
    const roomId = data.roomId;
    const roomUsers = state.getUsers(roomId);
    const timerStartTime: number = Date.now();
    const event = "timer:ticking";
    
    if(!roomUsers){
        return console.error("users not found");
    }

    const randomUser = state.getRandomUser(roomUsers);
    state.editVillainStatus(randomUser, true);

    const randomRoomUser = state.getRandomUser(roomUsers);
    state.makeUserCategoryChooser(randomRoomUser);

    const room = state.getRoomById(data.roomId);
    if(!room){
        return console.error("room does not exist");
    }

    state.setCurrentState(room, state.order[1]);

    const timerId = setInterval(() => {
        timerHandler(
            timerStartTime,
            roomId,
            timerId,
            state.settings.timer.durationM,
            event,
            () => {
                handleRandomCategory(roomId);
            },
        );
    }, 1000);

    state.setTimerId(room, timerId);

    broadcastToRoom(undefined, roomId as string, {
        event: "game:started",
        data: {
            "id": randomRoomUser.id,
            "name": randomRoomUser.name,
            "categories": state.categories,
            "time": state.settings.timer.durationM,
        }
    });
}

export function handleCategoryChosen(socket: WebSocket, data:Record<string, string>){
    const user = state.getUser(data.userId);
    const event = "timer:ticking";

    if(!user){
        return console.error("user does not exist");
    }

    const roomId = user.roomId;

    if(!roomId){
        return console.error("room does not exist");
    }

    const room = state.getRoomById(roomId);
    const category = state.getCategoryById(data.categoryId);

    if(!room || !category){
        return console.error("Room or category does not exist");
    }

    state.setCurrentState(room, state.order[2]);
    state.addCategoryToRoom(room, category);
    clearInterval(room.timerId);

    broadcastToRoom(undefined, roomId as string, {
        event: "category:chosen",
        data: {
            categoryId: data.categoryId,
            userId: user.id,
            userName: user.name,
            time: state.settings.timer.durationS,
        }
    });

    const timerStartTime: number = Date.now();

    const timerId = setInterval(() => {
        timerHandler(
            timerStartTime,
            roomId,
            timerId,
            state.settings.timer.durationS,
            event,
            () => {
                handleRounds(roomId)
            }
        );
    }, 1000);

    state.setTimerId(room, timerId)
}

function handleRandomCategory(roomId: string){
    const randCategory = state.getRandomCategory();
    const room = state.getRoomById(roomId);
    const users = state.getUsers(roomId);

    if(!room){
        return console.error("room does not exist");
    }

    if(!users){
        return console.error("users does not exist")
    }

    const specificUser = state.getCategoryChooser(users);

    if(!specificUser){
        return console.error("categorychooser does not exist");
    }

    state.addCategoryToRoom(room, randCategory);
    state.setCurrentState(room, state.order[2]);

    broadcastToRoom(undefined, roomId, {
        event: "category:chosen",
        data: {
            categoryId: randCategory.id,
            userId: specificUser.id,
            userName: specificUser.name,
            time: state.settings.timer.durationS,
        }
    });

    const timerStartTime: number = Date.now();
    const event = "timer:ticking";

    const timerId = setInterval(() => {
        timerHandler(
            timerStartTime,
            roomId,
            timerId,
            state.settings.timer.durationS,
            event,
            () => {
                handleRounds(roomId)
            }
        );
    }, 1000);
}

function handleRounds(roomId: string){
    const room = state.getRoomById(roomId);
    
    if(!room){
        return console.error("room not found");
    }

    const roomUsers = state.getUsers(roomId);
    const villainId = state.getVillain(roomUsers)?.id;
    const category = room.currentCategory;

    if(!category){
        return console.error("category not found");
    }

    const randType = state.getRandomTypeInCategory(category);
    const randQuestion = state.getRandomQuestionInCategory(randType);
    state.setCurrentCategoryImg(room, randType.img);
    state.setQuestionToRoom(room, randQuestion);
    state.setCurrentState(room, state.order[3]);

    const timerStartTime: number = Date.now();
    const event = "timer:ticking";

    broadcastToRoom(undefined, roomId, {
        event: "game:start-match",
        data: {
            categoryName: category.name,
            question: randQuestion,
            time: state.settings.timer.durationXl,
            villain: villainId as string,
            img: randType.img,
        }
    });

    const timerId = setInterval(() => {
        timerHandler(
            timerStartTime,
            roomId,
            timerId,
            state.settings.timer.durationXl,
            event,
            () => {
                handleShowAction(roomId);
            },
            {
                time: 3,
                func(){
                    state.setCurrentState(room, state.order[4]);
                    broadcastToRoom(undefined, roomId, {
                        event: "game:action-countdown",
                        data: {}
                    });
                }
            }
        );
    }, 1000);
}

function handleShowAction(roomId: string){
    const timerStartTime: number = Date.now();
    const room = state.getRoomById(roomId);
    if(!room){
        return console.error("room does not exist");
    }

    state.setCurrentState(room, state.order[5]);
    broadcastToRoom(undefined, roomId, {
        event: "game:action",
        data: {
            "action": state.getActionType(room)
        }
    });

    const timerId = setInterval(() => {
        timerHandler(
            timerStartTime,
            undefined,
            timerId,
            state.settings.timer.durationS,
            undefined,
            () => {handleShowQuestion(roomId)},
        )
    }, 1000);
}


function handleShowQuestion(roomId: string): void{
    const room = state.getRoomById(roomId);

    if(!room?.currentQuestion){
        return console.error("room key current question does not exist");
    }

    broadcastToRoom(undefined, roomId, {
        event: "game:show-prompt",
        data: {
            time: state.settings.timer.durationM,
            question: room.currentQuestion
        }
    });

    const timerStartTime: number = Date.now();
    const event = "timer:ticking";
    state.setCurrentState(room, state.order[6]);

    const timerId = setInterval(() => {
        timerHandler(
            timerStartTime,
            roomId,
            timerId,
            state.settings.timer.durationM,
            event,
            () => {handleVoting(roomId)}
        );
    }, 1000);
}

function handleVoting(roomId: string): void{
    const roomUsers = state.getUsers(roomId);
    const room = state.getRoomById(roomId);
    if(!room){
        return console.error("room does not exist");
    }

    state.setCurrentState(room, state.order[7]);

    broadcastToRoom(undefined, roomId, {
        event: "game:voting",
        data: {
            time: state.settings.timer.durationXl,
            users: roomUsers
        }
    });

    const timerStartTime: number = Date.now();
    const event = "timer:ticking";

    const timerId = setInterval(() => {
        timerHandler(
            timerStartTime,
            roomId,
            timerId,
            state.settings.timer.durationXl,
            event,
            () => {handleVotingTimeOut(roomId)}
        );
    }, 1000);
}

export function handleUserVote(socket: WebSocket, data: Record<string, string>):void{
    const userVoted = state.getUser(data.votedId);

    if(!userVoted?.roomId){
        return console.error("user key roomId does not exist");
    }

    state.editPlayerVote(userVoted, data.voteId);

    const roomUsers = state.getUsers(userVoted.roomId);
    state.setUsersVotes(roomUsers);

    broadcastToRoom(undefined, userVoted.roomId, {
        event: "user:voted",
        data: {
            users: roomUsers
        }
    });
}

export function handleVotingTimeOut(roomId:string):void{
    const roomUsers = state.getUsers(roomId);
    const userVoted = state.checkAllVotes(roomUsers);
    const villain = state.getVillain(roomUsers);
    const data: Record<string, string | boolean | number> = {};
    let nextAction = () => onRoundEnd(roomId);
    
    const room = state.getRoomById(roomId);
    if(!room){
        return console.error("room does not exist");
    }

    state.setCurrentState(room, state.order[8]);

    if(!villain){
        return console.error("villain does not exist");
    }

    if(!userVoted){
        data.villainId = false;
        const usersRight = state.getUsersWhoVotedRight(roomUsers, villain);

        if(usersRight.length !== 0 || usersRight !== undefined){
            state.addScoreToPlayers(usersRight, state.settings.points.notEverybodyRight);
            if(usersRight.length >= 4){
                state.addScoreToPlayers([villain], (state.settings.points.maxFakerPenalty));
            }
            else{
                state.addScoreToPlayers([villain], (state.settings.points.fakerPerUserRight * usersRight.length));
            }
        }
        state.addScoreToPlayers([villain], state.settings.points.fakerNotCaught);
    }
    
    else if(userVoted === villain){
        data.villainId = villain.id;
        const usersNotVillain = state.getAllNotVillain(roomUsers);
        state.addScoreToPlayers(usersNotVillain, state.settings.points.everybodyRight);
        nextAction = () => onMatchEnd(roomId);
    }

    else if(userVoted !== villain){
        data.userId = userVoted.id;
        data.userName = userVoted.name;
        data.userImg = userVoted.img;
        state.addScoreToPlayers([villain], state.settings.points.fakerNotCaught);
    }

    data.time = state.settings.timer.durationS;

    broadcastToRoom(undefined, roomId, {
        event: "game:everybody-voted",
        data
    });

    const timerStartTime: number = Date.now();
    const event = "timer:ticking";

    const timerId = setInterval(() => {
        timerHandler(
            timerStartTime,
            roomId,
            timerId,
            state.settings.timer.durationS,
            event,
            nextAction
        );
    }, 1000);
}

function onRoundEnd(roomId: string): void{
    const room = state.getRoomById(roomId);
    const roomUsers = state.getUsers(roomId);

    if(!room){
        return console.error("room does not exist");
    }

    state.resetRoundUsers(roomUsers);
    state.setNewRoomRound(room);
    const isNewMatch = state.isNewMatch(room);

    if(isNewMatch){
        onMatchEnd(roomId);
    }
    else{
        handleRounds(roomId);
    }
}

function onMatchEnd(roomId: string){
    const room = state.getRoomById(roomId);
    const roomUsers = state.getUsers(roomId);

    if(!room){
        return console.error("room does not exist");
    }
    state.setNewMatch(room);
    state.resetMatchUsers(roomUsers);
    const isGameOver = state.isGameOver(room);

    if(isGameOver){
        handleLeaderboard(roomId);
    }

    else{
        state.resetRounds(room);
        handleStartMatch(undefined, {
            roomId: roomId,
        });
    }
}


function handleLeaderboard(roomId: string): void{
    const roomUsers = state.getUsers(roomId);
    const room = state.getRoomById(roomId);
    if(!room){
        return console.error("room does not exist");
    }

    state.setCurrentState(room, state.order[9]);
    const usersAsc = state.getUsersAscendingScore(roomUsers);
    
    broadcastToRoom(undefined, roomId, {
        event: "game:leaderboard",
        data: {
            users: usersAsc
        }
    });
    
    state.resetRoom(room);
    state.resetLeaderboardUsers(roomUsers);
}

export function handleGoToMenu(socket: WebSocket, data:Record<string,string>){
    const user = state.getUser(data.userId);

    if(!user){
        return console.error("user does not exist");
    }

    send(socket, {
        event: "game:gone-to-menu",
        data: {
            name: user.name 
        }
    });
}

export function handlePlayAgain(socket: WebSocket, data:Record<string,string>){
    const specificUser = state.getUser(data.userId);
    
    if(!specificUser?.roomId){
        return console.error("room key roomId does not exist");
    }

    state.resetScore(specificUser);

    const roomUsers = state.getUsers(specificUser.roomId);
    const room = state.getRoomById(specificUser.roomId);
    
    if(!room){
        return console.error("room does not exist");
    }

    state.setCurrentState(room, state.order[0]);

    send(socket, {
        event: "game:gone-play-again",
        data: {
            "users": roomUsers,
            "roomPwd": room.password,
            "imgs": state.profilePics,
        }
    });

}
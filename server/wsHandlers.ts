import { OnlineUser, Room, Category, ServerToClientMessage, Questions } from "../protocols/protocols.ts";
import { generateId, generateRoomPassword, getImages, getRandomInt } from "../utils/utils.ts";



export const state = {
    users: [] as OnlineUser[],
    rooms: [] as Room[],
    categories: JSON.parse(await Deno.readTextFile("./db/categories.json")) as Category[],
    timer: {  //needs to be changed //NOTE
        duration: 20 as number, 
        currentTimerId: 0 as number 
    },

    deleteUser(user: OnlineUser): void{
        const index = this.users.indexOf(user);
        this.users.splice(index, 1);
    },

    deleteRoomById(roomId:string){
        for(let i = 0; i < this.rooms.length; i++){
            if(this.rooms[i].id === roomId){
                this.rooms.splice(i, 1);
            }
        }  
    },

    resetUser(user: OnlineUser){
        user.categoryChooser = false;
        user.host = false;
        user.playerVote = undefined;
        user.ready = false;
        user.roomId = undefined;
        user.votes = 0;
        user.villain = false;
        user.score = 0
    },

    resetRoundUsers(users: OnlineUser[]): void{
        for(const user of users){
            user.votes = 0;
            user.playerVote = undefined;
        }
    },

    resetMatchUsers(users: OnlineUser[]): void{
        for(const user of users){
            if(user.categoryChooser){
                user.categoryChooser = false;
            }

            if(user.villain){
                user.villain = false;
            }
        }
    },

    resetRoomUsers(users: OnlineUser[]): void{
        for(const user of users){
            user.categoryChooser = false;
            user.playerVote = undefined;
            user.ready = false;
            user.votes = 0;
            user.villain = false;
            user.score = 0;
        }
    },

    resetRounds(room:Room){
        room.currentRound = 0;
    },

    resetRoom(room: Room){
        room.currentMatch = 0;
        room.currentRound = 0;
        room.currentCategory = undefined;
        room.currentQuestion = undefined;
    },

    setTimerId(timerId: number): void{
        this.timer.currentTimerId = timerId;
    },

    editVillainStatus(user: OnlineUser, value:boolean): void{
        user.villain = value;
    },

    editPlayerVote(user: OnlineUser, userId: string): void{
        user.playerVote = userId;
    },

    getUser(userId: string): OnlineUser | undefined {
        return this.users.find((user) => user.id === userId);
    },

    getRandomUser(users: OnlineUser[]): OnlineUser {
        const randomIndex = getRandomInt(0, users.length);
        return users[randomIndex];
    },

    getRandomCategory(){
        const randomIndex = getRandomInt(0, this.categories.length);
        return this.categories[randomIndex];
    },

    setQuestionToRoom(room: Room, question: string){
        room.currentQuestion = question;
    },

    getRandomTypeInCategory(category: Category): Questions{
        const randomIndex = getRandomInt(0, category.questions.length);
        return category.questions[randomIndex];
    },

    getRandomQuestionInCategory(questions: Questions): string{
        const randomIndex = getRandomInt(0, questions.type.length);
        return questions.type[randomIndex]; //need to use in the other functions
    },

    getCategoryById(categoryId: string): Category | undefined{
        return state.categories.find(category => category.id === categoryId);
    },

    getUsers(roomId: string): OnlineUser[] {
        return this.users.filter((user) => user.roomId === roomId);
    },

    getRoomByPwd(pwd: string): Room | undefined {
        return this.rooms.find((room) => room.password === pwd);
    },

    getRoomById(id: string): Room | undefined{
        return this.rooms.find((room) => room.id === id);
    },

    makeUserHost(user: OnlineUser, value: boolean): void {
        user.host = value;
    },

    addUserToRoom(user: OnlineUser, roomId: string): void {
        user.roomId = roomId;
    },

    addCategoryToRoom(room: Room, category: Category){
        room.currentCategory = category
    },

    addCategoryQuestion(room: Room, question: string){
        room.currentQuestion = question;
    },

    createRoom(room: Room): void {
        this.rooms.push(room);
    },

    createUser(user: OnlineUser): void {
        const existingUser = this.users.find((u) => u.id === user.id);
        if (!existingUser) {
            this.users.push(user);
        } else {
            existingUser.socket = user.socket;
        }
    },

    editUserReadyStatus(user: OnlineUser, value: boolean): void {
        user.ready = value;
    },

    checkAllUsersReady(users: OnlineUser[]): boolean {
        return users.every((user) => user.ready);
    },

    makeUserCategoryChooser(user: OnlineUser): void {
        user.categoryChooser = true;
    },

    setUsersVotes(users: OnlineUser[]):void{
        for(const user of users){
            const userVotes = users.filter(filterUser => filterUser.playerVote === user.id);
            user.votes = userVotes.length;
        }
    },

    getVillain(users: OnlineUser[]): OnlineUser | undefined{
        return users.find(user => user.villain === true);
    },
    
    checkAllVotes(users: OnlineUser[]): OnlineUser | undefined{
        for(const user of users){
            if(user.votes === (users.length - 1)){
                return user;
            }
        }
        return;
    },

    getAllNotVillain(users: OnlineUser[]): OnlineUser[]{
        return users.filter(user => user.villain === false);
    },

    addScoreToPlayers(users: OnlineUser[], amount: number): void{
        users.forEach(user => {
            user.score += amount;
        });
    },

    getUsersAscendingScore(users: OnlineUser[]): OnlineUser[]{
        return users.sort((a,b) => b.score - a.score);
    },

    getUsersWhoVotedRight(users: OnlineUser[], villain: OnlineUser){
        return users.filter(user => user.playerVote === villain.id);
    },

    setNewRoomRound(room: Room): void{
        room.currentRound++;
    },

    setNewMatch(room: Room):void{
        room.currentMatch++;
    },

    isNewMatch(room:Room): boolean{
        if(room.currentRound === room.rounds){
            return true;
        }
        return false;
    },

    isGameOver(room:Room): boolean{
        if(room.currentMatch === room.matches){
            return true;
        }
        return false;
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
        socket: socket,
        score: 0,
        votes: 0,
        villain: false,
        categoryChooser: false,
        host: false,
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

export function handleUserLeave(socket: WebSocket, data: Record<string, string>){
    const user = state.getUser(data.userId);
    
    if(!user){
        return;
    }

    state.deleteUser(user);

    send(socket, {
        event: "user:left",
        data: {}
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
        currentRound: 0,
        currentMatch: 0,
        rounds: 3,
    }

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

    broadcastToRoom(undefined, specificUser.roomId as string,{
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
}


function timerHandler(startTime: number, roomId: string, timerId: number, duration:number, event: string | undefined, onTimeOut: VoidFunction){ 
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    const remainingTime = Math.max(duration - elapsedTime, 0);

    if(event){
        broadcastToRoom(undefined, roomId, {
            event: event,
            data: {
                "timer": remainingTime,
            }
        });
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
        return;
    }

    const randomUser = state.getRandomUser(roomUsers);
    state.editVillainStatus(randomUser, true);

    const randomRoomUser = state.getRandomUser(roomUsers);
    state.makeUserCategoryChooser(randomRoomUser);

    const timerId = setInterval(() => {
        timerHandler(
            timerStartTime,
            roomId,
            timerId,
            state.timer.duration,
            event,
            () => {
                handleRandomCategory(roomId);
            },
        );
    }, 1000);

    state.setTimerId(timerId);

    broadcastToRoom(undefined, roomId as string, {
        event: "game:started",
        data: {
            "id": randomRoomUser.id,
            "roomId": roomId,
            "time": state.timer.duration,
        }
    });
}

export function handleCategoryChosen(socket: WebSocket, data:Record<string, string>){
    const user = state.getUser(data.userId);

    if(!user || !user.categoryChooser){
        return;
    }

    const roomId = user.roomId;

    if(!roomId){
        return;
    }
    const room = state.getRoomById(roomId);
    const category = state.getCategoryById(data.categoryId);

    if(!room || !category){
        return;
    }

    state.addCategoryToRoom(room, category);
    clearInterval(state.timer.currentTimerId);

    broadcastToRoom(undefined, roomId as string, {
        event: "category:chosen",
        data: {
            categoryId: data.categoryId,
        }
    });

    const timerStartTime: number = Date.now();
    const duration = 10;

    const timerId = setInterval(() => {
        timerHandler(
            timerStartTime,
            roomId,
            timerId,
            duration,
            undefined,
            () => {
                handleRounds(roomId)
            }
        );
    }, 1000);

    state.setTimerId(timerId);
}

function handleRandomCategory(roomId: string){
    const randCategory = state.getRandomCategory();
    const room = state.getRoomById(roomId);

    if(!room){
        return;
    }

    state.addCategoryToRoom(room, randCategory);

    broadcastToRoom(undefined, roomId, {
        event: "category:chosen",
        data: {
            "categoryId": randCategory.id,
        }
    });

    const timerStartTime: number = Date.now();
    const duration = 10;

    const timerId = setInterval(() => {
        timerHandler(
            timerStartTime,
            roomId,
            timerId,
            duration,
            undefined,
            () => {
                handleRounds(roomId)
            }
        );
    }, 1000);

    state.setTimerId(timerId);
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
    state.setQuestionToRoom(room, randQuestion);

    const timerStartTime: number = Date.now();
    const event = "timer:ticking";

    const timerId = setInterval(() => {
        timerHandler(
            timerStartTime,
            roomId,
            timerId,
            state.timer.duration,
            event,
            () => {
                handleShowQuestion(roomId);
            }
        );
    }, 1000);

    state.setTimerId(timerId);

    broadcastToRoom(undefined, roomId, {
        event: "game:start-match",
        data: {
            categoryId: category.id,
            question: randQuestion,
            villain: villainId as string,
            img: randType.img,
        }
    });
}

function handleShowQuestion(roomId: string): void{
    const room = state.getRoomById(roomId);

    if(!room?.currentQuestion){
        return;
    }

    broadcastToRoom(undefined, roomId, {
        event: "game:show-prompt",
        data: {
            question: room.currentQuestion
        }
    });

    const timerStartTime: number = Date.now();
    const duration = 5;
    const event = "timer:ticking";

    const timerId = setInterval(() => {
        timerHandler(
            timerStartTime,
            roomId,
            timerId,
            duration,
            event,
            () => {handleVoting(roomId)}
        );
    }, 1000);
}

function handleVoting(roomId: string): void{
    const roomUsers = state.getUsers(roomId);

    broadcastToRoom(undefined, roomId, {
        event: "game:voting",
        data: {
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
            state.timer.duration,
            event,
            () => {handleVotingTimeOut(roomId)}
        );
    }, 1000);
}

export function handleUserVote(socket: WebSocket, data: Record<string, string>):void{
    const userVoted = state.getUser(data.votedId);

    if(!userVoted?.roomId){
        return;
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
    const data: Record<string, string | boolean> = {};
    let nextAction = () => onRoundEnd(roomId);

    if(!villain){
        return;
    }

    if(!userVoted){
        data.villainId = false;
        const usersRight = state.getUsersWhoVotedRight(roomUsers, villain);

        if(usersRight.length !== 0 || usersRight !== undefined){
            state.addScoreToPlayers(usersRight, 150);
            state.addScoreToPlayers([villain], (-50 * usersRight.length));
        }
        state.addScoreToPlayers([villain], 150);

    }
    
    else if(userVoted === villain){
        data.villainId = villain.id;
        const usersNotVillain = state.getAllNotVillain(roomUsers);
        state.addScoreToPlayers(usersNotVillain, 100);
        nextAction = () => onMatchEnd(roomId);
    }

    else if(userVoted !== villain){
        data.userId = userVoted.id;
        state.addScoreToPlayers([villain], 150);
    }

    broadcastToRoom(undefined, roomId, {
        event: "game:everybody-voted",
        data
    });

    const timerStartTime: number = Date.now();
    const duration = 10;

    const timerId = setInterval(() => {
        timerHandler(
            timerStartTime,
            roomId,
            timerId,
            duration,
            undefined,
            nextAction
        );
    }, 1000);
}

function onRoundEnd(roomId: string): void{
    const room = state.getRoomById(roomId);
    const roomUsers = state.getUsers(roomId);

    if(!room){
        return;
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
        return;
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
        return;
    }
    
    const usersAsc = state.getUsersAscendingScore(roomUsers);
    
    broadcastToRoom(undefined, roomId, {
        event: "game:leaderboard",
        data: {
            users: usersAsc
        }
    });
    
    state.resetRoom(room);
    state.resetRoomUsers(roomUsers);
}

export function handleGoToMenu(socket: WebSocket, data:Record<string,string>){
    const user = state.getUser(data.userId);

    if(!user){
        return;
    }

    const room = state.getRoomById(user.roomId as string);

    if(!room){
        return;
    }

    const roomUsers = state.getUsers(room.id);
    state.resetUser(user);

    if(roomUsers.length === 0){
        state.deleteRoomById(room.id);
    }

    send(socket, {
        event: "game:gone-to-menu",
        data: {
            //user
        }
    });
}

export function handlePlayAgain(socket: WebSocket, data:Record<string,string>){
    const specificUser = state.getUser(data.userId);

    if(!specificUser?.roomId){
        return;
    }

    const roomUsers = state.getUsers(specificUser.roomId);
    const room = state.getRoomById(specificUser.roomId);
    
    if(!room){
        return;
    }

    send(socket, {
        event: "game:gone-play-again",
        data: {
            "users": roomUsers,
            "roomPwd": room.password,
        }
    });

}

function handleLeaveRoom(socket: WebSocket, user: OnlineUser): void{

}

export function send(socket:WebSocket, payload:ServerToClientMessage): void{
    socket.send(JSON.stringify(payload));
}
import { getImages, getRandomInt } from "../utils/utils.ts";
import { OnlineUser, Room, Category, Questions } from "../protocols/protocols.ts";

export const state = {
    users: [] as OnlineUser[],
    rooms: [] as Room[],
    profilePics: await getImages("./public/media/profiles"),
    categories: JSON.parse(await Deno.readTextFile("./db/categories.json")) as Category[],
    order: ["lobby", "category", "category-chosen", "prompt", "prompt-action-countdown", "prompt-action" , "prompt-only", "voting", "results", "leaderboard"],
    settings: {
        timer: {
            "durationXl": 25,
            "durationL": 20,
            "durationM": 15,
            "durationS": 5,
        },

        room: {
            "rounds": 3,
        }, 

        points: {
            "everybodyRight": 200,
            "notEverybodyRight": 150,
            "fakerNotCaught": 200,
            "fakerPerUserRight": -50,
            "maxFakerPenalty": -200
        }
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

    setTimerId(room: Room, id: number){
        room.timerId = id;
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
            user.votes = 0;
            user.playerVote = undefined;

            if(user.categoryChooser){
                user.categoryChooser = false;
            }

            if(user.villain){
                user.villain = false;
            }
        }
    },

    resetLeaderboardUsers(users: OnlineUser[]): void{
        for(const user of users){
            user.categoryChooser = false;
            user.playerVote = undefined;
            user.ready = false;
            user.votes = 0;
            user.villain = false;
        }
    },

    resetScore(user: OnlineUser): void{
        user.score = 0;
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
        return questions.type[randomIndex]; 
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

    getCategoryChooser(users: OnlineUser[]): OnlineUser | undefined{
        return users.find((user) => user.categoryChooser === true)
    },

    getActionType(room: Room): string{
        if(room.currentQuestion?.includes("Raise")){
            return "Hands up!";
        }
        else if(room.currentQuestion?.includes("Point")){
            return "Point!";
        }
        else if(room.currentQuestion?.includes("How many")){
            return "Fingers up!";
        }
        else{
            return "Action does not exist";
        }
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

    getUserBySocket(socket:WebSocket){
        for(const user of this.users){
            if(user.socket === socket){
                return user;
            }
        }
    },  

    setNewMatch(room: Room):void{
        room.currentMatch++;
    },

    setNewUserImg(user: OnlineUser, img:string){
        user.img = img;
    },

    setCurrentTimer(room: Room, time: number): void{
        room.currentTime = time;
    },

    setLeaveTimerId(user: OnlineUser, timerId: number){
        user.leaveTimerId = timerId
    },

    setCurrentCategoryImg(room: Room, img: string): void{
        room.currentImg = img;
    },

    setCurrentState(room: Room, currentState: string): void{
        room.currentState = currentState;
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
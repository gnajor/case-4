export interface ServerToClientMessage{
    event: string,
    data: Record<string, string | OnlineUser[] | string[] | OnlineUser | WebSocket | boolean | number>
}

export interface ClientToServerMessage{
    action: string,
    data: Record<string, string>
}

//db protocols

export interface UserDb{
    token: string,
    id: string,
    name: string,
    password: string,
    profilePic: string, 
}

export interface Category{
    id: string,
    name: string,
    img: string
    questions: string[] 
}

//ws protocols

export interface Room{
    id: string,
    password: string,
    matches: number,
    rounds: number,
    category?: Category,
}

export interface OnlineUser{
    id: string,
    name: string,
    roomId?: string,
    host?: boolean,
    categoryChooser?: boolean
    faker?: boolean
    ready: boolean,
    socket: WebSocket,
}

export interface timer{
    duration: number,
}

export interface State{
    users: OnlineUser[],
    rooms: Room[],
    timer: timer,
    categories: Category[],
    getUser(id: string): OnlineUser | undefined,
    getUsers(id: string): OnlineUser[] | undefined,
    getRandomUser(users: OnlineUser[]): OnlineUser,
    getRoomByPwd(pwd: string): Room | undefined,
    getRoomById(id: string | undefined): Room | undefined,
    makeUserHost(user: OnlineUser, value: boolean): void,  
    addUserToRoom(user: OnlineUser, roomPwd: string): void,
    createRoom(room: Room): void,
    createUser(user: OnlineUser): void,
    editUserReadyStatus(user: OnlineUser, value: boolean): void,
    checkAllUsersReady(users: OnlineUser[] | undefined) : boolean,
    makeUserCategoryChooser(user:OnlineUser): void
}

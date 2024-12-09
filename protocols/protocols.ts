export interface ServerToClientMessage{
    event: string,
    data: Record<string, string | Array<OnlineUser>>
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
    profilePic?: string, 
}

export interface Category{
    name: string,
    questions: string[] 
}

//ws protocols

export interface Room{
    id: string,
    password: string,
    categories?: Category[],
}

export interface OnlineUser{
    id: string,
    name: string,
    roomId?: string,
    host?: boolean,
    socket: WebSocket
}

export interface State{
    users: OnlineUser[],
    rooms: Room[],
    getUser(id: string): OnlineUser | undefined,
    getUsers(id: string): Array<OnlineUser> | undefined,
    getRoom(id: string): Room | undefined,
    makeUserHost(user: OnlineUser, value: boolean): void,  
    addUserToRoom(user: OnlineUser, roomPwd: string): void,
    createRoom(room: Room): void,
    createUser(user: OnlineUser): void
}

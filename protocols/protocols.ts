export interface ServerToClientMessage{
    event: string,
    data: Record<string, string | number>
}

export interface ClientToServerMessage{
    action: string,
    data: Record<string, string | number>
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
    password: number,
    category: Category,
}

export interface OnlineUser{
    name: string,
    roomId?: number,
    socket: WebSocket
}

export interface State{
    users: OnlineUser[],
    rooms: Room[]
}

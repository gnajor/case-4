export interface ServerToClientMessage{
    event: string,
    data: Record<string, unknown>
}

export interface ClientToServerMessage{
    action: string,
    data: Record<string, unknown>
}

//db protocols

export interface UserDb{
    id: string,
    name: string,
    password: string,
    profilePic?: string, //should be optional for now
}

export interface Category{
    name: string,
    questions: string[] 
}

export interface Room{
    id: string,
    password: number,
    category: Category,
}

export interface OnlineUser{
    roomId: number,
    socket: unknown
}

export interface state{
    users: User[],
    rooms: Room[]
}

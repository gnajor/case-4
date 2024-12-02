export interface ServerToClientMessage{
    event: string,
    data: Record<string, unknown>
}

export interface ClientToServerMessage{
    event: string,
    data: Record<string, unknown>
}

export interface User{
    id: string,
    name: string,
    password: string,
    profilePic?: string, //should be optional for now
    roomId?: number,
}

export interface Room{
    id: string,
    password: number,
    members: User[]
}

export interface Category{
    name: string,
    questions: string[] 
}


//id
//name
//password
//roomId
//
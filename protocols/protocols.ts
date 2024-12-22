export interface ServerToClientMessage{
    event: string,
    data: Record<string, string | OnlineUser[] | string[] | OnlineUser | WebSocket | boolean | number | Category>
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
    questions: Questions[]
}

export interface Questions{
    img: string,
    type: string[],
}

//ws protocols

export interface Room{
    id: string,
    password: string,
    matches: number,
    rounds: number,
    currentCategory?: Category,
    currentQuestion?: string,
    currentRound: number,
    currentMatch: number
}

export interface OnlineUser{
    id: string,
    name: string,
    roomId?: string,
    host: boolean,
    categoryChooser: boolean
    villain: boolean
    playerVote?: string,
    votes: number,
    ready: boolean,
    socket: WebSocket,
    score: number
}



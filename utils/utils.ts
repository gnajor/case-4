import { encodeHex } from "@std/encoding/hex";
import { extname } from "@std/path/extname";
import { ServerToClientMessage } from "../protocols/protocols.ts";


export async function hash256(str: string): Promise<string>{
    const strBuffer = new TextEncoder().encode(str); //turns string into a Uint8array AKA an array of bytes AKA ArrayBuffer
    const hashedBuffer = await crypto.subtle.digest("SHA-256", strBuffer); //hashed ArrayBuffer
    return encodeHex(hashedBuffer); // converts the arrayBuffer to hexadecimal string
}

export function generateRandString(length: number = 32): string{
    const numArray = new Uint32Array(length);
    crypto.getRandomValues(numArray);

    return Array.from(numArray, (num) => num.toString(16)).join(""); //For each num make them into a hexadecimal conjoin them into a string;
}

export function generateId(): string{
    return crypto.randomUUID()
}

//min inclusive, max exclusive
export function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
}

export function generateRoomPassword(length: number = 6): string{
    const id = generateRandString();
    let password: string = "";

    for(let i: number = 0; i < length; i++){
        const randomInt: number = getRandomInt(0, id.length)
        password += id[randomInt];
    }

    return password;
}

export async function getImages(directory: string): Promise<string[]> {
    const images = [];

    for await(const file of Deno.readDir(directory)){
        if(file.isFile){
            const name = file.name;
            const type = extname(name).toLowerCase();

            if(type === ".png" || type === ".jpg" || type === ".jpeg" || ".gif"){
                images.push(file.name);
            }
        }
    }

    return images;
}

export function send(socket:WebSocket, payload:ServerToClientMessage): void{
    socket.send(JSON.stringify(payload));
}

export function encrypt(str: string){
    const randInt = getRandomInt(2, 8);
    let encryptedString: string = "";

    for(let i = 0; i < str.length; i++){
        const charCode = str.charCodeAt(i) + randInt;
        const encryptedChar = String.fromCharCode(charCode);
        encryptedString += encryptedChar;

        if(i === (str.length - 2)){
            encryptedString += String(randInt);
        }
    }
    return encryptedString;
}

export function decrypt(str: string){
    const key = Number(str[str.length - 2]);
    let decryptedString: string = "";

    for(let i = 0; i < str.length; i++){
        if(i === (str.length - 2)){
            continue;
        }
        
        const charCode = str.charCodeAt(i) - key;
        const decryptedChar = String.fromCharCode(charCode);
        decryptedString += decryptedChar;
    }   
    return decryptedString;
}
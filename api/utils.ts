import { encodeHex } from "@std/encoding/hex";

export async function encrypt(str: string): Promise<string>{
    const strBuffer = new TextEncoder().encode(str); //turns string into a Uint8array AKA an array of bytes AKA ArrayBuffer
    const hashedBuffer = await crypto.subtle.digest("SHA-256", strBuffer); //hashed ArrayBuffer
    return encodeHex(hashedBuffer); // converts the arrayBuffer to hexadecimal string
}

export function generateToken(length: number = 32): string{
    const numArray = new Uint32Array(length);
    crypto.getRandomValues(numArray);

    return Array.from(numArray, (num) => num.toString(16)).join(""); //For each num make them into a hexadecimal conjoin them into a string;
}

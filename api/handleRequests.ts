import { UserDb, Category } from "../protocols/protocols.ts";
import { encodeHex } from "@std/encoding/hex";

let users: UserDb[] = [];
const categories: Category[] = [];

try{
    const userDbString = await Deno.readTextFile("./db/users.json");

    if(userDbString.length > 0){
        users = JSON.parse(userDbString);
    }
} 
catch(error){
    if(error instanceof Deno.errors.NotFound) {
        console.error("the file was not found");
    } 
    else{
        throw error;
    }
}

export async function handleRequests(request: Request): Promise<Response>{
    const url = new URL(request.url);

    if(url.pathname === "/api/register" && request.method === "POST"){
        const {name, password} = await request.json();

        for(const user of users){
            if(user.name === name){
                return new Response(JSON.stringify({error: "Username is already in use"}), {status: 400});
            }
        }

        const passwordBuffer = new TextEncoder().encode(password) //turns password into a Uint8array AKA an array of bytes AKA ArrayBuffer
        const hashedBuffer = await crypto.subtle.digest("SHA-256", passwordBuffer); //hashed ArrayBuffer
        const encryptedPassword = encodeHex(hashedBuffer); // converts the arrayBuffer to hexadecimal string
        
        const id = crypto.randomUUID();

        const user: User = {
            id: id,
            name: name,
            password: encryptedPassword,
        }

        users.push(user);
        await Deno.writeTextFile("./db/users.json", JSON.stringify(users, null, 4));

        return new Response(JSON.stringify({message: name + "was added"}), {status: 201});
    }

    if(url.pathname === "/api/login" && request.method === "POST"){
        const {name, password} = await request.json();

        const passwordBuffer = new TextEncoder().encode(password);
        const hashedBuffer = await crypto.subtle.digest("SHA-256", passwordBuffer);
        const encryptedPassword = encodeHex(hashedBuffer);

        for(const user of users){
            if(user.name === name && user.password === encryptedPassword){
                return new Response(JSON.stringify({user: name, id: user.id}), {status: 200});
            }
        }
        return new Response(JSON.stringify({error: "User Not Found"}), {status: 404});
    }

    if(url.pathname === "/api/categories" && request.method === "GET"){
        const categoryName = await request.json();

        for(const category of categories){
            if(categoryName === category.name){
                return new Response(JSON.stringify({questions: category.questions}), {status: 200});
            }
        }

        return new Response(JSON.stringify({error: "Category Not Found"}), {status: 404});
    }

    if(url.pathname === "/api/user" && request.method === "PATCH"){
        const updatedUser = await request.json();

        for(let i = 0; i < users.length; i++){
            if(users[i].id === updatedUser.id){
                users[i].profilePic = updatedUser.profilePic;
            }
        }
    }

    return new Response("Path Not Found",{status: 404});
}
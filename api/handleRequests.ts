import { UserDb, Category } from "../protocols/protocols.ts";
import { encrypt, generateToken } from "./utils.ts";

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

        const encryptedPassword = await encrypt(password);
        const encryptedToken = await encrypt(generateToken());
        const id = crypto.randomUUID();

        const user: UserDb = {
            token: encryptedToken,
            id: id,
            name: name,
            password: encryptedPassword,
        }

        users.push(user);
        await Deno.writeTextFile("./db/users.json", JSON.stringify(users, null, 4));

        return new Response(JSON.stringify({message: name + " was added"}), {status: 201});
    }

    if(url.pathname === "/api/login" && request.method === "POST"){
        const {name, password} = await request.json();
        const encryptedPassword = await encrypt(password);

        for(const user of users){
            if(user.name === name && user.password === encryptedPassword){
                return new Response(JSON.stringify({user: name, token: user.token}), {status: 200});
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

    if(url.pathname === "/api/user?token" && request.method === "GET"){
        const urlToken = url.searchParams.get("token");
        if(urlToken?.length !== 64){
            return new Response(JSON.stringify({error: "Token not approved"}), {status: 400});
        }

        const user = users.find((user) => user.token === urlToken);

        if(!user){
            return new Response(JSON.stringify({error: "Token does not exist"}), {status: 401});
        }

        return new Response(JSON.stringify(user.name), {status: 202});
    }

    return new Response("Path Not Found",{status: 404});
}
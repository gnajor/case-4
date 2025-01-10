import { UserDb } from "../protocols/protocols.ts";
import { hash256, generateRandString, generateId, decrypt, encrypt } from "../utils/utils.ts";

let users: UserDb[] = [];

try{
    const usersDbString = await Deno.readTextFile("./db/users.json");

    if(usersDbString.length > 0){
        users = JSON.parse(usersDbString);
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
        const decryptedName = decrypt(name);
        const decryptedPwd = decrypt(password);

        for(const user of users){
            if(user.name === decryptedName){
                return new Response(JSON.stringify({error: "Username is already in use"}), {status: 400});
            }
        }

        const hashedPassword = await hash256(decryptedPwd);
        const hashedToken = await hash256(generateRandString());
        const id = generateId();

        const user: UserDb = {
            token: hashedToken,
            id: id,
            name: name,
            password: hashedPassword,
            profilePic: "default.png"
        }

        users.push(user);
        await Deno.writeTextFile("./db/users.json", JSON.stringify(users, null, 4));

        return new Response(JSON.stringify({message: name + "was added"}), {status: 201});
    }

    if(url.pathname === "/api/login" && request.method === "POST"){
        const {name, password} = await request.json();
        const decryptedName = decrypt(name);
        const decryptedPwd = decrypt(password);

        const hashedPassword = await hash256(decryptedPwd);

        for(const user of users){
            if(user.name === decryptedName && user.password === hashedPassword){
                return new Response(JSON.stringify({
                    id: encrypt(user.id), 
                    name: encrypt(user.name), 
                    token: encrypt(user.token),
                    img: encrypt(user.profilePic),
                }), {status: 200});
            }
        }
        return new Response(JSON.stringify({error: "User Not Found"}), {status: 404});
    }
    
    if(url.pathname.startsWith("/api/user") && request.method === "GET"){
        const urlToken = url.searchParams.get("token");
        const urlName = url.searchParams.get("name");

        if(!urlToken){
            return new Response(JSON.stringify({error: "Token not approved"}), {status: 401});
        }

        const token = decrypt(urlToken);        
        const user = users.find((user) => user.token === token);
        
        if(!user){
            return new Response(JSON.stringify({error: "No user with that token exists"}), {status: 401});
        }
        
        if(!urlName || urlName === ""){
            return new Response(JSON.stringify({error: "Username not approved"}), {status: 401});
        }

        const userName = decrypt(urlName);
        if(userName !== user.name){
            return new Response(JSON.stringify({error: "username does not exist"}), {status: 401});
        }
        
        return new Response(JSON.stringify({
            id: encrypt(user.id),
            name: encrypt(user.name),
            img: encrypt(user.profilePic), 
            token: encrypt(user.token)
        }), {status: 202});
    }
    
    if(url.pathname === "/api/user" && request.method === "PATCH"){
        const {userId, imgSrc} = await request.json();
        const decryptedUserId = decrypt(userId);
        const decryptedImgSrc = decrypt(imgSrc);

        for(const user of users){
            if(user.id === decryptedUserId){
                user.profilePic = decryptedImgSrc;
            }
        }
        await Deno.writeTextFile("./db/users.json", JSON.stringify(users, null, 4));
        return new Response(JSON.stringify({"ok": "profile image was added"}), {status: 200});
    }


    
    return new Response("Path Not Found",{status: 404});
}
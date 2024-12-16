import { UserDb, Category } from "../protocols/protocols.ts";
import { encrypt, generateRandString } from "../utils/utils.ts";

let users: UserDb[] = [];
let categories: Category[] = [];

try{
    const usersDbString = await Deno.readTextFile("./db/users.json");
    const categoriesDbString = await Deno.readTextFile("./db/categories.json");

    if(usersDbString.length > 0){
        users = JSON.parse(usersDbString);
    }
    if(categoriesDbString.length > 0){
        categories = JSON.parse(categoriesDbString);
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
        const encryptedToken = await encrypt(generateRandString());
        const id = crypto.randomUUID();

        const user: UserDb = {
            token: encryptedToken,
            id: id,
            name: name,
            password: encryptedPassword,
            profilePic: ""
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
                return new Response(JSON.stringify({id: user.id, name: name, token: user.token}), {status: 200});
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

    if(url.pathname.startsWith("/api/user") && request.method === "GET"){
        const urlToken = url.searchParams.get("token");
        const urlName = url.searchParams.get("name");

        if(urlToken?.length !== 64){
            return new Response(JSON.stringify({error: "Token not approved"}), {status: 401});
        }

        const user = users.find((user) => user.token === urlToken);

        if(!user){
            return new Response(JSON.stringify({error: "No user with that token exists"}), {status: 401});
        }

        if(!urlName || urlName === ""){
            return new Response(JSON.stringify({error: "Username not approved"}), {status: 401});
        }

        if(urlName !== user.name){
            return new Response(JSON.stringify({error: "username does not exist"}), {status: 401});
        }

        return new Response(JSON.stringify({
            id: user.id, 
            name: user.name, 
            token: user.token
        }), {status: 202});
    }

    if(url.pathname === "/api/user" && request.method === "PATCH"){
        const {userId, imgSrc} = await request.json();

        for(const user of users){
            if(user.id === userId){
                user.profilePic = imgSrc;
            }
        }
        await Deno.writeTextFile("./db/users.json", JSON.stringify(users, null, 4));
    }

    if(url.pathname.startsWith("/api/category") && request.method === "GET"){
        const urlCategory = url.searchParams.get("name");

        if(urlCategory === "all"){
            return new Response(JSON.stringify(categories));
        }
        else{
            return new Response(JSON.stringify({error: "Category not found"}), {status: 404});
        }
    }
    
    return new Response("Path Not Found",{status: 404});
}
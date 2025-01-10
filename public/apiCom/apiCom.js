import { encrypt } from "../utils/utils.js";

export async function apiCom(data, action){
    const options = {};

    switch(action){
        case "user:login": {
            options.method = "POST";
            options.body = {
                name: encrypt(data.name),
                password: encrypt(data.password)
            }
            
            const resource = await fetcher("../../api/login", options);
            return resource;
        }

        case "user:register": {
            options.method = "POST";
            options.body = {
                name: encrypt(data.name),
                password: encrypt(data.password)
            }
            
            const resource = await fetcher("../../api/register", options);
            return resource;
        }

        case "token-name:authorization": {
            options.method = "GET";
            const resource = await fetcher(`../../api/user/?token=${encrypt(data.token)}&name=${encrypt(data.name)}`, options);
            return resource;
        }

        case "user:patch-new-image": {
            options.method = "PATCH";
            options.body = {
                userId: encrypt(data.id),
                imgSrc: encrypt(data.img),
            }
            const resource = await fetcher(`../../api/user`, options);
            return resource
        }

        default: {
            console.warn("Unknown action: " + action);
            return null;
        }
    }
}

async function fetcher(url, options){
    try{
        const fetchOptions = {
            method: options.method,
            headers: {"content-type": "application/json"},
        };

        if(fetchOptions.method !== "GET" && options.body){
            fetchOptions.body = JSON.stringify(options.body);
        }

        const response = await fetch(url, fetchOptions);

        if(!response.ok){
            const errorMessage = await response.text();

            throw new Error(`Error: ${errorMessage}`);
        };

        return await response.json();
    }
    catch(error){
        console.error(error);
    }
}
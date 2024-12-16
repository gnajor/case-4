import { PubSub } from "../utils/pubsub.js";

export async function apiCom(data, action){
    const options = {};
    const response = undefined;

    switch(action){
        case "user:login": {
            options.method = "POST";
            options.body = {
                name: data.name,
                password: data.password
            }
            
            const resource = await fetcher("../../api/login", options);
            return resource;
        }

        case "user:register": {
            options.method = "POST";
            options.body = {
                name: data.name,
                password: data.password
            }
            
            const resource = await fetcher("../../api/register", options);
            return resource;
        }

        case "token-name:authorization": {
            options.method = "GET";
            const resource = await fetcher(`../../api/user/?token=${data.token}&name=${data.name}`, options);
            return resource;
        }

        case "category:all": {
            options.method = "GET";
            const resource = await fetcher(`../../api/category/?name=${data}`, options);
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
            headers: {"content-type": "applicationjson"},
        };

        if(fetchOptions.method !== "GET" && options.body){
            fetchOptions.body = JSON.stringify(options.body);
        }

        const response = await fetch(url, fetchOptions);

        if(!response.ok){
            const message = await response.json();

            throw new Error(
                message.error
            );
        };

        return await response.json();
    }
    catch(error){
        console.error(error);
    }
}
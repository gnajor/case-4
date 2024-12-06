import { PubSub } from "../utils/pubsub.js";

async function apiCom(data, action){
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

            if(response.status === 401 || response.status === 403){
                PubSub.publish({
                    event: "unauthorizedTokenName",
                    details: message
                });
            }

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

PubSub.subscribe({
    event: "sendUserLoginData",
    listener: async (user) => {
        const resource = await apiCom(user, "user:login");

        if(resource){
            localStorage.setItem("token", resource.token);
            localStorage.setItem("name", resource.name);
        }
    }
});

PubSub.subscribe({
    event: "sendUserRegData",
    listener: async (user) => {
        const resource = await apiCom(user, "user:register");
        console.log(resource);
    }
});

PubSub.subscribe({
    event: "authorizeTokenName",
    listener: async (details) => {
        const resource = await apiCom(
            {name: details.name, token: details.token, }, 
            details.action
        );
    }
});
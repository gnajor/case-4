import { PubSub } from "../utils/pubsub.js";

async function apiCom(data, action){
    const options = {}

    switch(action){
        case "user:login": {
            options.method = "POST";
            options.body = {
                name: data.name,
                password: data.password
            }
            
            const resource = await fetcher("../../api/login", options);
            localStorage.setItem("token", resource.token);
            break;
        }

        case "user:register": {
            options.method = "POST";
            options.body = {
                name: data.name,
                password: data.password
            }
            
            const resource = await fetcher("../../api/register", options);
            break;
        }

        default: {
            console.warn("Unknown action: " + action)
        }
    }
}

async function fetcher(url, options){
    try{
        const response = await fetch(url, {
            method: options.method,
            headers: {"content-type": "applicationjson"},
            body: JSON.stringify(options.body)
        });

        if(!response.ok){
            const message = await response.json();

            throw new Error(
                message.error
            )
        };

        return await response.json();
    }
    catch(error){
        console.error(error);
    }
}

PubSub.subscribe({
    event: "sendUserLoginData",
    listener: (user) => {
        apiCom(user, "user:login")
    }
});

PubSub.subscribe({
    event: "sendUserRegData",
    listener: (user) => {
        apiCom(user, "user:register")
    }
})
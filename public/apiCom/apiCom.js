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

            PubSub.publish({
                event: "",
                
            })

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

        case "token:authorization": {
            options.method = "GET";

            const resource = await fetcher(`../../api/user/token=${data}`);
            break;
        }

        default: {
            console.warn("Unknown action: " + action)
        }
    }
}

async function fetcher(url, options){
    try{
        const fetchOptions = (url, {
            method: options.method,
            headers: {"content-type": "applicationjson"},
        });

        if(fetchOptions.method !== "GET" && options.body){
            fetchOptions.body = JSON.stringify(options.body);
        }

        const response = await fetch(url, fetchOptions);

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

PubSub.subscribe({
    event: "authorizeToken",
    listener: (details) => {
        apiCom(details.token, details.action)
    }
})
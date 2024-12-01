import { serveFile, serveDir } from "jsr:@std/http/file-server";
import { handleRequests } from "./api/handleRequests.ts";


export function serveFileOrDir(request: Request){
    const pathname = new URL(request.url).pathname;

    if(pathname.startsWith("/api/")){
        return handleRequests(request);
    }

    if(pathname === "/") {
        return serveFile(request, "./index.html");
    }

    if(pathname === "/index.js"){
        console.log("cum")
        return serveFile(request, "./index.js");
    }

    return serveDir(request, {
        fsRoot: "assets",
        urlRoot: "static"
    });

}
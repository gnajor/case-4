import { serveFile, serveDir } from "@std/http/file-server";
import { handleRequests } from "../api/handleRequests.ts";

export function serveFileOrDir(request: Request){
    const pathname = new URL(request.url).pathname;

    if(pathname.startsWith("/api/")){
        return handleRequests(request);
    }

    if(pathname === "/"){
        return serveFile(request, "./public/index.html");
    }

    return serveDir(request, {
        fsRoot: "public",
        urlRoot: ""
    });
}
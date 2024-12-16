import { serveFile, serveDir } from "@std/http/file-server";
import { handleRequests } from "../api/handleRequests.ts";
import { extname } from "@std/path/extname";

export function serveFileOrDir(request: Request){
    const pathname = new URL(request.url).pathname;

    if(pathname.startsWith("/api/")){
        return handleRequests(request);
    }

    if(pathname === "/" || !extname(pathname)){
        return serveFile(request, Deno.cwd() + "/public/index.html");
    }

    return serveDir(request, {
        fsRoot: "public",
        urlRoot: ""
    });
}
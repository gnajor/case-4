import { send } from "../utils/utils.ts";
import { state } from "./wsState.ts"

export function wsDataGetter(socket: WebSocket, action: string, data:Record<string, string>){
    const specificUser = state.getUser(data.id); 
    if(!specificUser?.roomId){
        return console.error("room does not exist");
    }

    const room = state.getRoomById(specificUser.roomId);
    if(!room){
        return console.error("room does not exist");
    }

    const users = state.getUsers(specificUser.roomId);
    const imgs = state.profilePics;

    switch(action){
        case "room:get-current-data": {
            for(const user of users){
                if(user.ready){
                    send(user.socket, {
                        event: "user:you-readied",
                        data: {
                            "ready": true
                        }
                    });
                }
            }

            send(socket, {
                event: "room:render",
                data: {
                    "imgs": imgs,
                    "users": users,
                    "roomPwd": room.password,
                }
            });
            break;
        }

        case "room:get-category-data": {
            const categoryChooser = state.getCategoryChooser(users);
            if(!categoryChooser){
                return console.error("category chooser does not exist");
            }

            send(socket, {
                event: "game:started",
                data: {
                    "id": categoryChooser.id,
                    "time": room.currentTime,
                    "categories": state.categories,
                    "name": categoryChooser.name,
                }
            });

            if(room.currentState === "category-chosen"){
                if(!room.currentCategory){
                    return console.error("current category does not exist");
                }

                send(socket, {
                    event: "category:chosen",
                    data: {
                        "categoryId": room.currentCategory.id,
                        "userId": categoryChooser.id,
                        "userName": categoryChooser.name,
                        "time": room.currentTime,
                    }
                });

            }
            break;
        }

        case "room:get-prompt-data": {
            const villain = state.getVillain(users);
            if(!villain){
                return console.error("villain does not exist");
            }

            if(!room.currentCategory || !room.currentImg || !room.currentQuestion){
                return console.error("room keys does not exist currentCategory, currentImg and currentQuestion");
            }

            send(socket, {
                event: "game:start-match",
                data: {
                    "villain": villain.id,
                    "time": room.currentTime,
                    "question": room.currentQuestion,
                    "categories": state.categories,
                    "categoryName": room.currentCategory.name, 
                    "img": room.currentImg,
                }
            });            

            if(room.currentState === "prompt-only"){
                send(socket, {
                    event: "game:show-prompt",
                    data: {
                        "time": room.currentTime,
                        "question": room.currentQuestion
                    }
                });
            }

            else if(room.currentState === "prompt-action-countdown"){
                send(socket, {
                    event: "game:action-countdown",
                    data: {}
                });
            }

            else if(room.currentState === "prompt-action"){
                send(socket, {
                    event: "game:action",
                    data: {
                        "action": state.getActionType(room)
                    }
                });
            }

            break;
        }

        case "room:get-voting-data": {
            send(socket, {
                event: "game:voting",
                data: {
                    "time": room.currentTime,
                    "users": users
                }
            })
            break;
        }

        case "room:get-results-data": {
            const userVoted = state.checkAllVotes(users);
            const villain = state.getVillain(users);
            const data: Record<string, string | boolean | number> = {
                "time": room.currentTime
            }

            if(!villain){
                return console.error("villain does not exist");
            }

            if(!userVoted){
                data.villainId = false;
            }

            else if(userVoted === villain){
                data.villainId = villain.id;
            }

            else if(userVoted !== villain){
                data.userId = userVoted.id;
                data.userName = userVoted.name;
                data.userImg = userVoted.img;
            }

            send(socket,{
                event: "game:everybody-voted",
                data: data
            })
            break
        }

        case "room:get-leaderboard-data": {
            const userScoresAsc = state.getUsersAscendingScore(users);

            send(socket, {
                event: "game:leaderboard",
                data: {
                    users: userScoresAsc
                }
            });
            break;
        }

        default: {
            send(socket, {
                event: "action:not-found",
                data: {}
            })
        }
    }
}
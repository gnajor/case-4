export class User{
    static userInstances = [];

    constructor(id, name, host){
        this.id = id;
        this.name = name;
        this.host = host;
        User.userInstances.push(this);
    }
}
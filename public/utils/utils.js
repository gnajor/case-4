export function getRandomInt(min, max){
    return Math.floor(Math.random() * (max - min)) + min;
}

export function encrypt(str){
    const randInt = getRandomInt(2, 8);
    let encryptedString = "";

    for(let i = 0; i < str.length; i++){
        const charCode = str.charCodeAt(i) + randInt;
        const encryptedChar = String.fromCharCode(charCode);
        encryptedString += encryptedChar;

        if(i === (str.length - 2)){
            encryptedString += String(randInt);
        }
    }
    return encryptedString;
}

export function decrypt(str){
    const key = Number(str[str.length - 2]);
    let decryptedString = "";

    for(let i = 0; i < str.length; i++){
        if(i === (str.length - 2)){
            continue;
        }
        
        const charCode = str.charCodeAt(i) - key;
        const decryptedChar = String.fromCharCode(charCode);
        decryptedString += decryptedChar;
    }   
    return decryptedString;
}
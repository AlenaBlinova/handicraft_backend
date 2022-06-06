import jwt from "jsonwebtoken"

export const signToken = (data) => {
    return jwt.sign(data, process.env.ACCESS_SECRET, {
        expiresIn: "3h"
    })
}

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.ACCESS_SECRET)
    } catch (e) {
        return null
    }
}

export function makeid(length) {
    let result = '';
    const characters = '0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

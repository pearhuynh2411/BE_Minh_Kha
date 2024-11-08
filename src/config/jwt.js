import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();

const createToken = (data) => {
    return jwt.sign({payload: data}, process.env.SECRET_KEY, {
        algorithm: "HS256",
        expiresIn: "7s"
    });
}

const createRefToken = (data) => {
    return jwt.sign({payload: data}, process.env.SECRET_KEY, {
        algorithm: "HS256",
        expiresIn: "7d"
    });
}

//define function để verify token
const verifyToken = (token) =>{
    try{
        jwt.verify(token, process.env.SECRET_KEY);
        return true;
    }catch(error){
        return false;

    }
}

//define middleware để check token
const middlewareToken = (req, res, next) => {
    let {token} = req.headers;
    
    if(!token){
        return res.status(401).json({message: "Unauthorized"})
    }
    let checkToken = verifyToken(token);
    if (checkToken) {
        next();

    }
    else {
        return res.status(401).json({message: "Unauthorized"});
    }
}

export {
    createToken,middlewareToken, createRefToken
}
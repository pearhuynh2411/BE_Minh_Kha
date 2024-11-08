import initModels from "../models/init-models.js";
import sequelize from "../models/connect.js";
import bcrypt from 'bcrypt'; 
import transporter from "../config/transporter.js";
import jwt from 'jsonwebtoken';
import { createRefToken, createToken } from "../config/jwt.js";
import crypto from 'crypto'; 


const model = initModels(sequelize);

const signUp = async (req, res) => {
    try {
        let { full_name, email, pass_word } = req.body
        let checkUser = await model.users.findOne({
            where: {
                email
            }
        })

        if (checkUser) {
            return res.status(400).json({ message: "Email is wrong" })
        }

        await model.users.create({
            full_name,
            email,
            pass_word:bcrypt.hashSync(pass_word, 10)
        })
        

        const mailOption = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Welcome to Our Service",
            html: `
                <h1>Welcome ${full_name} to Our Service </h1>
            `
        }

        transporter.sendMail(mailOption, (err, info) => {
            if (err) {
                return res.status(500).json({ message: "Send email fail" });
            }
            return res.status(201).json({ message: "create user sucessfully" })
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "error API sign up" })
    }
}
const login = async (req, res) => {
    try {

        let { email, pass_word } = req.body;

        let checkUser = await model.users.findOne(({
            where: { email }
        }));
        if (!checkUser) {
            return res.status(400).json({ message: "Email is wrong" })
        }

        let checkPass = bcrypt.compareSync(pass_word, checkUser.pass_word);
        if (!checkPass) {
            return res.status(400).json({ message: "Password is wrong" });
        }
 
        let payload = {
            userId: checkUser.user_id
        }

        let accessToken = createToken(payload);
        

        let refreshToken = createRefToken(payload);

        await model.users.update({
            refresh_token: refreshToken
        }, {where: {user_id: checkUser.user_id}})

        res.cookie('refreshToken', refreshToken , {
            httpOnly: true,
            secure: false, 
            sameSite: 'Lax', 
            maxAge: 7 * 24 * 60 * 60 * 1000 
        })

        return res.status(200).json({ message: "Login successfully", token: accessToken })

    } catch (error) {
        return res.status(500).json({ message: "error API login" });
    }
}

const loginFacebook = async (req, res) => {
    try {
        let { id, email, name } = req.body;

        let checkUser = await model.users.findOne({
            where: {
                email
            }
        })

        if (!checkUser) {
            let newUser = await model.users.create({
                full_name: name,
                email,
                face_app_id: id
            });

            const mailOption = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Welcome to Our Service",
                html: `
                    <h1>Welcome ${name} to Our Service </h1>
                `
            }

            return transporter.sendMail(mailOption, (err, info) => {
                if (err) {
                    return res.status(500).json({ message: "Send email fail" });
                }

                let payload = {
                    userId: newUser.user_id
                }

                let accessToken = createToken(payload);
                return res.status(201).json({ message: "Login sucessfully", token: accessToken })
            })
        }

        let payload = {
            userId: checkUser.user_id
        }

        let accessToken = createToken(payload)

        return res.status(201).json({ message: "Login sucessfully", token: accessToken })
    } catch (error) {
        return res.status(500).json({ message: "error API login facebook" })
    }
}

const forgotPassword = async (req, res) => {
    try {
        let { email } = req.body;

        let checkUser = await model.users.findOne({
            where: {
                email
            }
        });
        if (!checkUser) {
            return res.status(400).json({ message: "Email is wrong" })
        }

        let randomCode = crypto.randomBytes(6).toString("hex");

        let expired = new Date(new Date().getTime() + 2 * 60 * 60 * 1000)// expire 2h


        await model.code.create({
            code: randomCode,
            expired
        })
        const mailOption = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Code xác thực",
            html: `
                    <h1> ${randomCode}</h1>
                `
        }
        return transporter.sendMail(mailOption, (err, info) => {
            if (err) {
                return res.status(500).json({ message: "Send email fail" });
            }
            return res.status(201).json({ message: "Send forgot password successfully sucessfully" })
        })

    } catch (error) {
        return res.status(500).json({ message: "error API forgot password" });
    }
}

const changePass = async (req, res) => {
    try {
        let {email, code, newPass} = req.body
        let checkEmail = await model.users.findOne({
            where:{email}
        });

        if(!checkEmail) {
            return res.status(400).json({message: "Email is wrong"});
        }
        if(!code) {
            return res.status(400).json({message: "Code is wrong"});
        }

        let checkCode = await model.code.findOne({
            where: {code}
        })

        if(!checkCode) {
            return res.status(400).json({message: "Code is wrong"});
        }

        let hashNewPass = bcrypt.hashSync(newPass, 10);

        checkEmail.pass_word = hashNewPass;
        checkEmail.save();

        await model.code.destroy({
            where:{code}
        });

        return res.status(200).json({message:"Change password successfully"});

    } catch (error) {
        return res.status(500).json({ message: "error API change password" });
    }
}

const extendToken = async (req,res) => {
    try{

        let refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({message: "401"});
        }

        let userRefToken = await model.users.findOne({
            where: {refresh_token: refreshToken}
        });
        if (!userRefToken || userRefToken == null){
            return res.status(401).json({message: "401"});
        }


        let newAccessToken = createToken({userId: userRefToken.user_id});
        return res.status(200).json({message: "Success", token: newAccessToken});

    }catch(error){
        console.log("error: " ,error);
        return res.status(500).json({ message: "error API extend Token" });
    
    }
}
export {
    signUp,
    login,
    loginFacebook,
    forgotPassword,
    changePass,
    extendToken
}
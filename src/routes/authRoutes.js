import express from 'express';
import { signUp, login, loginFacebook, forgotPassword,changePass, extendToken } from '../controllers/authControllers.js';

const authRoutes = express.Router();

//define API register (sign-up)
authRoutes.post("/sign-up", signUp);

//define API login
authRoutes.post("/login", login);

//define API login facebook
authRoutes.post("/login-facebook", loginFacebook);

//b1: API forgot password
authRoutes.post("/forgot-password", forgotPassword)
//b2: define API change password
authRoutes.post("/change-password",changePass)

//define API extend-token
authRoutes.post("/extend-token", extendToken);

export default authRoutes;
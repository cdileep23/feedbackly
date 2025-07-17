
import { Login, Logout, signIn, UserProfile } from "../controllers/admin.controller.js";
import { IsAuthenticated } from "../Middleware/auth.js";
import express from "express"

const AdminRouter=express.Router()

AdminRouter.route('/sign-up').post(signIn)
AdminRouter.route("/login").post(Login)
AdminRouter.route('/logout').get(Logout)
AdminRouter.route("/profile").get(IsAuthenticated, UserProfile);

export default AdminRouter
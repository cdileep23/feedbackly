import express from "express"
import { IsAuthenticated } from "../Middleware/auth.js";
import { createFeedbackForm, getAdminFeedbackForms, getFeedbackForm, toggleFeedbackFormStatus, updateFeedbackForm } from "../controllers/feedbackForm.controller.js";

const FeedbackFormRouter=express.Router();

FeedbackFormRouter.route("/create-form").post(IsAuthenticated,createFeedbackForm);
FeedbackFormRouter.route("/update-status/:formId").patch(IsAuthenticated,toggleFeedbackFormStatus);
FeedbackFormRouter.route("/update-form/:formId").patch(
  IsAuthenticated,
  updateFeedbackForm
);
FeedbackFormRouter.route('/get-form/:formId').get(IsAuthenticated,getFeedbackForm)
FeedbackFormRouter.route("/get-all/:adminId").get(IsAuthenticated,getAdminFeedbackForms);

export default FeedbackFormRouter;
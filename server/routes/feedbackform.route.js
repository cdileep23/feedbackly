import express from "express"
import { IsAuthenticated } from "../Middleware/auth.js";
import { createFeedbackForm, deleteFeedbackForm, getAdminFeedbackForms, getFeedbackForm, getFormAnalyticsForAdmin, toggleFeedbackFormStatus, updateFeedbackForm } from "../controllers/feedbackForm.controller.js";

const FeedbackFormRouter=express.Router();

FeedbackFormRouter.route("/create-form").post(IsAuthenticated,createFeedbackForm);
FeedbackFormRouter.route("/update-status/:formId").patch(IsAuthenticated,toggleFeedbackFormStatus);
FeedbackFormRouter.route("/update-form/:formId").patch(
  IsAuthenticated,
  updateFeedbackForm
);
FeedbackFormRouter.route('/get-form/:formId').get(getFeedbackForm)
FeedbackFormRouter.route("/get-all-forms").get(IsAuthenticated,getAdminFeedbackForms);
FeedbackFormRouter.route("/:formId/analytics").get(IsAuthenticated,getFormAnalyticsForAdmin)
FeedbackFormRouter.route('/delete-feedback/:formId').delete(IsAuthenticated,deleteFeedbackForm)
export default FeedbackFormRouter;
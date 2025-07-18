import express from "express";
import { IsAuthenticated } from "../Middleware/auth.js";
import { createFeedbackForm, deleteFeedbackForm, getAdminFeedbackForms, getFeedbackForm, getFormAnalyticsForAdmin, toggleFeedbackFormStatus } from "../controllers/FeedbackForm1.Controller.js";



const FeedbackFormRouter1 = express.Router();

FeedbackFormRouter1.route("/create-form").post(
  IsAuthenticated,
  createFeedbackForm
); //admin
FeedbackFormRouter1.route("/update-status/:formId").patch(
  IsAuthenticated,
  toggleFeedbackFormStatus); //admin

FeedbackFormRouter1.route("/get-form/:formId").get(getFeedbackForm); //user
FeedbackFormRouter1.route("/get-all-forms").get(
  IsAuthenticated,
  getAdminFeedbackForms
);
FeedbackFormRouter1.route("/:formId/analytics").get(
  IsAuthenticated,
  getFormAnalyticsForAdmin
);
FeedbackFormRouter1.route("/delete-feedback/:formId").delete(
  IsAuthenticated,
  deleteFeedbackForm
);
export default FeedbackFormRouter1;

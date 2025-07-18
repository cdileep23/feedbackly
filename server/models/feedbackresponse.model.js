import mongoose from "mongoose";

const feedbackResponseSchema = new mongoose.Schema({
  feedbackFormId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "feedback", 
    required: true,
  },
  responses: [
    {
      questionText: {
        type: String,
        required: true,
      },
      answer: {
        type: String, 
        required: true,
      },
    },
  ],
  submittedBy: {
    type: String,
   unique:true
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

const FeedbackResponseModel = mongoose.model(
  "feedbackResponse",
  feedbackResponseSchema
);
export default FeedbackResponseModel;

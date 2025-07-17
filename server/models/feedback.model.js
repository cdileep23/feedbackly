const mongoose = require("mongoose");

const feedbackFormSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  questions: [
    {
      questionText: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500,
      },
      questionType: {
        type: String,
        enum: ["text", "mcq", "yesno"],
        required: true,
      },
      options: {
        type: [String],
        validate: {
          validator: function (options) {
         
            if (this.questionType === "mcq") {
              return options && options.length >= 2 && options.length <= 10;
            }
            return !options || options.length === 0;
          },
          message:
            "MCQ questions must have 2-10 options, other types should have no options",
        },
      },
      isRequired: {
        type: Boolean,
        default: false,
      },
      order: {
        type: Number,
        default: 0,
      },
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
  expiresAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});


feedbackFormSchema.index({ adminId: 1, createdAt: -1 });
feedbackFormSchema.index({ isActive: 1, expiresAt: 1 });


feedbackFormSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});
const FeedbackModel=mongoose.model('feedback',feedbackFormSchema)
export default FeedbackModel

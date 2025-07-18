import FeedbackModel from "../models/feedback.model.js";
import FeedbackResponseModel from '../models/feedbackresponse.model.js'
import mongoose from "mongoose";
const validateQuestionType = (questionType) => {
  const validTypes = ["text", "mcq", "yesno"];
  return validTypes.includes(questionType);
};

const validateQuestion = (question, index) => {
  const errors = [];

  if (!question.questionText || question.questionText.trim().length === 0) {
    errors.push(`Question ${index + 1}: Question text is required`);
  }

  if (question.questionText && question.questionText.trim().length > 100) {
    errors.push(
      `Question ${index + 1}: Question text must be 100 characters or less`
    );
  }

  if (!question.questionType || !validateQuestionType(question.questionType)) {
    errors.push(
      `Question ${
        index + 1
      }: Invalid question type. Must be 'text', 'mcq', or 'yesno'`
    );
  }

  if (question.questionType === "mcq") {
    if (!question.options || !Array.isArray(question.options)) {
      errors.push(
        `Question ${index + 1}: MCQ questions must have options array`
      );
    } else if (question.options.length < 2 || question.options.length > 10) {
      errors.push(
        `Question ${index + 1}: MCQ questions must have 2-10 options`
      );
    } else {
      question.options.forEach((option, optionIndex) => {
        if (
          !option ||
          typeof option !== "string" ||
          option.trim().length === 0
        ) {
          errors.push(
            `Question ${index + 1}, Option ${
              optionIndex + 1
            }: Option cannot be empty`
          );
        }
        if (option && option.length > 100) {
          errors.push(
            `Question ${index + 1}, Option ${
              optionIndex + 1
            }: Option must be 100 characters or less`
          );
        }
      });

      const uniqueOptions = [
        ...new Set(question.options.map((opt) => opt.trim().toLowerCase())),
      ];
      if (uniqueOptions.length !== question.options.length) {
        errors.push(`Question ${index + 1}: Duplicate options are not allowed`);
      }
    }
  } else {
    if (question.options && question.options.length > 0) {
      errors.push(
        `Question ${index + 1}: ${
          question.questionType
        } questions should not have options`
      );
    }
  }

  return errors;
};

const validateFormData = (formData) => {
  const errors = [];

  if (!formData.title || formData.title.trim().length === 0) {
    errors.push("Title is required");
  }

  if (formData.title && formData.title.trim().length > 50) {
    errors.push("Title must be 50 characters or less");
  }

  if (formData.description && formData.description.trim().length > 200) {
    errors.push("Description must be 200 characters or less");
  }

  if (!formData.questions || !Array.isArray(formData.questions)) {
    errors.push("Questions must be an array");
  } else if (formData.questions.length === 0) {
    errors.push("At least one question is required");
  } else if (formData.questions.length > 10) {
    errors.push("Maximum 20 questions allowed");
  } else {
    formData.questions.forEach((question, index) => {
      const questionErrors = validateQuestion(question, index);
      errors.push(...questionErrors);
    });
  }

  if (formData.expiresAt) {
    const expiryDate = new Date(formData.expiresAt);
    const currentDate = new Date();

    if (isNaN(expiryDate.getTime())) {
      errors.push("Invalid expiry date format");
    } else if (expiryDate <= currentDate) {
      errors.push("Expiry date must be in the future");
    }
  }

  return errors;
};

export const createFeedbackForm = async (req, res) => {
  try {
    const {  title, description, questions, expiresAt } = req.body;
const adminId=req.user.id
    if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({
        success: false,
        message: "Valid admin ID is required",
      });
    }

    const formData = {
      title: title?.trim(),
      description: description?.trim() || "",
      questions: questions || [],
      expiresAt: expiresAt || null,
    };

    const validationErrors = validateFormData(formData);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    const cleanedQuestions = formData.questions.map((question) => ({
      questionText: question.questionText.trim(),
      questionType: question.questionType,
      options:
        question.questionType === "mcq"
          ? question.options.map((opt) => opt.trim())
          : [],
      isRequired: question.isRequired || false,
    }));

    const feedbackForm = new FeedbackModel({
      adminId,
      title: formData.title,
      description: formData.description,
      questions: cleanedQuestions,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : null,
    });

    const savedForm = await feedbackForm.save();

    res.status(201).json({
      success: true,
      message: "Feedback form created successfully",
      data: {
        formId: savedForm._id,
        title: savedForm.title,
        description: savedForm.description,
        questionsCount: savedForm.questions.length,
        isActive: savedForm.isActive,
        expiresAt: savedForm.expiresAt,
        createdAt: savedForm.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating feedback form:", error);

    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const mongooseErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: mongooseErrors,
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate entry found",
      });
    }

    // Handle other errors
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};


export const toggleFeedbackFormStatus = async (req, res) => {
  try {
    const { formId } = req.params;
    const { isActive } = req.body;

  
    if (!formId || !mongoose.Types.ObjectId.isValid(formId)) {
      return res.status(400).json({
        success: false,
        message: "Valid form ID is required",
      });
    }


    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean value",
      });
    }

   
    const feedbackForm = await FeedbackModel.findById(formId);
    if (!feedbackForm) {
      return res.status(404).json({
        success: false,
        message: "Feedback form not found",
      });
    }

 
    feedbackForm.isActive = isActive;
    const updatedForm = await feedbackForm.save();

    res.status(200).json({
      success: true,
      message: `Feedback form ${isActive ? "activated" : "closed"} successfully`,
      data: {
        formId: updatedForm._id,
        title: updatedForm.title,
        isActive: updatedForm.isActive,
        updatedAt: updatedForm.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error toggling feedback form status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};







export const getFeedbackForm = async (req, res) => {
  try {
    const { formId } = req.params;

    if (!formId || !mongoose.Types.ObjectId.isValid(formId)) {
      return res.status(400).json({
        success: false,
        message: "Valid form ID is required",
      });
    }

    const feedbackForm = await FeedbackModel.findById(formId);

    if (!feedbackForm) {
      return res.status(404).json({
        success: false,
        message: "Feedback form not found",
      });
    }

    res.status(200).json({
      success: true,
      data: feedbackForm,
    });
  } catch (error) {
    console.error("Error fetching feedback form:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAdminFeedbackForms = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { page = 1, limit = 10, search } = req.query;

    console.log(adminId);

    let query = { adminId };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const feedbackForms = await FeedbackModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select("_id title description isActive createdAt"); 

    const totalCount = await FeedbackModel.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        forms: feedbackForms,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNext: page * limit < totalCount,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching admin feedback forms:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getFormAnalyticsForAdmin = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { formId } = req.params;

    // Validate formId
    if (!mongoose.Types.ObjectId.isValid(formId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid form ID format",
      });
    }

    // Get form with all details
    const form = await FeedbackModel.findById(formId).lean();
    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Form not found",
      });
    }

    // Verify admin ownership
    if (form.adminId.toString() !== adminId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to form data",
      });
    }

    // Get all responses
    const responses = await FeedbackResponseModel.find(
      { feedbackFormId: formId },
      { __v: 0 }
    ).lean();

    const totalResponses = responses.length;

    // Prepare form details without questions
    const formDetails = {
      title: form.title,
      description: form.description,
      isActive: form.isActive,
      createdAt: form.createdAt,
      expiresAt: form.expiresAt,
      totalResponses: totalResponses,
    };

    // Filter only MCQ and Yes/No questions and prepare analytics
    const mcqYesNoAnalytics = form.questions
      .filter((q) => q.questionType === "mcq" || q.questionType === "yesno")
      .map((question) => {
        const questionResponses = responses
          .map(
            (response) =>
              response.responses.find(
                (r) => r.questionText === question.questionText
              )?.answer
          )
          .filter(Boolean);

        const options =
          question.questionType === "mcq" ? question.options : ["Yes", "No"];

        return {
          questionText: question.questionText,
          questionType: question.questionType,
          options: options.map((option) => {
            const count = questionResponses.filter((r) =>
              question.questionType === "mcq"
                ? r === option
                : r.toLowerCase() === option.toLowerCase()
            ).length;

            return {
              option,
              count,
              percentage:
                totalResponses > 0
                  ? Math.round((count / totalResponses) * 100)
                  : 0,
            };
          }),
          totalAnswers: questionResponses.length,
          responseRate:
            totalResponses > 0
              ? Math.round((questionResponses.length / totalResponses) * 100)
              : 0,
        };
      });

    // Prepare all responses in simple format
    const allResponses = responses.map((response) => ({
      submittedBy: response.submittedBy || "Anonymous",
      submittedAt: response.submittedAt,
      answers: response.responses.map((r) => ({
        questionText: r.questionText,
        answer: r.answer,
      })),
    }));

    res.status(200).json({
      success: true,
      data: {
        formDetails,
        analytics: mcqYesNoAnalytics,
        allResponses,
      },
    });
  } catch (error) {
    console.error("Error fetching form analytics:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteFeedbackForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const userId = req.user?.id; 

    if (!formId || !mongoose.Types.ObjectId.isValid(formId)) {
      return res.status(400).json({
        success: false,
        message: "Valid form ID is required",
      });
    }

    const form = await FeedbackModel.findById(formId);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Feedback form not found",
      });
    }

    if (form.adminId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this form",
      });
    }

    await FeedbackModel.findByIdAndDelete(formId);

    res.status(200).json({
      success: true,
      message: "Feedback form deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting feedback form:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
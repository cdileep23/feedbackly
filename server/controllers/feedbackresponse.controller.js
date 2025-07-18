
import FeedbackResponseModel from "../models/FeedbackResponseModel.js";
import FeedbackModel from "../models/FeedbackModel.js";
import mongoose from "mongoose";


export const submitFeedbackResponse = async (req, res) => {
  try {
    const { feedbackFormId, responses, submittedBy } = req.body;


    if (!feedbackFormId || !responses || !submittedBy) {
      return res.status(400).json({
        success: false,
        message: "feedbackFormId, responses, and submittedBy are required",
      });
    }


    if (!mongoose.Types.ObjectId.isValid(feedbackFormId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid feedbackFormId format",
      });
    }

    
    const feedbackForm = await FeedbackModel.findById(feedbackFormId);
    if (!feedbackForm) {
      return res.status(404).json({
        success: false,
        message: "Feedback form not found",
      });
    }

    if (!feedbackForm.isActive) {
      return res.status(400).json({
        success: false,
        message: "Feedback form is not active",
      });
    }

  
    if (feedbackForm.expiresAt && new Date() > feedbackForm.expiresAt) {
      return res.status(400).json({
        success: false,
        message: "Feedback form has expired",
      });
    }

    
    const existingResponse = await FeedbackResponseModel.findOne({
      feedbackFormId,
      submittedBy,
    });

    if (existingResponse) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted a response for this feedback form",
      });
    }


    if (!Array.isArray(responses) || responses.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Responses must be a non-empty array",
      });
    }

    // Validate each response
    for (const response of responses) {
      if (!response.questionText || !response.answer) {
        return res.status(400).json({
          success: false,
          message: "Each response must have questionText and answer",
        });
      }
    }

    // Validate required questions are answered
    const requiredQuestions = feedbackForm.questions.filter(
      (q) => q.isRequired
    );
    const answeredQuestions = responses.map((r) => r.questionText);

    for (const requiredQuestion of requiredQuestions) {
      if (!answeredQuestions.includes(requiredQuestion.questionText)) {
        return res.status(400).json({
          success: false,
          message: `Required question "${requiredQuestion.questionText}" is not answered`,
        });
      }
    }

    // Create new feedback response
    const newResponse = new FeedbackResponseModel({
      feedbackFormId,
      responses,
      submittedBy,
    });

    await newResponse.save();

    res.status(201).json({
      success: true,
      message: "Feedback response submitted successfully",
      data: newResponse,
    });
  } catch (error) {
    console.error("Error submitting feedback response:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted a response for this feedback form",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


export const getFeedbackResponses = async (req, res) => {
  try {
    const { feedbackFormId } = req.params;


    if (!mongoose.Types.ObjectId.isValid(feedbackFormId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid feedbackFormId format",
      });
    }

    const responses = await FeedbackResponseModel.find({ feedbackFormId })
      
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      message: "Feedback responses retrieved successfully",
      data: responses,
      count: responses.length,
    });
  } catch (error) {
    console.error("Error fetching feedback responses:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


export const getFeedbackResponseById = async (req, res) => {
  try {
    const { responseId } = req.params;


    if (!mongoose.Types.ObjectId.isValid(responseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid responseId format",
      });
    }

    const response = await FeedbackResponseModel.findById(responseId).populate(
      "feedbackFormId",
      "title description questions"
    );

    if (!response) {
      return res.status(404).json({
        success: false,
        message: "Feedback response not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Feedback response retrieved successfully",
      data: response,
    });
  } catch (error) {
    console.error("Error fetching feedback response:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getFeedbackAnalytics = async (req, res) => {
  try {
    const { feedbackFormId } = req.params;

   
    if (!mongoose.Types.ObjectId.isValid(feedbackFormId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid feedbackFormId format",
      });
    }

    const responses = await FeedbackResponseModel.find({
      feedbackFormId,
    }).populate("feedbackFormId", "title questions");

    if (responses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No responses found for this feedback form",
      });
    }

    const feedbackForm = responses[0].feedbackFormId;
    const analytics = {
      totalResponses: responses.length,
      formTitle: feedbackForm.title,
      questionAnalytics: {},
    };

    
    feedbackForm.questions.forEach((question) => {
      const questionResponses = responses.flatMap((response) =>
        response.responses.filter(
          (r) => r.questionText === question.questionText
        )
      );

      analytics.questionAnalytics[question.questionText] = {
        questionType: question.questionType,
        totalResponses: questionResponses.length,
        responses: questionResponses.map((r) => r.answer),
      };

     
      if (
        question.questionType === "mcq" ||
        question.questionType === "yesno"
      ) {
        const frequency = {};
        questionResponses.forEach((response) => {
          frequency[response.answer] = (frequency[response.answer] || 0) + 1;
        });
        analytics.questionAnalytics[question.questionText].frequency =
          frequency;
      }
    });

    res.status(200).json({
      success: true,
      message: "Feedback analytics retrieved successfully",
      data: analytics,
    });
  } catch (error) {
    console.error("Error fetching feedback analytics:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};




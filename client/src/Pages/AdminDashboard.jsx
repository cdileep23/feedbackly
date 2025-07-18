import { Loader2, Plus, X, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BASE_URL } from "@/utils/url";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";




const AdminDashboard = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
const navigate=useNavigate()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    questions: [
      {
        questionText: "",
        questionType: "text",
        options: [],
        isRequired: false,
      },
      {
        questionText: "",
        questionType: "text",
        options: [],
        isRequired: false,
      },
    ],
    expiresAt: "",
  });

  const fetchAdminForms = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/feedback/get-all-forms`, {
        withCredentials: true,
      });
   
      setForms(response.data.data?.forms);
    } catch (error) {
      console.error(error);
      setError("Failed to fetch forms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminForms();
  }, []);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      questions: [
        {
          questionText: "",
          questionType: "text",
          options: [],
          isRequired: false,
        },
        {
          questionText: "",
          questionType: "text",
          options: [],
          isRequired: false,
        },
      ],
      expiresAt: "",
    });
    setValidationErrors([]);
  };

  const handleOpenDialog = () => {
    resetForm();
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    resetForm();
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };

    
    if (field === "questionType") {
      updatedQuestions[index].options = value === "mcq" ? ["", ""] : [];
    }

    setFormData((prev) => ({
      ...prev,
      questions: updatedQuestions,
    }));
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setFormData((prev) => ({
      ...prev,
      questions: updatedQuestions,
    }));
  };

  const addOption = (questionIndex) => {
    const updatedQuestions = [...formData.questions];
    if (updatedQuestions[questionIndex].options.length < 10) {
      updatedQuestions[questionIndex].options.push("");
      setFormData((prev) => ({
        ...prev,
        questions: updatedQuestions,
      }));
    }
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...formData.questions];
    if (updatedQuestions[questionIndex].options.length > 2) {
      updatedQuestions[questionIndex].options.splice(optionIndex, 1);
      setFormData((prev) => ({
        ...prev,
        questions: updatedQuestions,
      }));
    }
  };

  const addQuestion = () => {
    if (formData.questions.length < 10) {
      setFormData((prev) => ({
        ...prev,
        questions: [
          ...prev.questions,
          {
            questionText: "",
            questionType: "text",
            options: [],
            isRequired: false,
          },
        ],
      }));
    }
  };

  const removeQuestion = (index) => {
    if (formData.questions.length > 2) {
      const updatedQuestions = formData.questions.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        questions: updatedQuestions,
      }));
    }
  };

  const validateForm = () => {
    const errors = [];

  
    if (!formData.title.trim()) {
      errors.push("Title is required");
    } else if (formData.title.trim().length > 50) {
      errors.push("Title must be 50 characters or less");
    }

   
    if (formData.description.trim().length > 200) {
      errors.push("Description must be 200 characters or less");
    }

   
    formData.questions.forEach((question, index) => {
      if (!question.questionText.trim()) {
        errors.push(`Question ${index + 1}: Question text is required`);
      } else if (question.questionText.trim().length > 100) {
        errors.push(
          `Question ${index + 1}: Question text must be 100 characters or less`
        );
      }

      if (question.questionType === "mcq") {
        if (question.options.length < 2) {
          errors.push(
            `Question ${index + 1}: MCQ questions must have at least 2 options`
          );
        } else if (question.options.length > 10) {
          errors.push(
            `Question ${index + 1}: MCQ questions can have maximum 10 options`
          );
        }

        question.options.forEach((option, optionIndex) => {
          if (!option.trim()) {
            errors.push(
              `Question ${index + 1}, Option ${
                optionIndex + 1
              }: Option cannot be empty`
            );
          } else if (option.length > 100) {
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
          errors.push(
            `Question ${index + 1}: Duplicate options are not allowed`
          );
        }
      }
    });

   
    if (formData.expiresAt) {
      const expiryDate = new Date(formData.expiresAt);
      const currentDate = new Date();
      if (expiryDate <= currentDate) {
        errors.push("Expiry date must be in the future");
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setFormSubmitting(true);
    setValidationErrors([]);

    try {
     

      const payload = {
      
        title: formData.title.trim(),
        description: formData.description.trim(),
        questions: formData.questions.map((q) => ({
          questionText: q.questionText.trim(),
          questionType: q.questionType,
          options:
            q.questionType === "mcq" ? q.options.map((opt) => opt.trim()) : [],
          isRequired: q.isRequired,
        })),
        expiresAt: formData.expiresAt || null,
      };

      const response = await axios.post(
        `${BASE_URL}/feedback/create-form`,
        payload,
        {
          withCredentials: true,
        }
      );
      

      if (response.data.success) {
        handleCloseDialog();
        fetchAdminForms(); 
        toast.success("Form created successfully")
        fetchAdminForms()
      }
    } catch (error) {
      console.error("Error creating form:", error);
      if (error.response?.data?.errors) {
        setValidationErrors(error.response.data.errors);
      } else {
        setValidationErrors([
          error.response?.data?.message || "Failed to create form",
        ]);
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading forms...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        {forms.length > 0 && (
          <Button onClick={handleOpenDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Form
          </Button>
        )}
      </div>

      {forms.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-gray-500 text-lg">No forms added yet</p>
          <Button onClick={handleOpenDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Form
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <div
              key={form._id}
              className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold truncate">{form.title}</h3>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    form.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {form.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {form.description}
              </p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>
                  Created: {new Date(form.createdAt).toLocaleDateString()}
                </span>
                <button
                  className="text-blue-600 hover:text-blue-800 font-medium"
                  onClick={() => {
                   navigate(`/admin/form/${form._id}`)
                  }}
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

  
      {showDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Create New Form</h2>
                <button
                  onClick={handleCloseDialog}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {validationErrors.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <h4 className="text-sm font-medium text-red-800 mb-2">
                    Please fix the following errors:
                  </h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter form title (max 50 characters)"
                    maxLength={50}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.title.length}/50 characters
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter form description (max 200 characters)"
                    rows={3}
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.description.length}/200 characters
                  </p>
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.expiresAt}
                    onChange={(e) =>
                      handleInputChange("expiresAt", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Questions */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium">
                      Questions <span className="text-red-500">*</span>
                    </label>
                    <Button
                      type="button"
                      onClick={addQuestion}
                      disabled={formData.questions.length >= 10}
                      className="text-sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Question
                    </Button>
                  </div>

                  {formData.questions.map((question, questionIndex) => (
                    <div
                      key={questionIndex}
                      className="border rounded-lg p-4 mb-4 bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium text-sm">
                          Question {questionIndex + 1}
                        </h4>
                        {formData.questions.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(questionIndex)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        {/* Question Text */}
                        <div>
                          <input
                            type="text"
                            value={question.questionText}
                            onChange={(e) =>
                              handleQuestionChange(
                                questionIndex,
                                "questionText",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter question text (max 100 characters)"
                            maxLength={100}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {question.questionText.length}/100 characters
                          </p>
                        </div>

                        {/* Question Type */}
                        <div>
                          <select
                            value={question.questionType}
                            onChange={(e) =>
                              handleQuestionChange(
                                questionIndex,
                                "questionType",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="text">Text</option>
                            <option value="mcq">Multiple Choice</option>
                            <option value="yesno">Yes/No</option>
                          </select>
                        </div>

                        {/* Required Toggle */}
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`required-${questionIndex}`}
                            checked={question.isRequired}
                            onChange={(e) =>
                              handleQuestionChange(
                                questionIndex,
                                "isRequired",
                                e.target.checked
                              )
                            }
                            className="mr-2"
                          />
                          <label
                            htmlFor={`required-${questionIndex}`}
                            className="text-sm"
                          >
                            Required question
                          </label>
                        </div>

                        {/* MCQ Options */}
                        {question.questionType === "mcq" && (
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="text-sm font-medium">
                                Options
                              </label>
                              <button
                                type="button"
                                onClick={() => addOption(questionIndex)}
                                disabled={question.options.length >= 10}
                                className="text-sm text-blue-600 hover:text-blue-800"
                              >
                                <Plus className="h-3 w-3 mr-1 inline" />
                                Add Option
                              </button>
                            </div>
                            {question.options.map((option, optionIndex) => (
                              <div
                                key={optionIndex}
                                className="flex items-center mb-2"
                              >
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) =>
                                    handleOptionChange(
                                      questionIndex,
                                      optionIndex,
                                      e.target.value
                                    )
                                  }
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder={`Option ${
                                    optionIndex + 1
                                  } (max 100 characters)`}
                                  maxLength={100}
                                />
                                {question.options.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeOption(questionIndex, optionIndex)
                                    }
                                    className="ml-2 text-red-500 hover:text-red-700"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    type="button"
                    onClick={handleCloseDialog}
                    disabled={formSubmitting}
                    className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={formSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md disabled:opacity-50"
                  >
                    {formSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Form"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

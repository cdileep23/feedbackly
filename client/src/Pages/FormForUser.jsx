import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "@/utils/url";

const FormForUser = () => {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responses, setResponses] = useState([]);
  const [submittedBy, setSubmittedBy] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/feedback/get-form/${formId}`
        );
        if (!response.data.success) {
          throw new Error(response.data.message || "Form not found");
        }
        setForm(response.data.data);
        const initialResponses = response.data.data.questions.map(
          (question) => ({
            questionText: question.questionText,
            answer: "",
          })
        );
        setResponses(initialResponses);
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || "Failed to fetch form"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [formId]);

  const handleInputChange = (index, value) => {
    setResponses((prev) => {
      const updatedResponses = [...prev];
      updatedResponses[index] = {
        ...updatedResponses[index],
        answer: value,
      };
      return updatedResponses;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!submittedBy) {
      alert("Please enter your name/identifier");
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/response/submit`, {
        feedbackFormId: formId,
        responses,
        submittedBy,
      });

      if (response.data.success) {
        setIsSubmitted(true);
      } else {
        throw new Error(response.data.message || "Submission failed");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit form");
    }
  };

  if (loading)
    return (
      <div className="max-w-4xl mx-auto p-4 my-4 text-center">Loading...</div>
    );

 if (error)
   return (
     <div className="flex items-center justify-center min-h-screen">
       <div className="max-w-4xl w-full mx-auto p-4 my-4 bg-white rounded-lg shadow-md text-center">
         <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
         <p className="text-gray-700">{error}</p>
         <p className="mt-4 text-gray-500">
           Please check the form URL and try again.
         </p>
       </div>
     </div>
   );

 if (isSubmitted)
   return (
     <div className="flex items-center justify-center min-h-screen">
       <div className="max-w-4xl w-full mx-auto p-4 my-4 bg-white rounded-lg shadow-md text-center">
         <h2 className="text-xl font-bold text-green-600 mb-2">Thank You!</h2>
         <p className="text-gray-700">
           Your response has been submitted successfully.
         </p>
         <p className="mt-2 text-gray-500">You can now close this page.</p>
       </div>
     </div>
   );
  return (
    <div className="max-w-4xl mx-auto p-4 my-4 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-2">{form.title}</h1>
      <p className="text-gray-600 mb-6">{form.description}</p>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Your Name/Identifier
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={submittedBy}
            onChange={(e) => setSubmittedBy(e.target.value)}
            required
          />
        </div>

        {form.questions.map((question, index) => (
          <div key={question._id} className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              {question.questionText}
              {question.isRequired && <span className="text-red-500">*</span>}
            </label>

            {question.questionType === "text" && (
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={responses[index]?.answer || ""}
                onChange={(e) => handleInputChange(index, e.target.value)}
                required={question.isRequired}
              />
            )}

            {question.questionType === "mcq" && (
              <div className="space-y-2">
                {question.options.map((option, i) => (
                  <div key={i} className="flex items-center">
                    <input
                      type="radio"
                      id={`${question._id}-${i}`}
                      name={`question-${index}`}
                      value={option}
                      checked={responses[index]?.answer === option}
                      onChange={() => handleInputChange(index, option)}
                      required={
                        question.isRequired && !responses[index]?.answer
                      }
                      className="mr-2"
                    />
                    <label htmlFor={`${question._id}-${i}`}>{option}</label>
                  </div>
                ))}
              </div>
            )}

            {question.questionType === "yesno" && (
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value="yes"
                    checked={responses[index]?.answer === "yes"}
                    onChange={() => handleInputChange(index, "yes")}
                    required={question.isRequired && !responses[index]?.answer}
                    className="mr-2"
                  />
                  Yes
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value="no"
                    checked={responses[index]?.answer === "no"}
                    onChange={() => handleInputChange(index, "no")}
                    required={question.isRequired && !responses[index]?.answer}
                    className="mr-2"
                  />
                  No
                </label>
              </div>
            )}
          </div>
        ))}

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Submit Form
        </button>
      </form>
    </div>
  );
};

export default FormForUser;

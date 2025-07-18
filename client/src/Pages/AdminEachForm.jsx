import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import axios from "axios";
import { BASE_URL } from "@/utils/url";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const AdminEachForm = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormActive, setIsFormActive] = useState(false); // Separate state for form status

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${BASE_URL}/feedback/${formId}/analytics`,
          {
            withCredentials: true,
          }
        );
        setAnalyticsData(response.data.data);
        setIsFormActive(response.data.data.formDetails.isActive); // Initialize status state
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [formId]);

  const toggleFormStatus = async () => {
    try {
      const newStatus = !isFormActive;
      setIsFormActive(newStatus); // Optimistic update

      const res = await axios.patch(
        `${BASE_URL}/feedback/update-status/${formId}`,
        { isActive: newStatus },
        { withCredentials: true }
      );

      if (res.data?.success) {
        toast.success(res.data?.message);
        // Update the local analytics data to reflect the change
        setAnalyticsData((prev) => ({
          ...prev,
          formDetails: {
            ...prev.formDetails,
            isActive: newStatus,
          },
        }));
      }
    } catch (error) {
      // Revert on error
      setIsFormActive(!isFormActive);
      toast.error(error.response?.data?.message || "Failed to update status");
      console.error(error);
    }
  };

  const handleDeleteForm = async () => {
    try {
      const res = await axios.delete(
        `${BASE_URL}/feedback/delete-feedback/${formId}`,
        { withCredentials: true }
      );
      if (res.data?.success) {
        navigate("/admin/dashboard");
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete form");
    }
  };

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!analyticsData) return <div className="p-4">No data found</div>;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <span className="flex gap-4">
          <Link to="/admin/dashboard">
            <ArrowLeft />
          </Link>
          <h1 className="text-2xl font-bold">
            {analyticsData.formDetails.title}
          </h1>
        </span>

        <div className="flex gap-2">
          <Button variant="outline" onClick={toggleFormStatus}>
            {isFormActive ? "Deactivate" : "Activate"}
          </Button>
          <Button variant="destructive" onClick={handleDeleteForm}>
            Delete Form
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <p className="text-gray-600 mb-2">
          {analyticsData.formDetails.description}
        </p>
        <div className="flex gap-4 text-sm text-gray-500">
          <span>
            Status:{" "}
            <span className={isFormActive ? "text-green-500 font-semibold" : "text-red-500 font-semibold"}>
              {isFormActive ? "Active" : "Inactive"}
            </span>
          </span>
          <span>Responses: {analyticsData.formDetails.totalResponses}</span>
          <span>
            Expires:{" "}
            {new Date(analyticsData.formDetails.expiresAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {analyticsData.analytics.map((question, index) => (
          <div key={index} className="border rounded-lg p-4 shadow-sm">
            <h3 className="font-medium mb-4">{question.questionText}</h3>

            {question.questionType === "mcq" && (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={question.options.map((opt) => ({
                    name: opt.option,
                    value: opt.percentage,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            )}

            {question.questionType === "yesno" && (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: "Yes",
                        value:
                          question.options.find((o) => o.option === "Yes")
                            ?.percentage || 0,
                      },
                      {
                        name: "No",
                        value:
                          question.options.find((o) => o.option === "No")
                            ?.percentage || 0,
                      },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    <Cell fill="#00C49F" />
                    <Cell fill="#FF8042" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}

            <div className="mt-2 text-sm text-gray-500">
              Response rate: {question.responseRate}%
            </div>
          </div>
        ))}
      </div>

      {/* Responses Section with Accordion */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          All Responses ({analyticsData.allResponses.length})
        </h2>
        {analyticsData.allResponses.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {analyticsData.allResponses.map((response, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex justify-between w-full pr-4">
                    <span className="font-medium">
                      Response #{idx + 1} - {response.submittedBy}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(response.submittedAt).toLocaleString()}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 p-2">
                    {response.answers.map((answer, ansIdx) => (
                      <div key={ansIdx} className="text-sm">
                        <p className="font-medium">{answer.questionText}</p>
                        <p className="text-gray-600 mt-1 pl-4">
                          {answer.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-8 text-gray-500 border rounded-lg">
            No responses yet
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEachForm;

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
import { ArrowLeft, Copy } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const exportResponsesToExcel = (allResponses, title) => {
  if (!allResponses || allResponses.length === 0) return;

  const questionHeaders = allResponses[0].answers.map((q) => q.questionText);

  const headers = ["Submitted By", "Submitted At", ...questionHeaders];

  // Prepare rows
  const dataRows = allResponses.map((response) => {
    const base = [
      response.submittedBy,
      new Date(response.submittedAt).toLocaleString(),
    ];

    const answers = questionHeaders.map((question) => {
      const found = response.answers.find((a) => a.questionText === question);
      return found ? found.answer : "";
    });

    return [...base, ...answers];
  });

  const worksheetData = [headers, ...dataRows];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Responses");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const fileBlob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(fileBlob, `${title}_Form_Responses.xlsx`);
};

const AdminEachForm = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormActive, setIsFormActive] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const totalResponses = analyticsData?.allResponses.length;
  const limitPerPage = 5;
  const NoOfPages = Math.ceil(totalResponses / limitPerPage);
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
        console.log(response.data.data);
        setAnalyticsData(response.data.data);
        setIsFormActive(response.data.data.formDetails.isActive); 
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

        setAnalyticsData((prev) => ({
          ...prev,
          formDetails: {
            ...prev.formDetails,
            isActive: newStatus,
          },
        }));
      }
    } catch (error) {
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
 const publicUrl = `https://feedbackly-sooty.vercel.app/form/${formId}`;

 const copyToClipboard = () => {
   navigator.clipboard.writeText(publicUrl);
   toast.success("Public link copied to clipboard!");
 };
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
          <Button variant="outline" onClick={copyToClipboard}>
            <Copy className="mr-2 h-4 w-4" />
            Share Form
          </Button>
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
            <span
              className={
                isFormActive
                  ? "text-green-500 font-semibold"
                  : "text-red-500 font-semibold"
              }
            >
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
        <div className="flex justify-between ">
          <h2 className="text-xl font-semibold mb-4">
            All Responses ({analyticsData.allResponses.length})
          </h2>
          {analyticsData?.allResponses && (
            <Button
              onClick={() => {
                exportResponsesToExcel(
                  analyticsData?.allResponses,
                  analyticsData.formDetails.title
                );
              }}
            >
              Download Xlsx
            </Button>
          )}
        </div>

        {analyticsData.allResponses.length > 0 ? (
          <>
            {" "}
            <Accordion type="single" collapsible className="w-full">
              {analyticsData.allResponses
                .slice(
                  (currentPage - 1) * limitPerPage,
                  currentPage * limitPerPage
                )

                .map((response, idx) => (
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
            <div className="flex items-center justify-center gap-4 mt-4">
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                variant="outline"
              >
                {"<"}
              </Button>

              <p>
                Page {currentPage} of {NoOfPages}
              </p>

              <Button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, NoOfPages))
                }
                disabled={currentPage === NoOfPages}
                variant="outline"
              >
                {">"}
              </Button>
            </div>
          </>
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

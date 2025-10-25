import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Loader2,
  User,
  BookOpen,
  Calendar,
  Award,
  Users,
  GraduationCap,
  Filter,
  ChevronDown,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import {
  StudentResult,
  StudentResultFormData,
  Student,
  Course,
  Batch,
  Subject,
  StudentMark,
} from "@/types";
import * as XLSX from "xlsx";

// Bulk creation interfaces
interface BulkStudentResultData {
  student_name: string;
  course_name: string;
  batch_name: string;
  register_number: string;
  certificate_number: string;
  result?: string;
  marks: Array<{
    subject_name: string;
    te_obtained?: number;
    ce_obtained?: number;
    pe_obtained?: number;
    pw_obtained?: number;
  }>;
  is_published: boolean;
  published_date?: string;
  // Resolved IDs
  student_id?: number;
  course_id?: number;
  batch_id?: number;
  subject_ids?: Record<string, number>;
}

interface BulkStudentResultValidation {
  row: number;
  data: BulkStudentResultData;
  errors: string[];
  isValid: boolean;
}

interface BulkCreationResult {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    registerNumber: string;
    error: string;
  }>;
}

const StudentResults: React.FC = () => {
  const [studentResults, setStudentResults] = useState<StudentResult[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredResults, setFilteredResults] = useState<StudentResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedResult, setSelectedResult] = useState<string>("all");
  const [selectedPublished, setSelectedPublished] = useState<string>("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<StudentResult | null>(
    null
  );
  const [resultToDelete, setResultToDelete] = useState<StudentResult | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState<StudentResultFormData>({
    student: 0,
    course: 0,
    batch: 0,
    register_number: "",
    certificate_number: "",
    result: "",
    marks: [],
    is_published: false,
    published_date: new Date().toISOString().split("T")[0],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Bulk creation states
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [bulkData, setBulkData] = useState<BulkStudentResultData[]>([]);
  const [bulkValidations, setBulkValidations] = useState<
    BulkStudentResultValidation[]
  >([]);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkResult, setBulkResult] = useState<BulkCreationResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Bulk update states
  const [isBulkUpdateDialogOpen, setIsBulkUpdateDialogOpen] = useState(false);
  const [selectedResultsForExport, setSelectedResultsForExport] = useState<
    Set<number>
  >(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [isBulkUpdateMode, setIsBulkUpdateMode] = useState(false);

  // Separate bulk update states
  const [isBulkUpdateImportDialogOpen, setIsBulkUpdateImportDialogOpen] =
    useState(false);
  const [bulkUpdateData, setBulkUpdateData] = useState<BulkStudentResultData[]>(
    []
  );
  const [bulkUpdateValidations, setBulkUpdateValidations] = useState<
    BulkStudentResultValidation[]
  >([]);
  const [isProcessingBulkUpdate, setIsProcessingBulkUpdate] = useState(false);
  const [bulkUpdateProgress, setBulkUpdateProgress] = useState(0);
  const [bulkUpdateResult, setBulkUpdateResult] =
    useState<BulkCreationResult | null>(null);

  // Bulk delete states
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [selectedResultsForDelete, setSelectedResultsForDelete] = useState<
    Set<number>
  >(new Set());
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const [bulkDeleteProgress, setBulkDeleteProgress] = useState(0);
  const [bulkDeleteResult, setBulkDeleteResult] = useState<{
    success: number;
    failed: number;
    errors: Array<{ row: number; registerNumber: string; error: string }>;
  } | null>(null);

  const { toast } = useToast();

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [
        resultsResponse,
        studentsResponse,
        coursesResponse,
        batchesResponse,
      ] = await Promise.all([
        api.get("/api/students/student-results/"),
        api.get("/api/students/students/"),
        api.get("/api/course/list/"),
        api.get("/api/students/batches/"),
      ]);

      const resultsData = resultsResponse.data;
      const studentsData = studentsResponse.data;
      const coursesData = coursesResponse.data;
      const batchesData = batchesResponse.data;

      // Enrich results with names
      const enrichedResults = resultsData.map((result: any) => ({
        ...result,
        student_name:
          studentsData.find((s: Student) => s.id === result.student)?.name ||
          "Unknown Student",
        course_name:
          coursesData.find((c: Course) => c.id === result.course)?.name ||
          "Unknown Course",
        batch_name:
          batchesData.find((b: Batch) => b.id === result.batch)?.name ||
          "Unknown Batch",
      }));

      setStudentResults(enrichedResults);
      setFilteredResults(enrichedResults);
      setStudents(studentsData);
      setCourses(coursesData);
      setBatches(batchesData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch student results and related data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch subjects for a course
  const fetchSubjects = async (courseId: number) => {
    try {
      const response = await api.get(`/api/course/subjects/${courseId}/`);
      setSubjects(response.data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setSubjects([]);
    }
  };

  // Filter results based on search query and filters
  const filterResults = () => {
    let filtered = [...studentResults];

    // Apply search query filter
    if (searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase();
      filtered = filtered.filter((result) => {
        const studentMatch = result.student_name
          ?.toLowerCase()
          .includes(searchTerm);
        const courseMatch = result.course_name
          ?.toLowerCase()
          .includes(searchTerm);
        const batchMatch = result.batch_name
          ?.toLowerCase()
          .includes(searchTerm);
        const registerMatch = result.register_number
          .toLowerCase()
          .includes(searchTerm);
        const certificateMatch = result.certificate_number
          .toLowerCase()
          .includes(searchTerm);

        return (
          studentMatch ||
          courseMatch ||
          batchMatch ||
          registerMatch ||
          certificateMatch
        );
      });
    }

    // Apply batch filter
    if (selectedBatch !== "all") {
      filtered = filtered.filter(
        (result) => result.batch === parseInt(selectedBatch)
      );
    }

    // Apply course filter
    if (selectedCourse !== "all") {
      filtered = filtered.filter(
        (result) => result.course === parseInt(selectedCourse)
      );
    }

    // Apply result filter
    if (selectedResult !== "all") {
      if (selectedResult === "pass") {
        filtered = filtered.filter(
          (result) => result.result?.toLowerCase() === "pass"
        );
      } else if (selectedResult === "fail") {
        filtered = filtered.filter(
          (result) => result.result?.toLowerCase() === "fail"
        );
      } else if (selectedResult === "distinction") {
        filtered = filtered.filter(
          (result) => result.result?.toLowerCase() === "distinction"
        );
      } else if (selectedResult === "no_result") {
        filtered = filtered.filter(
          (result) => !result.result || result.result.trim() === ""
        );
      }
    }

    // Apply published filter
    if (selectedPublished !== "all") {
      if (selectedPublished === "published") {
        filtered = filtered.filter((result) => result.is_published === true);
      } else if (selectedPublished === "unpublished") {
        filtered = filtered.filter((result) => result.is_published === false);
      }
    }

    setFilteredResults(filtered);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  // Handle filter changes
  const handleFilterChange = () => {
    filterResults();
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedBatch("all");
    setSelectedCourse("all");
    setSelectedResult("all");
    setSelectedPublished("all");
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Apply filters whenever any filter value changes
  useEffect(() => {
    filterResults();
    setCurrentPage(1); // Reset to first page when filters change
  }, [
    searchQuery,
    selectedBatch,
    selectedCourse,
    selectedResult,
    selectedPublished,
    studentResults,
  ]);

  // Pagination logic
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedResults = filteredResults.slice(startIndex, endIndex);

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      student: 0,
      course: 0,
      batch: 0,
      register_number: "",
      certificate_number: "",
      result: "",
      marks: [],
      is_published: false,
      published_date: new Date().toISOString().split("T")[0],
    });
    setErrors({});
    setEditingResult(null);
    setSubjects([]);
  };

  // Open dialog for create/edit
  const openDialog = (result?: StudentResult) => {
    if (result) {
      setEditingResult(result);
      setFormData({
        student: result.student,
        course: result.course,
        batch: result.batch,
        register_number: result.register_number,
        certificate_number: result.certificate_number,
        result: result.result || "",
        marks: result.marks || [],
        is_published: result.is_published || false,
        published_date:
          result.published_date || new Date().toISOString().split("T")[0],
      });
      fetchSubjects(result.course);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  // Handle course change
  const handleCourseChange = (courseId: number) => {
    setFormData({ ...formData, course: courseId, batch: 0, marks: [] });
    fetchSubjects(courseId);
  };

  // Add mark for a subject
  const addMark = (subjectId: number, subjectName: string) => {
    const existingMark = formData.marks.find(
      (mark) => mark.subject === subjectId
    );
    if (!existingMark) {
      const newMark: StudentMark = {
        subject: subjectId,
        subject_name: subjectName,
        te_obtained: null,
        ce_obtained: null,
        pe_obtained: null,
        pw_obtained: null,
      };
      setFormData({
        ...formData,
        marks: [...formData.marks, newMark],
      });
    }
  };

  // Update mark
  const updateMark = (
    subjectId: number,
    field: keyof StudentMark,
    value: number | null
  ) => {
    // Ensure value is not negative
    const validatedValue = value !== null && value < 0 ? 0 : value;

    const updatedMarks = formData.marks.map((mark) =>
      mark.subject === subjectId ? { ...mark, [field]: validatedValue } : mark
    );
    setFormData({ ...formData, marks: updatedMarks });
  };

  // Remove mark
  const removeMark = (subjectId: number) => {
    const updatedMarks = formData.marks.filter(
      (mark) => mark.subject !== subjectId
    );
    setFormData({ ...formData, marks: updatedMarks });
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.student || formData.student === 0) {
      newErrors.student = "Student is required";
    }

    if (!formData.course || formData.course === 0) {
      newErrors.course = "Course is required";
    }

    if (!formData.batch || formData.batch === 0) {
      newErrors.batch = "Batch is required";
    }

    if (!formData.register_number.trim()) {
      newErrors.register_number = "Register number is required";
    }

    if (!formData.certificate_number.trim()) {
      newErrors.certificate_number = "Certificate number is required";
    }

    // Check for duplicate course results (only for new results, not updates)
    if (!editingResult && formData.student && formData.course) {
      const existingResult = studentResults.find(
        (result) =>
          result.student === formData.student &&
          result.course === formData.course
      );
      if (existingResult) {
        const studentName =
          students.find((s) => s.id === formData.student)?.name || "Unknown";
        const courseName =
          courses.find((c) => c.id === formData.course)?.name || "Unknown";
        newErrors.course = `${studentName} already has a result for ${courseName}. A student can only have one result per course.`;
      }
    }

    // Validate marks
    if (formData.marks.length === 0) {
      newErrors.marks = "At least one subject mark is required";
    } else {
      // Validate each mark
      formData.marks.forEach((mark, index) => {
        const hasTheory =
          mark.te_obtained !== null || mark.ce_obtained !== null;
        const hasPractical =
          mark.pe_obtained !== null || mark.pw_obtained !== null;

        if (!hasTheory && !hasPractical) {
          newErrors[`marks_${index}`] =
            "At least one mark (TE, CE, PE, or PW) is required";
        }

        if (hasTheory && hasPractical) {
          newErrors[`marks_${index}`] =
            "Cannot mix theory marks (TE/CE) with practical marks (PE/PW)";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        student: formData.student,
        course: formData.course,
        batch: formData.batch,
        register_number: formData.register_number,
        certificate_number: formData.certificate_number,
        result: formData.result || null,
        marks: formData.marks.map((mark) => ({
          subject: mark.subject,
          te_obtained: mark.te_obtained,
          ce_obtained: mark.ce_obtained,
          pe_obtained: mark.pe_obtained,
          pw_obtained: mark.pw_obtained,
        })),
        is_published: formData.is_published || false,
        published_date: formData.published_date || null,
      };

      if (editingResult) {
        await api.put(
          `/api/students/student-results/update/${editingResult.id}/`,
          payload
        );
        toast({
          title: "Success",
          description: "Student result updated successfully",
        });
      } else {
        await api.post("/api/students/student-results/create/", payload);
        toast({
          title: "Success",
          description: "Student result created successfully",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error("Error saving student result:", error);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          error.response?.data?.detail ||
          "Failed to save student result",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete result
  const handleDelete = async () => {
    if (!resultToDelete) return;

    try {
      setIsDeleting(true);
      await api.delete(
        `/api/students/student-results/delete/${resultToDelete.id}/`
      );
      toast({
        title: "Success",
        description: "Student result deleted successfully",
      });
      setResultToDelete(null);
      setIsDeleteDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Error deleting student result:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete student result",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Open delete confirmation
  const openDeleteConfirmation = (result: StudentResult) => {
    setResultToDelete(result);
    setIsDeleteDialogOpen(true);
  };

  // Bulk creation functions
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    const reader = new FileReader();

    // Check file type and set appropriate reading method
    if (file.name.toLowerCase().endsWith(".csv")) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }

    reader.onload = async (e) => {
      try {
        let jsonData: any[][];

        // Check file type and parse accordingly
        if (file.name.toLowerCase().endsWith(".csv")) {
          // Parse CSV file
          const csvText = e.target?.result as string;
          const lines = csvText.split("\n");
          jsonData = lines.map((line) => {
            // Simple CSV parsing - handles quoted fields
            const result = [];
            let current = "";
            let inQuotes = false;

            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === "," && !inQuotes) {
                result.push(current.trim());
                current = "";
              } else {
                current += char;
              }
            }
            result.push(current.trim());
            return result;
          });
        } else {
          // Parse Excel file
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        }

        // Skip header row and process data
        const resultData: BulkStudentResultData[] = jsonData
          .slice(1)
          .map((row: any[], index: number) => {
            // Parse marks from the row (assuming marks are in columns after the basic info)
            const marks: Array<{
              subject_name: string;
              te_obtained?: number;
              ce_obtained?: number;
              pe_obtained?: number;
              pw_obtained?: number;
            }> = [];

            // Parse marks - new format: Subject 1, Type 1, TE Obtained 1, CE Obtained 1, PE Obtained 1, PW Obtained 1, Subject 2, Type 2, ...
            // Each subject group takes 6 columns: Subject Name, Type, TE Obtained, CE Obtained, PE Obtained, PW Obtained
            // Start from column 8 (index 8) since we added is_published at column 6 and published_date at column 7
            for (let i = 8; i < row.length; i += 6) {
              if (row[i] && row[i].toString().trim()) {
                const subjectName = row[i].toString().trim();
                const subjectType = row[i + 1]?.toString().trim().toLowerCase();

                // Create mark object with all possible fields
                const mark = {
                  subject_name: subjectName,
                  te_obtained: row[i + 2]
                    ? parseInt(row[i + 2].toString())
                    : null,
                  ce_obtained: row[i + 3]
                    ? parseInt(row[i + 3].toString())
                    : null,
                  pe_obtained: row[i + 4]
                    ? parseInt(row[i + 4].toString())
                    : null,
                  pw_obtained: row[i + 5]
                    ? parseInt(row[i + 5].toString())
                    : null,
                };

                // Only add if at least one mark is provided
                const hasAnyMark =
                  mark.te_obtained !== null ||
                  mark.ce_obtained !== null ||
                  mark.pe_obtained !== null ||
                  mark.pw_obtained !== null;

                if (hasAnyMark) {
                  marks.push(mark);
                }
              }
            }

            return {
              student_name: row[0]?.toString() || "",
              course_name: row[1]?.toString() || "",
              batch_name: row[2]?.toString() || "",
              register_number: row[3]?.toString() || "",
              certificate_number: row[4]?.toString() || "",
              result: row[5]?.toString() || "",
              is_published:
                row[6]?.toString().toLowerCase() === "true" || false,
              published_date:
                row[7]?.toString() || new Date().toISOString().split("T")[0],
              marks,
            };
          });

        setBulkData(resultData);
        await validateBulkData(resultData);
      } catch (error) {
        console.error("Error parsing file:", error);
        toast({
          title: "Error",
          description:
            "Failed to parse file. Please check the format and ensure it's a valid Excel or CSV file.",
          variant: "destructive",
        });
      }
    };
  };

  const validateBulkData = async (data: BulkStudentResultData[]) => {
    const validations: BulkStudentResultValidation[] = await Promise.all(
      data.map(async (result, index) => {
        const errors: string[] = [];
        const row = index + 2; // +2 because we skip header and arrays are 0-indexed

        // Validate student name
        if (!result.student_name.trim()) {
          errors.push("Student name is required");
        } else {
          const student = students.find(
            (s) => s.name.toLowerCase() === result.student_name.toLowerCase()
          );
          if (!student) {
            errors.push(`Student "${result.student_name}" not found`);
          } else {
            result.student_id = student.id;
          }
        }

        // Validate course name
        if (!result.course_name.trim()) {
          errors.push("Course name is required");
        } else {
          const course = courses.find(
            (c) => c.name.toLowerCase() === result.course_name.toLowerCase()
          );
          if (!course) {
            errors.push(`Course "${result.course_name}" not found`);
          } else {
            result.course_id = course.id;
          }
        }

        // Validate batch name
        if (!result.batch_name.trim()) {
          errors.push("Batch name is required");
        } else {
          const batch = batches.find(
            (b) => b.name.toLowerCase() === result.batch_name.toLowerCase()
          );
          if (!batch) {
            errors.push(`Batch "${result.batch_name}" not found`);
          } else {
            // Check if batch belongs to the course
            if (result.course_id && batch.course !== result.course_id) {
              errors.push(
                `Batch "${result.batch_name}" does not belong to course "${result.course_name}"`
              );
            } else {
              result.batch_id = batch.id;
            }
          }
        }

        // Validate register number
        if (!result.register_number.trim()) {
          errors.push("Register number is required");
        }

        // Validate certificate number
        if (!result.certificate_number.trim()) {
          errors.push("Certificate number is required");
        }

        // Check for duplicate course results
        if (result.student_id && result.course_id) {
          const existingResult = studentResults.find(
            (existing) =>
              existing.student === result.student_id &&
              existing.course === result.course_id
          );
          if (existingResult) {
            errors.push(
              `Student "${result.student_name}" already has a result for course "${result.course_name}". A student can only have one result per course.`
            );
          }
        }

        // Validate marks and resolve subject IDs
        if (result.marks && result.marks.length > 0 && result.course_id) {
          try {
            const response = await api.get(
              `/api/course/subjects/${result.course_id}/`
            );
            const courseSubjects = response.data;

            for (const mark of result.marks) {
              if (!mark.subject_name.trim()) {
                errors.push("Subject name is required for marks");
              } else {
                const subject = courseSubjects.find(
                  (s: any) =>
                    s.name.toLowerCase() === mark.subject_name.toLowerCase()
                );
                if (!subject) {
                  errors.push(
                    `Subject "${mark.subject_name}" not found for course "${result.course_name}"`
                  );
                } else {
                  // Validate mark fields based on subject type
                  const hasTheory =
                    mark.te_obtained !== null || mark.ce_obtained !== null;
                  const hasPractical =
                    mark.pe_obtained !== null || mark.pw_obtained !== null;

                  if (!hasTheory && !hasPractical) {
                    errors.push(
                      `At least one mark is required for subject "${mark.subject_name}"`
                    );
                  }

                  if (hasTheory && hasPractical) {
                    errors.push(
                      `Cannot mix theory and practical marks for subject "${mark.subject_name}"`
                    );
                  }

                  // Store subject ID for later use
                  if (!result.subject_ids) {
                    result.subject_ids = {};
                  }
                  result.subject_ids[mark.subject_name] = subject.id;
                }
              }
            }
          } catch (error) {
            errors.push(
              `Failed to fetch subjects for course "${result.course_name}"`
            );
          }
        } else if (result.course_id) {
          errors.push("At least one subject mark is required");
        }

        // Check for duplicate register numbers
        const duplicateRegisterIndex = data.findIndex(
          (r, i) =>
            i !== index &&
            r.register_number.toLowerCase() ===
              result.register_number.toLowerCase()
        );
        if (duplicateRegisterIndex !== -1) {
          errors.push(
            `Duplicate register number found in row ${
              duplicateRegisterIndex + 2
            }`
          );
        }

        // Check for duplicate course results within the bulk data
        const duplicateCourseIndex = data.findIndex(
          (r, i) =>
            i !== index &&
            r.student_id === result.student_id &&
            r.course_id === result.course_id
        );
        if (duplicateCourseIndex !== -1) {
          errors.push(
            `Duplicate course result found in row ${
              duplicateCourseIndex + 2
            }. Student "${
              result.student_name
            }" already has a result for course "${
              result.course_name
            }" in this import.`
          );
        }

        return {
          row,
          data: result,
          errors,
          isValid: errors.length === 0,
        };
      })
    );

    setBulkValidations(validations);
  };

  // Separate validation for bulk updates (doesn't check for duplicate course results)
  const validateBulkUpdateData = async (data: BulkStudentResultData[]) => {
    const validations: BulkStudentResultValidation[] = await Promise.all(
      data.map(async (result, index) => {
        const errors: string[] = [];
        const row = index + 2; // +2 because we skip header and arrays are 0-indexed

        // Validate student name
        if (!result.student_name.trim()) {
          errors.push("Student name is required");
        } else {
          const student = students.find(
            (s) => s.name.toLowerCase() === result.student_name.toLowerCase()
          );
          if (!student) {
            errors.push(`Student "${result.student_name}" not found`);
          } else {
            result.student_id = student.id;
          }
        }

        // Validate course name
        if (!result.course_name.trim()) {
          errors.push("Course name is required");
        } else {
          const course = courses.find(
            (c) => c.name.toLowerCase() === result.course_name.toLowerCase()
          );
          if (!course) {
            errors.push(`Course "${result.course_name}" not found`);
          } else {
            result.course_id = course.id;
          }
        }

        // Validate batch name
        if (!result.batch_name.trim()) {
          errors.push("Batch name is required");
        } else {
          const batch = batches.find(
            (b) => b.name.toLowerCase() === result.batch_name.toLowerCase()
          );
          if (!batch) {
            errors.push(`Batch "${result.batch_name}" not found`);
          } else {
            // Check if batch belongs to the course
            if (result.course_id && batch.course !== result.course_id) {
              errors.push(
                `Batch "${result.batch_name}" does not belong to course "${result.course_name}"`
              );
            } else {
              result.batch_id = batch.id;
            }
          }
        }

        // Validate register number
        if (!result.register_number.trim()) {
          errors.push("Register number is required");
        }

        // Validate certificate number
        if (!result.certificate_number.trim()) {
          errors.push("Certificate number is required");
        }

        // For updates, we need to check if the result exists
        if (result.register_number.trim()) {
          const existingResult = studentResults.find(
            (existing) =>
              existing.register_number.toLowerCase() ===
              result.register_number.toLowerCase()
          );
          if (!existingResult) {
            errors.push(
              `No existing result found with register number "${result.register_number}". Please ensure this is an update of an existing result.`
            );
          }
        }

        // Validate marks and resolve subject IDs
        if (result.marks && result.marks.length > 0 && result.course_id) {
          try {
            const response = await api.get(
              `/api/course/subjects/${result.course_id}/`
            );
            const courseSubjects = response.data;

            for (const mark of result.marks) {
              if (!mark.subject_name.trim()) {
                errors.push("Subject name is required for marks");
              } else {
                const subject = courseSubjects.find(
                  (s: any) =>
                    s.name.toLowerCase() === mark.subject_name.toLowerCase()
                );
                if (!subject) {
                  errors.push(
                    `Subject "${mark.subject_name}" not found for course "${result.course_name}"`
                  );
                } else {
                  // Validate mark fields based on subject type
                  const hasTheory =
                    mark.te_obtained !== null || mark.ce_obtained !== null;
                  const hasPractical =
                    mark.pe_obtained !== null || mark.pw_obtained !== null;

                  if (!hasTheory && !hasPractical) {
                    errors.push(
                      `At least one mark is required for subject "${mark.subject_name}"`
                    );
                  }

                  if (hasTheory && hasPractical) {
                    errors.push(
                      `Cannot mix theory and practical marks for subject "${mark.subject_name}"`
                    );
                  }

                  // Store subject ID for later use
                  if (!result.subject_ids) {
                    result.subject_ids = {};
                  }
                  result.subject_ids[mark.subject_name] = subject.id;
                }
              }
            }
          } catch (error) {
            errors.push(
              `Failed to fetch subjects for course "${result.course_name}"`
            );
          }
        } else if (result.course_id) {
          errors.push("At least one subject mark is required");
        }

        // Check for duplicate register numbers within the bulk data
        const duplicateRegisterIndex = data.findIndex(
          (r, i) =>
            i !== index &&
            r.register_number.toLowerCase() ===
              result.register_number.toLowerCase()
        );
        if (duplicateRegisterIndex !== -1) {
          errors.push(
            `Duplicate register number found in row ${
              duplicateRegisterIndex + 2
            }`
          );
        }

        return {
          row,
          data: result,
          errors,
          isValid: errors.length === 0,
        };
      })
    );

    setBulkUpdateValidations(validations);
  };

  const handleBulkCreate = async () => {
    const validResults = bulkValidations.filter((v) => v.isValid);
    if (validResults.length === 0) {
      toast({
        title: "No valid results",
        description: "Please fix validation errors before creating results.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingBulk(true);
    setBulkProgress(0);
    setBulkResult(null);

    const result: BulkCreationResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (let i = 0; i < validResults.length; i++) {
      const validation = validResults[i];
      const progress = ((i + 1) / validResults.length) * 100;
      setBulkProgress(progress);

      try {
        const payload = {
          student: validation.data.student_id,
          course: validation.data.course_id,
          batch: validation.data.batch_id,
          register_number: validation.data.register_number,
          certificate_number: validation.data.certificate_number,
          result: validation.data.result || null,
          marks: validation.data.marks.map((mark) => ({
            subject: validation.data.subject_ids?.[mark.subject_name] || 0,
            te_obtained: mark.te_obtained,
            ce_obtained: mark.ce_obtained,
            pe_obtained: mark.pe_obtained,
            pw_obtained: mark.pw_obtained,
          })),
          is_published: validation.data.is_published || false,
          published_date:
            validation.data.published_date ||
            new Date().toISOString().split("T")[0],
        };

        await api.post("/api/students/student-results/create/", payload);
        result.success++;
      } catch (error: any) {
        result.failed++;
        result.errors.push({
          row: validation.row,
          registerNumber: validation.data.register_number,
          error: error.response?.data?.message || "Failed to create result",
        });
      }
    }

    setBulkResult(result);
    setIsProcessingBulk(false);

    if (result.success > 0) {
      toast({
        title: "Bulk Creation Complete",
        description: `Successfully created ${result.success} results. ${result.failed} failed.`,
      });
      fetchData();
    }

    if (result.failed > 0) {
      toast({
        title: "Some results failed",
        description: `${result.failed} results could not be created. Check the details below.`,
        variant: "destructive",
      });
    }
  };

  const handleBulkUpdate = async () => {
    const validResults = bulkUpdateValidations.filter((v) => v.isValid);
    if (validResults.length === 0) {
      toast({
        title: "No valid results",
        description: "Please fix validation errors before updating results.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingBulkUpdate(true);
    setBulkUpdateProgress(0);
    setBulkUpdateResult(null);

    const result: BulkCreationResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (let i = 0; i < validResults.length; i++) {
      const validation = validResults[i];
      const progress = ((i + 1) / validResults.length) * 100;
      setBulkUpdateProgress(progress);

      try {
        // Find existing result by register number
        const existingResult = studentResults.find(
          (result) => result.register_number === validation.data.register_number
        );

        if (!existingResult) {
          result.failed++;
          result.errors.push({
            row: validation.row,
            registerNumber: validation.data.register_number,
            error: "Result not found for update",
          });
          continue;
        }

        const payload = {
          student: validation.data.student_id,
          course: validation.data.course_id,
          batch: validation.data.batch_id,
          register_number: validation.data.register_number,
          certificate_number: validation.data.certificate_number,
          result: validation.data.result || null,
          marks: validation.data.marks.map((mark) => ({
            subject: validation.data.subject_ids?.[mark.subject_name] || 0,
            te_obtained: mark.te_obtained,
            ce_obtained: mark.ce_obtained,
            pe_obtained: mark.pe_obtained,
            pw_obtained: mark.pw_obtained,
          })),
          is_published: validation.data.is_published || false,
        };

        await api.put(
          `/api/students/student-results/update/${existingResult.id}/`,
          payload
        );
        result.success++;
      } catch (error: any) {
        result.failed++;
        result.errors.push({
          row: validation.row,
          registerNumber: validation.data.register_number,
          error: error.response?.data?.message || "Failed to update result",
        });
      }
    }

    setBulkUpdateResult(result);
    setIsProcessingBulkUpdate(false);

    if (result.success > 0) {
      toast({
        title: "Bulk Update Complete",
        description: `Successfully updated ${result.success} results. ${result.failed} failed.`,
      });
      fetchData();
    }

    if (result.failed > 0) {
      toast({
        title: "Some results failed",
        description: `${result.failed} results could not be updated. Check the details below.`,
        variant: "destructive",
      });
    }
  };

  // File upload handler for bulk updates
  const handleBulkUpdateFileUpload = async (file: File) => {
    if (!file) return;

    const reader = new FileReader();

    // Check file type and set appropriate reading method
    if (file.name.toLowerCase().endsWith(".csv")) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }

    reader.onload = async (e) => {
      try {
        let jsonData: any[][];

        // Check file type and parse accordingly
        if (file.name.toLowerCase().endsWith(".csv")) {
          // Parse CSV file
          const csvText = e.target?.result as string;
          const lines = csvText.split("\n");
          jsonData = lines.map((line) => {
            // Simple CSV parsing - handles quoted fields
            const result = [];
            let current = "";
            let inQuotes = false;

            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === "," && !inQuotes) {
                result.push(current.trim());
                current = "";
              } else {
                current += char;
              }
            }
            result.push(current.trim());
            return result;
          });
        } else {
          // Parse Excel file
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        }

        // Skip header row and process data
        const resultData: BulkStudentResultData[] = jsonData
          .slice(1)
          .map((row: any[], index: number) => {
            // Parse marks from the row (assuming marks are in columns after the basic info)
            const marks: Array<{
              subject_name: string;
              te_obtained?: number;
              ce_obtained?: number;
              pe_obtained?: number;
              pw_obtained?: number;
            }> = [];

            // Parse marks - new format: Subject 1, Type 1, TE Obtained 1, CE Obtained 1, PE Obtained 1, PW Obtained 1, Subject 2, Type 2, ...
            // Each subject group takes 6 columns: Subject Name, Type, TE Obtained, CE Obtained, PE Obtained, PW Obtained
            // Start from column 8 (index 8) since we added is_published at column 6 and published_date at column 7
            for (let i = 8; i < row.length; i += 6) {
              if (row[i] && row[i].toString().trim()) {
                const subjectName = row[i].toString().trim();
                const subjectType = row[i + 1]?.toString().trim().toLowerCase();

                // Create mark object with all possible fields
                const mark = {
                  subject_name: subjectName,
                  te_obtained: row[i + 2]
                    ? parseInt(row[i + 2].toString())
                    : null,
                  ce_obtained: row[i + 3]
                    ? parseInt(row[i + 3].toString())
                    : null,
                  pe_obtained: row[i + 4]
                    ? parseInt(row[i + 4].toString())
                    : null,
                  pw_obtained: row[i + 5]
                    ? parseInt(row[i + 5].toString())
                    : null,
                };

                // Only add if at least one mark is provided
                const hasAnyMark =
                  mark.te_obtained !== null ||
                  mark.ce_obtained !== null ||
                  mark.pe_obtained !== null ||
                  mark.pw_obtained !== null;

                if (hasAnyMark) {
                  marks.push(mark);
                }
              }
            }

            return {
              student_name: row[0]?.toString() || "",
              course_name: row[1]?.toString() || "",
              batch_name: row[2]?.toString() || "",
              register_number: row[3]?.toString() || "",
              certificate_number: row[4]?.toString() || "",
              result: row[5]?.toString() || "",
              is_published:
                row[6]?.toString().toLowerCase() === "true" || false,
              marks,
            };
          });

        setBulkUpdateData(resultData);
        await validateBulkUpdateData(resultData);
      } catch (error) {
        console.error("Error parsing file:", error);
        toast({
          title: "Error",
          description:
            "Failed to parse file. Please check the format and ensure it's a valid Excel or CSV file.",
          variant: "destructive",
        });
      }
    };
  };

  // Bulk delete functions
  const toggleDeleteSelection = (resultId: number) => {
    setSelectedResultsForDelete((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(resultId)) {
        newSet.delete(resultId);
      } else {
        newSet.add(resultId);
      }
      return newSet;
    });
  };

  const selectAllForDelete = () => {
    setSelectedResultsForDelete(
      new Set(paginatedResults.map((result) => result.id!))
    );
  };

  const clearDeleteSelection = () => {
    setSelectedResultsForDelete(new Set());
  };

  const handleBulkDelete = async () => {
    if (selectedResultsForDelete.size === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one student result to delete.",
        variant: "destructive",
      });
      return;
    }

    setIsDeletingBulk(true);
    setBulkDeleteProgress(0);
    setBulkDeleteResult(null);

    const result = {
      success: 0,
      failed: 0,
      errors: [] as Array<{
        row: number;
        registerNumber: string;
        error: string;
      }>,
    };

    const selectedResults = studentResults.filter((result) =>
      selectedResultsForDelete.has(result.id!)
    );

    for (let i = 0; i < selectedResults.length; i++) {
      const studentResult = selectedResults[i];
      const progress = ((i + 1) / selectedResults.length) * 100;
      setBulkDeleteProgress(progress);

      try {
        await api.delete(
          `/api/students/student-results/delete/${studentResult.id}/`
        );
        result.success++;
      } catch (error: any) {
        result.failed++;
        result.errors.push({
          row: i + 1,
          registerNumber: studentResult.register_number,
          error: error.response?.data?.message || "Failed to delete result",
        });
      }
    }

    setBulkDeleteResult(result);
    setIsDeletingBulk(false);

    if (result.success > 0) {
      toast({
        title: "Bulk Delete Complete",
        description: `Successfully deleted ${result.success} results. ${result.failed} failed.`,
      });
      fetchData();
      setSelectedResultsForDelete(new Set());
    }

    if (result.failed > 0) {
      toast({
        title: "Some results failed",
        description: `${result.failed} results could not be deleted. Check the details below.`,
        variant: "destructive",
      });
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      [
        "Student Name",
        "Course Name",
        "Batch Name",
        "Register Number",
        "Certificate Number",
        "Result",
        "Is Published",
        "Published Date",
        "Subject 1",
        "Type 1",
        "TE Obtained 1",
        "CE Obtained 1",
        "PE Obtained 1",
        "PW Obtained 1",
        "Subject 2",
        "Type 2",
        "TE Obtained 2",
        "CE Obtained 2",
        "PE Obtained 2",
        "PW Obtained 2",
        "Subject 3",
        "Type 3",
        "TE Obtained 3",
        "CE Obtained 3",
        "PE Obtained 3",
        "PW Obtained 3",
      ],
      [
        "John Doe",
        "Computer Science",
        "CS Batch 2024-1",
        "REG001",
        "CERT001",
        "Pass",
        "TRUE",
        "Programming",
        "theory",
        "80",
        "20",
        "",
        "",
        "Database Lab",
        "practical",
        "",
        "",
        "15",
        "5",
        "Data Structures",
        "theory",
        "75",
        "25",
        "",
        "",
      ],
      [
        "",
        "Use exact course name",
        "Use exact batch name",
        "Unique register number",
        "Unique certificate number",
        "Pass/Fail",
        "TRUE or FALSE",
        "Subject name",
        "theory or practical",
        "For theory subjects only",
        "For theory subjects only",
        "For practical subjects only",
        "For practical subjects only",
        "Subject name",
        "theory or practical",
        "For theory subjects only",
        "For theory subjects only",
        "For practical subjects only",
        "For practical subjects only",
        "Subject name",
        "theory or practical",
        "For theory subjects only",
        "For theory subjects only",
        "For practical subjects only",
        "For practical subjects only",
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Student Results");
    XLSX.writeFile(wb, "student_results_template.xlsx");
  };

  const downloadCSVTemplate = () => {
    const templateData = [
      [
        "Student Name",
        "Course Name",
        "Batch Name",
        "Register Number",
        "Certificate Number",
        "Result",
        "Is Published",
        "Published Date",
        "Subject 1",
        "Type 1",
        "TE Obtained 1",
        "CE Obtained 1",
        "PE Obtained 1",
        "PW Obtained 1",
        "Subject 2",
        "Type 2",
        "TE Obtained 2",
        "CE Obtained 2",
        "PE Obtained 2",
        "PW Obtained 2",
        "Subject 3",
        "Type 3",
        "TE Obtained 3",
        "CE Obtained 3",
        "PE Obtained 3",
        "PW Obtained 3",
      ],
      [
        "John Doe",
        "Computer Science",
        "CS Batch 2024-1",
        "REG001",
        "CERT001",
        "Pass",
        "TRUE",
        "Programming",
        "theory",
        "80",
        "20",
        "",
        "",
        "Database Lab",
        "practical",
        "",
        "",
        "15",
        "5",
        "Data Structures",
        "theory",
        "75",
        "25",
        "",
        "",
      ],
      [
        "",
        "Use exact course name",
        "Use exact batch name",
        "Unique register number",
        "Unique certificate number",
        "Pass/Fail",
        "TRUE or FALSE",
        "Subject name",
        "theory or practical",
        "For theory subjects only",
        "For theory subjects only",
        "For practical subjects only",
        "For practical subjects only",
        "Subject name",
        "theory or practical",
        "For theory subjects only",
        "For theory subjects only",
        "For practical subjects only",
        "For practical subjects only",
        "Subject name",
        "theory or practical",
        "For theory subjects only",
        "For theory subjects only",
        "For practical subjects only",
        "For practical subjects only",
      ],
    ];

    // Convert to CSV format
    const csvContent = templateData
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "student_results_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetBulkDialog = () => {
    setBulkData([]);
    setBulkValidations([]);
    setBulkResult(null);
    setBulkProgress(0);
  };

  // Bulk update functions
  const toggleResultSelection = (resultId: number) => {
    setSelectedResultsForExport((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(resultId)) {
        newSet.delete(resultId);
      } else {
        newSet.add(resultId);
      }
      return newSet;
    });
  };

  const selectAllResults = () => {
    setSelectedResultsForExport(
      new Set(paginatedResults.map((result) => result.id!))
    );
  };

  const clearSelection = () => {
    setSelectedResultsForExport(new Set());
  };

  const exportSelectedToExcel = async () => {
    if (selectedResultsForExport.size === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one student result to export.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      const selectedResults = studentResults.filter((result) =>
        selectedResultsForExport.has(result.id!)
      );

      // Create Excel data using the same template structure as bulk import
      const excelData = [
        [
          "Student Name",
          "Course Name",
          "Batch Name",
          "Register Number",
          "Certificate Number",
          "Result",
          "Is Published",
          "Subject 1",
          "Type 1",
          "TE Obtained 1",
          "CE Obtained 1",
          "PE Obtained 1",
          "PW Obtained 1",
          "Subject 2",
          "Type 2",
          "TE Obtained 2",
          "CE Obtained 2",
          "PE Obtained 2",
          "PW Obtained 2",
          "Subject 3",
          "Type 3",
          "TE Obtained 3",
          "CE Obtained 3",
          "PE Obtained 3",
          "PW Obtained 3",
        ],
      ];

      // Add data rows
      selectedResults.forEach((result) => {
        const row = [
          result.student_name,
          result.course_name,
          result.batch_name,
          result.register_number,
          result.certificate_number,
          result.result || "",
          result.is_published ? "TRUE" : "FALSE",
        ];

        // Add marks data
        if (result.marks && result.marks.length > 0) {
          result.marks.forEach((mark, index) => {
            if (index < 3) {
              // Limit to 3 subjects max
              const subjectType =
                mark.te_obtained !== null || mark.ce_obtained !== null
                  ? "theory"
                  : "practical";
              row.push(
                mark.subject_name || "",
                subjectType,
                mark.te_obtained?.toString() || "",
                mark.ce_obtained?.toString() || "",
                mark.pe_obtained?.toString() || "",
                mark.pw_obtained?.toString() || ""
              );
            }
          });

          // Fill remaining subject columns if less than 3 subjects
          const remainingSubjects = 3 - (result.marks?.length || 0);
          for (let i = 0; i < remainingSubjects; i++) {
            row.push("", "", "", "", "", "");
          }
        } else {
          // No marks - fill with empty values
          for (let i = 0; i < 18; i++) {
            // 3 subjects * 6 columns each
            row.push("");
          }
        }

        excelData.push(row);
      });

      // Create and download Excel file
      const ws = XLSX.utils.aoa_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Student Results");
      XLSX.writeFile(
        wb,
        `student_results_export_${new Date().toISOString().split("T")[0]}.xlsx`
      );

      toast({
        title: "Export Successful",
        description: `Exported ${selectedResultsForExport.size} student results to Excel file.`,
      });

      setIsBulkUpdateDialogOpen(false);
      setSelectedResultsForExport(new Set());
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export student results to Excel file.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Student Results Management
            </h1>
            <p className="text-muted-foreground">
              Manage student results and their marks
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              onClick={() => openDialog()}
              className="gap-2 flex-1 sm:flex-none"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Result</span>
            </Button>
            <Button
              onClick={() => {
                resetBulkDialog();
                setIsBulkDialogOpen(true);
              }}
              variant="outline"
              className="gap-2 flex-1 sm:flex-none"
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Bulk Import</span>
            </Button>
            <Button
              onClick={() => setIsBulkUpdateDialogOpen(true)}
              variant="outline"
              className="gap-2 flex-1 sm:flex-none"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span className="hidden sm:inline">Convert to Excel</span>
            </Button>
            <Button
              onClick={() => setIsBulkDeleteDialogOpen(true)}
              variant="outline"
              className="gap-2 flex-1 sm:flex-none text-red-600 border-red-300 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Bulk Delete</span>
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search results by student, course, batch, register number..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 pr-10 w-full"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="text-sm text-muted-foreground whitespace-nowrap">
              {filteredResults.length} of {studentResults.length} results
            </div>
          </div>

          {/* Filter Options */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id!.toString()}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedBatch} onValueChange={setSelectedBatch}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Batches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Batches</SelectItem>
                {batches.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id!.toString()}>
                    {batch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedResult} onValueChange={setSelectedResult}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Results" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="pass">Pass</SelectItem>
                <SelectItem value="fail">Fail</SelectItem>
                <SelectItem value="distinction">Distinction</SelectItem>
                <SelectItem value="no_result">No Result</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedPublished}
              onValueChange={setSelectedPublished}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="unpublished">Unpublished</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Clear All
            </Button>
          </div>
        </div>

        {/* Results Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Register No.</TableHead>
                <TableHead>Certificate No.</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedResults.map((result) => (
                <TableRow key={result.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {/* <User className="h-4 w-4 text-muted-foreground" /> */}
                      {result.student_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {/* <BookOpen className="h-4 w-4 text-muted-foreground" /> */}
                      {result.course_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {/* <Users className="h-4 w-4 text-muted-foreground" /> */}
                      {result.batch_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {/* <Award className="h-4 w-4 text-muted-foreground" /> */}
                      {result.register_number}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {/* <GraduationCap className="h-4 w-4 text-muted-foreground" /> */}
                      {result.certificate_number}
                    </div>
                  </TableCell>
                  <TableCell>
                    {result.result ? (
                      <Badge
                        variant={
                          result.result.toLowerCase() === "pass"
                            ? "default"
                            : result.result.toLowerCase() === "distinction"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {result.result}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        No result
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {result.is_published ? (
                        <Badge
                          variant="outline"
                          className="text-green-600 border-green-600"
                        >
                          Published
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-orange-600 border-orange-600"
                        >
                          Unpublished
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {result.marks?.length || 0}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openDialog(result)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteConfirmation(result)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {filteredResults.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredResults.length)} of{" "}
              {filteredResults.length} results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    // Show first page, last page, current page, and pages around current page
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="text-muted-foreground">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {filteredResults.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            {searchQuery ||
            selectedBatch !== "all" ||
            selectedCourse !== "all" ||
            selectedResult !== "all" ||
            selectedPublished !== "all" ? (
              <>
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground mb-4">
                  No results match your current filters
                </p>
                <Button onClick={clearAllFilters} variant="outline">
                  Clear All Filters
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by creating your first student result
                </p>
                <Button onClick={() => openDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Result
                </Button>
              </>
            )}
          </div>
        )}

        {/* Student Result Form Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingResult
                  ? "Edit Student Result"
                  : "Create New Student Result"}
              </DialogTitle>
              <DialogDescription>
                {editingResult
                  ? "Update student result details and marks"
                  : "Add a new student result with marks"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="student">Student *</Label>
                  <Select
                    value={formData.student.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, student: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem
                          key={student.id}
                          value={student.id!.toString()}
                        >
                          {student.name} ({student.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.student && (
                    <p className="text-sm text-destructive">{errors.student}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course">Course *</Label>
                  <Select
                    value={formData.course.toString()}
                    onValueChange={(value) =>
                      handleCourseChange(parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem
                          key={course.id}
                          value={course.id!.toString()}
                        >
                          {course.name} ({course.short_code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.course && (
                    <p className="text-sm text-destructive">{errors.course}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batch">Batch *</Label>
                  <Select
                    value={formData.batch.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, batch: parseInt(value) })
                    }
                    disabled={!formData.course || formData.course === 0}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          !formData.course || formData.course === 0
                            ? "Select a course first"
                            : "Select a batch"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {batches
                        .filter((batch) => batch.course === formData.course)
                        .map((batch) => (
                          <SelectItem
                            key={batch.id}
                            value={batch.id!.toString()}
                          >
                            {batch.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {errors.batch && (
                    <p className="text-sm text-destructive">{errors.batch}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register_number">Register Number *</Label>
                  <Input
                    id="register_number"
                    value={formData.register_number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        register_number: e.target.value,
                      })
                    }
                    placeholder="e.g., REG001"
                  />
                  {errors.register_number && (
                    <p className="text-sm text-destructive">
                      {errors.register_number}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certificate_number">
                    Certificate Number *
                  </Label>
                  <Input
                    id="certificate_number"
                    value={formData.certificate_number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        certificate_number: e.target.value,
                      })
                    }
                    placeholder="e.g., CERT001"
                  />
                  {errors.certificate_number && (
                    <p className="text-sm text-destructive">
                      {errors.certificate_number}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="result">Result</Label>
                  <Select
                    value={formData.result || ""}
                    onValueChange={(value) =>
                      setFormData({ ...formData, result: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select result" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pass">Pass</SelectItem>
                      <SelectItem value="Fail">Fail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_published"
                      checked={formData.is_published}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_published: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <Label
                      htmlFor="is_published"
                      className="text-sm font-medium"
                    >
                      Published
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Check this box to mark the result as published
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="published_date">Published Date</Label>
                  <Input
                    id="published_date"
                    type="date"
                    value={formData.published_date || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        published_date: e.target.value || null,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Select the date when the result was published
                  </p>
                </div>
              </div>

              {/* Marks Section */}
              {subjects.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Marks *</h3>
                    <div className="text-sm text-muted-foreground">
                      Add marks for subjects in{" "}
                      {courses.find((c) => c.id === formData.course)?.name}
                    </div>
                  </div>

                  {errors.marks && (
                    <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                      {errors.marks}
                    </div>
                  )}

                  <div className="grid gap-4">
                    {subjects.map((subject) => {
                      const existingMark = formData.marks.find(
                        (mark) => mark.subject === subject.id
                      );
                      return (
                        <Card key={subject.id} className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-medium">{subject.name}</h4>
                              <div className="text-sm text-muted-foreground">
                                {subject.te_max || subject.ce_max ? (
                                  <>
                                    Theory: TE({subject.te_max || 0}) + CE(
                                    {subject.ce_max || 0})
                                  </>
                                ) : (
                                  <>
                                    Practical: PE({subject.pe_max || 0}) + PW(
                                    {subject.pw_max || 0})
                                  </>
                                )}
                              </div>
                              {errors[
                                `marks_${formData.marks.findIndex(
                                  (m) => m.subject === subject.id
                                )}`
                              ] && (
                                <div className="text-sm text-destructive mt-1">
                                  {
                                    errors[
                                      `marks_${formData.marks.findIndex(
                                        (m) => m.subject === subject.id
                                      )}`
                                    ]
                                  }
                                </div>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant={existingMark ? "destructive" : "outline"}
                              size="sm"
                              onClick={() => {
                                if (existingMark) {
                                  removeMark(subject.id!);
                                } else {
                                  addMark(subject.id!, subject.name);
                                }
                              }}
                            >
                              {existingMark ? "Remove" : "Add"}
                            </Button>
                          </div>

                          {existingMark && (
                            <div className="grid grid-cols-2 gap-3">
                              {/* Theory subjects - show TE and CE */}
                              {(subject.te_max || subject.ce_max) && (
                                <>
                                  <div className="space-y-1">
                                    <Label
                                      htmlFor={`te_${subject.id}`}
                                      className="text-xs"
                                    >
                                      TE (Theory Exam)
                                    </Label>
                                    <Input
                                      id={`te_${subject.id}`}
                                      type="number"
                                      value={existingMark.te_obtained || ""}
                                      onChange={(e) =>
                                        updateMark(
                                          subject.id!,
                                          "te_obtained",
                                          e.target.value
                                            ? parseInt(e.target.value)
                                            : null
                                        )
                                      }
                                      placeholder="0"
                                      min="0"
                                      max={subject.te_max || undefined}
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label
                                      htmlFor={`ce_${subject.id}`}
                                      className="text-xs"
                                    >
                                      CE (Continuous Evaluation)
                                    </Label>
                                    <Input
                                      id={`ce_${subject.id}`}
                                      type="number"
                                      value={existingMark.ce_obtained || ""}
                                      onChange={(e) =>
                                        updateMark(
                                          subject.id!,
                                          "ce_obtained",
                                          e.target.value
                                            ? parseInt(e.target.value)
                                            : null
                                        )
                                      }
                                      placeholder="0"
                                      min="0"
                                      max={subject.ce_max || undefined}
                                    />
                                  </div>
                                </>
                              )}

                              {/* Practical subjects - show PE and PW */}
                              {(subject.pe_max || subject.pw_max) && (
                                <>
                                  <div className="space-y-1">
                                    <Label
                                      htmlFor={`pe_${subject.id}`}
                                      className="text-xs"
                                    >
                                      PE (Practical Exam)
                                    </Label>
                                    <Input
                                      id={`pe_${subject.id}`}
                                      type="number"
                                      value={existingMark.pe_obtained || ""}
                                      onChange={(e) =>
                                        updateMark(
                                          subject.id!,
                                          "pe_obtained",
                                          e.target.value
                                            ? parseInt(e.target.value)
                                            : null
                                        )
                                      }
                                      placeholder="0"
                                      min="0"
                                      max={subject.pe_max || undefined}
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label
                                      htmlFor={`pw_${subject.id}`}
                                      className="text-xs"
                                    >
                                      PW (Practical Work)
                                    </Label>
                                    <Input
                                      id={`pw_${subject.id}`}
                                      type="number"
                                      value={existingMark.pw_obtained || ""}
                                      onChange={(e) =>
                                        updateMark(
                                          subject.id!,
                                          "pw_obtained",
                                          e.target.value
                                            ? parseInt(e.target.value)
                                            : null
                                        )
                                      }
                                      placeholder="0"
                                      min="0"
                                      max={subject.pw_max || undefined}
                                    />
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingResult ? "Updating..." : "Creating..."}
                    </>
                  ) : editingResult ? (
                    "Update Result"
                  ) : (
                    "Create Result"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                student result for{" "}
                <strong>{resultToDelete?.student_name}</strong> and remove all
                associated marks.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setResultToDelete(null);
                  setIsDeleteDialogOpen(false);
                }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  "Delete Result"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Bulk Update Dialog */}
        <Dialog
          open={isBulkUpdateDialogOpen}
          onOpenChange={setIsBulkUpdateDialogOpen}
        >
          <DialogContent className="max-w-6xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Bulk Update Student Results</DialogTitle>
              <DialogDescription>
                Select student results to export to Excel, edit the data, and
                upload back for bulk updates.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Selection Controls */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Select Student Results</p>
                    <p className="text-sm text-muted-foreground">
                      Choose the student results you want to export and update.
                      {selectedResultsForExport.size > 0 &&
                        ` ${selectedResultsForExport.size} selected`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={selectAllResults}
                    variant="outline"
                    size="sm"
                    disabled={paginatedResults.length === 0}
                  >
                    Select All ({paginatedResults.length})
                  </Button>
                  <Button
                    onClick={clearSelection}
                    variant="outline"
                    size="sm"
                    disabled={selectedResultsForExport.size === 0}
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>

              {/* Results Selection Table */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Select Results to Export
                </h3>
                <div className="max-h-60 overflow-auto border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <input
                            type="checkbox"
                            checked={
                              selectedResultsForExport.size > 0 &&
                              selectedResultsForExport.size ===
                                paginatedResults.length
                            }
                            onChange={() => {
                              if (
                                selectedResultsForExport.size ===
                                paginatedResults.length
                              ) {
                                clearSelection();
                              } else {
                                selectAllResults();
                              }
                            }}
                            className="h-4 w-4"
                          />
                        </TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Batch</TableHead>
                        <TableHead>Register No.</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedResults.map((result) => (
                        <TableRow key={result.id} className="hover:bg-muted/50">
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedResultsForExport.has(result.id!)}
                              onChange={() => toggleResultSelection(result.id!)}
                              className="h-4 w-4"
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {result.student_name}
                          </TableCell>
                          <TableCell>{result.course_name}</TableCell>
                          <TableCell>{result.batch_name}</TableCell>
                          <TableCell>{result.register_number}</TableCell>
                          <TableCell>
                            {result.result ? (
                              <Badge
                                variant={
                                  result.result.toLowerCase() === "pass"
                                    ? "default"
                                    : result.result.toLowerCase() ===
                                      "distinction"
                                    ? "secondary"
                                    : "destructive"
                                }
                              >
                                {result.result}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                No result
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {result.is_published ? (
                              <Badge
                                variant="outline"
                                className="text-green-600 border-green-600"
                              >
                                Published
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-orange-600 border-orange-600"
                              >
                                Unpublished
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsBulkUpdateDialogOpen(false);
                    setSelectedResultsForExport(new Set());
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={exportSelectedToExcel}
                  disabled={selectedResultsForExport.size === 0 || isExporting}
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export to Excel ({selectedResultsForExport.size})
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Bulk Update Import Dialog */}
        <Dialog
          open={isBulkUpdateImportDialogOpen}
          onOpenChange={setIsBulkUpdateImportDialogOpen}
        >
          <DialogContent className="max-w-6xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Bulk Update Student Results</DialogTitle>
              <DialogDescription>
                Upload an Excel file with existing student results to update
                them in bulk. The system will validate that the results exist
                before updating.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* File Upload */}
              {bulkUpdateData.length === 0 && (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-muted-foreground/50"
                  }`}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                      handleBulkUpdateFileUpload(files[0]);
                    }
                  }}
                >
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">
                    Upload Excel or CSV File for Bulk Update
                  </p>
                  <p className="text-muted-foreground mb-4">
                    Drag and drop your Excel (.xlsx, .xls) or CSV file here, or
                    click to browse. This should contain existing student
                    results that you want to update.
                  </p>
                  <Input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleBulkUpdateFileUpload(file);
                    }}
                    className="hidden"
                    id="bulk-update-upload"
                  />
                  <Button asChild>
                    <Label
                      htmlFor="bulk-update-upload"
                      className="cursor-pointer"
                    >
                      Choose File
                    </Label>
                  </Button>
                </div>
              )}

              {/* Validation Results */}
              {bulkUpdateValidations.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      Validation Results
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {bulkUpdateValidations.filter((v) => v.isValid).length}{" "}
                        Valid
                      </Badge>
                      <Badge variant="destructive">
                        {bulkUpdateValidations.filter((v) => !v.isValid).length}{" "}
                        Invalid
                      </Badge>
                    </div>
                  </div>

                  <div className="max-h-60 overflow-auto border rounded-lg">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="p-3 text-left text-sm font-medium">
                            Row
                          </th>
                          <th className="p-3 text-left text-sm font-medium">
                            Student
                          </th>
                          <th className="p-3 text-left text-sm font-medium">
                            Course
                          </th>
                          <th className="p-3 text-left text-sm font-medium">
                            Batch
                          </th>
                          <th className="p-3 text-left text-sm font-medium">
                            Register No
                          </th>
                          <th className="p-3 text-left text-sm font-medium">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {bulkUpdateValidations.map((validation, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-3 text-sm">{validation.row}</td>
                            <td className="p-3 text-sm">
                              {validation.data.student_name}
                            </td>
                            <td className="p-3 text-sm">
                              {validation.data.course_name}
                            </td>
                            <td className="p-3 text-sm">
                              {validation.data.batch_name}
                            </td>
                            <td className="p-3 text-sm">
                              {validation.data.register_number}
                            </td>
                            <td className="p-3">
                              {validation.isValid ? (
                                <div className="flex items-center gap-1 text-green-600">
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="text-sm">Valid</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-red-600">
                                  <AlertCircle className="h-4 w-4" />
                                  <span className="text-sm">Invalid</span>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Error Details */}
                  {bulkUpdateValidations.some((v) => !v.isValid) && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-destructive">
                        Validation Errors:
                      </h4>
                      <div className="space-y-1 max-h-32 overflow-auto">
                        {bulkUpdateValidations
                          .filter((v) => !v.isValid)
                          .map((validation, index) => (
                            <div
                              key={index}
                              className="text-sm text-destructive"
                            >
                              <strong>Row {validation.row}:</strong>{" "}
                              {validation.errors.join(", ")}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Progress Bar */}
                  {isProcessingBulkUpdate && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Updating results...</span>
                        <span>{Math.round(bulkUpdateProgress)}%</span>
                      </div>
                      <Progress value={bulkUpdateProgress} className="w-full" />
                    </div>
                  )}

                  {/* Results */}
                  {bulkUpdateResult && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-medium">
                            {bulkUpdateResult.success} Updated
                          </span>
                        </div>
                        {bulkUpdateResult.failed > 0 && (
                          <div className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            <span className="font-medium">
                              {bulkUpdateResult.failed} Failed
                            </span>
                          </div>
                        )}
                      </div>

                      {bulkUpdateResult.errors.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-destructive">
                            Failed Updates:
                          </h4>
                          <div className="space-y-1 max-h-32 overflow-auto">
                            {bulkUpdateResult.errors.map((error, index) => (
                              <div
                                key={index}
                                className="text-sm text-destructive"
                              >
                                <strong>
                                  Row {error.row} ({error.registerNumber}):
                                </strong>{" "}
                                {error.error}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsBulkUpdateImportDialogOpen(false);
                        setBulkUpdateData([]);
                        setBulkUpdateValidations([]);
                        setBulkUpdateResult(null);
                        setBulkUpdateProgress(0);
                      }}
                    >
                      Cancel
                    </Button>
                    {!isProcessingBulkUpdate && !bulkUpdateResult && (
                      <Button
                        onClick={handleBulkUpdate}
                        disabled={
                          bulkUpdateValidations.filter((v) => v.isValid)
                            .length === 0
                        }
                      >
                        Update{" "}
                        {bulkUpdateValidations.filter((v) => v.isValid).length}{" "}
                        Results
                      </Button>
                    )}
                    {bulkUpdateResult && (
                      <Button
                        onClick={() => {
                          setIsBulkUpdateImportDialogOpen(false);
                          setBulkUpdateData([]);
                          setBulkUpdateValidations([]);
                          setBulkUpdateResult(null);
                          setBulkUpdateProgress(0);
                        }}
                      >
                        Close
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Bulk Delete Dialog */}
        <Dialog
          open={isBulkDeleteDialogOpen}
          onOpenChange={setIsBulkDeleteDialogOpen}
        >
          <DialogContent className="max-w-6xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Bulk Delete Student Results</DialogTitle>
              <DialogDescription>
                Select student results to delete in bulk. This action cannot be
                undone.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Selection Controls */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-red-50 border-red-200">
                <div className="flex items-center gap-3">
                  <Trash2 className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-900">
                      Select Student Results to Delete
                    </p>
                    <p className="text-sm text-red-700">
                      Choose the student results you want to delete permanently.
                      {selectedResultsForDelete.size > 0 &&
                        ` ${selectedResultsForDelete.size} selected`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={selectAllForDelete}
                    variant="outline"
                    size="sm"
                    disabled={paginatedResults.length === 0}
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    Select All ({paginatedResults.length})
                  </Button>
                  <Button
                    onClick={clearDeleteSelection}
                    variant="outline"
                    size="sm"
                    disabled={selectedResultsForDelete.size === 0}
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>

              {/* Results Selection Table */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Select Results to Delete
                </h3>
                <div className="max-h-60 overflow-auto border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <input
                            type="checkbox"
                            checked={
                              selectedResultsForDelete.size > 0 &&
                              selectedResultsForDelete.size ===
                                paginatedResults.length
                            }
                            onChange={() => {
                              if (
                                selectedResultsForDelete.size ===
                                paginatedResults.length
                              ) {
                                clearDeleteSelection();
                              } else {
                                selectAllForDelete();
                              }
                            }}
                            className="h-4 w-4"
                          />
                        </TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Batch</TableHead>
                        <TableHead>Register No.</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedResults.map((result) => (
                        <TableRow key={result.id} className="hover:bg-muted/50">
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedResultsForDelete.has(result.id!)}
                              onChange={() => toggleDeleteSelection(result.id!)}
                              className="h-4 w-4"
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {result.student_name}
                          </TableCell>
                          <TableCell>{result.course_name}</TableCell>
                          <TableCell>{result.batch_name}</TableCell>
                          <TableCell>{result.register_number}</TableCell>
                          <TableCell>
                            {result.result ? (
                              <Badge
                                variant={
                                  result.result.toLowerCase() === "pass"
                                    ? "default"
                                    : result.result.toLowerCase() ===
                                      "distinction"
                                    ? "secondary"
                                    : "destructive"
                                }
                              >
                                {result.result}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                No result
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {result.is_published ? (
                              <Badge
                                variant="outline"
                                className="text-green-600 border-green-600"
                              >
                                Published
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-orange-600 border-orange-600"
                              >
                                Unpublished
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Progress Bar */}
              {isDeletingBulk && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Deleting results...</span>
                    <span>{Math.round(bulkDeleteProgress)}%</span>
                  </div>
                  <Progress value={bulkDeleteProgress} className="w-full" />
                </div>
              )}

              {/* Results */}
              {bulkDeleteResult && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">
                        {bulkDeleteResult.success} Deleted
                      </span>
                    </div>
                    {bulkDeleteResult.failed > 0 && (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="h-5 w-5" />
                        <span className="font-medium">
                          {bulkDeleteResult.failed} Failed
                        </span>
                      </div>
                    )}
                  </div>

                  {bulkDeleteResult.errors.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-destructive">
                        Failed Deletions:
                      </h4>
                      <div className="space-y-1 max-h-32 overflow-auto">
                        {bulkDeleteResult.errors.map((error, index) => (
                          <div key={index} className="text-sm text-destructive">
                            <strong>{error.registerNumber}:</strong>{" "}
                            {error.error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsBulkDeleteDialogOpen(false);
                    setSelectedResultsForDelete(new Set());
                    setBulkDeleteResult(null);
                    setBulkDeleteProgress(0);
                  }}
                >
                  Cancel
                </Button>
                {!isDeletingBulk && !bulkDeleteResult && (
                  <Button
                    onClick={handleBulkDelete}
                    disabled={selectedResultsForDelete.size === 0}
                    variant="destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete {selectedResultsForDelete.size} Results
                  </Button>
                )}
                {bulkDeleteResult && (
                  <Button
                    onClick={() => {
                      setIsBulkDeleteDialogOpen(false);
                      setSelectedResultsForDelete(new Set());
                      setBulkDeleteResult(null);
                      setBulkDeleteProgress(0);
                    }}
                  >
                    Close
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Bulk Creation Dialog */}
        <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Bulk Import Student Results</DialogTitle>
              <DialogDescription>
                Upload an Excel (.xlsx, .xls) or CSV file to create multiple
                student results at once. Download the template for the correct
                format.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Template Download */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Download Template</p>
                    <p className="text-sm text-muted-foreground">
                      Use this Excel template to format your student result data
                      correctly. You can also use CSV format with the same
                      column structure.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={downloadTemplate}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                  <Button
                    onClick={downloadCSVTemplate}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                </div>
              </div>

              {/* Bulk Update Section */}
              {/* <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 border-blue-200">
                <div className="flex items-center gap-3">
                  <Edit className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">
                      Bulk Update Existing Results
                    </p>
                    <p className="text-sm text-blue-700">
                      Export existing results to Excel, edit them, and upload
                      back for bulk updates.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setIsBulkDialogOpen(false);
                    setIsBulkUpdateDialogOpen(true);
                  }}
                  variant="outline"
                  size="sm"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Convert to Excel
                </Button>
              </div> */}

              {/* File Upload */}
              {bulkData.length === 0 && (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-muted-foreground/50"
                  }`}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                      handleFileUpload(files[0]);
                    }
                  }}
                >
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">
                    Upload Excel or CSV File
                  </p>
                  <p className="text-muted-foreground mb-4">
                    Drag and drop your Excel (.xlsx, .xls) or CSV file here, or
                    click to browse
                  </p>
                  <Input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    className="hidden"
                    id="bulk-upload"
                  />
                  <Button asChild>
                    <Label htmlFor="bulk-upload" className="cursor-pointer">
                      Choose File
                    </Label>
                  </Button>
                </div>
              )}

              {/* Validation Results */}
              {bulkValidations.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      Validation Results
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {bulkValidations.filter((v) => v.isValid).length} Valid
                      </Badge>
                      <Badge variant="destructive">
                        {bulkValidations.filter((v) => !v.isValid).length}{" "}
                        Invalid
                      </Badge>
                    </div>
                  </div>

                  <div className="max-h-60 overflow-auto border rounded-lg">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="p-3 text-left text-sm font-medium">
                            Row
                          </th>
                          <th className="p-3 text-left text-sm font-medium">
                            Student
                          </th>
                          <th className="p-3 text-left text-sm font-medium">
                            Course
                          </th>
                          <th className="p-3 text-left text-sm font-medium">
                            Batch
                          </th>
                          <th className="p-3 text-left text-sm font-medium">
                            Register No
                          </th>
                          <th className="p-3 text-left text-sm font-medium">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {bulkValidations.map((validation, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-3 text-sm">{validation.row}</td>
                            <td className="p-3 text-sm">
                              {validation.data.student_name}
                            </td>
                            <td className="p-3 text-sm">
                              {validation.data.course_name}
                            </td>
                            <td className="p-3 text-sm">
                              {validation.data.batch_name}
                            </td>
                            <td className="p-3 text-sm">
                              {validation.data.register_number}
                            </td>
                            <td className="p-3">
                              {validation.isValid ? (
                                <div className="flex items-center gap-1 text-green-600">
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="text-sm">Valid</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-red-600">
                                  <AlertCircle className="h-4 w-4" />
                                  <span className="text-sm">Invalid</span>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Error Details */}
                  {bulkValidations.some((v) => !v.isValid) && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-destructive">
                        Validation Errors:
                      </h4>
                      <div className="space-y-1 max-h-32 overflow-auto">
                        {bulkValidations
                          .filter((v) => !v.isValid)
                          .map((validation, index) => (
                            <div
                              key={index}
                              className="text-sm text-destructive"
                            >
                              <strong>Row {validation.row}:</strong>{" "}
                              {validation.errors.join(", ")}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Progress Bar */}
                  {isProcessingBulk && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Creating results...</span>
                        <span>{Math.round(bulkProgress)}%</span>
                      </div>
                      <Progress value={bulkProgress} className="w-full" />
                    </div>
                  )}

                  {/* Results */}
                  {bulkResult && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-medium">
                            {bulkResult.success} Created
                          </span>
                        </div>
                        {bulkResult.failed > 0 && (
                          <div className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            <span className="font-medium">
                              {bulkResult.failed} Failed
                            </span>
                          </div>
                        )}
                      </div>

                      {bulkResult.errors.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-destructive">
                            Failed Results:
                          </h4>
                          <div className="space-y-1 max-h-32 overflow-auto">
                            {bulkResult.errors.map((error, index) => (
                              <div
                                key={index}
                                className="text-sm text-destructive"
                              >
                                <strong>
                                  Row {error.row} ({error.registerNumber}):
                                </strong>{" "}
                                {error.error}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsBulkDialogOpen(false);
                        resetBulkDialog();
                      }}
                    >
                      Cancel
                    </Button>
                    {!isProcessingBulk && !bulkResult && (
                      <Button
                        onClick={handleBulkCreate}
                        disabled={
                          bulkValidations.filter((v) => v.isValid).length === 0
                        }
                      >
                        Create {bulkValidations.filter((v) => v.isValid).length}{" "}
                        Results
                      </Button>
                    )}
                    {bulkResult && (
                      <Button
                        onClick={() => {
                          setIsBulkDialogOpen(false);
                          resetBulkDialog();
                        }}
                      >
                        Close
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default StudentResults;

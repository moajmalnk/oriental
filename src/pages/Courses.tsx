import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  BookOpen,
  Users,
  Calendar,
  Search,
  X,
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Loader2,
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
  DialogTrigger,
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import { Course, CourseFormData, Subject } from "@/types";
import * as XLSX from "xlsx";

// Bulk import interfaces
interface BulkCourseData {
  name: string;
  short_code: string;
  duration_months?: number;
  subjects: Array<{
    name: string;
    te_max?: number;
    ce_max?: number;
    pe_max?: number;
    pw_max?: number;
  }>;
}

interface BulkCourseValidation {
  row: number;
  data: BulkCourseData;
  errors: string[];
  isValid: boolean;
}

interface BulkCreationResult {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    courseName: string;
    error: string;
  }>;
}

const Courses: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [formData, setFormData] = useState<CourseFormData>({
    name: "",
    short_code: "",
    duration_months: null,
    subjects: [
      { name: "", te_max: null, ce_max: null, pe_max: null, pw_max: null },
    ],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Bulk import states
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [bulkData, setBulkData] = useState<BulkCourseData[]>([]);
  const [bulkValidations, setBulkValidations] = useState<
    BulkCourseValidation[]
  >([]);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkResult, setBulkResult] = useState<BulkCreationResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const { toast } = useToast();

  // Fetch courses
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/course/list/");
      setCourses(response.data);
      setFilteredCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch courses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter courses based on search query
  const filterCourses = (query: string) => {
    if (!query.trim()) {
      setFilteredCourses(courses);
      return;
    }

    const searchTerm = query.toLowerCase();
    const filtered = courses.filter((course) => {
      // Search in course name and short code
      const courseMatch =
        course.name.toLowerCase().includes(searchTerm) ||
        course.short_code.toLowerCase().includes(searchTerm);

      // Search in subject names
      const subjectMatch = course.subjects.some((subject) =>
        subject.name.toLowerCase().includes(searchTerm)
      );

      return courseMatch || subjectMatch;
    });

    setFilteredCourses(filtered);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    filterCourses(query);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setFilteredCourses(courses);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      short_code: "",
      duration_months: null,
      subjects: [
        { name: "", te_max: null, ce_max: null, pe_max: null, pw_max: null },
      ],
    });
    setErrors({});
    setEditingCourse(null);
  };

  // Open dialog for create/edit
  const openDialog = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        name: course.name,
        short_code: course.short_code,
        duration_months: course.duration_months,
        subjects:
          course.subjects.length > 0
            ? course.subjects
            : [
                {
                  name: "",
                  te_max: null,
                  ce_max: null,
                  pe_max: null,
                  pw_max: null,
                },
              ],
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Course name is required";
    }

    if (!formData.short_code.trim()) {
      newErrors.short_code = "Short code is required";
    }

    if (formData.duration_months && formData.duration_months <= 0) {
      newErrors.duration_months = "Duration must be a positive number";
    }

    // Validate subjects
    const validSubjects = formData.subjects.filter((subject) =>
      subject.name.trim()
    );
    if (validSubjects.length === 0) {
      newErrors.subjects = "At least one subject is required";
    }

    // Validate each subject
    validSubjects.forEach((subject, index) => {
      const hasTheory =
        (subject.te_max !== null && subject.te_max !== undefined) ||
        (subject.ce_max !== null && subject.ce_max !== undefined);
      const hasPractical =
        (subject.pe_max !== null && subject.pe_max !== undefined) ||
        (subject.pw_max !== null && subject.pw_max !== undefined);

      if (!hasTheory && !hasPractical) {
        newErrors[`subject_${index}`] =
          "Subject must have either theory or practical marks";
      }

      if (hasTheory && hasPractical) {
        newErrors[`subject_${index}`] =
          "Subject cannot have both theory and practical marks";
      }
    });

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
      const payload = {
        ...formData,
        subjects: formData.subjects.filter((subject) => subject.name.trim()),
      };

      if (editingCourse) {
        await api.put(`/api/course/update/${editingCourse.id}/`, payload);
        toast({
          title: "Success",
          description: "Course updated successfully",
        });
      } else {
        await api.post("/api/course/create/", payload);
        toast({
          title: "Success",
          description: "Course created successfully",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchCourses();
    } catch (error: any) {
      console.error("Error saving course:", error);
      console.error("Error response:", error.response?.data);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          error.response?.data?.subjects ||
          "Failed to save course",
        variant: "destructive",
      });
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (course: Course) => {
    setCourseToDelete(course);
    setIsDeleteDialogOpen(true);
  };

  // Close delete confirmation dialog
  const closeDeleteDialog = () => {
    setCourseToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  // Delete course
  const handleDelete = async () => {
    if (!courseToDelete) return;

    try {
      await api.delete(`/api/course/delete/${courseToDelete.id}/`);
      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
      fetchCourses();
      closeDeleteDialog();
    } catch (error: any) {
      console.error("Error deleting course:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete course",
        variant: "destructive",
      });
    }
  };

  // Add subject
  const addSubject = () => {
    setFormData({
      ...formData,
      subjects: [
        ...formData.subjects,
        { name: "", te_max: null, ce_max: null, pe_max: null, pw_max: null },
      ],
    });
  };

  // Remove subject
  const removeSubject = (index: number) => {
    if (formData.subjects.length > 1) {
      const newSubjects = formData.subjects.filter((_, i) => i !== index);
      setFormData({ ...formData, subjects: newSubjects });
    }
  };

  // Update subject
  const updateSubject = (index: number, field: keyof Subject, value: any) => {
    const newSubjects = [...formData.subjects];
    newSubjects[index] = { ...newSubjects[index], [field]: value };
    setFormData({ ...formData, subjects: newSubjects });
  };

  // Get subject type
  const getSubjectType = (
    subject: Subject
  ): "theory" | "practical" | "none" => {
    const hasTheory =
      (subject.te_max !== null && subject.te_max !== undefined) ||
      (subject.ce_max !== null && subject.ce_max !== undefined);
    const hasPractical =
      (subject.pe_max !== null && subject.pe_max !== undefined) ||
      (subject.pw_max !== null && subject.pw_max !== undefined);

    if (hasTheory) return "theory";
    if (hasPractical) return "practical";
    return "none";
  };

  // Bulk import functions
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
        const courseData: BulkCourseData[] = jsonData
          .slice(1)
          .map((row: any[], index: number) => {
            // Parse subjects from the row (assuming subjects start from column 4)
            const subjects: Array<{
              name: string;
              te_max?: number;
              ce_max?: number;
              pe_max?: number;
              pw_max?: number;
            }> = [];

            // Parse subjects - assuming format: Subject Name, Type, TE Max, CE Max, PE Max, PW Max
            // Each subject takes 6 columns: Name, Type, TE Max, CE Max, PE Max, PW Max
            for (let i = 3; i < row.length; i += 6) {
              if (row[i] && row[i].toString().trim()) {
                const subjectName = row[i].toString().trim();
                const subjectType = row[i + 1]?.toString().trim().toLowerCase();

                if (subjectType === "theory") {
                  const subject = {
                    name: subjectName,
                    te_max: row[i + 2] ? parseInt(row[i + 2].toString()) : null,
                    ce_max: row[i + 3] ? parseInt(row[i + 3].toString()) : null,
                    pe_max: null,
                    pw_max: null,
                  };
                  subjects.push(subject);
                } else if (subjectType === "practical") {
                  const subject = {
                    name: subjectName,
                    te_max: null,
                    ce_max: null,
                    pe_max: row[i + 4] ? parseInt(row[i + 4].toString()) : null,
                    pw_max: row[i + 5] ? parseInt(row[i + 5].toString()) : null,
                  };
                  subjects.push(subject);
                }
              }
            }

            return {
              name: row[0]?.toString() || "",
              short_code: row[1]?.toString() || "",
              duration_months: row[2] ? parseInt(row[2].toString()) : null,
              subjects,
            };
          });

        setBulkData(courseData);
        await validateBulkData(courseData);
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

  const validateBulkData = async (data: BulkCourseData[]) => {
    const validations: BulkCourseValidation[] = data.map((course, index) => {
      const errors: string[] = [];
      const row = index + 2; // +2 because we skip header and arrays are 0-indexed

      // Validate course name
      if (!course.name.trim()) {
        errors.push("Course name is required");
      }

      // Validate short code
      if (!course.short_code.trim()) {
        errors.push("Short code is required");
      }

      // Validate subjects
      if (!course.subjects || course.subjects.length === 0) {
        errors.push("At least one subject is required");
      } else {
        course.subjects.forEach((subject, subjectIndex) => {
          if (!subject.name.trim()) {
            errors.push(`Subject ${subjectIndex + 1} name is required`);
          }

          // Validate subject type consistency
          const hasTheory = subject.te_max !== null || subject.ce_max !== null;
          const hasPractical =
            subject.pe_max !== null || subject.pw_max !== null;

          if (!hasTheory && !hasPractical) {
            errors.push(
              `Subject "${subject.name}" must have either theory or practical marks`
            );
          }

          if (hasTheory && hasPractical) {
            errors.push(
              `Subject "${subject.name}" cannot have both theory and practical marks`
            );
          }
        });
      }

      // Check for duplicate course names
      const duplicateIndex = data.findIndex(
        (c, i) =>
          i !== index && c.name.toLowerCase() === course.name.toLowerCase()
      );
      if (duplicateIndex !== -1) {
        errors.push(`Duplicate course name found in row ${duplicateIndex + 2}`);
      }

      // Check for duplicate short codes
      const duplicateCodeIndex = data.findIndex(
        (c, i) =>
          i !== index &&
          c.short_code.toLowerCase() === course.short_code.toLowerCase()
      );
      if (duplicateCodeIndex !== -1) {
        errors.push(
          `Duplicate short code found in row ${duplicateCodeIndex + 2}`
        );
      }

      return {
        row,
        data: course,
        errors,
        isValid: errors.length === 0,
      };
    });

    setBulkValidations(validations);
  };

  const handleBulkCreate = async () => {
    const validCourses = bulkValidations.filter((v) => v.isValid);
    if (validCourses.length === 0) {
      toast({
        title: "No valid courses",
        description: "Please fix validation errors before creating courses.",
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

    for (let i = 0; i < validCourses.length; i++) {
      const validation = validCourses[i];
      const progress = ((i + 1) / validCourses.length) * 100;
      setBulkProgress(progress);

      try {
        const payload = {
          name: validation.data.name,
          short_code: validation.data.short_code,
          duration_months: validation.data.duration_months,
          subjects: validation.data.subjects,
        };

        await api.post("/api/course/create/", payload);
        result.success++;
      } catch (error: any) {
        result.failed++;
        result.errors.push({
          row: validation.row,
          courseName: validation.data.name,
          error: error.response?.data?.message || "Failed to create course",
        });
      }
    }

    setBulkResult(result);
    setIsProcessingBulk(false);

    if (result.success > 0) {
      toast({
        title: "Bulk Creation Complete",
        description: `Successfully created ${result.success} courses. ${result.failed} failed.`,
      });
      fetchCourses();
    }

    if (result.failed > 0) {
      toast({
        title: "Some courses failed",
        description: `${result.failed} courses could not be created. Check the details below.`,
        variant: "destructive",
      });
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      [
        "Course Name",
        "Short Code",
        "Duration (Months)",
        "Subject 1",
        "Type 1",
        "TE Max 1",
        "CE Max 1",
        "PE Max 1",
        "PW Max 1",
        "Subject 2",
        "Type 2",
        "TE Max 2",
        "CE Max 2",
        "PE Max 2",
        "PW Max 2",
        "Subject 3",
        "Type 3",
        "TE Max 3",
        "CE Max 3",
        "PE Max 3",
        "PW Max 3",
      ],
      [
        "Computer Science",
        "CS",
        "12",
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
        "Web Development",
        "theory",
        "70",
        "30",
        "",
        "",
      ],
      [
        "",
        "Format: Use exact names",
        "",
        "",
        "theory or practical",
        "Numbers only",
        "Numbers only",
        "Numbers only",
        "Numbers only",
        "",
        "theory or practical",
        "Numbers only",
        "Numbers only",
        "Numbers only",
        "Numbers only",
        "",
        "theory or practical",
        "Numbers only",
        "Numbers only",
        "Numbers only",
        "Numbers only",
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Courses");
    XLSX.writeFile(wb, "courses_template.xlsx");
  };

  const downloadCSVTemplate = () => {
    const templateData = [
      [
        "Course Name",
        "Short Code",
        "Duration (Months)",
        "Subject 1",
        "Type 1",
        "TE Max 1",
        "CE Max 1",
        "PE Max 1",
        "PW Max 1",
        "Subject 2",
        "Type 2",
        "TE Max 2",
        "CE Max 2",
        "PE Max 2",
        "PW Max 2",
        "Subject 3",
        "Type 3",
        "TE Max 3",
        "CE Max 3",
        "PE Max 3",
        "PW Max 3",
      ],
      [
        "Computer Science",
        "CS",
        "12",
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
        "Web Development",
        "theory",
        "70",
        "30",
        "",
        "",
      ],
      [
        "",
        "Format: Use exact names",
        "",
        "",
        "theory or practical",
        "Numbers only",
        "Numbers only",
        "Numbers only",
        "Numbers only",
        "",
        "theory or practical",
        "Numbers only",
        "Numbers only",
        "Numbers only",
        "Numbers only",
        "",
        "theory or practical",
        "Numbers only",
        "Numbers only",
        "Numbers only",
        "Numbers only",
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
    link.setAttribute("download", "courses_template.csv");
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
              Course Management
            </h1>
            <p className="text-muted-foreground">
              Manage courses and their subjects
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              onClick={() => openDialog()}
              className="gap-2 flex-1 sm:flex-none"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Course</span>
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
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search courses by name, code, or subject..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 pr-10 w-full"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {searchQuery && (
            <div className="text-sm text-muted-foreground whitespace-nowrap">
              {filteredCourses.length} of {courses.length} courses
            </div>
          )}
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{course.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{course.short_code}</Badge>
                      {course.duration_months && (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {course.duration_months} months
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDialog(course)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDeleteDialog(course)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>
                      {course.subjects.length} subject
                      {course.subjects.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {course.subjects.slice(0, 3).map((subject, index) => (
                      <div key={index} className="text-sm">
                        <div className="font-medium">{subject.name}</div>
                        <div className="text-muted-foreground">
                          {getSubjectType(subject) === "theory" && (
                            <span>
                              TE: {subject.te_max || 0}, CE:{" "}
                              {subject.ce_max || 0}
                            </span>
                          )}
                          {getSubjectType(subject) === "practical" && (
                            <span>
                              PE: {subject.pe_max || 0}, PW:{" "}
                              {subject.pw_max || 0}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {course.subjects.length > 3 && (
                      <div className="text-sm text-muted-foreground">
                        +{course.subjects.length - 3} more subjects
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            {searchQuery ? (
              <>
                <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                <p className="text-muted-foreground mb-4">
                  No courses match your search for "{searchQuery}"
                </p>
                <Button onClick={clearSearch} variant="outline">
                  Clear Search
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by creating your first course
                </p>
                <Button onClick={() => openDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Course
                </Button>
              </>
            )}
          </div>
        )}

        {/* Course Form Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCourse ? "Edit Course" : "Create New Course"}
              </DialogTitle>
              <DialogDescription>
                {editingCourse
                  ? "Update course details and subjects"
                  : "Add a new course with its subjects"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Course Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Course Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Computer Science"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="short_code">Short Code *</Label>
                  <Input
                    id="short_code"
                    value={formData.short_code}
                    onChange={(e) =>
                      setFormData({ ...formData, short_code: e.target.value })
                    }
                    placeholder="e.g., CS"
                  />
                  {errors.short_code && (
                    <p className="text-sm text-destructive">
                      {errors.short_code}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration_months">Duration (Months)</Label>
                  <Input
                    id="duration_months"
                    type="number"
                    value={formData.duration_months || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration_months: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    placeholder="e.g., 24"
                  />
                  {errors.duration_months && (
                    <p className="text-sm text-destructive">
                      {errors.duration_months}
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Subjects Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">Subjects</h3>
                    <p className="text-sm text-muted-foreground">
                      Add subjects with either theory or practical marks (not
                      both)
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={addSubject}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Subject
                  </Button>
                </div>

                {errors.subjects && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.subjects}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  {formData.subjects.map((subject, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-medium">Subject {index + 1}</h4>
                          {formData.subjects.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSubject(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor={`subject_name_${index}`}>
                              Subject Name *
                            </Label>
                            <Input
                              id={`subject_name_${index}`}
                              value={subject.name}
                              onChange={(e) =>
                                updateSubject(index, "name", e.target.value)
                              }
                              placeholder="e.g., Programming Fundamentals"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Theory Marks */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">
                                Theory Marks
                              </Label>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label
                                    htmlFor={`te_max_${index}`}
                                    className="text-xs"
                                  >
                                    TE Max
                                  </Label>
                                  <Input
                                    id={`te_max_${index}`}
                                    type="number"
                                    value={subject.te_max || ""}
                                    onChange={(e) =>
                                      updateSubject(
                                        index,
                                        "te_max",
                                        e.target.value
                                          ? parseInt(e.target.value)
                                          : null
                                      )
                                    }
                                    placeholder="0"
                                  />
                                </div>
                                <div>
                                  <Label
                                    htmlFor={`ce_max_${index}`}
                                    className="text-xs"
                                  >
                                    CE Max
                                  </Label>
                                  <Input
                                    id={`ce_max_${index}`}
                                    type="number"
                                    value={subject.ce_max || ""}
                                    onChange={(e) =>
                                      updateSubject(
                                        index,
                                        "ce_max",
                                        e.target.value
                                          ? parseInt(e.target.value)
                                          : null
                                      )
                                    }
                                    placeholder="0"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Practical Marks */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">
                                Practical Marks
                              </Label>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label
                                    htmlFor={`pe_max_${index}`}
                                    className="text-xs"
                                  >
                                    PE Max
                                  </Label>
                                  <Input
                                    id={`pe_max_${index}`}
                                    type="number"
                                    value={subject.pe_max || ""}
                                    onChange={(e) =>
                                      updateSubject(
                                        index,
                                        "pe_max",
                                        e.target.value
                                          ? parseInt(e.target.value)
                                          : null
                                      )
                                    }
                                    placeholder="0"
                                  />
                                </div>
                                <div>
                                  <Label
                                    htmlFor={`pw_max_${index}`}
                                    className="text-xs"
                                  >
                                    PW Max
                                  </Label>
                                  <Input
                                    id={`pw_max_${index}`}
                                    type="number"
                                    value={subject.pw_max || ""}
                                    onChange={(e) =>
                                      updateSubject(
                                        index,
                                        "pw_max",
                                        e.target.value
                                          ? parseInt(e.target.value)
                                          : null
                                      )
                                    }
                                    placeholder="0"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {errors[`subject_${index}`] && (
                            <p className="text-sm text-destructive">
                              {errors[`subject_${index}`]}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCourse ? "Update Course" : "Create Course"}
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
                course <strong>{courseToDelete?.name}</strong> and remove all
                associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={closeDeleteDialog}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Course
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Bulk Import Dialog */}
        <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Bulk Import Courses</DialogTitle>
              <DialogDescription>
                Upload an Excel (.xlsx, .xls) or CSV file to create multiple
                courses with subjects at once. Download the template for the
                correct format.
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
                      Use this Excel template to format your course data
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
                            Course Name
                          </th>
                          <th className="p-3 text-left text-sm font-medium">
                            Short Code
                          </th>
                          <th className="p-3 text-left text-sm font-medium">
                            Subjects
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
                              {validation.data.name}
                            </td>
                            <td className="p-3 text-sm">
                              {validation.data.short_code}
                            </td>
                            <td className="p-3 text-sm">
                              {validation.data.subjects.length}
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
                        <span>Creating courses...</span>
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
                            Failed Courses:
                          </h4>
                          <div className="space-y-1 max-h-32 overflow-auto">
                            {bulkResult.errors.map((error, index) => (
                              <div
                                key={index}
                                className="text-sm text-destructive"
                              >
                                <strong>
                                  Row {error.row} ({error.courseName}):
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
                        Courses
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

export default Courses;

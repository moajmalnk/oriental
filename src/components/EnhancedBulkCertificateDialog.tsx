import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Download,
  Award,
  CheckCircle,
  Loader2,
  Search,
  Filter,
  DownloadCloud,
} from "lucide-react";
import { Student, Course, Batch } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useResponsive } from "@/hooks/use-responsive";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Certificate } from "@/components/Certificate";
import { PrintPDFButtons } from "@/components/PrintPDFButtons";
import DataService from "@/services/dataService";
import api from "@/services/api";

interface EnhancedBulkCertificateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EnhancedBulkCertificateDialog = ({
  open,
  onOpenChange,
}: EnhancedBulkCertificateDialogProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const [selectedRegiNos, setSelectedRegiNos] = useState<Set<string>>(
    new Set()
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [certificatePreviews, setCertificatePreviews] = useState<Student[]>([]);
  const [showPreviews, setShowPreviews] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const { isDesktop } = useResponsive();

  // Filter states
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Fetch all data when dialog opens
  useEffect(() => {
    const fetchData = async () => {
      if (!open) return;

      setIsLoading(true);
      try {
        // Fetch students, student results, courses, and batches in parallel
        const [
          studentsResponse,
          studentResultsResponse,
          coursesResponse,
          batchesResponse,
        ] = await Promise.all([
          api.get("/api/students/students/"),
          api.get("/api/students/student-results/"),
          api.get("/api/course/list/"),
          api.get("/api/students/batches/"),
        ]);

        const fetchedStudents = studentsResponse.data;
        const fetchedStudentResults = studentResultsResponse.data;
        const fetchedCourses: Course[] = coursesResponse.data;
        const fetchedBatches: Batch[] = batchesResponse.data;

        // Transform student results to student format for compatibility
        const transformedStudents: Student[] = fetchedStudentResults.map(
          (result: any) => {
            // Find the actual student data by matching student ID
            const actualStudent = fetchedStudents.find(
              (student: any) => student.id === result.student
            );

            // Find the related course and batch data
            const relatedCourse = fetchedCourses.find(
              (c) => c.id === result.course
            );
            const relatedBatch = fetchedBatches.find(
              (b) => b.id === result.batch
            );

            return {
              id: result.id,
              Name:
                actualStudent?.name || actualStudent?.Name || "Unknown Student",
              RegiNo: result.register_number,
              Course: relatedCourse?.name || "Course " + result.course,
              Batch: {
                id: result.batch,
                name: relatedBatch?.name || "Batch " + result.batch,
                start_date: relatedBatch?.start_date || "",
                duration_months: relatedBatch?.duration_months || null,
                course: result.course,
                course_name: relatedCourse?.name || "",
                created_at: relatedBatch?.created_at || "",
              },
              CertificateNumber: result.certificate_number,
              Result: result.result || "PENDING",
              Email: actualStudent?.email || actualStudent?.Email || "",
              Phone: actualStudent?.phone || actualStudent?.Phone || "",
              WhatsApp:
                actualStudent?.whatsapp_number ||
                actualStudent?.WhatsApp ||
                null,
              Photo: actualStudent?.photo || actualStudent?.Photo || null,
              CourseType: (relatedCourse?.name || "")
                .toUpperCase()
                .includes("PDA")
                ? "PDA"
                : "DCP",
              Subjects: result.marks || [],
              PublishedDate: result.published_date || null,
            };
          }
        );

        setStudents(transformedStudents);
        setCourses(fetchedCourses);
        setBatches(fetchedBatches);

        // Filter students who are eligible for certificates (have certificate numbers)
        const eligibleStudents = transformedStudents.filter((student) => {
          const hasCertificate =
            student.CertificateNumber &&
            student.CertificateNumber.trim() !== "";
          // For now, include all students with certificate numbers regardless of result
          // You can modify this to be more specific if needed
          return hasCertificate;
        });

        setFilteredStudents(eligibleStudents);
        setSelectedRegiNos(new Set(eligibleStudents.map((s) => s.RegiNo)));

        console.log("Fetched data:", {
          students: fetchedStudents.length,
          studentResults: fetchedStudentResults.length,
          transformedStudents: transformedStudents.length,
          eligibleStudents: eligibleStudents.length,
          courses: fetchedCourses.length,
          batches: fetchedBatches.length,
          sampleStudent: fetchedStudents[0],
          sampleResult: fetchedStudentResults[0],
          sampleTransformed: transformedStudents[0],
          allCertificateNumbers: fetchedStudentResults.map(
            (r) => r.certificate_number
          ),
          allResults: fetchedStudentResults.map((r) => r.result),
        });
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({
          title: "Failed to Load Data",
          description:
            "Unable to load students, courses, and batches. Please try again.",
          variant: "destructive",
        });
        setStudents([]);
        setCourses([]);
        setBatches([]);
        setFilteredStudents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [open, toast]);

  // Apply filters when filter states change
  useEffect(() => {
    let filtered = students.filter((student) => {
      const hasCertificate =
        student.CertificateNumber && student.CertificateNumber.trim() !== "";
      if (!hasCertificate) return false;

      // Course filter
      if (selectedCourse !== "all") {
        const courseMatch =
          student.Course === selectedCourse ||
          student.CourseType === selectedCourse ||
          (typeof student.Course === "object" &&
            student.Course &&
            (student.Course as any).name === selectedCourse);
        if (!courseMatch) return false;
      }

      // Batch filter
      if (selectedBatch !== "all") {
        const batchMatch =
          typeof student.Batch === "object" &&
          student.Batch?.name === selectedBatch;
        if (!batchMatch) return false;
      }

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          student.Name.toLowerCase().includes(searchLower) ||
          student.RegiNo.toLowerCase().includes(searchLower) ||
          student.CertificateNumber.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      return true;
    });

    setFilteredStudents(filtered);
  }, [students, selectedCourse, selectedBatch, searchTerm]);

  // Update selection when filtered students change
  useEffect(() => {
    if (open) {
      setSelectedRegiNos(new Set(filteredStudents.map((s) => s.RegiNo)));
    }
  }, [filteredStudents, open]);

  const allSelected =
    selectedRegiNos.size > 0 &&
    selectedRegiNos.size === filteredStudents.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedRegiNos(new Set());
    } else {
      setSelectedRegiNos(new Set(filteredStudents.map((s) => s.RegiNo)));
    }
  };

  const toggleOne = (regiNo: string) => {
    setSelectedRegiNos((prev) => {
      const next = new Set(prev);
      if (next.has(regiNo)) {
        next.delete(regiNo);
      } else {
        next.add(regiNo);
      }
      return next;
    });
  };

  const generateCertificatePreviews = () => {
    const selectedStudents = filteredStudents.filter((s) =>
      selectedRegiNos.has(s.RegiNo)
    );

    if (selectedStudents.length === 0) {
      toast({
        title: "No Students Selected",
        description:
          "Please select at least one student to generate certificate previews.",
        variant: "destructive",
      });
      return;
    }

    setCertificatePreviews(selectedStudents);
    setShowPreviews(true);

    toast({
      title: "Certificate Previews Generated",
      description: `Generated ${selectedStudents.length} certificate previews.`,
    });
  };

  const handleBackToSelection = () => {
    setShowPreviews(false);
    setCertificatePreviews([]);
  };

  const clearFilters = () => {
    setSelectedCourse("all");
    setSelectedBatch("all");
    setSearchTerm("");
  };

  const handleDownloadAll = async () => {
    if (certificatePreviews.length === 0) {
      toast({
        title: "No Certificates to Download",
        description: "There are no certificate previews to download.",
        variant: "destructive",
      });
      return;
    }

    setIsDownloadingAll(true);

    try {
      toast({
        title: "Starting Bulk Download",
        description: `Preparing to download ${certificatePreviews.length} certificates...`,
      });

      // Import jsPDF and html2canvas dynamically
      const { default: jsPDF } = await import("jspdf");
      const { default: html2canvas } = await import("html2canvas");

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < certificatePreviews.length; i++) {
        const student = certificatePreviews[i];

        try {
          // Wait a bit between downloads to avoid overwhelming the browser
          if (i > 0) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }

          // Find the certificate element for this student
          const certificateElement = document.querySelector(
            `[data-student-id="${student.RegiNo}"] .certificate-container`
          );

          if (!certificateElement) {
            console.warn(
              `Certificate element not found for student ${student.RegiNo}`
            );
            errorCount++;
            continue;
          }

          // Ensure template image is loaded before capturing
          const templateImg = certificateElement.querySelector(
            ".template-image"
          ) as HTMLImageElement;

          if (templateImg && !templateImg.complete) {
            await new Promise((resolve, reject) => {
              templateImg.onload = resolve;
              templateImg.onerror = reject;
              if (templateImg.complete) resolve(true);
            });
          }

          // Wait a bit to ensure all images are rendered
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Add PDF capture mode class
          const certificateHTMLElement = certificateElement as HTMLElement;
          certificateHTMLElement.classList.add("pdf-capture-mode");

          // Temporarily adjust KUG seal size for PDF generation
          const sealElement = certificateElement.querySelector(
            ".seal-image"
          ) as HTMLElement;
          const originalSealStyles = {
            width: sealElement?.style.width,
            height: sealElement?.style.height,
          };

          if (sealElement) {
            sealElement.style.height = "95px";
            sealElement.style.width = "75px";
            sealElement.style.marginBottom = "10px";
            sealElement.style.marginLeft = "0px";
          }

          // Capture the certificate
          const canvas = await html2canvas(certificateElement as HTMLElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
            logging: false,
            width: certificateElement.clientWidth,
            height: certificateElement.clientHeight,
            imageTimeout: 30000,
          });

          // Restore original styles
          certificateHTMLElement.classList.remove("pdf-capture-mode");

          if (sealElement) {
            sealElement.style.width = originalSealStyles.width || "";
            sealElement.style.height = originalSealStyles.height || "";
          }

          // Create PDF from the canvas
          const pdf = new jsPDF("p", "mm", "a4");
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();

          // Calculate the aspect ratio of the captured image
          const imgWidth = canvas.width;
          const imgHeight = canvas.height;
          const imgAspectRatio = imgWidth / imgHeight;
          const pdfAspectRatio = pdfWidth / pdfHeight;

          let finalWidth, finalHeight;

          if (imgAspectRatio > pdfAspectRatio) {
            finalWidth = pdfWidth;
            finalHeight = pdfWidth / imgAspectRatio;
          } else {
            finalHeight = pdfHeight;
            finalWidth = pdfHeight * imgAspectRatio;
          }

          // Center the image on the page
          const x = (pdfWidth - finalWidth) / 2;
          const y = (pdfHeight - finalHeight) / 2;

          // Convert canvas to image data URL with high quality
          const imgData = canvas.toDataURL("image/png", 1.0);

          // Add the image to PDF
          pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight);

          // Save the PDF
          pdf.save(
            `${student.RegiNo}_${student.Name.replace(
              /\s+/g,
              "_"
            )}_Certificate.pdf`
          );

          successCount++;
        } catch (error) {
          console.error(
            `Error generating certificate for ${student.RegiNo}:`,
            error
          );
          errorCount++;
        }
      }

      // Show final results
      if (successCount > 0) {
        toast({
          title: "Bulk Download Complete",
          description: `Successfully downloaded ${successCount} certificates${
            errorCount > 0 ? ` (${errorCount} failed)` : ""
          }`,
        });
      } else {
        toast({
          title: "Bulk Download Failed",
          description: "No certificates were downloaded successfully.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in bulk download:", error);
      toast({
        title: "Bulk Download Failed",
        description: "An error occurred during the bulk download process.",
        variant: "destructive",
      });
    } finally {
      setIsDownloadingAll(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] w-[95vw] sm:w-full overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-600" />
            {showPreviews
              ? "Certificate Previews"
              : "Bulk Certificate Download"}
          </DialogTitle>
          <DialogDescription>
            {showPreviews
              ? "Review and download individual certificates"
              : "Select students and generate certificate previews with filtering options"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 overflow-y-auto max-h-[calc(90vh-100px)]">
          {showPreviews ? (
            // Certificate Previews Section
            <div className="space-y-3">
              {/* Desktop requirement message for non-desktop users */}
              {!isDesktop && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Award className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Desktop View Required for Certificate Previews
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Certificate previews require desktop view for proper
                        display and PDF generation. Please switch to desktop
                        view to view and download certificates.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                  <span className="font-semibold text-sm sm:text-base text-emerald-900 dark:text-emerald-100">
                    {certificatePreviews.length} Certificate Previews
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                  <Button
                    onClick={handleDownloadAll}
                    disabled={isDownloadingAll}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 gap-2 w-full sm:w-auto"
                  >
                    {isDownloadingAll ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="hidden sm:inline">Downloading...</span>
                        <span className="sm:hidden">Downloading...</span>
                      </>
                    ) : (
                      <>
                        <DownloadCloud className="h-4 w-4" />
                        <span className="hidden sm:inline">Download All</span>
                        <span className="sm:hidden">Download All</span>
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleBackToSelection}
                    variant="outline"
                    className="gap-2 w-full sm:w-auto"
                  >
                    ← Back to Selection
                  </Button>
                </div>
              </div>

              {/* Certificate Previews - Only for desktop users */}
              {isDesktop && (
                <ScrollArea className="h-[300px] sm:h-[400px] rounded-md border p-2 sm:p-4">
                  <div className="space-y-3 sm:space-y-4">
                    {certificatePreviews.map((student, index) => (
                      <div
                        key={student.RegiNo}
                        data-student-id={student.RegiNo}
                        className="space-y-2 sm:space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-3 bg-muted rounded-lg gap-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-sm sm:text-lg truncate">
                              {student.Name}
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                              {student.RegiNo} • {student.CertificateNumber}
                            </p>
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground shrink-0">
                            Certificate {index + 1} of{" "}
                            {certificatePreviews.length}
                          </div>
                        </div>

                        {/* Certificate Preview */}
                        <div className="border rounded-lg p-2 sm:p-4 bg-white">
                          <Certificate student={student} />
                          <div className="mt-2 sm:mt-4">
                            <PrintPDFButtons student={student} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          ) : (
            // Student Selection Section
            <>
              {/* Summary */}
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 rounded-lg p-3 sm:p-4 border border-emerald-200 dark:border-emerald-800">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                      <span className="font-semibold text-sm sm:text-base text-emerald-900 dark:text-emerald-100">
                        {filteredStudents.length} Eligible Students
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pl-0 sm:pl-3 border-l-0 sm:border-l border-emerald-300/50 dark:border-emerald-700/50">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={toggleSelectAll}
                      />
                      <span className="text-xs sm:text-sm text-emerald-900 dark:text-emerald-200">
                        Select all ({selectedRegiNos.size}/
                        {filteredStudents.length})
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={generateCertificatePreviews}
                    disabled={
                      filteredStudents.length === 0 ||
                      selectedRegiNos.size === 0 ||
                      !isDesktop
                    }
                    className={`w-full sm:w-auto ${
                      isDesktop
                        ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                        : "bg-gray-400 text-gray-600 cursor-not-allowed"
                    }`}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isDesktop ? "Generate Previews" : "Use Desktop View"}
                  </Button>
                </div>
              </div>

              {/* Desktop requirement message for non-desktop users */}
              {!isDesktop && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Award className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Desktop View Required
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Certificate previews and bulk downloads work best on
                        desktop screens. Please switch to desktop view for the
                        full experience.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/30 rounded-lg border">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Course
                  </label>
                  <Select
                    value={selectedCourse}
                    onValueChange={setSelectedCourse}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.name}>
                          {course.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="PDA">PDA</SelectItem>
                      <SelectItem value="DCP">DCP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Batch</label>
                  <Select
                    value={selectedBatch}
                    onValueChange={setSelectedBatch}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Batches</SelectItem>
                      {batches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.name}>
                          {batch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Search
                  </label>
                  <Input
                    placeholder="Search by name, register no..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>

              {/* Progress Bar */}
              {isGenerating && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div
                    className="bg-gradient-to-r from-amber-600 to-orange-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              )}

              {/* Student List */}
              <ScrollArea className="h-[300px] sm:h-[400px] rounded-md border p-2 sm:p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Loading students and courses...</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1 sm:space-y-2">
                    {filteredStudents.map((student, index) => (
                      <div
                        key={student.RegiNo}
                        className="flex items-center justify-between p-2 sm:p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                      >
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <Checkbox
                            checked={selectedRegiNos.has(student.RegiNo)}
                            onCheckedChange={() => toggleOne(student.RegiNo)}
                            className="shrink-0"
                          />
                          <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary font-semibold text-xs sm:text-sm shrink-0">
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-xs sm:text-sm truncate">
                              {student.Name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              <span className="hidden sm:inline">Reg: </span>
                              {student.RegiNo}
                              <span className="hidden sm:inline">
                                {" "}
                                • Cert:{" "}
                              </span>
                              <span className="sm:hidden"> • </span>
                              {student.CertificateNumber}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                          <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium">
                            {student.Result}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {!isLoading && filteredStudents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No eligible students found.</p>
                  <p className="text-sm mt-2">
                    Try adjusting your filters or check if students have
                    certificate numbers and PASS results.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

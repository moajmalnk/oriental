import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer, FileText, CheckCircle, AlertCircle } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Student } from "@/data/studentsData";
import { useResponsive } from "@/hooks/use-responsive";
import { useToast } from "@/hooks/use-toast";

interface PrintPDFButtonsProps {
  student: Student;
}

export const PrintPDFButtons = ({ student }: PrintPDFButtonsProps) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const { isMobile, isTablet } = useResponsive();
  const { toast } = useToast();

  const handlePrint = async () => {
    setIsPrinting(true);
    
    try {
      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Hide theme toggle and other UI elements during print
      const themeToggle = document.querySelector('[data-print-hide]');
      if (themeToggle) {
        themeToggle.classList.add('print:hidden');
      }
      
      window.print();
      
      toast({
        title: "Print Ready",
        description: "Print dialog opened successfully",
      });
    } catch (error) {
      toast({
        title: "Print Error",
        description: "Failed to open print dialog",
        variant: "destructive",
      });
    } finally {
      setIsPrinting(false);
      
      // Restore theme toggle visibility
      const themeToggle = document.querySelector('[data-print-hide]');
      if (themeToggle) {
        themeToggle.classList.remove('print:hidden');
      }
    }
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      const element = document.getElementById("result-table");
      if (!element) {
        throw new Error("Result table not found");
      }

      // Show loading toast
      toast({
        title: "Generating PDF",
        description: "Please wait while we create your result document...",
      });

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calculate optimal scaling
      const ratio = Math.min(
        (pdfWidth - 20) / imgWidth, 
        (pdfHeight - 40) / imgHeight
      );
      
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 35;

      // Add professional header
      pdf.setFontSize(20);
      pdf.setTextColor(21, 92, 28); // Dark green color
      pdf.setFont("helvetica", "bold");
      pdf.text("KUG ORIENTAL ACADEMY", pdfWidth / 2, 15, { align: "center" });
      
      pdf.setFontSize(16);
      pdf.setTextColor(129, 57, 39); // Dark reddish-brown
      pdf.text("BATCH 15 RESULT", pdfWidth / 2, 25, { align: "center" });
      
      // Add student info
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Student: ${student.Name}`, 20, 30);
      pdf.text(`Registration: ${student.RegiNo}`, 20, 35);
      
      // Add the result table image
      pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      // Add footer
      const footerY = pdfHeight - 10;
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.setFont("helvetica", "italic");
      pdf.text("Generated on: " + new Date().toLocaleDateString(), pdfWidth / 2, footerY, { align: "center" });
      pdf.text("kugoriental.com", pdfWidth / 2, footerY - 5, { align: "center" });
      
      // Save the PDF
      pdf.save(`${student.RegiNo}_${student.Name.replace(/\s+/g, '_')}_Result.pdf`);
      
      toast({
        title: "PDF Downloaded",
        description: "Your result document has been saved successfully",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "PDF Generation Failed",
        description: "There was an error creating your PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleViewPDF = async () => {
    // This could open a preview modal or generate a temporary PDF for viewing
    toast({
      title: "PDF Preview",
      description: "PDF preview feature coming soon!",
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-6 sm:mt-8">
        {/* Print Button */}
        <Button
          onClick={handlePrint}
          variant="outline"
          size={isMobile ? "default" : "lg"}
          disabled={isPrinting}
          className="flex items-center gap-2 sm:gap-3 h-11 sm:h-12 px-4 sm:px-6 text-sm sm:text-base font-medium border-2 hover:bg-muted transition-all duration-300 rounded-xl shadow-sm hover:shadow-md"
        >
          {isPrinting ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span className="hidden sm:inline">Printing...</span>
              <span className="sm:hidden">Print...</span>
            </>
          ) : (
            <>
              <Printer className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Print Result</span>
              <span className="sm:hidden">Print</span>
            </>
          )}
        </Button>

        {/* Download PDF Button */}
        <Button
          onClick={handleDownloadPDF}
          size={isMobile ? "default" : "lg"}
          disabled={isGeneratingPDF}
          className="flex items-center gap-2 sm:gap-3 h-11 sm:h-12 px-4 sm:px-6 text-sm sm:text-base font-medium bg-gradient-primary hover:shadow-elegant transition-all duration-300 rounded-xl text-white"
        >
          {isGeneratingPDF ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="hidden sm:inline">Generating PDF...</span>
              <span className="sm:hidden">PDF...</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Download PDF</span>
              <span className="sm:hidden">PDF</span>
            </>
          )}
        </Button>

        {/* View PDF Button (Optional) */}
        {!isMobile && (
          <Button
            onClick={handleViewPDF}
            variant="ghost"
            size="lg"
            className="flex items-center gap-3 h-12 px-6 text-base font-medium hover:bg-accent/10 transition-all duration-300 rounded-xl"
          >
            <FileText className="h-5 w-5" />
            Preview PDF
          </Button>
        )}
      </div>

      {/* Professional Info Section */}
      <div className="mt-6 sm:mt-8 text-center">
        <div className="bg-gradient-card rounded-xl p-4 sm:p-6 border border-border/50 shadow-card">
          <h3 className="text-sm sm:text-base font-semibold text-foreground mb-2">
            Document Options
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <Printer className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Print for physical copy</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Download className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Download for digital storage</span>
            </div>
            {!isMobile && (
              <div className="flex items-center justify-center gap-2">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Preview before downloading</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
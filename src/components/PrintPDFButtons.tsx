import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
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

      // Wait for any animations to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calculate optimal scaling with better margins
      const marginLeft = 15; // Left margin in mm
      const marginRight = 15; // Right margin in mm
      const marginTop = 40; // Top margin in mm
      const marginBottom = 20; // Bottom margin in mm
      
      const availableWidth = pdfWidth - marginLeft - marginRight;
      const availableHeight = pdfHeight - marginTop - marginBottom;
      
      // Calculate scaling ratio to fit content within available space
      const scaleX = availableWidth / imgWidth;
      const scaleY = availableHeight / imgHeight;
      const scale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 100%
      
      // Calculate final dimensions
      const finalWidth = imgWidth * scale;
      const finalHeight = imgHeight * scale;
      
      // Center the image horizontally and position vertically
      const imgX = marginLeft + (availableWidth - finalWidth) / 2;
      const imgY = marginTop;

      // Add professional header with better spacing
      pdf.setFontSize(18);
      pdf.setTextColor(21, 92, 28); // Dark green color
      pdf.setFont("helvetica", "bold");
      pdf.text("KUG ORIENTAL ACADEMY", pdfWidth / 2, 15, { align: "center" });
      
      pdf.setFontSize(14);
      pdf.setTextColor(129, 57, 39); // Dark reddish-brown
      pdf.text("BATCH 15 RESULT", pdfWidth / 2, 25, { align: "center" });
      
      // Add student info with better positioning
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Student: ${student.Name}`, marginLeft, 32);
      pdf.text(`Registration: ${student.RegiNo}`, marginLeft, 37);
      
      // Add the result table image
      pdf.addImage(imgData, "PNG", imgX, imgY, finalWidth, finalHeight);
      
      // Add footer with better positioning
      const footerY = pdfHeight - 15;
      pdf.setFontSize(9);
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
      </div>

      {/* Professional Info Section */}
      <div className="mt-6 sm:mt-8 text-center">
        <div className="bg-gradient-card rounded-xl p-4 sm:p-6 border border-border/50 shadow-card">
          <h3 className="text-sm sm:text-base font-semibold text-foreground mb-2">
            Document Options
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <Printer className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Print for physical copy</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Download className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Download for digital storage</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
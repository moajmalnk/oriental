import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Student, DCPStudent } from "@/data/studentsData";
import { useResponsive } from "@/hooks/use-responsive";
import { useToast } from "@/hooks/use-toast";

interface PrintPDFButtonsProps {
  student: Student | DCPStudent;
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
      // Show loading toast
      toast({
        title: "Generating PDF",
        description: "Please wait while we create your result document...",
      });

      // Wait for any animations to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Add letterhead background
      try {
        const letterheadImg = new Image();
        letterheadImg.crossOrigin = "anonymous";
        letterheadImg.src = "/letterhead.jpg";
        
        await new Promise((resolve, reject) => {
          letterheadImg.onload = () => {
            // Scale letterhead to fit the page
            const imgWidth = letterheadImg.width;
            const imgHeight = letterheadImg.height;
            const scale = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            
            const finalWidth = imgWidth * scale;
            const finalHeight = imgHeight * scale;
            
            // Center the letterhead
            const x = (pdfWidth - finalWidth) / 2;
            const y = (pdfHeight - finalHeight) / 2;
            
            pdf.addImage(letterheadImg, "JPEG", x, y, finalWidth, finalHeight);
            resolve(true);
          };
          letterheadImg.onerror = reject;
        });
      } catch (error) {
        console.warn("Could not load letterhead image, continuing without it:", error);
      }

      // Type guard to check if student is DCP student
      const isDCPStudent = (student: Student | DCPStudent): student is DCPStudent => {
        return 'DCP001_CE' in student;
      };

      // Add MARK LIST title
      pdf.setFontSize(24);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "bold");
      pdf.text("MARK LIST", pdfWidth / 2, 85, { align: "center" });

      // Add student information section
      const startY = 100;
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "normal");
      
      pdf.text(`Register Number : ${student.RegiNo}`, 20, startY);
      pdf.text(`Name of Candidate : ${student.Name}`, 20, startY + 8);
      pdf.text(`Course Name : ${isDCPStudent(student) ? 'DIPLOMA IN COUNSELLING PSYCHOLOGY' : 'PRACTICAL DIPLOMA IN ACUPUNCTURE'}`, 20, startY + 16);
      pdf.text(`Result : ${student.Result}`, 20, startY + 24);

      // Add marks table
      const tableStartY = startY + 40;
      const colWidths = [80, 25, 25, 25]; // SUBJECT, TE, CE, TOTAL
      
      // Table header
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.rect(20, tableStartY - 5, colWidths[0], 8);
      pdf.rect(20 + colWidths[0], tableStartY - 5, colWidths[1], 8);
      pdf.rect(20 + colWidths[0] + colWidths[1], tableStartY - 5, colWidths[2], 8);
      pdf.rect(20 + colWidths[0] + colWidths[1] + colWidths[2], tableStartY - 5, colWidths[3], 8);
      
      pdf.text("SUBJECT-THEORY", 21, tableStartY);
      pdf.text("TE", 21 + colWidths[0], tableStartY);
      pdf.text("CE", 21 + colWidths[0] + colWidths[1], tableStartY);
      pdf.text("TOTAL", 21 + colWidths[0] + colWidths[1] + colWidths[2], tableStartY);

      let currentY = tableStartY + 8;

      // Add subject rows
      if (isDCPStudent(student)) {
        // DCP Subjects
        const subjects = [
          { name: "PSYCHOLOGY AND PSYCHOPATHOLOGY", ce: student.DCP001_CE, te: student.DCP001_TE, total: student.DCP001_Total },
          { name: "COUNSELLING STAGES,STEPS AND SKILLS", ce: student.DCP002_CE, te: student.DCP002_TE, total: student.DCP002_Total },
          { name: "LIFE SKILL EDUCATION AND FAMILY THERAPY", ce: student.DCP003_CE, te: student.DCP003_TE, total: student.DCP003_Total }
        ];

        subjects.forEach((subject, index) => {
          const rowY = currentY + (index * 8);
          
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(9);
          
          // Draw cell borders
          pdf.rect(20, rowY - 5, colWidths[0], 8);
          pdf.rect(20 + colWidths[0], rowY - 5, colWidths[1], 8);
          pdf.rect(20 + colWidths[0] + colWidths[1], rowY - 5, colWidths[2], 8);
          pdf.rect(20 + colWidths[0] + colWidths[1] + colWidths[2], rowY - 5, colWidths[3], 8);
          
          // Add text
          pdf.text(subject.name, 21, rowY);
          pdf.text(subject.te?.toString() || "-", 21 + colWidths[0], rowY);
          pdf.text(subject.ce?.toString() || "-", 21 + colWidths[0] + colWidths[1], rowY);
          pdf.text(subject.total?.toString() || "-", 21 + colWidths[0] + colWidths[1] + colWidths[2], rowY);
        });

        currentY += (subjects.length * 8) + 5;

        // Practical section
        pdf.rect(20, currentY - 5, colWidths[0], 8);
        pdf.rect(20 + colWidths[0], currentY - 5, colWidths[1], 8);
        pdf.rect(20 + colWidths[0] + colWidths[1], currentY - 5, colWidths[2], 8);
        pdf.rect(20 + colWidths[0] + colWidths[1] + colWidths[2], currentY - 5, colWidths[3], 8);
        
        pdf.text("PRACTICAL", 21, currentY);
        pdf.text(student.DCP004_PE?.toString() || "-", 21 + colWidths[0], currentY);
        pdf.text(student.DCP004_PW?.toString() || "-", 21 + colWidths[0] + colWidths[1], currentY);
        pdf.text(student.DCP004_Total?.toString() || "-", 21 + colWidths[0] + colWidths[1] + colWidths[2], currentY);

      } else {
        // Regular PDA Subjects
        const subjects = [
          { name: "ANATOMY", ce: student.Anatomy_CE, te: student.Anatomy_TE, total: student.Anatomy_Total },
          { name: "ACUPUNCTURE", ce: student.Acupuncture_CE, te: student.Acupuncture_TE, total: student.Acupuncture_Total }
        ];

        subjects.forEach((subject, index) => {
          const rowY = currentY + (index * 8);
          
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(9);
          
          // Draw cell borders
          pdf.rect(20, rowY - 5, colWidths[0], 8);
          pdf.rect(20 + colWidths[0], rowY - 5, colWidths[1], 8);
          pdf.rect(20 + colWidths[0] + colWidths[1], rowY - 5, colWidths[2], 8);
          pdf.rect(20 + colWidths[0] + colWidths[1] + colWidths[2], rowY - 5, colWidths[3], 8);
          
          // Add text
          pdf.text(subject.name, 21, rowY);
          pdf.text(subject.te?.toString() || "-", 21 + colWidths[0], rowY);
          pdf.text(subject.ce?.toString() || "-", 21 + colWidths[0] + colWidths[1], rowY);
          pdf.text(subject.total?.toString() || "-", 21 + colWidths[0] + colWidths[1] + colWidths[2], rowY);
        });

        currentY += (subjects.length * 8) + 5;

        // Practical section
        pdf.rect(20, currentY - 5, colWidths[0], 8);
        pdf.rect(20 + colWidths[0], currentY - 5, colWidths[1], 8);
        pdf.rect(20 + colWidths[0] + colWidths[1], currentY - 5, colWidths[2], 8);
        pdf.rect(20 + colWidths[0] + colWidths[1] + colWidths[2], currentY - 5, colWidths[3], 8);
        
        pdf.text("PRACTICAL", 21, currentY);
        pdf.text(student.Practical_Viva?.toString() || "-", 21 + colWidths[0], currentY);
        pdf.text(student.Practical_Project?.toString() || "-", 21 + colWidths[0] + colWidths[1], currentY);
        pdf.text(student.Practical_Total?.toString() || "-", 21 + colWidths[0] + colWidths[1] + colWidths[2], currentY);
      }

      // Add abbreviation
      currentY += 15;
      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "normal");
      pdf.text("Abbreviation: CE-Continuous Evaluation ,TE- Terminal Evaluation", pdfWidth / 2, currentY, { align: "center" });

      // Add maximum scores section
      currentY += 15;
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("MAXIMUM SCORES", pdfWidth / 2, currentY, { align: "center" });

      currentY += 10;
      
      // Maximum scores table header
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.rect(20, currentY - 5, colWidths[0], 8);
      pdf.rect(20 + colWidths[0], currentY - 5, colWidths[1], 8);
      pdf.rect(20 + colWidths[0] + colWidths[1], currentY - 5, colWidths[2], 8);
      pdf.rect(20 + colWidths[0] + colWidths[1] + colWidths[2], currentY - 5, colWidths[3], 8);
      
      pdf.text("SUBJECT-THEORY", 21, currentY);
      pdf.text("TE", 21 + colWidths[0], currentY);
      pdf.text("CE", 21 + colWidths[0] + colWidths[1], currentY);
      pdf.text("TOTAL", 21 + colWidths[0] + colWidths[1] + colWidths[2], currentY);

      currentY += 8;

      // Add maximum scores rows
      if (isDCPStudent(student)) {
        const maxSubjects = [
          { name: "PSYCHOLOGY AND PSYCHOPATHOLOGY", ce: 20, te: 60, total: 80 },
          { name: "COUNSELLING STAGES,STEPS AND SKILLS", ce: 20, te: 60, total: 80 },
          { name: "LIFE SKILL EDUCATION AND FAMILY THERAPY", ce: 20, te: 60, total: 80 }
        ];

        maxSubjects.forEach((subject, index) => {
          const rowY = currentY + (index * 8);
          
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(9);
          
          // Draw cell borders
          pdf.rect(20, rowY - 5, colWidths[0], 8);
          pdf.rect(20 + colWidths[0], rowY - 5, colWidths[1], 8);
          pdf.rect(20 + colWidths[0] + colWidths[1], rowY - 5, colWidths[2], 8);
          pdf.rect(20 + colWidths[0] + colWidths[1] + colWidths[2], rowY - 5, colWidths[3], 8);
          
          // Add text
          pdf.text(subject.name, 21, rowY);
          pdf.text(subject.te.toString(), 21 + colWidths[0], rowY);
          pdf.text(subject.ce.toString(), 21 + colWidths[0] + colWidths[1], rowY);
          pdf.text(subject.total.toString(), 21 + colWidths[0] + colWidths[1] + colWidths[2], rowY);
        });

        currentY += (maxSubjects.length * 8) + 5;

        // Practical maximum scores
        pdf.rect(20, currentY - 5, colWidths[0], 8);
        pdf.rect(20 + colWidths[0], currentY - 5, colWidths[1], 8);
        pdf.rect(20 + colWidths[0] + colWidths[1], currentY - 5, colWidths[2], 8);
        pdf.rect(20 + colWidths[0] + colWidths[1] + colWidths[2], currentY - 5, colWidths[3], 8);
        
        pdf.text("PRACTICAL", 21, currentY);
        pdf.text("40", 21 + colWidths[0], currentY); // PE
        pdf.text("20", 21 + colWidths[0] + colWidths[1], currentY); // PW
        pdf.text("60", 21 + colWidths[0] + colWidths[1] + colWidths[2], currentY); // Total

      } else {
        const maxSubjects = [
          { name: "ANATOMY", ce: 20, te: 60, total: 80 },
          { name: "ACUPUNCTURE", ce: 20, te: 60, total: 80 }
        ];

        maxSubjects.forEach((subject, index) => {
          const rowY = currentY + (index * 8);
          
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(9);
          
          // Draw cell borders
          pdf.rect(20, rowY - 5, colWidths[0], 8);
          pdf.rect(20 + colWidths[0], rowY - 5, colWidths[1], 8);
          pdf.rect(20 + colWidths[0] + colWidths[1], rowY - 5, colWidths[2], 8);
          pdf.rect(20 + colWidths[0] + colWidths[1] + colWidths[2], rowY - 5, colWidths[3], 8);
          
          // Add text
          pdf.text(subject.name, 21, rowY);
          pdf.text(subject.te.toString(), 21 + colWidths[0], rowY);
          pdf.text(subject.ce.toString(), 21 + colWidths[0] + colWidths[1], rowY);
          pdf.text(subject.total.toString(), 21 + colWidths[0] + colWidths[1] + colWidths[2], rowY);
        });

        currentY += (maxSubjects.length * 8) + 5;

        // Practical maximum scores
        pdf.rect(20, currentY - 5, colWidths[0], 8);
        pdf.rect(20 + colWidths[0], currentY - 5, colWidths[1], 8);
        pdf.rect(20 + colWidths[0] + colWidths[1], currentY - 5, colWidths[2], 8);
        pdf.rect(20 + colWidths[0] + colWidths[1] + colWidths[2], currentY - 5, colWidths[3], 8);
        
        pdf.text("PRACTICAL", 21, currentY);
        pdf.text("30", 21 + colWidths[0], currentY); // Viva
        pdf.text("30", 21 + colWidths[0] + colWidths[1], currentY); // Project
        pdf.text("60", 21 + colWidths[0] + colWidths[1] + colWidths[2], currentY); // Total
      }

      // Add footer fields
      currentY += 20;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text("CERTIFICATE NO:", 20, currentY);
      pdf.text("DATE:", pdfWidth - 40, currentY);

      // Save the PDF
      pdf.save(`${student.RegiNo}_${student.Name.replace(/\s+/g, '_')}_MarkList.pdf`);
      
      toast({
        title: "PDF Downloaded",
        description: "Your mark list document has been saved successfully",
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
    </div>
  );
};
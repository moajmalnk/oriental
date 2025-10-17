import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer, Award } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Student, DCPStudent } from "@/data/studentsData";
import { useResponsive } from "@/hooks/use-responsive";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface PrintPDFButtonsProps {
  student: Student | DCPStudent;
}

export const PrintPDFButtons = ({ student }: PrintPDFButtonsProps) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
  const { isMobile, isTablet } = useResponsive();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

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

      // Add letterhead background with compression
      try {
        const letterheadImg = new Image();
        letterheadImg.crossOrigin = "anonymous";
        letterheadImg.src = "/letterhead.jpg";
        
        await new Promise((resolve, reject) => {
          letterheadImg.onload = () => {
            // Create a canvas to compress the image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas size to a reasonable resolution (max 1200px width)
            const maxWidth = 1200;
            const maxHeight = 1600;
            const imgWidth = letterheadImg.width;
            const imgHeight = letterheadImg.height;
            
            // Calculate new dimensions maintaining aspect ratio
            let newWidth = imgWidth;
            let newHeight = imgHeight;
            
            if (imgWidth > maxWidth) {
              newWidth = maxWidth;
              newHeight = (imgHeight * maxWidth) / imgWidth;
            }
            
            if (newHeight > maxHeight) {
              newHeight = maxHeight;
              newWidth = (imgWidth * maxHeight) / imgHeight;
            }
            
            canvas.width = newWidth;
            canvas.height = newHeight;
            
            // Draw and compress the image
            ctx?.drawImage(letterheadImg, 0, 0, newWidth, newHeight);
            
            // Convert to compressed data URL with optimized quality
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6); // 60% quality for better compression
            
            // Create new image from compressed data
            const compressedImg = new Image();
            compressedImg.onload = () => {
              // Scale to fit the page
              const scale = Math.min(pdfWidth / compressedImg.width, pdfHeight / compressedImg.height);
              const finalWidth = compressedImg.width * scale;
              const finalHeight = compressedImg.height * scale;
              
              // Center the letterhead
              const x = (pdfWidth - finalWidth) / 2;
              const y = (pdfHeight - finalHeight) / 2;
              
              pdf.addImage(compressedImg, "JPEG", x, y, finalWidth, finalHeight);
              resolve(true);
            };
            compressedImg.src = compressedDataUrl;
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
      pdf.setFont("times", "bold");
      pdf.text("MARK LIST", pdfWidth / 2, 85, { align: "center" });

      // Add student information section
      const startY = 100;
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "normal");
      
      pdf.text(`Register Number : ${student.RegiNo}`, 20, startY);
      pdf.text(`Name of Candidate : ${student.Name}`, 20, startY + 8);
      pdf.text(`Course Name : ${isDCPStudent(student) ? 'DIPLOMA IN COUNSELLING PSYCHOLOGY' : 'PRACTICAL DIPLOMA IN ACUPUNCTURE'}`, 20, startY + 16);
      
      // Convert result to Qualified/Not Qualified
      const displayResult = student.Result === 'PASS' ? 'Qualified' : 'Not Qualified';
      pdf.text(`Result : ${displayResult}`, 20, startY + 24);

      // Add marks table
      const tableStartY = startY + 40;
      const colWidths = [80, 25, 25, 25]; // SUBJECT, TE, CE, TOTAL
      const totalTableWidth = colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3]; // Total table width
      const tableStartX = (pdfWidth - totalTableWidth) / 2; // Center the table
      
      // Table header
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      
      // Set border color to #a16a2b
      pdf.setDrawColor(161, 106, 43);
      
      // Draw rounded rectangles for table header
      pdf.roundedRect(tableStartX, tableStartY - 5, colWidths[0], 8, 1.5, 1.5);
      pdf.roundedRect(tableStartX + colWidths[0], tableStartY - 5, colWidths[1], 8, 1.5, 1.5);
      pdf.roundedRect(tableStartX + colWidths[0] + colWidths[1], tableStartY - 5, colWidths[2], 8, 1.5, 1.5);
      pdf.roundedRect(tableStartX + colWidths[0] + colWidths[1] + colWidths[2], tableStartY - 5, colWidths[3], 8, 1.5, 1.5);
      
      pdf.text("SUBJECT-THEORY", tableStartX + 3, tableStartY);
      pdf.text("TE", tableStartX + colWidths[0] + colWidths[1]/2, tableStartY, { align: "center" });
      pdf.text("CE", tableStartX + colWidths[0] + colWidths[1] + colWidths[2]/2, tableStartY, { align: "center" });
      pdf.text("TOTAL", tableStartX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3]/2, tableStartY, { align: "center" });

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
          
          // Draw cell borders with rounded corners
          pdf.roundedRect(tableStartX, rowY - 5, colWidths[0], 8, 1.5, 1.5);
          pdf.roundedRect(tableStartX + colWidths[0], rowY - 5, colWidths[1], 8, 1.5, 1.5);
          pdf.roundedRect(tableStartX + colWidths[0] + colWidths[1], rowY - 5, colWidths[2], 8, 1.5, 1.5);
          pdf.roundedRect(tableStartX + colWidths[0] + colWidths[1] + colWidths[2], rowY - 5, colWidths[3], 8, 1.5, 1.5);
          
          // Add text
          pdf.text(subject.name, tableStartX + 3, rowY);
          pdf.text(subject.te?.toString() || "-", tableStartX + colWidths[0] + colWidths[1]/2, rowY, { align: "center" });
          pdf.text(subject.ce?.toString() || "-", tableStartX + colWidths[0] + colWidths[1] + colWidths[2]/2, rowY, { align: "center" });
          pdf.text(subject.total?.toString() || "-", tableStartX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3]/2, rowY, { align: "center" });
        });

        currentY += (subjects.length * 8) + 5;

        // Practical section with merged first column
        // Draw the merged PRACTICAL cell spanning 2 rows
        pdf.roundedRect(tableStartX, currentY - 5, colWidths[0], 16, 1.5, 1.5); // Height of 16 for 2 rows
        pdf.roundedRect(tableStartX + colWidths[0], currentY - 5, colWidths[1], 8, 1.5, 1.5);
        pdf.roundedRect(tableStartX + colWidths[0] + colWidths[1], currentY - 5, colWidths[2], 8, 1.5, 1.5);
        pdf.roundedRect(tableStartX + colWidths[0] + colWidths[1] + colWidths[2], currentY - 5, colWidths[3], 8, 1.5, 1.5);
        
        pdf.text("PRACTICAL", tableStartX + 3, currentY + 4); // Center vertically in merged cell
        pdf.text("P.E", tableStartX + colWidths[0] + colWidths[1]/2, currentY, { align: "center" });
        pdf.text("P.W", tableStartX + colWidths[0] + colWidths[1] + colWidths[2]/2, currentY, { align: "center" });
        pdf.text("TOTAL", tableStartX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3]/2, currentY, { align: "center" });
        
        currentY += 8;
        
        // Practical data row
        pdf.roundedRect(tableStartX + colWidths[0], currentY - 5, colWidths[1], 8, 1.5, 1.5);
        pdf.roundedRect(tableStartX + colWidths[0] + colWidths[1], currentY - 5, colWidths[2], 8, 1.5, 1.5);
        pdf.roundedRect(tableStartX + colWidths[0] + colWidths[1] + colWidths[2], currentY - 5, colWidths[3], 8, 1.5, 1.5);
        
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.text(student.DCP004_PE?.toString() || "-", tableStartX + colWidths[0] + colWidths[1]/2, currentY, { align: "center" });
        pdf.text(student.DCP004_PW?.toString() || "-", tableStartX + colWidths[0] + colWidths[1] + colWidths[2]/2, currentY, { align: "center" });
        pdf.text(student.DCP004_Total?.toString() || "-", tableStartX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3]/2, currentY, { align: "center" });

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
          
          // Draw cell borders with rounded corners
          pdf.roundedRect(tableStartX, rowY - 5, colWidths[0], 8, 1.5, 1.5);
          pdf.roundedRect(tableStartX + colWidths[0], rowY - 5, colWidths[1], 8, 1.5, 1.5);
          pdf.roundedRect(tableStartX + colWidths[0] + colWidths[1], rowY - 5, colWidths[2], 8, 1.5, 1.5);
          pdf.roundedRect(tableStartX + colWidths[0] + colWidths[1] + colWidths[2], rowY - 5, colWidths[3], 8, 1.5, 1.5);
          
          // Add text
          pdf.text(subject.name, tableStartX + 3, rowY);
          pdf.text(subject.te?.toString() || "-", tableStartX + colWidths[0] + colWidths[1]/2, rowY, { align: "center" });
          pdf.text(subject.ce?.toString() || "-", tableStartX + colWidths[0] + colWidths[1] + colWidths[2]/2, rowY, { align: "center" });
          pdf.text(subject.total?.toString() || "-", tableStartX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3]/2, rowY, { align: "center" });
        });

        currentY += (subjects.length * 8) + 5;

        // Practical section with merged first column
        // Draw the merged PRACTICAL cell spanning 2 rows
        pdf.roundedRect(tableStartX, currentY - 5, colWidths[0], 16, 1.5, 1.5); // Height of 16 for 2 rows
        pdf.roundedRect(tableStartX + colWidths[0], currentY - 5, colWidths[1], 8, 1.5, 1.5);
        pdf.roundedRect(tableStartX + colWidths[0] + colWidths[1], currentY - 5, colWidths[2], 8, 1.5, 1.5);
        pdf.roundedRect(tableStartX + colWidths[0] + colWidths[1] + colWidths[2], currentY - 5, colWidths[3], 8, 1.5, 1.5);
        
        pdf.text("PRACTICAL", tableStartX + 3, currentY + 4); // Center vertically in merged cell
        pdf.text("P.E", tableStartX + colWidths[0] + colWidths[1]/2, currentY, { align: "center" });
        pdf.text("P.W", tableStartX + colWidths[0] + colWidths[1] + colWidths[2]/2, currentY, { align: "center" });
        pdf.text("TOTAL", tableStartX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3]/2, currentY, { align: "center" });
        
        currentY += 8;
        
        // Practical data row
        pdf.roundedRect(tableStartX + colWidths[0], currentY - 5, colWidths[1], 8, 1.5, 1.5);
        pdf.roundedRect(tableStartX + colWidths[0] + colWidths[1], currentY - 5, colWidths[2], 8, 1.5, 1.5);
        pdf.roundedRect(tableStartX + colWidths[0] + colWidths[1] + colWidths[2], currentY - 5, colWidths[3], 8, 1.5, 1.5);
        
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.text(student.Practical_Viva?.toString() || "-", tableStartX + colWidths[0] + colWidths[1]/2, currentY, { align: "center" });
        pdf.text(student.Practical_Project?.toString() || "-", tableStartX + colWidths[0] + colWidths[1] + colWidths[2]/2, currentY, { align: "center" });
        pdf.text(student.Practical_Total?.toString() || "-", tableStartX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3]/2, currentY, { align: "center" });
      }

      // Add abbreviation
      currentY += 15;
      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "normal");
      pdf.text("Abbreviation: CE-Continuous Evaluation, TE-Terminal Evaluation, P.E-Practical Evaluation, P.W-Practical Work", pdfWidth / 2, currentY, { align: "center" });

      // Add maximum scores section
      currentY += 15;
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("MAXIMUM SCORES", pdfWidth / 2, currentY, { align: "center" });

      currentY += 10;
      
      // Maximum scores table header
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      
      // Ensure border color is set for maximum scores table
      pdf.setDrawColor(161, 106, 43);
      
      pdf.roundedRect(tableStartX, currentY - 5, colWidths[0], 8, 1.5, 1.5);
      pdf.roundedRect(tableStartX + colWidths[0], currentY - 5, colWidths[1], 8, 1.5, 1.5);
      pdf.roundedRect(tableStartX + colWidths[0] + colWidths[1], currentY - 5, colWidths[2], 8, 1.5, 1.5);
      pdf.roundedRect(tableStartX + colWidths[0] + colWidths[1] + colWidths[2], currentY - 5, colWidths[3], 8, 1.5, 1.5);
      
      pdf.text("SUBJECT-THEORY", tableStartX + 3, currentY);
      pdf.text("TE", tableStartX + colWidths[0] + colWidths[1]/2, currentY, { align: "center" });
      pdf.text("CE", tableStartX + colWidths[0] + colWidths[1] + colWidths[2]/2, currentY, { align: "center" });
      pdf.text("TOTAL", tableStartX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3]/2, currentY, { align: "center" });

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
          
          // Draw cell borders with rounded corners
          pdf.roundedRect(tableStartX, rowY - 5, colWidths[0], 8, 1.5, 1.5);
          pdf.roundedRect(tableStartX + colWidths[0], rowY - 5, colWidths[1], 8, 1.5, 1.5);
          pdf.roundedRect(tableStartX + colWidths[0] + colWidths[1], rowY - 5, colWidths[2], 8, 1.5, 1.5);
          pdf.roundedRect(tableStartX + colWidths[0] + colWidths[1] + colWidths[2], rowY - 5, colWidths[3], 8, 1.5, 1.5);
          
          // Add text
          pdf.text(subject.name, tableStartX + 3, rowY);
          pdf.text(subject.te.toString(), tableStartX + colWidths[0] + colWidths[1]/2, rowY, { align: "center" });
          pdf.text(subject.ce.toString(), tableStartX + colWidths[0] + colWidths[1] + colWidths[2]/2, rowY, { align: "center" });
          pdf.text(subject.total.toString(), tableStartX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3]/2, rowY, { align: "center" });
        });

        currentY += (maxSubjects.length * 8) + 5;

        // Practical maximum scores with merged first column
        // Draw the merged PRACTICAL cell spanning 2 rows
        pdf.roundedRect(tableStartX, currentY - 5, colWidths[0], 16, 1.5, 1.5); // Height of 16 for 2 rows
        pdf.roundedRect(tableStartX + colWidths[0], currentY - 5, colWidths[1], 8, 1.5, 1.5);
        pdf.roundedRect(tableStartX + colWidths[0] + colWidths[1], currentY - 5, colWidths[2], 8, 1.5, 1.5);
        pdf.roundedRect(tableStartX + colWidths[0] + colWidths[1] + colWidths[2], currentY - 5, colWidths[3], 8, 1.5, 1.5);
        
        pdf.text("PRACTICAL", tableStartX + 3, currentY + 4); // Center vertically in merged cell
        pdf.text("P.E", tableStartX + colWidths[0] + colWidths[1]/2, currentY, { align: "center" });
        pdf.text("P.W", tableStartX + colWidths[0] + colWidths[1] + colWidths[2]/2, currentY, { align: "center" });
        pdf.text("TOTAL", tableStartX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3]/2, currentY, { align: "center" });
        
        currentY += 8;
        
        // Practical maximum scores data row
        pdf.roundedRect(tableStartX + colWidths[0], currentY - 5, colWidths[1], 8, 1.5, 1.5);
        pdf.roundedRect(tableStartX + colWidths[0] + colWidths[1], currentY - 5, colWidths[2], 8, 1.5, 1.5);
        pdf.roundedRect(tableStartX + colWidths[0] + colWidths[1] + colWidths[2], currentY - 5, colWidths[3], 8, 1.5, 1.5);
        
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.text("40", tableStartX + colWidths[0] + colWidths[1]/2, currentY, { align: "center" }); // PE
        pdf.text("20", tableStartX + colWidths[0] + colWidths[1] + colWidths[2]/2, currentY, { align: "center" }); // PW
        pdf.text("60", tableStartX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3]/2, currentY, { align: "center" }); // Total

      } else {
        const maxSubjects = [
          { name: "ANATOMY", ce: 20, te: 60, total: 80 },
          { name: "ACUPUNCTURE", ce: 20, te: 60, total: 80 }
        ];

        maxSubjects.forEach((subject, index) => {
          const rowY = currentY + (index * 8);
          
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(9);
          
          // Draw cell borders with rounded corners
          pdf.roundedRect(tableStartX, rowY - 5, colWidths[0], 8, 1.5, 1.5);
          pdf.roundedRect(tableStartX + colWidths[0], rowY - 5, colWidths[1], 8, 1.5, 1.5);
          pdf.roundedRect(tableStartX + colWidths[0] + colWidths[1], rowY - 5, colWidths[2], 8, 1.5, 1.5);
          pdf.roundedRect(tableStartX + colWidths[0] + colWidths[1] + colWidths[2], rowY - 5, colWidths[3], 8, 1.5, 1.5);
          
          // Add text
          pdf.text(subject.name, tableStartX + 3, rowY);
          pdf.text(subject.te.toString(), tableStartX + colWidths[0] + colWidths[1]/2, rowY, { align: "center" });
          pdf.text(subject.ce.toString(), tableStartX + colWidths[0] + colWidths[1] + colWidths[2]/2, rowY, { align: "center" });
          pdf.text(subject.total.toString(), tableStartX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3]/2, rowY, { align: "center" });
        });

        currentY += (maxSubjects.length * 8) + 5;

        // Practical maximum scores with merged first column
        // Draw the merged PRACTICAL cell spanning 2 rows
        pdf.roundedRect(tableStartX, currentY - 5, colWidths[0], 16, 1.5, 1.5); // Height of 16 for 2 rows
        pdf.roundedRect(tableStartX + colWidths[0], currentY - 5, colWidths[1], 8, 1.5, 1.5);
        pdf.roundedRect(tableStartX + colWidths[0] + colWidths[1], currentY - 5, colWidths[2], 8, 1.5, 1.5);
        pdf.roundedRect(tableStartX + colWidths[0] + colWidths[1] + colWidths[2], currentY - 5, colWidths[3], 8, 1.5, 1.5);
        
        pdf.text("PRACTICAL", tableStartX + 3, currentY + 4); // Center vertically in merged cell
        pdf.text("P.E", tableStartX + colWidths[0] + colWidths[1]/2, currentY, { align: "center" });
        pdf.text("P.W", tableStartX + colWidths[0] + colWidths[1] + colWidths[2]/2, currentY, { align: "center" });
        pdf.text("TOTAL", tableStartX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3]/2, currentY, { align: "center" });
        
        currentY += 8;
        
        // Practical maximum scores data row
        pdf.roundedRect(tableStartX + colWidths[0], currentY - 5, colWidths[1], 8, 1.5, 1.5);
        pdf.roundedRect(tableStartX + colWidths[0] + colWidths[1], currentY - 5, colWidths[2], 8, 1.5, 1.5);
        pdf.roundedRect(tableStartX + colWidths[0] + colWidths[1] + colWidths[2], currentY - 5, colWidths[3], 8, 1.5, 1.5);
        
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.text("30", tableStartX + colWidths[0] + colWidths[1]/2, currentY, { align: "center" }); // Viva
        pdf.text("30", tableStartX + colWidths[0] + colWidths[1] + colWidths[2]/2, currentY, { align: "center" }); // Project
        pdf.text("60", tableStartX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3]/2, currentY, { align: "center" }); // Total
      }

      // Add footer fields centered within two equal halves of the page
      currentY += 10;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");

      // Calculate centers for left and right halves
      const leftCenterX = pdfWidth / 4;
      const rightCenterX = (pdfWidth * 3) / 4;

      // Display certificate number centered in left half
      const certificateNo = student.CertificateNo || "Not Assigned";
      pdf.text(`CERTIFICATE NO: ${certificateNo}`, leftCenterX, currentY, { align: "center" });

      // Display date centered in right half
      let displayDate;
      if (isDCPStudent(student)) {
        displayDate = "03/10/2025"; // Default date for DCP
      } else {
        displayDate = "01/09/2025"; // Default date for PDA
      }
      pdf.text(`DATE: ${displayDate}`, rightCenterX, currentY, { align: "center" });

      // Add KUG seal - positioned below signatures
      // Based on CSS: .kug-seal left: 52%, bottom: 3% - 80px x 80px (90px on larger screens)
      try {
        const sealImg = new Image();
        sealImg.crossOrigin = "anonymous";
        sealImg.src = "/kug seal.png";
        
        await new Promise((resolve, reject) => {
          sealImg.onload = () => {
            // Create a canvas to compress the image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas size to match CSS .seal-image (80px x 80px)
            const sealSize = 80; // 80px to match CSS
            canvas.width = sealSize;
            canvas.height = sealSize;
            
            // Draw and compress the image
            ctx?.drawImage(sealImg, 0, 0, sealSize, sealSize);
            
            // Convert to compressed data URL (PNG for seal to maintain transparency)
            const compressedDataUrl = canvas.toDataURL('image/png', 0.7); // 70% quality for better compression
            
            // Create new image from compressed data
            const compressedImg = new Image();
            compressedImg.onload = () => {
              // Calculate seal size maintaining aspect ratio
              const sealWidth = 20; // Convert 80px to mm (approximately 20mm)
              const aspectRatio = compressedImg.height / compressedImg.width;
              const sealHeight = sealWidth * aspectRatio; // Maintain original aspect ratio
              
              // Position at center bottom (matching CSS: left: 52%, bottom: 3%)
              const sealX = (pdfWidth - sealWidth) / 2; // Center horizontally (52% from CSS)
              const sealY = pdfHeight - sealHeight - 8; // 3% from bottom edge
              
              // Add the seal image with original aspect ratio
              pdf.addImage(compressedImg, "PNG", sealX, sealY, sealWidth, sealHeight);
              resolve(true);
            };
            compressedImg.src = compressedDataUrl;
          };
          sealImg.onerror = reject;
        });
      } catch (error) {
        console.warn("Could not load KUG seal image:", error);
      }

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

  const handleGenerateCertificate = async () => {
    setIsGeneratingCertificate(true);
    
    try {
      // Show loading toast
      toast({
        title: "Generating Certificate",
        description: "Please wait while we create your certificate...",
      });

      // Wait for any animations to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Type guard to check if student is DCP student
      const isDCPStudent = (student: Student | DCPStudent): student is DCPStudent => {
        return 'DCP001_CE' in student;
      };

      // Load and add certificate template as background
      try {
        const templateImg = new Image();
        templateImg.crossOrigin = "anonymous";
        templateImg.src = "/Course Certificate Model WEB .jpg";
        
        await new Promise((resolve, reject) => {
          templateImg.onload = () => {
            // Create a canvas to compress the image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas size to a reasonable resolution (max 1200px width)
            const maxWidth = 1200;
            const maxHeight = 1600;
            const imgWidth = templateImg.width;
            const imgHeight = templateImg.height;
            
            // Calculate new dimensions maintaining aspect ratio
            let newWidth = imgWidth;
            let newHeight = imgHeight;
            
            if (imgWidth > maxWidth) {
              newWidth = maxWidth;
              newHeight = (imgHeight * maxWidth) / imgWidth;
            }
            
            if (newHeight > maxHeight) {
              newHeight = maxHeight;
              newWidth = (imgWidth * maxHeight) / imgHeight;
            }
            
            canvas.width = newWidth;
            canvas.height = newHeight;
            
            // Draw and compress the image
            ctx?.drawImage(templateImg, 0, 0, newWidth, newHeight);
            
            // Convert to compressed data URL with optimized quality
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8); // Higher quality for certificate
            
            // Create new image from compressed data
            const compressedImg = new Image();
            compressedImg.onload = () => {
              // Scale to fit the page
              const scale = Math.min(pdfWidth / compressedImg.width, pdfHeight / compressedImg.height);
              const finalWidth = compressedImg.width * scale;
              const finalHeight = compressedImg.height * scale;
              
              // Center the template
              const x = (pdfWidth - finalWidth) / 2;
              const y = (pdfHeight - finalHeight) / 2;
              
              pdf.addImage(compressedImg, "JPEG", x, y, finalWidth, finalHeight);
              resolve(true);
            };
            compressedImg.src = compressedDataUrl;
          };
          templateImg.onerror = reject;
        });
      } catch (error) {
        console.warn("Could not load certificate template image, continuing without it:", error);
      }

      // Add dynamic content over the template - EXACTLY matching Certificate.tsx structure
      
      // Reference Numbers - positioned on left side (CSS: left: 8%, top: 45%)
      pdf.setFontSize(11); // font-size: 11px from CSS .ref-line
      pdf.setFont("times", "bold");
      
      // Register Number with red value (matching .reg-value color)
      const regLabel = "Register No. :";
      const regY = 120; // Convert CSS top: 45% to PDF coordinates
      const regX = 20; // Convert CSS left: 8% to PDF coordinates
      pdf.setTextColor(139, 69, 19); // #8b4513 from CSS .ref-line
      pdf.text(regLabel, regX, regY);
      const regLabelWidth = pdf.getTextWidth(regLabel + " ");
      pdf.setTextColor(198, 40, 40); // #c62828 from CSS .reg-value
      pdf.text(String(student.RegiNo), regX + regLabelWidth, regY);

      // Certificate Number (positioned below Register No.)
      const certificateNo = student.CertificateNo || "2025" + student.RegiNo.slice(-4);
      pdf.setTextColor(139, 69, 19); // #8b4513 from CSS .ref-line
      pdf.text("Certificate No. :", regX, regY + 6); // 6px margin-bottom from CSS
      const certLabelWidth = pdf.getTextWidth("Certificate No. : ");
      pdf.setTextColor(17, 17, 17); // #111 from CSS .cert-value
      pdf.text(String(certificateNo), regX + certLabelWidth, regY + 6);

      // Course Conferred - positioned in center (CSS: left: 50%, top: 52%, transform: translateX(-50%))
      pdf.setFontSize(14); // font-size: 14px from CSS .conferral-text
      pdf.setFont("times", "normal");
      pdf.setTextColor(0, 0, 0); // Black color from CSS
      
      // "The certificate of" - positioned at course-conferred top: 52%
      pdf.text("The certificate of", pdfWidth / 2, 140, { align: "center" });

      // Course name - font-size: 20px from CSS .course-name
      const courseName = isDCPStudent(student) ? 'Diploma in Counselling Psychology' : 'Professional Diploma in Acupuncture';
      pdf.setFontSize(20);
      pdf.setFont("times", "bold");
      pdf.text(courseName, pdfWidth / 2, 150, { align: "center" }); // 8px margin-bottom from CSS

      // "has been conferred upon"
      pdf.setFontSize(14);
      pdf.setFont("times", "normal");
      pdf.text("has been conferred upon", pdfWidth / 2, 160, { align: "center" });

      // Student Name - positioned in center (CSS: left: 50%, top: 60%, transform: translateX(-50%))
      // font-size: 32px, font-weight: bold, letter-spacing: 1px
      pdf.setFontSize(32);
      pdf.setFont("times", "bold");
      pdf.text(student.Name.toUpperCase(), pdfWidth / 2, 175, { align: "center" });

      // Completion Statement - positioned in center (CSS: left: 50%, top: 67%, transform: translateX(-50%))
      // font-size: 13px, line-height: 1.5, max-width: 85%
      pdf.setFontSize(13);
      pdf.setFont("times", "normal");
      pdf.setTextColor(0, 0, 0); // Black color from CSS
      
      // Build completion statement in exactly 5 lines format as shown in screenshot
      const cLine1 = "who successfully completed the course at the Kug Oriental Academy of";
      const cLine2 = "Alternative Medicines Allied Sciences Foundation from June 2021 to";
      const cLine3 = "May 2022, and passed the final examination administered by the";
      const cLine4 = "Central Board of Examinations of the Kug Oriental Academy of";
      const cLine5 = "Alternative Medicines Allied Sciences Foundation.";

      // Completion paragraph positioned at top: 67% from CSS
      let completionY = 190; // Convert CSS top: 67% to PDF coordinates
      pdf.text(cLine1, pdfWidth / 2, completionY, { align: "center" });
      completionY += 6; // line-height: 1.5 from CSS (13px * 1.5 = ~19.5px, converted to 6mm)
      
      // Line 2 with bold "June 2021" (matching the screenshot exactly)
      pdf.setFont("times", "normal");
      const line2Text = "Alternative Medicines Allied Sciences Foundation from ";
      const line2BoldText = "June 2021";
      const line2NormalText2 = " to";
      const line2Width = pdf.getTextWidth(line2Text);
      const line2BoldWidth = pdf.getTextWidth(line2BoldText);
      const line2NormalWidth2 = pdf.getTextWidth(line2NormalText2);
      const line2StartX = (pdfWidth - (line2Width + line2BoldWidth + line2NormalWidth2)) / 2;
      pdf.text(line2Text, line2StartX, completionY);
      pdf.setFont("times", "bold");
      pdf.text(line2BoldText, line2StartX + line2Width, completionY);
      pdf.setFont("times", "normal");
      pdf.text(line2NormalText2, line2StartX + line2Width + line2BoldWidth, completionY);
      completionY += 6;
      
      // Line 3 with bold "May 2022" (matching the screenshot exactly)
      pdf.setFont("times", "bold");
      const line3BoldText = "May 2022";
      const line3NormalText = ", and passed the final examination administered by the";
      const line3BoldWidth = pdf.getTextWidth(line3BoldText);
      const line3NormalWidth = pdf.getTextWidth(line3NormalText);
      const line3StartX = (pdfWidth - (line3BoldWidth + line3NormalWidth)) / 2;
      pdf.text(line3BoldText, line3StartX, completionY);
      pdf.setFont("times", "normal");
      pdf.text(line3NormalText, line3StartX + line3BoldWidth, completionY);
      completionY += 6;
      
      pdf.text(cLine4, pdfWidth / 2, completionY, { align: "center" });
      completionY += 6;
      pdf.text(cLine5, pdfWidth / 2, completionY, { align: "center" });

      // Student Photo - positioned on right side (CSS: right: 8%, top: 45%)
      // photo-container: 80px x 80px, student-photo-img: 80px x 80px
      try {
        const photoImg = new Image();
        photoImg.crossOrigin = "anonymous";
        photoImg.src = `/DCP STUDENTS PHOTOS/${student.RegiNo}.png`;
        
        await new Promise((resolve, reject) => {
          photoImg.onload = () => {
            // Create a canvas to compress the image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas size for photo (square format) - 80px from CSS .student-photo-img
            const photoSize = 80; // 80px to match CSS exactly
            canvas.width = photoSize;
            canvas.height = photoSize;

            // Calculate proper aspect ratio to avoid stretching
            const aspectRatio = photoImg.width / photoImg.height;
            let drawWidth = photoSize;
            let drawHeight = photoSize;
            let offsetX = 0;
            let offsetY = 0;

            if (aspectRatio > 1) {
              // Image is wider than tall
              drawHeight = photoSize / aspectRatio;
              offsetY = (photoSize - drawHeight) / 2;
            } else if (aspectRatio < 1) {
              // Image is taller than wide
              drawWidth = photoSize * aspectRatio;
              offsetX = (photoSize - drawWidth) / 2;
            }

            // Crop a small margin to remove any borders present in source images
            const minDim = Math.min(photoImg.width, photoImg.height);
            const cropMargin = Math.floor(minDim * 0.08); // crop ~8% from each side
            const sx = cropMargin;
            const sy = cropMargin;
            const sWidth = photoImg.width - cropMargin * 2;
            const sHeight = photoImg.height - cropMargin * 2;
            
            // Draw cropped image into square canvas maintaining aspect ratio
            ctx?.drawImage(photoImg, sx, sy, sWidth, sHeight, offsetX, offsetY, drawWidth, drawHeight);
            
            // Convert to compressed data URL
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
            
            // Create new image from compressed data
            const compressedPhotoImg = new Image();
            compressedPhotoImg.onload = () => {
            // Position photo on the right side (matching CSS: right: 8%, top: 45%)
            const photoWidth = 20; // Convert 80px to mm (approximately 20mm)
            const photoHeight = 20; // Convert 80px to mm (approximately 20mm)
            const photoX = pdfWidth - photoWidth - 20; // 8% from right edge
            const photoY = 120; // Match CSS top: 45% positioning
              
              // Add the photo image
              pdf.addImage(compressedPhotoImg, "JPEG", photoX, photoY, photoWidth, photoHeight);
              resolve(true);
            };
            compressedPhotoImg.src = compressedDataUrl;
          };
          photoImg.onerror = () => {
            console.warn(`Could not load photo for ${student.RegiNo}`);
            resolve(true); // Continue without photo
          };
        });
      } catch (error) {
        console.warn("Could not load student photo:", error);
      }

      // Bottom Row - Date, Chairman, and Controller in one row (CSS: .bottom-row)
      // CSS: bottom: 12%, display: flex, justify-content: space-evenly, align-items: flex-end, padding: 0 5%
      const displayDate = isDCPStudent(student) ? "28/06/2021" : "28/06/2021";
      
      // Calculate bottom row positioning (CSS: bottom: 12%)
      const signatureY = 240; // Convert CSS bottom: 12% to PDF coordinates
      const titleY = signatureY + 8; // titles below signatures with proper spacing
      
      // Date section - positioned on left side (CSS: .date-section)
      // CSS: flex: 0 0 auto, min-width: 120px, text-align: center
      pdf.setFontSize(10); // font-size: 10px from CSS .date-text
      pdf.setFont("times", "bold");
      pdf.setTextColor(0, 0, 0); // Black color from CSS
      pdf.text(`Date: ${displayDate}`, 20, signatureY, { align: "left" });

      try {
        // Chairman signature (center) above title (CSS: .chairman-section)
        // CSS: .chairman-sign width: 80px, height: auto, margin: 0 auto 0px auto
        const chairmanImg = new Image();
        chairmanImg.crossOrigin = "anonymous";
        chairmanImg.src = "/UMMER SIR SIGN.png";

        await new Promise((resolve) => {
          chairmanImg.onload = () => {
            const width = 20; // Convert 80px to mm (approximately 20mm)
            const aspect = chairmanImg.height / chairmanImg.width;
            const height = width * aspect;
            const x = pdfWidth / 2 - width / 2; // Center horizontally
            const y = signatureY - 5; // slightly higher for better spacing
            pdf.addImage(chairmanImg, "PNG", x, y, width, height);
            resolve(true);
          };
          chairmanImg.onerror = () => resolve(true);
        });
      } catch {}

      try {
        // Controller signature (right) above title (CSS: .controller-section)
        // CSS: .controller-sign width: 100px, height: auto, margin: 0 auto 0px auto
        const controllerImg = new Image();
        controllerImg.crossOrigin = "anonymous";
        controllerImg.src = "/Nargees teacher Sign.png";

        await new Promise((resolve) => {
          controllerImg.onload = () => {
            const width = 25; // Convert 100px to mm (approximately 25mm)
            const aspect = controllerImg.height / controllerImg.width;
            const height = width * aspect;
            const x = pdfWidth - 20 - width; // Right side positioning
            const y = signatureY - 5; // slightly higher for better spacing
            pdf.addImage(controllerImg, "PNG", x, y, width, height);
            resolve(true);
          };
          controllerImg.onerror = () => resolve(true);
        });
      } catch {}

      // Add titles below signatures with proper spacing
      // CSS: .chairman-title and .controller-title font-size: 10px, font-weight: bold
      pdf.setFontSize(10);
      pdf.setFont("times", "bold");
      pdf.setTextColor(0, 0, 0); // Black color from CSS
      pdf.text("Chairman", pdfWidth / 2, titleY, { align: "center" });
      pdf.text("Controller", pdfWidth - 20, titleY, { align: "right" });
      pdf.text("of Examination", pdfWidth - 20, titleY + 4, { align: "right" }); // line-height: 1.2 from CSS

      // KUG Seal - positioned below signatures (CSS: .kug-seal)
      // CSS: left: 52%, bottom: 3%, transform: translateX(-50%), z-index: 3
      // CSS: .seal-image width: 80px, height: 80px, object-fit: contain
      try {
        const sealImg = new Image();
        sealImg.crossOrigin = "anonymous";
        sealImg.src = "/kug seal.png";
        
        await new Promise((resolve, reject) => {
          sealImg.onload = () => {
            // Create a canvas to compress the image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas size to match CSS .seal-image (80px x 80px)
            const sealSize = 80; // 80px to match CSS exactly
            canvas.width = sealSize;
            canvas.height = sealSize;
            
            // Draw and compress the image
            ctx?.drawImage(sealImg, 0, 0, sealSize, sealSize);
            
            // Convert to compressed data URL (PNG for seal to maintain transparency)
            const compressedDataUrl = canvas.toDataURL('image/png', 0.7); // 70% quality for better compression
            
            // Create new image from compressed data
            const compressedImg = new Image();
            compressedImg.onload = () => {
              // Calculate seal size maintaining aspect ratio
              const sealWidth = 20; // Convert 80px to mm (approximately 20mm)
              const aspectRatio = compressedImg.height / compressedImg.width;
              const sealHeight = sealWidth * aspectRatio; // Maintain original aspect ratio
              
              // Position at center bottom (matching CSS: left: 52%, bottom: 3%, transform: translateX(-50%))
              const sealX = (pdfWidth - sealWidth) / 2; // Center horizontally (52% from CSS)
              const sealY = pdfHeight - sealHeight - 8; // 3% from bottom edge
              
              // Add the seal image with original aspect ratio
              pdf.addImage(compressedImg, "PNG", sealX, sealY, sealWidth, sealHeight);
              resolve(true);
            };
            compressedImg.src = compressedDataUrl;
          };
          sealImg.onerror = reject;
        });
      } catch (error) {
        console.warn("Could not load KUG seal image:", error);
      }

      // Save the PDF
      pdf.save(`${student.RegiNo}_${student.Name.replace(/\s+/g, '_')}_Certificate.pdf`);
      
      toast({
        title: "Certificate Downloaded",
        description: "Your certificate has been generated successfully",
      });
    } catch (error) {
      console.error("Error generating certificate:", error);
      toast({
        title: "Certificate Generation Failed",
        description: "There was an error creating your certificate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingCertificate(false);
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
              <span className="hidden sm:inline">Download Mark List</span>
              <span className="sm:hidden">Mark List</span>
            </>
          )}
        </Button>

        {/* Certificate Button - Only for authenticated users */}
        {isAuthenticated && (
          <Button
            onClick={handleGenerateCertificate}
            size={isMobile ? "default" : "lg"}
            disabled={isGeneratingCertificate}
            className="flex items-center gap-2 sm:gap-3 h-11 sm:h-12 px-4 sm:px-6 text-sm sm:text-base font-medium bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 hover:shadow-elegant transition-all duration-300 rounded-xl text-white"
          >
            {isGeneratingCertificate ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="hidden sm:inline">Generating Certificate...</span>
                <span className="sm:hidden">Certificate...</span>
              </>
            ) : (
              <>
                <Award className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Generate Certificate</span>
                <span className="sm:hidden">Certificate</span>
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
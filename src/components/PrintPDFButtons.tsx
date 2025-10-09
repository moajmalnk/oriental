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

      // Add KUG seal at the right bottom corner with compression
      try {
        const sealImg = new Image();
        sealImg.crossOrigin = "anonymous";
        sealImg.src = "/kug seal.png";
        
        await new Promise((resolve, reject) => {
          sealImg.onload = () => {
            // Create a canvas to compress the image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas size to a reasonable resolution (max 300px width for seal)
            const maxWidth = 300;
            const imgWidth = sealImg.width;
            const imgHeight = sealImg.height;
            
            // Calculate new dimensions maintaining aspect ratio
            let newWidth = imgWidth;
            let newHeight = imgHeight;
            
            if (imgWidth > maxWidth) {
              newWidth = maxWidth;
              newHeight = (imgHeight * maxWidth) / imgWidth;
            }
            
            canvas.width = newWidth;
            canvas.height = newHeight;
            
            // Draw and compress the image
            ctx?.drawImage(sealImg, 0, 0, newWidth, newHeight);
            
            // Convert to compressed data URL (PNG for seal to maintain transparency)
            const compressedDataUrl = canvas.toDataURL('image/png', 0.7); // 70% quality for better compression
            
            // Create new image from compressed data
            const compressedImg = new Image();
            compressedImg.onload = () => {
              // Calculate seal size maintaining aspect ratio
              const sealWidth = 35; // 35mm width
              const aspectRatio = compressedImg.height / compressedImg.width;
              const sealHeight = sealWidth * aspectRatio; // Maintain original aspect ratio
              
              // Position at center bottom with 10mm margin
              const sealX = (pdfWidth - sealWidth) / 2.2; // Center horizontally
              const sealY = pdfHeight - sealHeight - 1; // 2mm from bottom edge
              
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

      // Add dynamic content over the template
      // Set text color to dark brown/black for visibility
      pdf.setTextColor(101, 67, 33); // Dark brown color similar to template text

      // Add Register Number (positioned on the left side, matching template layout)
      pdf.setFontSize(9);
      pdf.setFont("times", "bold");
      // Draw label and value separately to color the value red
      const regLabel = "Register No. : ";
      const regY = 135;
      const regX = 20;
      pdf.setTextColor(0, 0, 0);
      pdf.text(regLabel, regX, regY);
      const regLabelWidth = pdf.getTextWidth(regLabel);
      pdf.setTextColor(198, 40, 40); // deep red
      pdf.text(String(student.RegiNo), regX + regLabelWidth, regY);

      // Add Certificate Number (positioned below Register No.)
      const certificateNo = student.CertificateNo || "2025" + student.RegiNo.slice(-4);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Certificate No. : ${certificateNo}`, 20, 143);

      // Add course description text (centered, matching template)
      pdf.setFontSize(10);
      pdf.setFont("times", "normal");
      pdf.setTextColor(0, 0, 0); // Black color
      
      // "The certificate of"
      // Drop center block a bit further from top
      pdf.text("The certificate of", pdfWidth / 2, 157, { align: "center" });

      // Course name
      const courseName = isDCPStudent(student) ? 'Diploma in Counselling Psychology' : 'Professional Diploma in Acupuncture';
      pdf.setFontSize(14);
      pdf.setFont("times", "bold");
      pdf.text(courseName, pdfWidth / 2, 165, { align: "center" });

      // "has been conferred upon"
      pdf.setFontSize(10);
      pdf.setFont("times", "normal");
      pdf.text("has been conferred upon", pdfWidth / 2, 173, { align: "center" });

      // Candidate Name - centered and prominent
      pdf.setFontSize(18);
      pdf.setFont("times", "bold");
      pdf.text(student.Name.toUpperCase(), pdfWidth / 2, 184, { align: "center" });

      // Add course completion details (centered, matching template layout)
      pdf.setFontSize(9);
      pdf.setFont("times", "normal");
      pdf.setTextColor(0, 0, 0); // Black color
      
      // Build 5-line paragraph per screenshot; bold the date range line
      const dcpRange = 'October 2024 to September 2025';
      const pdaRange = 'July 2024 to July 2025';
      const rangeText = isDCPStudent(student) ? dcpRange : pdaRange;

      const cLine1 = "who successfully completed the course at the Kug Oriental Academy of";
      const cLine2 = "Alternative Medicines Allied Sciences Foundation from";
      const cLine3 = `${rangeText},`;
      const cLine4 = "and passed the final examination administered by the Central Board of Examinations of the Kug";
      const cLine5 = "Oriental Academy of Alternative Medicines Allied Sciences Foundation.";

      // Completion paragraph aligned to ~62% of page height
      let completionY = 200;
      pdf.text(cLine1, pdfWidth / 2, completionY, { align: "center" });
      completionY += 4;
      pdf.text(cLine2, pdfWidth / 2, completionY, { align: "center" });
      completionY += 4;
      pdf.setFont('times', 'bold');
      pdf.text(cLine3, pdfWidth / 2, completionY, { align: "center" });
      pdf.setFont('times', 'normal');
      completionY += 4;
      pdf.text(cLine4, pdfWidth / 2, completionY, { align: "center" });
      completionY += 4;
      pdf.text(cLine5, pdfWidth / 2, completionY, { align: "center" });

      // Add student photo
      try {
        const photoImg = new Image();
        photoImg.crossOrigin = "anonymous";
        photoImg.src = `/DCP STUDENTS PHOTOS/${student.RegiNo}.png`;
        
        await new Promise((resolve, reject) => {
          photoImg.onload = () => {
            // Create a canvas to compress the image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas size for photo (square format)
            const photoSize = 200; // 200px for good quality
            canvas.width = photoSize;
            canvas.height = photoSize;

            // Crop a small margin to remove any borders present in source images
            const minDim = Math.min(photoImg.width, photoImg.height);
            const cropMargin = Math.floor(minDim * 0.08); // crop ~8% from each side
            const sx = cropMargin;
            const sy = cropMargin;
            const sWidth = photoImg.width - cropMargin * 2;
            const sHeight = photoImg.height - cropMargin * 2;
            
            // Draw cropped image into square canvas (no border)
            ctx?.drawImage(photoImg, sx, sy, sWidth, sHeight, 0, 0, photoSize, photoSize);
            
            // Convert to compressed data URL
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
            
            // Create new image from compressed data
            const compressedPhotoImg = new Image();
            compressedPhotoImg.onload = () => {
            // Position photo on the right side (matching template layout)
            const photoWidth = 20; // 20mm width
            const photoHeight = 20; // 20mm height (square)
            const photoX = pdfWidth - photoWidth - 25; // 25mm from right edge
            const photoY = 135; // Dropped further from top for spacing
              
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

      // Prepare date text for footer row
      const displayDate = isDCPStudent(student) ? "03/10/2025" : "06/10/2025";
      pdf.setFontSize(9);
      pdf.setFont("times", "normal");

      // Add signatures images and titles
      pdf.setFontSize(9);
      pdf.setTextColor(101, 67, 33);

      // Titles first (above signatures) moved lower near bottom; date on same row (left)
      const titleY = 246; // lower placement
      pdf.text(`Date: ${displayDate}`, 20, titleY, { align: "left" });
      pdf.text("Chairman", pdfWidth / 2, titleY, { align: "center" });
      pdf.text("Controller", pdfWidth - 20, titleY, { align: "right" });
      pdf.text("of Examination", pdfWidth - 20, titleY + 4, { align: "right" });

      try {
        // Chairman signature (center) below title
        const chairmanImg = new Image();
        chairmanImg.crossOrigin = "anonymous";
        chairmanImg.src = "/UMMER SIR SIGN.png";

        await new Promise((resolve) => {
          chairmanImg.onload = () => {
            const width = 28; // ~28mm
            const aspect = chairmanImg.height / chairmanImg.width;
            const height = width * aspect;
            const x = pdfWidth / 2 - width / 2;
            const y = titleY + 2; // below title
            pdf.addImage(chairmanImg, "PNG", x, y, width, height);
            resolve(true);
          };
          chairmanImg.onerror = () => resolve(true);
        });
      } catch {}

      try {
        // Controller signature (right) below title
        const controllerImg = new Image();
        controllerImg.crossOrigin = "anonymous";
        controllerImg.src = "/Nargees teacher Sign.png";

        await new Promise((resolve) => {
          controllerImg.onload = () => {
            const width = 32; // ~32mm
            const aspect = controllerImg.height / controllerImg.width;
            const height = width * aspect;
            const x = pdfWidth - 20 - width;
            const y = titleY + 2;
            pdf.addImage(controllerImg, "PNG", x, y, width, height);
            resolve(true);
          };
          controllerImg.onerror = () => resolve(true);
        });
      } catch {}

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
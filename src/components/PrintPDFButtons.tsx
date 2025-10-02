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
      
      pdf.text("SUBJECT-THEORY", tableStartX + 1, tableStartY);
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
          pdf.text(subject.name, tableStartX + 1, rowY);
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
        
        pdf.text("PRACTICAL", tableStartX + 1, currentY + 4); // Center vertically in merged cell
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
          pdf.text(subject.name, tableStartX + 1, rowY);
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
        
        pdf.text("PRACTICAL", tableStartX + 1, currentY + 4); // Center vertically in merged cell
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
      
      pdf.text("SUBJECT-THEORY", tableStartX + 1, currentY);
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
          pdf.text(subject.name, tableStartX + 1, rowY);
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
        
        pdf.text("PRACTICAL", tableStartX + 1, currentY + 4); // Center vertically in merged cell
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
          pdf.text(subject.name, tableStartX + 1, rowY);
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
        
        pdf.text("PRACTICAL", tableStartX + 1, currentY + 4); // Center vertically in merged cell
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

      // Add footer fields with proper alignment
      currentY += 10;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      
      // Display certificate number if available
      const certificateNo = student.CertificateNo || "Not Assigned";
      pdf.text(`CERTIFICATE NO: ${certificateNo}`, 20, currentY);
      
      // Display date based on course type
      let displayDate;
      if (isDCPStudent(student)) {
        displayDate = "18/10/2025"; // Default date for DCP
      } else {
        displayDate = "01/09/2025"; // Default date for PDA
      }
      pdf.text(`DATE: ${displayDate}`, pdfWidth - 60, currentY);

      // Add KUG seal at the right bottom corner without stretching
      try {
        const sealImg = new Image();
        sealImg.crossOrigin = "anonymous";
        sealImg.src = "/kug seal.png";
        
        await new Promise((resolve, reject) => {
          sealImg.onload = () => {
            // Calculate seal size maintaining aspect ratio
            const sealWidth = 35; // 35mm width
            const aspectRatio = sealImg.height / sealImg.width;
            const sealHeight = sealWidth * aspectRatio; // Maintain original aspect ratio
            
            // Position at right bottom corner with 10mm margins
            const sealX = pdfWidth - sealWidth - 110; // 10mm from right edge
            const sealY = pdfHeight - sealHeight - -1; // 4mm from bottom edge
            
            // Add the seal image with original aspect ratio
            pdf.addImage(sealImg, "PNG", sealX, sealY, sealWidth, sealHeight);
            resolve(true);
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
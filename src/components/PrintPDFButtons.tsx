import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer, Award } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Student } from "@/types";
import { useResponsive } from "@/hooks/use-responsive";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface PrintPDFButtonsProps {
  student: Student;
}

export const PrintPDFButtons = ({ student }: PrintPDFButtonsProps) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const handlePrint = async () => {
    setIsPrinting(true);

    try {
      // Add a small delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Hide theme toggle and other UI elements during print
      const themeToggle = document.querySelector("[data-print-hide]");
      if (themeToggle) {
        themeToggle.classList.add("print:hidden");
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
      const themeToggle = document.querySelector("[data-print-hide]");
      if (themeToggle) {
        themeToggle.classList.remove("print:hidden");
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
      await new Promise((resolve) => setTimeout(resolve, 100));

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
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

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
            const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.6); // 60% quality for better compression

            // Create new image from compressed data
            const compressedImg = new Image();
            compressedImg.onload = () => {
              // Scale to fit the page
              const scale = Math.min(
                pdfWidth / compressedImg.width,
                pdfHeight / compressedImg.height
              );
              const finalWidth = compressedImg.width * scale;
              const finalHeight = compressedImg.height * scale;

              // Center the letterhead
              const x = (pdfWidth - finalWidth) / 2;
              const y = (pdfHeight - finalHeight) / 2;

              pdf.addImage(
                compressedImg,
                "JPEG",
                x,
                y,
                finalWidth,
                finalHeight
              );
              resolve(true);
            };
            compressedImg.src = compressedDataUrl;
          };
          letterheadImg.onerror = reject;
        });
      } catch (error) {
        console.warn(
          "Could not load letterhead image, continuing without it:",
          error
        );
      }

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
      pdf.text(`Course Name : ${student.Course}`, 20, startY + 16);

      // Convert result to Qualified/Not Qualified
      const displayResult =
        student.Result === "Pass" ||
        student.Result === "PASS" ||
        student.Result === "pass"
          ? "Qualified"
          : "Not Qualified";
      pdf.text(`Result : ${displayResult}`, 20, startY + 24);

      // Add marks table
      const tableStartY = startY + 40;
      const colWidths = [80, 25, 25, 25]; // SUBJECT, TE, CE, TOTAL
      const totalTableWidth =
        colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3]; // Total table width
      const tableStartX = (pdfWidth - totalTableWidth) / 2; // Center the table

      // Table header
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");

      // Set border color to #a16a2b
      pdf.setDrawColor(161, 106, 43);

      // Draw rounded rectangles for table header
      pdf.roundedRect(tableStartX, tableStartY - 5, colWidths[0], 8, 1.5, 1.5);
      pdf.roundedRect(
        tableStartX + colWidths[0],
        tableStartY - 5,
        colWidths[1],
        8,
        1.5,
        1.5
      );
      pdf.roundedRect(
        tableStartX + colWidths[0] + colWidths[1],
        tableStartY - 5,
        colWidths[2],
        8,
        1.5,
        1.5
      );
      pdf.roundedRect(
        tableStartX + colWidths[0] + colWidths[1] + colWidths[2],
        tableStartY - 5,
        colWidths[3],
        8,
        1.5,
        1.5
      );

      pdf.text("SUBJECT-THEORY", tableStartX + 3, tableStartY);
      pdf.text(
        "TE",
        tableStartX + colWidths[0] + colWidths[1] / 2,
        tableStartY,
        { align: "center" }
      );
      pdf.text(
        "CE",
        tableStartX + colWidths[0] + colWidths[1] + colWidths[2] / 2,
        tableStartY,
        { align: "center" }
      );
      pdf.text(
        "TOTAL",
        tableStartX +
          colWidths[0] +
          colWidths[1] +
          colWidths[2] +
          colWidths[3] / 2,
        tableStartY,
        { align: "center" }
      );

      let currentY = tableStartY + 8;

      // Add subject rows using actual backend data (only theory subjects)
      if (student.Subjects && student.Subjects.length > 0) {
        // Filter only theory subjects for the theory section
        const theorySubjects = student.Subjects.filter(
          (subject: any) => subject?.SubjectType === "Theory"
        );

        // Use actual backend subjects data (only theory subjects)
        const subjects = theorySubjects.map((subject: any) => ({
          name: subject?.SubjectName || "-",
          ce: subject?.CE || null,
          te: subject?.TE || null,
          pe: subject?.PE || null,
          pw: subject?.PW || null,
          theoryTotal: subject?.TheoryTotal || null,
          practicalTotal: subject?.PracticalTotal || null,
          overallObtained: subject?.OverallObtained || null,
          subjectType: subject?.SubjectType || "Theory",
          // Maximum scores from subject configuration
          ceMax: subject?.CE_Max || null,
          teMax: subject?.TE_Max || null,
          peMax: subject?.PE_Max || null,
          pwMax: subject?.PW_Max || null,
          theoryTotalMax: subject?.TheoryTotal_Max || null,
          practicalTotalMax: subject?.PracticalTotal_Max || null,
          overallTotalMax: subject?.OverallTotal_Max || null,
        }));

        subjects.forEach((subject, index) => {
          const rowY = currentY + index * 8;

          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(9);

          // Draw cell borders with rounded corners
          pdf.roundedRect(tableStartX, rowY - 5, colWidths[0], 8, 1.5, 1.5);
          pdf.roundedRect(
            tableStartX + colWidths[0],
            rowY - 5,
            colWidths[1],
            8,
            1.5,
            1.5
          );
          pdf.roundedRect(
            tableStartX + colWidths[0] + colWidths[1],
            rowY - 5,
            colWidths[2],
            8,
            1.5,
            1.5
          );
          pdf.roundedRect(
            tableStartX + colWidths[0] + colWidths[1] + colWidths[2],
            rowY - 5,
            colWidths[3],
            8,
            1.5,
            1.5
          );

          // Add text
          pdf.text(subject.name || "-", tableStartX + 3, rowY);
          pdf.text(
            subject.te?.toString() || "-",
            tableStartX + colWidths[0] + colWidths[1] / 2,
            rowY,
            { align: "center" }
          );
          pdf.text(
            subject.ce?.toString() || "-",
            tableStartX + colWidths[0] + colWidths[1] + colWidths[2] / 2,
            rowY,
            { align: "center" }
          );
          pdf.text(
            subject.overallObtained?.toString() || "-",
            tableStartX +
              colWidths[0] +
              colWidths[1] +
              colWidths[2] +
              colWidths[3] / 2,
            rowY,
            { align: "center" }
          );
        });

        currentY += subjects.length * 8 + 5;

        // Practical section with merged first column
        // Draw the merged PRACTICAL cell spanning 2 rows
        pdf.roundedRect(tableStartX, currentY - 5, colWidths[0], 16, 1.5, 1.5); // Height of 16 for 2 rows
        pdf.roundedRect(
          tableStartX + colWidths[0],
          currentY - 5,
          colWidths[1],
          8,
          1.5,
          1.5
        );
        pdf.roundedRect(
          tableStartX + colWidths[0] + colWidths[1],
          currentY - 5,
          colWidths[2],
          8,
          1.5,
          1.5
        );
        pdf.roundedRect(
          tableStartX + colWidths[0] + colWidths[1] + colWidths[2],
          currentY - 5,
          colWidths[3],
          8,
          1.5,
          1.5
        );

        pdf.text("PRACTICAL", tableStartX + 3, currentY + 4); // Center vertically in merged cell
        pdf.text(
          "P.E",
          tableStartX + colWidths[0] + colWidths[1] / 2,
          currentY,
          { align: "center" }
        );
        pdf.text(
          "P.W",
          tableStartX + colWidths[0] + colWidths[1] + colWidths[2] / 2,
          currentY,
          { align: "center" }
        );
        pdf.text(
          "TOTAL",
          tableStartX +
            colWidths[0] +
            colWidths[1] +
            colWidths[2] +
            colWidths[3] / 2,
          currentY,
          { align: "center" }
        );

        currentY += 8;

        // Practical data row
        pdf.roundedRect(
          tableStartX + colWidths[0],
          currentY - 5,
          colWidths[1],
          8,
          1.5,
          1.5
        );
        pdf.roundedRect(
          tableStartX + colWidths[0] + colWidths[1],
          currentY - 5,
          colWidths[2],
          8,
          1.5,
          1.5
        );
        pdf.roundedRect(
          tableStartX + colWidths[0] + colWidths[1] + colWidths[2],
          currentY - 5,
          colWidths[3],
          8,
          1.5,
          1.5
        );

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        // Get practical subjects from backend data
        const practicalSubjects =
          student.Subjects?.filter(
            (subject: any) => subject?.SubjectType === "Practical"
          ) || [];

        if (practicalSubjects.length > 0) {
          const practicalSubject = practicalSubjects[0]; // Use first practical subject
          pdf.text(
            practicalSubject?.PE?.toString() || "-",
            tableStartX + colWidths[0] + colWidths[1] / 2,
            currentY,
            { align: "center" }
          );
          pdf.text(
            practicalSubject?.PW?.toString() || "-",
            tableStartX + colWidths[0] + colWidths[1] + colWidths[2] / 2,
            currentY,
            { align: "center" }
          );
          pdf.text(
            practicalSubject?.PracticalTotal?.toString() || "-",
            tableStartX +
              colWidths[0] +
              colWidths[1] +
              colWidths[2] +
              colWidths[3] / 2,
            currentY,
            { align: "center" }
          );
        } else {
          pdf.text(
            "-",
            tableStartX + colWidths[0] + colWidths[1] / 2,
            currentY,
            { align: "center" }
          );
          pdf.text(
            "-",
            tableStartX + colWidths[0] + colWidths[1] + colWidths[2] / 2,
            currentY,
            { align: "center" }
          );
          pdf.text(
            "-",
            tableStartX +
              colWidths[0] +
              colWidths[1] +
              colWidths[2] +
              colWidths[3] / 2,
            currentY,
            { align: "center" }
          );
        }
      }

      // Add abbreviation
      currentY += 15;
      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        "Abbreviation: CE-Continuous Evaluation, TE-Terminal Evaluation, P.E-Practical Evaluation, P.W-Practical Work",
        pdfWidth / 2,
        currentY,
        { align: "center" }
      );

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
      pdf.roundedRect(
        tableStartX + colWidths[0],
        currentY - 5,
        colWidths[1],
        8,
        1.5,
        1.5
      );
      pdf.roundedRect(
        tableStartX + colWidths[0] + colWidths[1],
        currentY - 5,
        colWidths[2],
        8,
        1.5,
        1.5
      );
      pdf.roundedRect(
        tableStartX + colWidths[0] + colWidths[1] + colWidths[2],
        currentY - 5,
        colWidths[3],
        8,
        1.5,
        1.5
      );

      pdf.text("SUBJECT-THEORY", tableStartX + 3, currentY);
      pdf.text("TE", tableStartX + colWidths[0] + colWidths[1] / 2, currentY, {
        align: "center",
      });
      pdf.text(
        "CE",
        tableStartX + colWidths[0] + colWidths[1] + colWidths[2] / 2,
        currentY,
        { align: "center" }
      );
      pdf.text(
        "TOTAL",
        tableStartX +
          colWidths[0] +
          colWidths[1] +
          colWidths[2] +
          colWidths[3] / 2,
        currentY,
        { align: "center" }
      );

      currentY += 8;

      // Add maximum scores rows using backend data (only theory subjects)
      if (student.Subjects && student.Subjects.length > 0) {
        // Filter only theory subjects for maximum scores
        const theorySubjects = student.Subjects.filter(
          (subject: any) => subject?.SubjectType === "Theory"
        );

        // Use actual backend subjects data for maximum scores (only theory subjects)
        const maxSubjects = theorySubjects.map((subject: any) => ({
          name: subject?.SubjectName || "-",
          ce: subject?.CE_Max || null,
          te: subject?.TE_Max || null,
          overallObtained: subject?.OverallTotal_Max || null,
        }));

        maxSubjects.forEach((subject, index) => {
          const rowY = currentY + index * 8;

          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(9);

          // Draw cell borders with rounded corners
          pdf.roundedRect(tableStartX, rowY - 5, colWidths[0], 8, 1.5, 1.5);
          pdf.roundedRect(
            tableStartX + colWidths[0],
            rowY - 5,
            colWidths[1],
            8,
            1.5,
            1.5
          );
          pdf.roundedRect(
            tableStartX + colWidths[0] + colWidths[1],
            rowY - 5,
            colWidths[2],
            8,
            1.5,
            1.5
          );
          pdf.roundedRect(
            tableStartX + colWidths[0] + colWidths[1] + colWidths[2],
            rowY - 5,
            colWidths[3],
            8,
            1.5,
            1.5
          );

          // Add text
          pdf.text(subject.name || "-", tableStartX + 3, rowY);
          pdf.text(
            subject.te?.toString() || "-",
            tableStartX + colWidths[0] + colWidths[1] / 2,
            rowY,
            { align: "center" }
          );
          pdf.text(
            subject.ce?.toString() || "-",
            tableStartX + colWidths[0] + colWidths[1] + colWidths[2] / 2,
            rowY,
            { align: "center" }
          );
          pdf.text(
            subject.overallObtained?.toString() || "-",
            tableStartX +
              colWidths[0] +
              colWidths[1] +
              colWidths[2] +
              colWidths[3] / 2,
            rowY,
            { align: "center" }
          );
        });

        currentY += maxSubjects.length * 8 + 5;

        // Practical maximum scores with merged first column
        // Draw the merged PRACTICAL cell spanning 2 rows
        pdf.roundedRect(tableStartX, currentY - 5, colWidths[0], 16, 1.5, 1.5); // Height of 16 for 2 rows
        pdf.roundedRect(
          tableStartX + colWidths[0],
          currentY - 5,
          colWidths[1],
          8,
          1.5,
          1.5
        );
        pdf.roundedRect(
          tableStartX + colWidths[0] + colWidths[1],
          currentY - 5,
          colWidths[2],
          8,
          1.5,
          1.5
        );
        pdf.roundedRect(
          tableStartX + colWidths[0] + colWidths[1] + colWidths[2],
          currentY - 5,
          colWidths[3],
          8,
          1.5,
          1.5
        );

        pdf.text("PRACTICAL", tableStartX + 3, currentY + 4); // Center vertically in merged cell
        pdf.text(
          "P.E",
          tableStartX + colWidths[0] + colWidths[1] / 2,
          currentY,
          { align: "center" }
        );
        pdf.text(
          "P.W",
          tableStartX + colWidths[0] + colWidths[1] + colWidths[2] / 2,
          currentY,
          { align: "center" }
        );
        pdf.text(
          "TOTAL",
          tableStartX +
            colWidths[0] +
            colWidths[1] +
            colWidths[2] +
            colWidths[3] / 2,
          currentY,
          { align: "center" }
        );

        currentY += 8;

        // Practical maximum scores data row
        pdf.roundedRect(
          tableStartX + colWidths[0],
          currentY - 5,
          colWidths[1],
          8,
          1.5,
          1.5
        );
        pdf.roundedRect(
          tableStartX + colWidths[0] + colWidths[1],
          currentY - 5,
          colWidths[2],
          8,
          1.5,
          1.5
        );
        pdf.roundedRect(
          tableStartX + colWidths[0] + colWidths[1] + colWidths[2],
          currentY - 5,
          colWidths[3],
          8,
          1.5,
          1.5
        );

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        // Get practical subjects maximum scores from backend data
        const practicalSubjects =
          student.Subjects?.filter(
            (subject: any) => subject?.SubjectType === "Practical"
          ) || [];

        if (practicalSubjects.length > 0) {
          const practicalSubject = practicalSubjects[0]; // Use first practical subject
          pdf.text(
            practicalSubject?.PE_Max?.toString() || "-",
            tableStartX + colWidths[0] + colWidths[1] / 2,
            currentY,
            { align: "center" }
          ); // PE Max
          pdf.text(
            practicalSubject?.PW_Max?.toString() || "-",
            tableStartX + colWidths[0] + colWidths[1] + colWidths[2] / 2,
            currentY,
            { align: "center" }
          ); // PW Max
          pdf.text(
            practicalSubject?.PracticalTotal_Max?.toString() || "-",
            tableStartX +
              colWidths[0] +
              colWidths[1] +
              colWidths[2] +
              colWidths[3] / 2,
            currentY,
            { align: "center" }
          ); // Total Max
        } else {
          pdf.text(
            "-",
            tableStartX + colWidths[0] + colWidths[1] / 2,
            currentY,
            { align: "center" }
          );
          pdf.text(
            "-",
            tableStartX + colWidths[0] + colWidths[1] + colWidths[2] / 2,
            currentY,
            { align: "center" }
          );
          pdf.text(
            "-",
            tableStartX +
              colWidths[0] +
              colWidths[1] +
              colWidths[2] +
              colWidths[3] / 2,
            currentY,
            { align: "center" }
          );
        }
      }

      // Add footer fields centered within two equal halves of the page
      currentY += 10;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");

      // Calculate centers for left and right halves
      const leftCenterX = pdfWidth / 4;
      const rightCenterX = (pdfWidth * 3) / 4;

      // Display certificate number centered in left half
      const certificateNo = student.CertificateNumber || "Not Assigned";
      pdf.text(`CERTIFICATE NO: ${certificateNo}`, leftCenterX, currentY, {
        align: "center",
      });

      // Display date centered in right half
      let displayDate = "";
      if (student.PublishedDate) {
        displayDate = new Date(student.PublishedDate)
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
          .replace(/\//g, "-");
      } else {
        displayDate = new Date()
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
          .replace(/\//g, "-");
      }
      pdf.text(`DATE: ${displayDate}`, rightCenterX, currentY, {
        align: "center",
      });

      // Add KUG seal - positioned below signatures
      // Based on CSS: .kug-seal left: 52%, bottom: 3% - 80px x 80px (90px on larger screens)
      try {
        const sealImg = new Image();
        sealImg.crossOrigin = "anonymous";
        sealImg.src = "/kug seal.png";

        await new Promise((resolve, reject) => {
          sealImg.onload = () => {
            // Create a canvas to compress the image
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            // Set canvas size to match CSS .seal-image (80px x 80px)
            const sealWidth = 75;
            const sealHeight = 95;
            canvas.width = sealWidth;
            canvas.height = sealHeight;

            // Draw and compress the image
            ctx?.drawImage(sealImg, 0, 0, sealWidth, sealHeight);

            // Convert to compressed data URL (PNG for seal to maintain transparency)
            const compressedDataUrl = canvas.toDataURL("image/png", 0.7); // 70% quality for better compression

            // Create new image from compressed data
            const compressedImg = new Image();
            compressedImg.onload = () => {
              // Calculate seal size maintaining aspect ratio
              const sealWidth = 20; // Convert 80px to mm (approximately 20mm)
              const aspectRatio = compressedImg.height / compressedImg.width;
              const sealHeight = sealWidth * aspectRatio; // Maintain original aspect ratio

              // Position at center bottom (matching CSS: left: 52%, bottom: 3%)
              const sealX = (pdfWidth - sealWidth) / 2; // Center horizontally (52% from CSS)
              const sealY = pdfHeight - sealHeight - 16; // 3% from bottom edge

              // Add the seal image with original aspect ratio
              pdf.addImage(
                compressedImg,
                "PNG",
                sealX,
                sealY,
                sealWidth,
                sealHeight
              );
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
      pdf.save(
        `${student.RegiNo}_${student.Name.replace(/\s+/g, "_")}_MarkList.pdf`
      );

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
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Find the certificate element in the DOM
      const certificateElement = document.querySelector(
        ".certificate-container"
      );

      if (!certificateElement) {
        throw new Error(
          "Certificate element not found. Please make sure the certificate preview is visible."
        );
      }

      // Ensure template image is loaded before capturing
      const templateImg = certificateElement.querySelector(
        ".template-image"
      ) as HTMLImageElement;

      if (templateImg && !templateImg.complete) {
        await new Promise((resolve, reject) => {
          templateImg.onload = resolve;
          templateImg.onerror = reject;
          // If already loaded, resolve immediately
          if (templateImg.complete) resolve(true);
        });
      }

      // Wait a bit more to ensure all images are rendered
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Try capturing without modifying styles first
      const certificateHTMLElement = certificateElement as HTMLElement;

      // Just add the PDF capture mode class
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

      // Use html2canvas to capture the certificate component with working settings
      const canvas = await html2canvas(certificateElement as HTMLElement, {
        scale: 2, // Keep scale 2 for quality
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

      // Restore original seal styles
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
        // Image is wider than PDF page
        finalWidth = pdfWidth;
        finalHeight = pdfWidth / imgAspectRatio;
      } else {
        // Image is taller than PDF page
        finalHeight = pdfHeight;
        finalWidth = pdfHeight * imgAspectRatio;
      }

      // Center the image on the page
      const x = (pdfWidth - finalWidth) / 2;
      const y = (pdfHeight - finalHeight) / 2;

      // Debug: Check canvas dimensions and content

      // Convert canvas to image data URL with high quality
      const imgData = canvas.toDataURL("image/png", 1.0);

      // Add the image to PDF
      pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight);

      // Save the PDF
      pdf.save(
        `${student.RegiNo}_${student.Name.replace(/\s+/g, "_")}_Certificate.pdf`
      );

      toast({
        title: "Certificate Downloaded",
        description: "Your certificate has been generated successfully",
      });
    } catch (error) {
      console.error("Error generating certificate:", error);
      toast({
        title: "Certificate Generation Failed",
        description:
          "There was an error creating your certificate. Please try again.",
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

        {/* Certificate Button - Only for authenticated users and passed students */}
        {isAuthenticated && (
          <Button
            onClick={handleGenerateCertificate}
            size={isMobile ? "default" : "lg"}
            disabled={
              isGeneratingCertificate ||
              !isDesktop ||
              (student.Result !== "Pass" &&
                student.Result !== "PASS" &&
                student.Result !== "pass")
            }
            className={`flex items-center gap-2 sm:gap-3 h-11 sm:h-12 px-4 sm:px-6 text-sm sm:text-base font-medium transition-all duration-300 rounded-xl ${
              student.Result === "Pass" ||
              student.Result === "PASS" ||
              student.Result === "pass"
                ? isDesktop
                  ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 hover:shadow-elegant text-white"
                  : "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-gray-400 text-gray-600 cursor-not-allowed"
            }`}
          >
            {isGeneratingCertificate ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="hidden sm:inline">
                  Generating Certificate...
                </span>
                <span className="sm:hidden">Certificate...</span>
              </>
            ) : (
              <>
                <Award className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">
                  {student.Result === "Pass" ||
                  student.Result === "PASS" ||
                  student.Result === "pass"
                    ? isDesktop
                      ? "Generate Certificate"
                      : "Use Desktop View"
                    : "Certificate Not Available"}
                </span>
                <span className="sm:hidden">
                  {student.Result === "Pass" ||
                  student.Result === "PASS" ||
                  student.Result === "pass"
                    ? isDesktop
                      ? "Certificate"
                      : "Desktop"
                    : "N/A"}
                </span>
              </>
            )}
          </Button>
        )}

        {/* Desktop requirement message for non-desktop users */}
        {isAuthenticated &&
          student &&
          (student.Result === "Pass" ||
            student.Result === "PASS" ||
            student.Result === "pass") &&
          !isDesktop && (
            <div className="mt-3 text-center">
              <p className="text-xs text-muted-foreground">
                💡 Switch to desktop view for certificate preview and PDF
                generation
              </p>
            </div>
          )}
      </div>
    </div>
  );
};

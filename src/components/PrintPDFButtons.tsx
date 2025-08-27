import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Student } from "@/data/studentsData";

interface PrintPDFButtonsProps {
  student: Student;
}

export const PrintPDFButtons = ({ student }: PrintPDFButtonsProps) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById("result-table");
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;

      // Add header
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("BATCH 15 RESULT", pdfWidth / 2, 20, { align: "center" });
      
      pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      pdf.save(`${student.RegiNo}_Result.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 animate-fade-in">
      <Button
        onClick={handlePrint}
        variant="outline"
        size="lg"
        className="flex items-center gap-3 h-12 px-6 text-base font-medium border-2 hover:bg-muted transition-all duration-300 rounded-xl"
      >
        <Printer className="h-5 w-5" />
        Print Result
      </Button>
      <Button
        onClick={handleDownloadPDF}
        size="lg"
        className="flex items-center gap-3 h-12 px-6 text-base font-medium bg-gradient-primary hover:shadow-elegant transition-all duration-300 rounded-xl"
      >
        <Download className="h-5 w-5" />
        Download PDF
      </Button>
    </div>
  );
};
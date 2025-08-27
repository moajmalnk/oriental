import { Student } from "@/data/studentsData";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface ResultTableProps {
  student: Student;
}

export const ResultTable = ({ student }: ResultTableProps) => {
  const getResultBadgeVariant = (result: string) => {
    switch (result) {
      case "PASS":
        return "default";
      case "FAIL":
        return "destructive";
      case "AB":
        return "secondary";
      case "RW":
        return "outline";
      default:
        return "secondary";
    }
  };

  const formatScore = (score: number | string | null) => {
    if (score === null) return "-";
    return score.toString();
  };

  return (
    <div className="w-full max-w-4xl mx-auto" id="result-table">
      <Card className="shadow-lg">
        <CardContent className="p-6">
          {/* Student Info Header */}
          <div className="mb-6 p-4 bg-accent rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Register Number</p>
                <p className="text-lg font-bold text-academic">{student.RegiNo}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Student Name</p>
                <p className="text-lg font-bold text-foreground">{student.Name}</p>
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left p-3 font-bold text-foreground bg-muted">Subject</th>
                  <th className="text-center p-3 font-bold text-foreground bg-muted">CE</th>
                  <th className="text-center p-3 font-bold text-foreground bg-muted">TE</th>
                  <th className="text-center p-3 font-bold text-foreground bg-muted">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border hover:bg-accent/50">
                  <td className="p-3 font-medium">Anatomy</td>
                  <td className="text-center p-3">{formatScore(student.Anatomy_CE)}</td>
                  <td className="text-center p-3">{formatScore(student.Anatomy_TE)}</td>
                  <td className="text-center p-3 font-semibold">{formatScore(student.Anatomy_Total)}</td>
                </tr>
                <tr className="border-b border-border hover:bg-accent/50">
                  <td className="p-3 font-medium">Acupuncture</td>
                  <td className="text-center p-3">{formatScore(student.Acupuncture_CE)}</td>
                  <td className="text-center p-3">{formatScore(student.Acupuncture_TE)}</td>
                  <td className="text-center p-3 font-semibold">{formatScore(student.Acupuncture_Total)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Practical Marks Table */}
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-3 text-foreground">Acupuncture Practical</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="text-center p-3 font-bold text-foreground bg-muted">P.R</th>
                    <th className="text-center p-3 font-bold text-foreground bg-muted">Project</th>
                    <th className="text-center p-3 font-bold text-foreground bg-muted">Viva & PL</th>
                    <th className="text-center p-3 font-bold text-foreground bg-muted">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border hover:bg-accent/50">
                    <td className="text-center p-3">{formatScore(student.Practical_PR)}</td>
                    <td className="text-center p-3">{formatScore(student.Practical_Project)}</td>
                    <td className="text-center p-3">{formatScore(student.Practical_Viva)}</td>
                    <td className="text-center p-3 font-semibold">{formatScore(student.Practical_Total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-secondary rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Marks</p>
                <p className="text-2xl font-bold text-academic">{student.Total}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Result</p>
                <Badge 
                  variant={getResultBadgeVariant(student.Result)}
                  className="text-lg px-4 py-2 font-bold"
                >
                  {student.Result}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
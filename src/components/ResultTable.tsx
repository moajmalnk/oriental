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
    <div className="w-full max-w-6xl mx-auto animate-slide-up" id="result-table">
      <Card className="shadow-elegant border-0 overflow-hidden bg-gradient-card">
        <CardContent className="p-0">
          {/* Student Info Header */}
          <div className="bg-gradient-primary text-academic-foreground p-6 md:p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
                Student Result Card
              </h2>
              <div className="w-24 h-1 bg-white/30 rounded mx-auto"></div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-2">
                <p className="text-academic-foreground/80 text-sm font-medium uppercase tracking-wide">
                  Register Number
                </p>
                <p className="text-2xl md:text-3xl font-bold font-mono tracking-wider">
                  {student.RegiNo}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-academic-foreground/80 text-sm font-medium uppercase tracking-wide">
                  Student Name
                </p>
                <p className="text-xl md:text-2xl font-display font-semibold">
                  {student.Name}
                </p>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="p-6 md:p-8 space-y-8">
            {/* Theory Subjects Table */}
            <div className="space-y-4">
              <h3 className="text-xl md:text-2xl font-display font-bold text-foreground flex items-center gap-3">
                <div className="w-1 h-6 bg-academic rounded"></div>
                Theory Subjects
              </h3>
              
              <div className="overflow-hidden rounded-xl border border-border/50">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted border-b border-border">
                        <th className="text-left p-4 md:p-6 font-semibold text-foreground min-w-[120px]">
                          Subject
                        </th>
                        <th className="text-center p-4 md:p-6 font-semibold text-foreground min-w-[80px]">
                          CE
                        </th>
                        <th className="text-center p-4 md:p-6 font-semibold text-foreground min-w-[80px]">
                          TE
                        </th>
                        <th className="text-center p-4 md:p-6 font-semibold text-foreground min-w-[100px]">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border hover:bg-accent/30 transition-colors duration-200">
                        <td className="p-4 md:p-6 font-medium text-foreground">Anatomy</td>
                        <td className="text-center p-4 md:p-6 font-mono">{formatScore(student.Anatomy_CE)}</td>
                        <td className="text-center p-4 md:p-6 font-mono">{formatScore(student.Anatomy_TE)}</td>
                        <td className="text-center p-4 md:p-6 font-bold text-academic font-mono text-lg">
                          {formatScore(student.Anatomy_Total)}
                        </td>
                      </tr>
                      <tr className="border-b border-border hover:bg-accent/30 transition-colors duration-200">
                        <td className="p-4 md:p-6 font-medium text-foreground">Acupuncture</td>
                        <td className="text-center p-4 md:p-6 font-mono">{formatScore(student.Acupuncture_CE)}</td>
                        <td className="text-center p-4 md:p-6 font-mono">{formatScore(student.Acupuncture_TE)}</td>
                        <td className="text-center p-4 md:p-6 font-bold text-academic font-mono text-lg">
                          {formatScore(student.Acupuncture_Total)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Practical Marks Table */}
            <div className="space-y-4">
              <h3 className="text-xl md:text-2xl font-display font-bold text-foreground flex items-center gap-3">
                <div className="w-1 h-6 bg-success rounded"></div>
                Acupuncture Practical
              </h3>
              
              <div className="overflow-hidden rounded-xl border border-border/50">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted border-b border-border">
                        <th className="text-center p-4 md:p-6 font-semibold text-foreground min-w-[80px]">
                          P.R
                        </th>
                        <th className="text-center p-4 md:p-6 font-semibold text-foreground min-w-[100px]">
                          Project
                        </th>
                        <th className="text-center p-4 md:p-6 font-semibold text-foreground min-w-[120px]">
                          Viva & PL
                        </th>
                        <th className="text-center p-4 md:p-6 font-semibold text-foreground min-w-[100px]">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border hover:bg-accent/30 transition-colors duration-200">
                        <td className="text-center p-4 md:p-6 font-mono">{formatScore(student.Practical_PR)}</td>
                        <td className="text-center p-4 md:p-6 font-mono">{formatScore(student.Practical_Project)}</td>
                        <td className="text-center p-4 md:p-6 font-mono">{formatScore(student.Practical_Viva)}</td>
                        <td className="text-center p-4 md:p-6 font-bold text-success font-mono text-lg">
                          {formatScore(student.Practical_Total)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Summary Section */}
            <div className="bg-gradient-to-r from-accent/50 to-secondary/30 rounded-xl p-6 md:p-8 border border-border/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="text-center md:text-left">
                  <p className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                    Total Marks Obtained
                  </p>
                  <p className="text-4xl md:text-5xl font-bold font-mono text-academic">
                    {student.Total}
                  </p>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                    Final Result
                  </p>
                  <Badge 
                    variant={getResultBadgeVariant(student.Result)}
                    className="text-lg md:text-xl px-6 py-3 font-bold rounded-lg"
                  >
                    {student.Result}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
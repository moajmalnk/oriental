import { Student } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useResponsive } from "@/hooks/use-responsive";

interface ResultTableProps {
  student: Student;
}

export const ResultTable = ({ student }: ResultTableProps) => {
  const { isMobile, isTablet } = useResponsive();

  // Check if student has the new backend structure with Subjects array
  const hasNewStructure =
    "Subjects" in student && Array.isArray(student.Subjects);

  const getResultBadgeVariant = (result: string) => {
    // Convert to lowercase for consistent comparison
    const normalizedResult = result?.toLowerCase();

    switch (normalizedResult) {
      case "pass":
        return "default";
      case "fail":
        return "destructive";
      case "ab":
        return "destructive";
      case "rw":
        return "outline";
      case "absent":
        return "destructive";
      default:
        // For any result that is not "pass", show as destructive (red)
        return "destructive";
    }
  };

  const formatScore = (score: number | string | null) => {
    if (score === null) return "-";
    return score.toString();
  };

  // Helper functions to get subject data from backend structure
  const getTheorySubjects = () => {
    if (!student.Subjects) return [];
    return student.Subjects.filter(
      (subject) => subject.SubjectType === "Theory"
    );
  };

  const getPracticalSubjects = () => {
    if (!student.Subjects) return [];
    return student.Subjects.filter(
      (subject) => subject.SubjectType === "Practical"
    );
  };

  // Calculate total marks from backend structure
  const calculateTotal = () => {
    if (!student.Subjects) return 0;
    return student.Subjects.reduce((total, subject) => {
      return total + (subject.OverallObtained || 0);
    }, 0);
  };

  const MobileTheoryRow = ({
    subject,
    ce,
    te,
    total,
  }: {
    subject: string;
    ce: number | string | null;
    te: number | string | null;
    total: number | string | null;
  }) => (
    <div className="bg-gradient-card rounded-lg p-4 border border-border/50 space-y-3">
      <h4 className="font-semibold text-foreground text-sm">{subject}</h4>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center">
          <span className="text-muted-foreground block">CE</span>
          <span className="font-mono font-medium">{formatScore(ce)}</span>
        </div>
        <div className="text-center">
          <span className="text-muted-foreground block">TE</span>
          <span className="font-mono font-medium">{formatScore(te)}</span>
        </div>
        <div className="text-center">
          <span className="text-muted-foreground block">Total</span>
          <span className="font-mono font-bold text-academic">
            {formatScore(total)}
          </span>
        </div>
      </div>
    </div>
  );

  const MobilePracticalRow = ({
    subject,
    pw,
    pe,
    total,
  }: {
    subject: string;
    pw: number | string | null;
    pe: number | string | null;
    total: number | string | null;
  }) => (
    <div className="bg-gradient-card rounded-lg p-4 border border-border/50 space-y-3">
      <h4 className="font-semibold text-foreground text-sm">{subject}</h4>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center">
          <span className="text-muted-foreground block">P.E</span>
          <span className="font-mono font-medium">{formatScore(pe)}</span>
        </div>
        <div className="text-center">
          <span className="text-muted-foreground block">P.W</span>
          <span className="font-mono font-medium">{formatScore(pw)}</span>
        </div>
        <div className="text-center">
          <span className="text-muted-foreground block">Total</span>
          <span className="font-mono font-bold text-success">
            {formatScore(total)}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="w-full max-w-6xl mx-auto animate-slide-up"
      id="result-table"
    >
      <Card className="shadow-elegant border-0 overflow-hidden bg-gradient-card">
        <CardContent className="p-0">
          {/* Student Info Header */}
          <div className="bg-gradient-primary text-academic-foreground p-4 sm:p-6 md:p-8">
            <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold mb-2">
                Student Result Card
              </h2>
              <div className="w-16 sm:w-24 h-1 bg-white/30 rounded mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              <div className="space-y-2">
                <p className="text-academic-foreground/80 text-xs sm:text-sm font-medium uppercase tracking-wide">
                  Register Number
                </p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold font-mono tracking-wider break-all">
                  {student.RegiNo}
                </p>
              </div>
              <div className="space-y-2 text-right">
                <p className="text-academic-foreground/80 text-xs sm:text-sm font-medium uppercase tracking-wide">
                  Student Name
                </p>
                <p className="text-lg sm:text-xl md:text-2xl font-display font-semibold break-words">
                  {student.Name}
                </p>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
            {/* Theory Subjects */}
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl md:text-2xl font-display font-bold text-foreground flex items-center gap-3">
                <div className="w-1 h-4 sm:h-6 bg-academic rounded"></div>
                Theory Subjects
              </h3>

              {isMobile ? (
                <div className="space-y-3">
                  {getTheorySubjects().map((subject, index) => (
                    <MobileTheoryRow
                      key={index}
                      subject={subject.SubjectName}
                      ce={subject.CE}
                      te={subject.TE}
                      total={subject.TheoryTotal}
                    />
                  ))}
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-border/50">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted border-b border-border">
                          <th className="text-left p-3 sm:p-4 md:p-6 font-semibold text-foreground min-w-[120px] text-sm sm:text-base">
                            Subject
                          </th>
                          <th className="text-center p-3 sm:p-4 md:p-6 font-semibold text-foreground min-w-[80px] text-sm sm:text-base">
                            TE
                          </th>
                          <th className="text-center p-3 sm:p-4 md:p-6 font-semibold text-foreground min-w-[80px] text-sm sm:text-base">
                            CE
                          </th>
                          <th className="text-center p-3 sm:p-4 md:p-6 font-semibold text-foreground min-w-[100px] text-sm sm:text-base">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {getTheorySubjects().map((subject, index) => (
                          <tr
                            key={index}
                            className="border-b border-border hover:bg-accent/30 transition-colors duration-200"
                          >
                            <td className="p-3 sm:p-4 md:p-6 font-medium text-foreground text-sm sm:text-base">
                              {subject.SubjectName}
                            </td>
                            <td className="text-center p-3 sm:p-4 md:p-6 font-mono text-sm sm:text-base">
                              {formatScore(subject.TE)}
                            </td>
                            <td className="text-center p-3 sm:p-4 md:p-6 font-mono text-sm sm:text-base">
                              {formatScore(subject.CE)}
                            </td>
                            <td className="text-center p-3 sm:p-4 md:p-6 font-bold text-academic font-mono text-base sm:text-lg">
                              {formatScore(subject.TheoryTotal)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Practical Marks */}
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl md:text-2xl font-display font-bold text-foreground flex items-center gap-3">
                <div className="w-1 h-4 sm:h-6 bg-success rounded"></div>
                Practical Subjects
              </h3>

              {isMobile ? (
                <div className="space-y-3">
                  {getPracticalSubjects().map((subject, index) => (
                    <MobilePracticalRow
                      key={index}
                      subject={subject.SubjectName}
                      pw={subject.PW}
                      pe={subject.PE}
                      total={subject.PracticalTotal}
                    />
                  ))}
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-border/50">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted border-b border-border">
                          <th className="text-left p-3 sm:p-4 md:p-6 font-semibold text-foreground min-w-[120px] text-sm sm:text-base">
                            Subject
                          </th>
                          <th className="text-center p-3 sm:p-4 md:p-6 font-semibold text-foreground min-w-[80px] text-sm sm:text-base">
                            P.E
                          </th>
                          <th className="text-center p-3 sm:p-4 md:p-6 font-semibold text-foreground min-w-[80px] text-sm sm:text-base">
                            P.W
                          </th>
                          <th className="text-center p-3 sm:p-4 md:p-6 font-semibold text-foreground min-w-[100px] text-sm sm:text-base">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {getPracticalSubjects().map((subject, index) => (
                          <tr
                            key={index}
                            className="border-b border-border hover:bg-accent/30 transition-colors duration-200"
                          >
                            <td className="p-3 sm:p-4 md:p-6 font-medium text-foreground text-sm sm:text-base">
                              {subject.SubjectName}
                            </td>
                            <td className="text-center p-3 sm:p-4 md:p-6 font-mono text-sm sm:text-base">
                              {formatScore(subject.PE)}
                            </td>
                            <td className="text-center p-3 sm:p-4 md:p-6 font-mono text-sm sm:text-base">
                              {formatScore(subject.PW)}
                            </td>
                            <td className="text-center p-3 sm:p-4 md:p-6 font-bold text-success font-mono text-base sm:text-lg">
                              {formatScore(subject.PracticalTotal)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Maximum Scores Table */}
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl md:text-2xl font-display font-bold text-foreground flex items-center gap-3">
                <div className="w-1 h-4 sm:h-6 bg-warning rounded"></div>
                Maximum Scores
              </h3>

              {isMobile ? (
                <div className="space-y-4">
                  {/* Theory Subjects */}
                  {getTheorySubjects().length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-base font-semibold text-foreground">
                        Theory Subjects
                      </h4>
                      {getTheorySubjects().map((subject, index) => (
                        <div
                          key={index}
                          className="bg-gradient-card rounded-lg p-4 border border-border/50 space-y-3"
                        >
                          <h5 className="font-semibold text-foreground text-sm">
                            {subject.SubjectName}
                          </h5>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  TE:
                                </span>
                                <span className="font-mono font-medium">
                                  {subject.TE_Max || "-"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  CE:
                                </span>
                                <span className="font-mono font-medium">
                                  {subject.CE_Max || "-"}
                                </span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Total:
                                </span>
                                <span className="font-mono font-bold text-academic">
                                  {subject.TheoryTotal_Max || "-"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Practical Subjects */}
                  {getPracticalSubjects().length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-base font-semibold text-foreground">
                        Practical Subjects
                      </h4>
                      {getPracticalSubjects().map((subject, index) => (
                        <div
                          key={index}
                          className="bg-gradient-card rounded-lg p-4 border border-border/50 space-y-3"
                        >
                          <h5 className="font-semibold text-foreground text-sm">
                            {subject.SubjectName}
                          </h5>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  P.E:
                                </span>
                                <span className="font-mono font-medium">
                                  {subject.PE_Max || "-"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  P.W:
                                </span>
                                <span className="font-mono font-medium">
                                  {subject.PW_Max || "-"}
                                </span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Total:
                                </span>
                                <span className="font-mono font-bold text-success">
                                  {subject.PracticalTotal_Max || "-"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Theory Subjects Table */}
                  {getTheorySubjects().length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-base font-semibold text-foreground">
                        Theory Subjects
                      </h4>
                      <div className="overflow-hidden rounded-xl border border-border/50">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-muted border-b border-border">
                                <th className="text-left p-3 sm:p-4 md:p-6 font-semibold text-foreground min-w-[180px] text-sm sm:text-base">
                                  Subject
                                </th>
                                <th className="text-center p-3 sm:p-4 md:p-6 font-semibold text-foreground min-w-[80px] text-sm sm:text-base">
                                  TE
                                </th>
                                <th className="text-center p-3 sm:p-4 md:p-6 font-semibold text-foreground min-w-[80px] text-sm sm:text-base">
                                  CE
                                </th>
                                <th className="text-center p-3 sm:p-4 md:p-6 font-semibold text-foreground min-w-[100px] text-sm sm:text-base">
                                  Total
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {getTheorySubjects().map((subject, index) => (
                                <tr
                                  key={index}
                                  className="border-b border-border hover:bg-accent/30 transition-colors duration-200"
                                >
                                  <td className="p-3 sm:p-4 md:p-6 font-medium text-foreground text-sm sm:text-base">
                                    {subject.SubjectName}
                                  </td>
                                  <td className="text-center p-3 sm:p-4 md:p-6 font-mono text-sm sm:text-base">
                                    {subject.TE_Max || "-"}
                                  </td>
                                  <td className="text-center p-3 sm:p-4 md:p-6 font-mono text-sm sm:text-base">
                                    {subject.CE_Max || "-"}
                                  </td>
                                  <td className="text-center p-3 sm:p-4 md:p-6 font-bold text-academic font-mono text-base sm:text-lg">
                                    {subject.TheoryTotal_Max || "-"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Practical Subjects Table */}
                  {getPracticalSubjects().length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-base font-semibold text-foreground">
                        Practical Subjects
                      </h4>
                      <div className="overflow-hidden rounded-xl border border-border/50">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-muted border-b border-border">
                                <th className="text-left p-3 sm:p-4 md:p-6 font-semibold text-foreground min-w-[180px] text-sm sm:text-base">
                                  Subject
                                </th>
                                <th className="text-center p-3 sm:p-4 md:p-6 font-semibold text-foreground min-w-[80px] text-sm sm:text-base">
                                  P.E
                                </th>
                                <th className="text-center p-3 sm:p-4 md:p-6 font-semibold text-foreground min-w-[80px] text-sm sm:text-base">
                                  P.W
                                </th>
                                <th className="text-center p-3 sm:p-4 md:p-6 font-semibold text-foreground min-w-[100px] text-sm sm:text-base">
                                  Total
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {getPracticalSubjects().map((subject, index) => (
                                <tr
                                  key={index}
                                  className="border-b border-border hover:bg-accent/30 transition-colors duration-200"
                                >
                                  <td className="p-3 sm:p-4 md:p-6 font-medium text-foreground text-sm sm:text-base">
                                    {subject.SubjectName}
                                  </td>
                                  <td className="text-center p-3 sm:p-4 md:p-6 font-mono text-sm sm:text-base">
                                    {subject.PE_Max || "-"}
                                  </td>
                                  <td className="text-center p-3 sm:p-4 md:p-6 font-mono text-sm sm:text-base">
                                    {subject.PW_Max || "-"}
                                  </td>
                                  <td className="text-center p-3 sm:p-4 md:p-6 font-bold text-success font-mono text-base sm:text-lg">
                                    {subject.PracticalTotal_Max || "-"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Course Information */}
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl md:text-2xl font-display font-bold text-foreground flex items-center gap-3">
                <div className="w-1 h-4 sm:h-6 bg-info rounded"></div>
                Course Information
              </h3>

              <div className="bg-gradient-card rounded-xl p-4 sm:p-6 border border-border/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Course
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      {student.Course}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Register Number
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      {student.RegiNo}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Section */}
            <div className="bg-gradient-to-r from-accent/50 to-secondary/30 rounded-xl p-4 sm:p-6 md:p-8 border border-border/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                <div className="text-center md:text-left">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                    Total Marks Obtained
                  </p>
                  <p className="text-3xl sm:text-4xl md:text-5xl font-bold font-mono text-academic">
                    {calculateTotal()}
                  </p>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                    Final Result
                  </p>
                  <Badge
                    variant={getResultBadgeVariant(student.Result)}
                    className="text-base sm:text-lg md:text-xl px-4 sm:px-6 py-2 sm:py-3 font-bold rounded-lg"
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

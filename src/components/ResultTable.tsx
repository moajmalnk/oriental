import { Student, DCPStudent } from "@/data/studentsData";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useResponsive } from "@/hooks/use-responsive";

interface ResultTableProps {
  student: Student | DCPStudent;
}

export const ResultTable = ({ student }: ResultTableProps) => {
  const { isMobile, isTablet } = useResponsive();

  // Type guard to check if student is DCP student
  const isDCPStudent = (student: Student | DCPStudent): student is DCPStudent => {
    return 'DCP001_CE' in student;
  };

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
      case "ABSENT":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const formatScore = (score: number | string | null) => {
    if (score === null) return "-";
    return score.toString();
  };

  const MobileTheoryRow = ({ subject, ce, te, total }: { subject: string; ce: number | string | null; te: number | string | null; total: number | string | null }) => (
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
          <span className="font-mono font-bold text-academic">{formatScore(total)}</span>
        </div>
      </div>
    </div>
  );

  const MobilePracticalRow = ({ pr, project, viva, total }: { pr: number | string | null; project: number | string | null; viva: number | string | null; total: number | string | null }) => (
    <div className="bg-gradient-card rounded-lg p-4 border border-border/50 space-y-3">
      <h4 className="font-semibold text-foreground text-sm">Acupuncture Practical</h4>
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">P.R:</span>
            <span className="font-mono font-medium">{formatScore(pr)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Project:</span>
            <span className="font-mono font-medium">{formatScore(project)}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Viva & PL:</span>
            <span className="font-mono font-medium">{formatScore(viva)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-mono font-bold text-success">{formatScore(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // DCP Mobile Components
  const MobileDCPTheoryRow = ({ subject, ce, te, total }: { subject: string; ce: number | string | null; te: number | string | null; total: number | string | null }) => (
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
          <span className="font-mono font-bold text-academic">{formatScore(total)}</span>
        </div>
      </div>
    </div>
  );

  const MobileDCPPracticalRow = ({ pw, pe, total }: { pw: number | string | null; pe: number | string | null; total: number | string | null }) => (
    <div className="bg-gradient-card rounded-lg p-4 border border-border/50 space-y-3">
      <h4 className="font-semibold text-foreground text-sm">DCP 004 - Practical</h4>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center">
          <span className="text-muted-foreground block">P.W</span>
          <span className="font-mono font-medium">{formatScore(pw)}</span>
        </div>
        <div className="text-center">
          <span className="text-muted-foreground block">P.E</span>
          <span className="font-mono font-medium">{formatScore(pe)}</span>
        </div>
        <div className="text-center">
          <span className="text-muted-foreground block">Total</span>
          <span className="font-mono font-bold text-success">{formatScore(total)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto animate-slide-up" id="result-table">
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
                  {isDCPStudent(student) ? (
                    <>
                      <MobileDCPTheoryRow 
                        subject="DCP 001 - Psychology Pathology" 
                        ce={student.DCP001_CE} 
                        te={student.DCP001_TE} 
                        total={student.DCP001_Total} 
                      />
                      <MobileDCPTheoryRow 
                        subject="DCP 002 - Counselling Skills" 
                        ce={student.DCP002_CE} 
                        te={student.DCP002_TE} 
                        total={student.DCP002_Total} 
                      />
                      <MobileDCPTheoryRow 
                        subject="DCP 003 - Life Skills Education" 
                        ce={student.DCP003_CE} 
                        te={student.DCP003_TE} 
                        total={student.DCP003_Total} 
                      />
                    </>
                  ) : (
                    <>
                      <MobileTheoryRow 
                        subject="Anatomy" 
                        ce={student.Anatomy_CE} 
                        te={student.Anatomy_TE} 
                        total={student.Anatomy_Total} 
                      />
                      <MobileTheoryRow 
                        subject="Acupuncture" 
                        ce={student.Acupuncture_CE} 
                        te={student.Acupuncture_TE} 
                        total={student.Acupuncture_Total} 
                      />
                    </>
                  )}
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
                            CE
                          </th>
                          <th className="text-center p-3 sm:p-4 md:p-6 font-semibold text-foreground min-w-[80px] text-sm sm:text-base">
                            TE
                          </th>
                          <th className="text-center p-3 sm:p-4 md:p-6 font-semibold text-foreground min-w-[100px] text-sm sm:text-base">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {isDCPStudent(student) ? (
                          <>
                            <tr className="border-b border-border hover:bg-accent/30 transition-colors duration-200">
                              <td className="p-3 sm:p-4 md:p-6 font-medium text-foreground text-sm sm:text-base">DCP 001 - Psychology Pathology</td>
                              <td className="text-center p-3 sm:p-4 md:p-6 font-mono text-sm sm:text-base">{formatScore(student.DCP001_CE)}</td>
                              <td className="text-center p-3 sm:p-4 md:p-6 font-mono text-sm sm:text-base">{formatScore(student.DCP001_TE)}</td>
                              <td className="text-center p-3 sm:p-4 md:p-6 font-bold text-academic font-mono text-base sm:text-lg">
                                {formatScore(student.DCP001_Total)}
                              </td>
                            </tr>
                            <tr className="border-b border-border hover:bg-accent/30 transition-colors duration-200">
                              <td className="p-3 sm:p-4 md:p-6 font-medium text-foreground text-sm sm:text-base">DCP 002 - Counselling Skills</td>
                              <td className="text-center p-3 sm:p-4 md:p-6 font-mono text-sm sm:text-base">{formatScore(student.DCP002_CE)}</td>
                              <td className="text-center p-3 sm:p-4 md:p-6 font-mono text-sm sm:text-base">{formatScore(student.DCP002_TE)}</td>
                              <td className="text-center p-3 sm:p-4 md:p-6 font-bold text-academic font-mono text-base sm:text-lg">
                                {formatScore(student.DCP002_Total)}
                              </td>
                            </tr>
                            <tr className="border-b border-border hover:bg-accent/30 transition-colors duration-200">
                              <td className="p-3 sm:p-4 md:p-6 font-medium text-foreground text-sm sm:text-base">DCP 003 - Life Skills Education</td>
                              <td className="text-center p-3 sm:p-4 md:p-6 font-mono text-sm sm:text-base">{formatScore(student.DCP003_CE)}</td>
                              <td className="text-center p-3 sm:p-4 md:p-6 font-mono text-sm sm:text-base">{formatScore(student.DCP003_TE)}</td>
                              <td className="text-center p-3 sm:p-4 md:p-6 font-bold text-academic font-mono text-base sm:text-lg">
                                {formatScore(student.DCP003_Total)}
                              </td>
                            </tr>
                          </>
                        ) : (
                          <>
                            <tr className="border-b border-border hover:bg-accent/30 transition-colors duration-200">
                              <td className="p-3 sm:p-4 md:p-6 font-medium text-foreground text-sm sm:text-base">Anatomy</td>
                              <td className="text-center p-3 sm:p-4 md:p-6 font-mono text-sm sm:text-base">{formatScore(student.Anatomy_CE)}</td>
                              <td className="text-center p-3 sm:p-4 md:p-6 font-mono text-sm sm:text-base">{formatScore(student.Anatomy_TE)}</td>
                              <td className="text-center p-3 sm:p-4 md:p-6 font-bold text-academic font-mono text-base sm:text-lg">
                                {formatScore(student.Anatomy_Total)}
                              </td>
                            </tr>
                            <tr className="border-b border-border hover:bg-accent/30 transition-colors duration-200">
                              <td className="p-3 sm:p-4 md:p-6 font-medium text-foreground text-sm sm:text-base">Acupuncture</td>
                              <td className="text-center p-3 sm:p-4 md:p-6 font-mono text-sm sm:text-base">{formatScore(student.Acupuncture_CE)}</td>
                              <td className="text-center p-3 sm:p-4 md:p-6 font-mono text-sm sm:text-base">{formatScore(student.Acupuncture_TE)}</td>
                              <td className="text-center p-3 sm:p-4 md:p-6 font-bold text-academic font-mono text-base sm:text-lg">
                                {formatScore(student.Acupuncture_Total)}
                              </td>
                            </tr>
                          </>
                        )}
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
                {isDCPStudent(student) ? "DCP 004 - Practical" : "Acupuncture Practical"}
              </h3>
              
              {isMobile ? (
                isDCPStudent(student) ? (
                  <MobileDCPPracticalRow 
                    pw={student.DCP004_PW}
                    pe={student.DCP004_PE}
                    total={student.DCP004_Total}
                  />
                ) : (
                  <MobilePracticalRow 
                    pr={student.Practical_PR}
                    project={student.Practical_Project}
                    viva={student.Practical_Viva}
                    total={student.Practical_Total}
                  />
                )
              ) : (
                <div className="overflow-hidden rounded-xl border border-border/50">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted border-b border-border">
                          {isDCPStudent(student) ? (
                            <>
                              <th className="text-center p-3 sm:p-4 md:p-6 font-semibold text-foreground min-w-[80px] text-sm sm:text-base">
                                P.W
                              </th>
                              <th className="text-center p-3 sm:p-4 md:p-6 font-semibold text-foreground min-w-[80px] text-sm sm:text-base">
                                P.E
                              </th>
                              <th className="text-center p-3 sm:p-4 md:p-6 font-semibold text-foreground min-w-[100px] text-sm sm:text-base">
                                Total
                              </th>
                            </>
                          ) : (
                            <>
                              <th className="text-center p-3 sm:p-4 md:p-6 font-semibold text-foreground min-w-[80px] text-sm sm:text-base">
                                P.R
                              </th>
                              <th className="text-center p-3 sm:p-4 md:p-6 font-semibold text-foreground min-w-[100px] text-sm sm:text-base">
                                Project
                              </th>
                              <th className="text-center p-3 sm:p-4 md:p-6 font-semibold text-foreground min-w-[120px] text-sm sm:text-base">
                                Viva & PL
                              </th>
                              <th className="text-center p-3 sm:p-4 md:p-6 font-semibold text-foreground min-w-[100px] text-sm sm:text-base">
                                Total
                              </th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border hover:bg-accent/30 transition-colors duration-200">
                          {isDCPStudent(student) ? (
                            <>
                              <td className="text-center p-3 sm:p-4 md:p-6 font-mono text-sm sm:text-base">{formatScore(student.DCP004_PW)}</td>
                              <td className="text-center p-3 sm:p-4 md:p-6 font-mono text-sm sm:text-base">{formatScore(student.DCP004_PE)}</td>
                              <td className="text-center p-3 sm:p-4 md:p-6 font-bold text-success font-mono text-base sm:text-lg">
                                {formatScore(student.DCP004_Total)}
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="text-center p-3 sm:p-4 md:p-6 font-mono text-sm sm:text-base">{formatScore(student.Practical_PR)}</td>
                              <td className="text-center p-3 sm:p-4 md:p-6 font-mono text-sm sm:text-base">{formatScore(student.Practical_Project)}</td>
                              <td className="text-center p-3 sm:p-4 md:p-6 font-mono text-sm sm:text-base">{formatScore(student.Practical_Viva)}</td>
                              <td className="text-center p-3 sm:p-4 md:p-6 font-bold text-success font-mono text-base sm:text-lg">
                                {formatScore(student.Practical_Total)}
                              </td>
                            </>
                          )}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Maximum Scores Tables */}
            <div className="space-y-6">
              <h3 className="text-lg sm:text-xl md:text-2xl font-display font-bold text-foreground flex items-center gap-3">
                <div className="w-1 h-4 sm:h-6 bg-warning rounded"></div>
                Maximum Scores
              </h3>
              
              {isMobile ? (
                <div className="space-y-4">
                  {/* Theory Subjects */}
                  <div className="space-y-3">
                    <h4 className="text-base font-semibold text-foreground">SUBJECT-THEORY</h4>
                    {isDCPStudent(student) ? (
                      <>
                        <div className="bg-gradient-card rounded-lg p-4 border border-border/50 space-y-3">
                          <h5 className="font-semibold text-foreground text-sm">DCP 001 - Psychology Pathology</h5>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">TE:</span>
                                <span className="font-mono font-medium">60</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">CE:</span>
                                <span className="font-mono font-medium">20</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Total:</span>
                                <span className="font-mono font-bold text-academic">80</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gradient-card rounded-lg p-4 border border-border/50 space-y-3">
                          <h5 className="font-semibold text-foreground text-sm">DCP 002 - Counselling Skills</h5>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">TE:</span>
                                <span className="font-mono font-medium">60</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">CE:</span>
                                <span className="font-mono font-medium">20</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Total:</span>
                                <span className="font-mono font-bold text-academic">80</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gradient-card rounded-lg p-4 border border-border/50 space-y-3">
                          <h5 className="font-semibold text-foreground text-sm">DCP 003 - Life Skills Education</h5>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">TE:</span>
                                <span className="font-mono font-medium">60</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">CE:</span>
                                <span className="font-mono font-medium">20</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Total:</span>
                                <span className="font-mono font-bold text-academic">80</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-gradient-card rounded-lg p-4 border border-border/50 space-y-3">
                          <h5 className="font-semibold text-foreground text-sm">Anatomy & Physiology</h5>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">TE:</span>
                                <span className="font-mono font-medium">80</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">CE:</span>
                                <span className="font-mono font-medium">20</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Total:</span>
                                <span className="font-mono font-bold text-academic">100</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gradient-card rounded-lg p-4 border border-border/50 space-y-3">
                          <h5 className="font-semibold text-foreground text-sm">Acupuncture Science</h5>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">TE:</span>
                                <span className="font-mono font-medium">80</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">CE:</span>
                                <span className="font-mono font-medium">20</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Total:</span>
                                <span className="font-mono font-bold text-academic">100</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Practical Section */}
                  <div className="space-y-3">
                    <h4 className="text-base font-semibold text-foreground">PRACTICAL</h4>
                    <div className="bg-gradient-card rounded-lg p-4 border border-border/50">
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <span className="text-muted-foreground block font-semibold">PRACTICAL WORK SHOP</span>
                          <span className="font-mono font-bold text-lg">20</span>
                        </div>
                        <div className="text-center">
                          <span className="text-muted-foreground block font-semibold">PRACTICAL EXAMINATION</span>
                          <span className="font-mono font-bold text-lg">40</span>
                        </div>
                        <div className="text-center">
                          <span className="text-muted-foreground block font-semibold">TOTAL</span>
                          <span className="font-mono font-bold text-lg text-success">60</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Theory Subjects Table */}
                  <div className="space-y-4">
                    <h4 className="text-base font-semibold text-foreground">SUBJECT-THEORY</h4>
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
                            {isDCPStudent(student) ? (
                              <>
                                <tr className="border-b border-border hover:bg-accent/30 transition-colors duration-200">
                                  <td className="p-3 sm:p-4 md:p-6 font-medium text-foreground text-sm sm:text-base">DCP 001 - Psychology Pathology</td>
                                  <td className="text-center p-3 sm:p-4 md:p-6 font-mono text-sm sm:text-base">60</td>
                                  <td className="text-center p-3 sm:p-4 md:p-6 font-mono text-sm sm:text-base">20</td>
                                  <td className="text-center p-3 sm:p-4 md:p-6 font-bold text-academic font-mono text-base sm:text-lg">80</td>
                                </tr>
                                <tr className="border-b border-border hover:bg-accent/30 transition-colors duration-200">
                                  <td className="p-3 sm:p-4 md:p-6 font-medium text-foreground text-sm sm:text-base">DCP 002 - Counselling Skills</td>
                                  <td className="text-center p-3 sm:p-4 md:p-6 font-mono text-sm sm:text-base">60</td>
                                  <td className="text-center p-3 sm:p-4 md:p-6 font-mono text-sm sm:text-base">20</td>
                                  <td className="text-center p-3 sm:p-4 md:p-6 font-bold text-academic font-mono text-base sm:text-lg">80</td>
                                </tr>
                                <tr className="border-b border-border hover:bg-accent/30 transition-colors duration-200">
                                  <td className="p-3 sm:p-4 md:p-6 font-medium text-foreground text-sm sm:text-base">DCP 003 - Life Skills Education</td>
                                  <td className="text-center p-3 sm:p-4 md:p-6 font-mono text-sm sm:text-base">60</td>
                                  <td className="text-center p-3 sm:p-4 md:p-6 font-mono text-sm sm:text-base">20</td>
                                  <td className="text-center p-3 sm:p-4 md:p-6 font-bold text-academic font-mono text-base sm:text-lg">80</td>
                                </tr>
                              </>
                            ) : (
                              <>
                                <tr className="border-b border-border hover:bg-accent/30 transition-colors duration-200">
                                  <td className="p-3 sm:p-4 md:p-6 font-medium text-foreground text-sm sm:text-base">Anatomy & Physiology</td>
                                  <td className="text-center p-3 sm:p-4 md:p-6 font-mono text-sm sm:text-base">80</td>
                                  <td className="text-center p-3 sm:p-4 md:p-6 font-mono text-sm sm:text-base">20</td>
                                  <td className="text-center p-3 sm:p-4 md:p-6 font-bold text-academic font-mono text-base sm:text-lg">100</td>
                                </tr>
                                <tr className="border-b border-border hover:bg-accent/30 transition-colors duration-200">
                                  <td className="p-3 sm:p-4 md:p-6 font-medium text-foreground text-sm sm:text-base">Acupuncture Science</td>
                                  <td className="text-center p-3 sm:p-4 md:p-6 font-mono text-sm sm:text-base">80</td>
                                  <td className="text-center p-3 sm:p-4 md:p-6 font-mono text-sm sm:text-base">20</td>
                                  <td className="text-center p-3 sm:p-4 md:p-6 font-bold text-academic font-mono text-base sm:text-lg">100</td>
                                </tr>
                              </>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Practical Table */}
                  <div className="space-y-4">
                    <h4 className="text-base font-semibold text-foreground">PRACTICAL</h4>
                    <div className="overflow-hidden rounded-xl border border-border/50">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-muted border-b border-border">
                              <th className="text-center p-3 sm:p-4 md:p-6 font-semibold text-foreground min-w-[120px] text-sm sm:text-base">
                                PRACTICAL WORK SHOP
                              </th>
                              <th className="text-center p-3 sm:p-4 md:p-6 font-semibold text-foreground min-w-[120px] text-sm sm:text-base">
                                PRACTICAL EXAMINATION
                              </th>
                              <th className="text-center p-3 sm:p-4 md:p-6 font-semibold text-foreground min-w-[100px] text-sm sm:text-base">
                                TOTAL
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-border hover:bg-accent/30 transition-colors duration-200">
                              <td className="text-center p-3 sm:p-4 md:p-6 font-mono text-sm sm:text-base">20</td>
                              <td className="text-center p-3 sm:p-4 md:p-6 font-mono text-sm sm:text-base">40</td>
                              <td className="text-center p-3 sm:p-4 md:p-6 font-bold text-success font-mono text-base sm:text-lg">60</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Summary Section */}
            <div className="bg-gradient-to-r from-accent/50 to-secondary/30 rounded-xl p-4 sm:p-6 md:p-8 border border-border/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                <div className="text-center md:text-left">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                    Total Marks Obtained
                  </p>
                  <p className="text-3xl sm:text-4xl md:text-5xl font-bold font-mono text-academic">
                    {student.Total}
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
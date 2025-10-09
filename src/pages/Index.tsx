import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SearchBox } from "@/components/SearchBox";
import { ResultTable } from "@/components/ResultTable";
import { PrintPDFButtons } from "@/components/PrintPDFButtons";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Certificate } from "@/components/Certificate";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Skeleton, SkeletonHeader, SkeletonCard } from "@/components/Skeleton";
import { ProfessionalLoader, AcademicLoader } from "@/components/ProfessionalLoader";
import { BulkCertificateDialog } from "@/components/BulkCertificateDialog";
import { studentsData, dcpStudentsData, type Student, type DCPStudent } from "@/data/studentsData";
import { useToast } from "@/hooks/use-toast";
import { useResponsive } from "@/hooks/use-responsive";
import { useAuth } from "@/contexts/AuthContext";
import { Clock, Calendar, AlertCircle, Award, BookOpen, Users, Shield, CheckCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [searchResult, setSearchResult] = useState<Student | DCPStudent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isResultAvailable, setIsResultAvailable] = useState(false);
  const [timeUntilAvailable, setTimeUntilAvailable] = useState<string>("");
  const [pdaDialogOpen, setPdaDialogOpen] = useState(false);
  const [dcpDialogOpen, setDcpDialogOpen] = useState(false);
  const { toast } = useToast();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const { logout, userEmail, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Set default theme to light mode
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (!savedTheme) {
      localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Check result availability
  useEffect(() => {
    const checkAvailability = () => {
      // DCP results release schedule: 03/10/2025 at 10:00 AM (local time)
      const resultDate = new Date("2025-10-03T10:00:00");
      const now = new Date();
      
      if (now >= resultDate) {
        setIsResultAvailable(true);
        setTimeUntilAvailable("");
      } else {
        setIsResultAvailable(false);
        const timeDiff = resultDate.getTime() - now.getTime();
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) {
          setTimeUntilAvailable(`${days} day${days > 1 ? 's' : ''}, ${hours} hour${hours > 1 ? 's' : ''}`);
        } else if (hours > 0) {
          setTimeUntilAvailable(`${hours} hour${hours > 1 ? 's' : ''}, ${minutes} minute${minutes > 1 ? 's' : ''}`);
        } else {
          setTimeUntilAvailable(`${minutes} minute${minutes > 1 ? 's' : ''}`);
        }
      }
    };

    checkAvailability();
    const interval = setInterval(checkAvailability, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Simulate initial page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = async (searchTerm: string) => {
    setIsLoading(true);
    setHasSearched(false);
    
    // Simulate search delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Search in both PDA and DCP students data
    const pdaStudent = studentsData.find(
      student => student.RegiNo.toLowerCase() === searchTerm.toLowerCase()
    );
    
    const dcpStudent = dcpStudentsData.find(
      student => student.RegiNo.toLowerCase() === searchTerm.toLowerCase()
    );
    
    // Gate only DCP results by time; PDA always allowed
    if (dcpStudent && !isResultAvailable) {
      setIsLoading(false);
      toast({
        title: "DCP Results Not Available Yet",
        description: "DCP results will be available after 03/10/2025 10:00 AM",
        variant: "destructive",
      });
      return;
    }

    const found = pdaStudent || dcpStudent;
    
    setSearchResult(found || null);
    setHasSearched(true);
    setIsLoading(false);
    
    if (found) {
      toast({
        title: "Result Found",
        description: `Record found for ${found.Name}`,
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
          {/* Subtle Pattern Overlay */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>
          
          {/* Theme Toggle and Login/Logout */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Button
                  onClick={() => setPdaDialogOpen(true)}
                  variant="ghost"
                  size="sm"
                  className="text-slate-300 hover:text-white hover:bg-slate-700/50 font-semibold"
                >
                  <Award className="h-4 w-4 mr-2" />
                  PDA
                </Button>
                <Button
                  onClick={() => setDcpDialogOpen(true)}
                  variant="ghost"
                  size="sm"
                  className="text-slate-300 hover:text-white hover:bg-slate-700/50 font-semibold"
                >
                  <Award className="h-4 w-4 mr-2" />
                  DCP
                </Button>
                <div className="hidden sm:block text-sm text-slate-300">
                  {userEmail}
                </div>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="text-slate-300 hover:text-white hover:bg-slate-700/50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Button
                onClick={() => navigate("/login")}
                variant="ghost"
                size="sm"
                className="text-slate-300 hover:text-white hover:bg-slate-700/50"
              >
                Login
              </Button>
            )}
            <ThemeToggle />
          </div>
          
          <div className="relative container mx-auto px-6 py-16 sm:py-20 md:py-24 lg:py-28">
            <SkeletonHeader />
          </div>
          
          {/* Elegant Bottom Border */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
        </header>

        <main className="container mx-auto px-4 py-6 sm:py-8 md:py-12 lg:py-16">
          <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12 md:space-y-16">
            <section className="text-center">
              <SkeletonCard />
            </section>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Professional Header */}
      <header className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden" role="banner" aria-label="KUG Oriental Academy Header">
        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        {/* Theme Toggle and Login/Logout */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Button
                onClick={() => setPdaDialogOpen(true)}
                variant="ghost"
                size="sm"
                className="text-slate-300 hover:text-white hover:bg-slate-700/50 font-semibold"
              >
                <Award className="h-4 w-4 mr-2" />
                PDA
              </Button>
              <Button
                onClick={() => setDcpDialogOpen(true)}
                variant="ghost"
                size="sm"
                className="text-slate-300 hover:text-white hover:bg-slate-700/50 font-semibold"
              >
                <Award className="h-4 w-4 mr-2" />
                DCP
              </Button>
              <div className="hidden sm:block text-sm text-slate-300">
                {userEmail}
              </div>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-slate-300 hover:text-white hover:bg-slate-700/50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <Button
              onClick={() => navigate("/login")}
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white hover:bg-slate-700/50"
            >
              Login
            </Button>
          )}
          <ThemeToggle />
        </div>
        
        <div className="relative container mx-auto px-6 py-16 sm:py-20 md:py-24 lg:py-28">
          <div className="text-center max-w-6xl mx-auto">
            {/* Academy Name */}
            <div className="mb-8">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-display font-bold leading-none tracking-tight" id="main-heading">
                KUG ORIENTAL
                <br />
                <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light tracking-wider text-slate-300">
                  ACADEMY
                </span>
              </h1>
            </div>
            
            {/* Website Link */}
            <div className="mb-12">
              <a 
                href="https://kugoriental.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors duration-300 group"
              >
                <div className="w-1 h-1 bg-slate-400 rounded-full group-hover:bg-white transition-colors duration-300"></div>
                <span className="text-sm sm:text-base font-mono tracking-widest uppercase">
                  kugoriental.com
                </span>
                <div className="w-1 h-1 bg-slate-400 rounded-full group-hover:bg-white transition-colors duration-300"></div>
              </a>
            </div>
            
            {/* Result Availability Status */}
            <div className="mt-12" role="status" aria-live="polite">
              {isResultAvailable ? (
                <div className="inline-flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-8 py-4 backdrop-blur-sm" aria-label="Results are now available">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-400" aria-hidden="true" />
                    <span className="text-base font-semibold text-emerald-100 tracking-wide">
                      DCP Results Now Available
                    </span>
                  </div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" aria-hidden="true"></div>
                </div>
              ) : (
                <div className="inline-flex items-center gap-4 bg-amber-500/10 border border-amber-500/20 rounded-full px-8 py-4 backdrop-blur-sm" aria-label={`Results will be available in ${timeUntilAvailable}`}>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-amber-400" aria-hidden="true" />
                    <span className="text-base font-semibold text-amber-100 tracking-wide">
                      DCP available in {timeUntilAvailable}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Elegant Bottom Border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 sm:py-8 md:py-12 lg:py-16" role="main" aria-label="Student Result Portal Main Content">
        <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12 md:space-y-16">
          
          {/* Search Section */}
          <section className="text-center" aria-label="Student Result Search">
            <SearchBox onSearch={handleSearch} isLoading={isLoading} />
            
            {/* DCP Result Availability Notice */}
            {!isResultAvailable && (
              <div className="mt-8 max-w-3xl mx-auto">
                <div className="bg-gradient-card rounded-2xl p-6 sm:p-8 border border-border/50 shadow-elegant backdrop-blur-sm">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="p-2 bg-warning/10 rounded-full">
                      <AlertCircle className="h-6 w-6 text-warning" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground">
                      DCP Results Not Yet Available
                    </h3>
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground mb-6 leading-relaxed">
                    DCP examination results will be published on <strong className="text-foreground">03/10/2025 at 10:00 AM</strong> and will be available for viewing after <strong className="text-foreground">10:00 AM</strong>. DIPLOMA IN COUNSELLING PSYCHOLOGY results are available now.
                  </p>
                  <div className="flex items-center justify-center gap-6 text-sm sm:text-base text-muted-foreground">
                    <div className="flex items-center gap-2 bg-accent/5 rounded-lg px-4 py-2">
                      <Calendar className="h-4 w-4 text-accent" />
                      <span className="font-medium">03/10/2025</span>
                    </div>
                    <div className="flex items-center gap-2 bg-accent/5 rounded-lg px-4 py-2">
                      <Clock className="h-4 w-4 text-accent" />
                      <span className="font-medium">10:00 AM</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Loading State */}
          {isLoading && (
            <section className="text-center py-12 sm:py-16 md:py-20" aria-label="Loading search results" role="status" aria-live="polite">
              <div className="inline-flex items-center justify-center">
                <div className="bg-gradient-card rounded-3xl p-8 sm:p-10 md:p-12 shadow-elegant border border-border/50 animate-scale-in backdrop-blur-sm">
                  <div className="space-y-6">
                    <AcademicLoader 
                      message="Searching for Result" 
                      size="lg" 
                    />
                    <div className="space-y-2">
                      <p className="text-sm sm:text-base text-muted-foreground font-medium">
                        Please wait while we fetch your examination results...
                      </p>
                      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground" aria-hidden="true">
                        <div className="w-1 h-1 bg-accent rounded-full animate-pulse"></div>
                        <div className="w-1 h-1 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-1 h-1 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Results Section */}
          {hasSearched && !isLoading && (
            <section className="space-y-6 sm:space-y-8 md:space-y-12" aria-label="Search Results" role="region">
              {searchResult ? (
                <div className="space-y-6 sm:space-y-8">
                  <ResultTable student={searchResult} />
                  <PrintPDFButtons student={searchResult} />
                  
                  {/* Certificate Preview - Only for authenticated users */}
                  {isAuthenticated && (
                    <div className="mt-12">
                      <h2 className="text-2xl font-bold text-center mb-6 text-foreground">
                        Certificate Preview
                      </h2>
                      <div className="flex justify-center">
                        <Certificate student={searchResult} />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <ErrorMessage />
              )}
            </section>
          )}

          {/* Information Section */}
          {!hasSearched && !isLoading && (
            <section className="text-center py-12 sm:py-16 md:py-20" aria-label="How to use the portal">
              <div className="max-w-4xl mx-auto animate-fade-in">
                <div className="text-center mb-12 sm:mb-16">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground mb-4 sm:mb-6">
                    How to Check Your Result
                  </h2>
                  <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Follow these simple steps to access your examination results quickly and securely
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
                  <div className="bg-gradient-card rounded-2xl p-6 sm:p-8 border border-border/50 shadow-card hover:shadow-elegant hover:scale-105 transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-academic/5 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative z-10">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-academic/10 to-academic/20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:from-academic/20 group-hover:to-academic/30 transition-all duration-300">
                        <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 text-academic" />
                      </div>
                      <h3 className="font-bold text-foreground mb-3 text-base sm:text-lg">Enter Details</h3>
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                        Type your Register Number in the search box above
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-card rounded-2xl p-6 sm:p-8 border border-border/50 shadow-card hover:shadow-elegant hover:scale-105 transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-academic/5 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative z-10">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-academic/10 to-academic/20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:from-academic/20 group-hover:to-academic/30 transition-all duration-300">
                        <Shield className="h-6 w-6 sm:h-7 sm:w-7 text-academic" />
                      </div>
                      <h3 className="font-bold text-foreground mb-3 text-base sm:text-lg">Search Result</h3>
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                        Click the search button to fetch your results securely
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-card rounded-2xl p-6 sm:p-8 border border-border/50 shadow-card hover:shadow-elegant hover:scale-105 transition-all duration-300 sm:col-span-2 lg:col-span-1 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-academic/5 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative z-10">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-academic/10 to-academic/20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:from-academic/20 group-hover:to-academic/30 transition-all duration-300">
                        <Users className="h-6 w-6 sm:h-7 sm:w-7 text-academic" />
                      </div>
                      <h3 className="font-bold text-foreground mb-3 text-base sm:text-lg">View & Download</h3>
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                        View your detailed result and download PDF copy
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Professional Features Highlight */}
                <div className="mt-12 sm:mt-16 bg-gradient-to-r from-accent/5 to-secondary/5 rounded-2xl p-8 sm:p-10 border border-border/30 shadow-card backdrop-blur-sm">
                  <div className="text-center mb-8">
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">Professional Features</h3>
                    <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
                      Built with modern technology and professional standards for the best user experience
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="flex items-center gap-3 p-4 bg-background/50 rounded-xl border border-border/20">
                      <div className="w-2 h-2 bg-academic rounded-full flex-shrink-0"></div>
                      <span className="text-sm sm:text-base font-medium text-foreground">High-quality PDF generation</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-background/50 rounded-xl border border-border/20">
                      <div className="w-2 h-2 bg-academic rounded-full flex-shrink-0"></div>
                      <span className="text-sm sm:text-base font-medium text-foreground">Print-optimized layouts</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-background/50 rounded-xl border border-border/20">
                      <div className="w-2 h-2 bg-academic rounded-full flex-shrink-0"></div>
                      <span className="text-sm sm:text-base font-medium text-foreground">Responsive design</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-background/50 rounded-xl border border-border/20">
                      <div className="w-2 h-2 bg-academic rounded-full flex-shrink-0"></div>
                      <span className="text-sm sm:text-base font-medium text-foreground">Secure & fast</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Bulk Certificate Dialogs */}
      <BulkCertificateDialog
        open={pdaDialogOpen}
        onOpenChange={setPdaDialogOpen}
        students={studentsData}
        courseType="PDA"
      />
      <BulkCertificateDialog
        open={dcpDialogOpen}
        onOpenChange={setDcpDialogOpen}
        students={dcpStudentsData}
        courseType="DCP"
      />

      {/* Professional Footer */}
      <footer className="bg-gradient-to-r from-muted to-muted/80 border-t border-border/50 mt-16 sm:mt-20 md:mt-24" role="contentinfo" aria-label="KUG Oriental Academy Footer">
        <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-6">
              <div className="space-y-3">
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  KUG Oriental Academy
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Premier educational institution committed to excellence in oriental medicine and holistic healthcare education.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-t border-b border-border/30">
                <div className="text-center sm:text-left">
                  <p className="text-xs sm:text-sm font-semibold text-foreground mb-2">Contact</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    For technical support, contact the examination department
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs sm:text-sm font-semibold text-foreground mb-2">Website</p>
                  <p className="text-xs sm:text-sm text-muted-foreground font-mono">
                    kugoriental.com
                  </p>
                </div>
                <div className="text-center sm:text-right">
                  <p className="text-xs sm:text-sm font-semibold text-foreground mb-2">Copyright</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    © 2025 All rights reserved
                  </p>
                </div>
              </div>
              
              {/* Professional Footer Badge */}
              <div className="flex items-center justify-center gap-3 text-xs sm:text-sm text-muted-foreground">
                <div className="w-1.5 h-1.5 bg-academic rounded-full"></div>
                <span className="font-medium">Professional Academic Portal</span>
                <div className="w-1.5 h-1.5 bg-academic rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

import { useState, useEffect } from "react";
import { SearchBox } from "@/components/SearchBox";
import { ResultTable } from "@/components/ResultTable";
import { PrintPDFButtons } from "@/components/PrintPDFButtons";
import { ErrorMessage } from "@/components/ErrorMessage";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Skeleton, SkeletonHeader, SkeletonCard } from "@/components/Skeleton";
import { ProfessionalLoader, AcademicLoader } from "@/components/ProfessionalLoader";
import { studentsData, type Student } from "@/data/studentsData";
import { useToast } from "@/hooks/use-toast";
import { useResponsive } from "@/hooks/use-responsive";

const Index = () => {
  const [searchResult, setSearchResult] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const { toast } = useToast();
  const { isMobile, isTablet, isDesktop } = useResponsive();

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
    
    const found = studentsData.find(
      student => student.RegiNo.toLowerCase() === searchTerm.toLowerCase()
    );
    
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

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="relative bg-gradient-primary text-academic-foreground">
          <div className="absolute inset-0 bg-black/10"></div>
          
          {/* Theme Toggle */}
          <div className="absolute top-4 right-4 z-10">
            <ThemeToggle />
          </div>
          
          <div className="relative container mx-auto px-4 py-12 md:py-16 lg:py-20">
            <SkeletonHeader />
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-background to-transparent"></div>
        </header>

        <main className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
          <div className="max-w-7xl mx-auto space-y-12 md:space-y-16">
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
      <header className="relative bg-gradient-primary text-academic-foreground overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </div>
        
        {/* Theme Toggle */}
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10">
          <ThemeToggle />
        </div>
        
        <div className="relative container mx-auto px-4 py-8 sm:py-12 md:py-16 lg:py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-display font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
              KUG ORIENTAL ACADEMY
            </h1>
            <div className="w-20 sm:w-24 md:w-32 h-1 bg-white/30 rounded mx-auto mb-4 sm:mb-6"></div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-display font-semibold mb-3 sm:mb-4 md:mb-6 leading-tight">
              BATCH 15 RESULT
            </h2>
            <div className="w-16 sm:w-20 md:w-24 h-1 bg-white/20 rounded mx-auto mb-4 sm:mb-6"></div>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl opacity-90 font-medium">
              Result Publish Time – 28/08/2025 10:00 AM
            </p>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg opacity-80 mt-2 sm:mt-3">
              Official Student Result Portal
            </p>
            <p className="text-xs sm:text-sm md:text-base opacity-70 mt-1 sm:mt-2">
              kugoriental.com
            </p>
            
            {/* Professional Badge */}
            <div className="mt-6 sm:mt-8 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm font-medium">Live Results Portal</span>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-2 sm:h-4 bg-gradient-to-t from-background to-transparent"></div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 sm:py-8 md:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12 md:space-y-16">
          
          {/* Search Section */}
          <section className="text-center">
            <SearchBox onSearch={handleSearch} isLoading={isLoading} />
          </section>

          {/* Loading State */}
          {isLoading && (
            <section className="text-center py-8 sm:py-12 md:py-16">
              <div className="inline-flex items-center justify-center">
                <div className="bg-gradient-card rounded-2xl p-6 sm:p-8 md:p-12 shadow-elegant border border-border/50 animate-scale-in">
                  <AcademicLoader 
                    message="Searching for Result" 
                    size="lg" 
                  />
                  <p className="text-xs sm:text-sm text-muted-foreground mt-4">
                    Please wait while we fetch your examination results...
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Results Section */}
          {hasSearched && !isLoading && (
            <section className="space-y-6 sm:space-y-8 md:space-y-12">
              {searchResult ? (
                <div className="space-y-6 sm:space-y-8">
                  <ResultTable student={searchResult} />
                  <PrintPDFButtons student={searchResult} />
                </div>
              ) : (
                <ErrorMessage />
              )}
            </section>
          )}

          {/* Information Section */}
          {!hasSearched && !isLoading && (
            <section className="text-center py-8 sm:py-12 md:py-16">
              <div className="max-w-2xl mx-auto animate-fade-in">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-semibold text-foreground mb-4 sm:mb-6">
                  How to Check Your Result
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                  <div className="bg-gradient-card rounded-xl p-4 sm:p-6 border border-border/50 shadow-card hover:shadow-elegant hover:scale-105 transition-all duration-300 group">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-academic/10 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-academic/20 transition-colors duration-300">
                      <span className="text-academic font-bold text-lg sm:text-xl">1</span>
                    </div>
                    <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Enter Details</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Type your Register Number in the search box above
                    </p>
                  </div>
                  
                  <div className="bg-gradient-card rounded-xl p-4 sm:p-6 border border-border/50 shadow-card hover:shadow-elegant hover:scale-105 transition-all duration-300 group">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-academic/10 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-academic/20 transition-colors duration-300">
                      <span className="text-academic font-bold text-lg sm:text-xl">2</span>
                    </div>
                    <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Search Result</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Click the search button to fetch your results
                    </p>
                  </div>
                  
                  <div className="bg-gradient-card rounded-xl p-4 sm:p-6 border border-border/50 shadow-card hover:shadow-elegant hover:scale-105 transition-all duration-300 sm:col-span-2 lg:col-span-1 group">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-academic/10 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-academic/20 transition-colors duration-300">
                      <span className="text-academic font-bold text-lg sm:text-xl">3</span>
                    </div>
                    <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">View & Download</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      View your detailed result and download PDF copy
                    </p>
                  </div>
                </div>
                
                {/* Professional Features Highlight */}
                {isDesktop && (
                  <div className="mt-8 sm:mt-12 bg-gradient-to-r from-accent/10 to-secondary/10 rounded-xl p-6 border border-border/50">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Professional Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-academic rounded-full"></div>
                        <span>High-quality PDF generation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-academic rounded-full"></div>
                        <span>Print-optimized layouts</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-academic rounded-full"></div>
                        <span>Responsive design for all devices</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted border-t border-border mt-12 sm:mt-16 md:mt-20">
        <div className="container mx-auto px-4 py-6 sm:py-8 md:py-12">
          <div className="text-center">
            <p className="text-muted-foreground text-xs sm:text-sm md:text-base">
              © 2025 KUG Oriental Academy. All rights reserved.
            </p>
            <p className="text-muted-foreground text-xs md:text-sm mt-1 sm:mt-2">
              For technical support, contact the examination department.
            </p>
            <p className="text-muted-foreground text-xs md:text-sm mt-1">
              Visit us at kugoriental.com
            </p>
            
            {/* Professional Footer Badge */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <div className="w-1 h-1 bg-academic rounded-full"></div>
              <span>Professional Academic Portal</span>
              <div className="w-1 h-1 bg-academic rounded-full"></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

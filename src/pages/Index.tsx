import { useState } from "react";
import { SearchBox } from "@/components/SearchBox";
import { ResultTable } from "@/components/ResultTable";
import { PrintPDFButtons } from "@/components/PrintPDFButtons";
import { ErrorMessage } from "@/components/ErrorMessage";
import { studentsData, type Student } from "@/data/studentsData";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [searchResult, setSearchResult] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

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

  return (
    <div className="min-h-screen bg-background">
      {/* Professional Header */}
      <header className="relative bg-gradient-primary text-academic-foreground">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 py-12 md:py-16 lg:py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4 md:mb-6">
              BATCH 15 RESULT
            </h1>
            <div className="w-32 h-1 bg-white/30 rounded mx-auto mb-6"></div>
            <p className="text-lg md:text-xl lg:text-2xl opacity-90 font-medium">
              Result Publish Time – 28/08/2025 10:00 AM
            </p>
            <p className="text-base md:text-lg opacity-80 mt-3">
              Official Student Result Portal
            </p>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-background to-transparent"></div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto space-y-12 md:space-y-16">
          
          {/* Search Section */}
          <section className="text-center">
            <SearchBox onSearch={handleSearch} isLoading={isLoading} />
          </section>

          {/* Loading State */}
          {isLoading && (
            <section className="text-center py-12 md:py-16">
              <div className="inline-flex items-center justify-center">
                <div className="bg-gradient-card rounded-2xl p-8 md:p-12 shadow-elegant border border-border/50 animate-scale-in">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-academic/30 border-t-academic rounded-full animate-spin"></div>
                    <div className="space-y-2 text-center">
                      <h3 className="text-xl md:text-2xl font-display font-semibold text-foreground">
                        Searching for Result
                      </h3>
                      <p className="text-muted-foreground">
                        Please wait while we fetch your examination results...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Results Section */}
          {hasSearched && !isLoading && (
            <section className="space-y-8 md:space-y-12">
              {searchResult ? (
                <div className="space-y-8">
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
            <section className="text-center py-12 md:py-16">
              <div className="max-w-2xl mx-auto animate-fade-in">
                <h2 className="text-2xl md:text-3xl font-display font-semibold text-foreground mb-6">
                  How to Check Your Result
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                  <div className="bg-gradient-card rounded-xl p-6 border border-border/50 shadow-card-hover hover:shadow-elegant transition-all duration-300">
                    <div className="w-12 h-12 bg-academic/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <span className="text-academic font-bold text-xl">1</span>
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">Enter Details</h3>
                    <p className="text-sm text-muted-foreground">
                      Type your Register Number in the search box above
                    </p>
                  </div>
                  
                  <div className="bg-gradient-card rounded-xl p-6 border border-border/50 shadow-card-hover hover:shadow-elegant transition-all duration-300">
                    <div className="w-12 h-12 bg-academic/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <span className="text-academic font-bold text-xl">2</span>
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">Search Result</h3>
                    <p className="text-sm text-muted-foreground">
                      Click the search button to fetch your results
                    </p>
                  </div>
                  
                  <div className="bg-gradient-card rounded-xl p-6 border border-border/50 shadow-card-hover hover:shadow-elegant transition-all duration-300">
                    <div className="w-12 h-12 bg-academic/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <span className="text-academic font-bold text-xl">3</span>
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">View & Download</h3>
                    <p className="text-sm text-muted-foreground">
                      View your detailed result and download PDF copy
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted border-t border-border mt-16 md:mt-20">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="text-center">
            <p className="text-muted-foreground text-sm md:text-base">
              © 2025 Academic Institution. All rights reserved.
            </p>
            <p className="text-muted-foreground text-xs md:text-sm mt-2">
              For technical support, contact the examination department.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

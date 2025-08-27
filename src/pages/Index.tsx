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
      {/* Header */}
      <div className="bg-academic text-academic-foreground py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">BATCH 15 RESULT</h1>
          <p className="text-lg opacity-90">Result Publish Time – 28/08/2025 10:00 AM</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Search Section */}
          <div className="text-center">
            <SearchBox onSearch={handleSearch} isLoading={isLoading} />
          </div>

          {/* Results Section */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-primary bg-accent">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching for result...
              </div>
            </div>
          )}

          {hasSearched && !isLoading && (
            <>
              {searchResult ? (
                <div className="space-y-6">
                  <ResultTable student={searchResult} />
                  <PrintPDFButtons student={searchResult} />
                </div>
              ) : (
                <ErrorMessage />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;

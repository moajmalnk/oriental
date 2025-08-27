import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Smartphone, Monitor } from "lucide-react";
import { useResponsive } from "@/hooks/use-responsive";

interface SearchBoxProps {
  onSearch: (searchTerm: string) => void;
  isLoading?: boolean;
}

export const SearchBox = ({ onSearch, isLoading = false }: SearchBoxProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { isMobile, isTablet } = useResponsive();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto animate-fade-in px-4 sm:px-0">
      <div className="bg-gradient-card rounded-2xl p-4 sm:p-6 md:p-8 shadow-elegant border border-border/50">
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-display font-semibold text-foreground mb-2">
            Search Student Result
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
            Enter your register number to view your examination results
          </p>
          
          {/* Device indicator for better UX */}
          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
            {isMobile ? (
              <>
                <Smartphone className="h-3 w-3" />
                <span>Mobile Optimized</span>
              </>
            ) : isTablet ? (
              <>
                <Monitor className="h-3 w-3" />
                <span>Tablet View</span>
              </>
            ) : (
              <>
                <Monitor className="h-3 w-3" />
                <span>Desktop View</span>
              </>
            )}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-2 sm:space-y-3">
            <Label 
              htmlFor="search" 
              className="text-xs sm:text-sm font-medium text-foreground block"
            >
              Register Number or Certificate Number
            </Label>
            <div className="relative group">
              <Input
                id="search"
                type="text"
                placeholder={isMobile ? "e.g., PDA2024065" : "Enter your register number (e.g., PDA2024065)"}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-12 h-10 sm:h-12 text-sm sm:text-base md:text-lg bg-background border-2 border-border focus:border-academic focus:ring-academic/20 focus:ring-2 transition-all duration-300 rounded-xl"
                disabled={isLoading}
                autoComplete="off"
                autoFocus={!isMobile}
              />
              <Search className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 sm:h-5 sm:w-5 group-focus-within:text-academic transition-colors duration-300" />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-10 sm:h-12 text-sm sm:text-base md:text-lg font-medium bg-gradient-primary hover:shadow-elegant transition-all duration-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !searchTerm.trim()}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="hidden sm:inline">Searching...</span>
                <span className="sm:hidden">Search...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Search className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Search Result</span>
                <span className="sm:hidden">Search</span>
              </div>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};
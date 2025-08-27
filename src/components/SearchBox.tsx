import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

interface SearchBoxProps {
  onSearch: (searchTerm: string) => void;
  isLoading?: boolean;
}

export const SearchBox = ({ onSearch, isLoading = false }: SearchBoxProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto animate-fade-in">
      <div className="bg-gradient-card rounded-2xl p-6 md:p-8 shadow-elegant border border-border/50">
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-display font-semibold text-foreground mb-2">
            Search Student Result
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Enter your register number to view your examination results
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label 
              htmlFor="search" 
              className="text-sm font-medium text-foreground block"
            >
              Register Number or Certificate Number
            </Label>
            <div className="relative group">
              <Input
                id="search"
                type="text"
                placeholder="e.g., PDA2024065"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-12 h-12 text-base md:text-lg bg-background border-2 border-border focus:border-academic focus:ring-academic/20 focus:ring-2 transition-all duration-300 rounded-xl"
                disabled={isLoading}
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 group-focus-within:text-academic transition-colors duration-300" />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 text-base md:text-lg font-medium bg-gradient-primary hover:shadow-elegant transition-all duration-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !searchTerm.trim()}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Searching...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search Result
              </div>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};
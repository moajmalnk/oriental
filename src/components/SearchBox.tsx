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
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="search" className="text-sm font-medium text-foreground">
            Enter Register Number or Certificate Number
          </Label>
          <div className="relative">
            <Input
              id="search"
              type="text"
              placeholder="e.g., PDA2024065"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
              disabled={isLoading}
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          </div>
        </div>
        <Button 
          type="submit" 
          className="w-full bg-academic hover:bg-academic/90"
          disabled={isLoading || !searchTerm.trim()}
        >
          {isLoading ? "Searching..." : "Search Result"}
        </Button>
      </form>
    </div>
  );
};
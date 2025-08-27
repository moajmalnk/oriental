import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const ErrorMessage = () => {
  return (
    <Alert variant="destructive" className="max-w-md mx-auto">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        No record found. Please check your Register Number or Certificate Number.
      </AlertDescription>
    </Alert>
  );
};
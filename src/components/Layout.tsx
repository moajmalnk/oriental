import React from "react";
import { Sidebar } from "./Navbar";
import { useAuth } from "@/contexts/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
  onBulkCertificateClick?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  onBulkCertificateClick,
}) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar onBulkCertificateClick={onBulkCertificateClick} />
      <main
        className={isAuthenticated ? "lg:ml-64 min-h-screen" : "min-h-screen"}
      >
        <div className="pt-8 p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
};

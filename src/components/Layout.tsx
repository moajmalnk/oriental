import React from "react";
import { Navbar } from "./Navbar";

interface LayoutProps {
  children: React.ReactNode;
  onBulkCertificateClick?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  onBulkCertificateClick,
}) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar onBulkCertificateClick={onBulkCertificateClick} />
      <main className="flex-1">{children}</main>
    </div>
  );
};

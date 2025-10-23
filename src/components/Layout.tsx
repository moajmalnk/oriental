import React from "react";
import { Navbar } from "./Navbar";

interface LayoutProps {
  children: React.ReactNode;
  onPdaClick?: () => void;
  onDcpClick?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  onPdaClick,
  onDcpClick,
}) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar onPdaClick={onPdaClick} onDcpClick={onDcpClick} />
      <main className="flex-1">{children}</main>
    </div>
  );
};

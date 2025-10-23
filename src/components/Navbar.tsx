import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ScrollbarVertical } from "@/components/ui/scrollbar";
import {
  BookOpen,
  Users,
  Home,
  LogOut,
  Award,
  Menu,
  X,
  Calendar,
} from "lucide-react";
import { useState, useEffect } from "react";

interface NavbarProps {
  onPdaClick?: () => void;
  onDcpClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onPdaClick, onDcpClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Check screen size for tablet/mobile
  useEffect(() => {
    const checkScreenSize = () => {
      setIsTablet(window.innerWidth < 1024); // lg breakpoint
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Close sidebar when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    {
      path: "/",
      label: "Home",
      icon: Home,
      show: true,
    },
    {
      path: "/courses",
      label: "Courses",
      icon: BookOpen,
      show: isAuthenticated,
    },
    {
      path: "/batches",
      label: "Batches",
      icon: Calendar,
      show: isAuthenticated,
    },
    {
      path: "/students",
      label: "Students",
      icon: Users,
      show: isAuthenticated,
    },
    {
      path: "/users",
      label: "Users",
      icon: Users,
      show: isAuthenticated,
    },
    {
      path: "/student-results",
      label: "Student Results",
      icon: Award,
      show: isAuthenticated,
    },
  ];

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Main Navbar */}
      <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                if (!item.show) return null;
                const Icon = item.icon;
                return (
                  <Button
                    key={item.path}
                    variant={isActive(item.path) ? "default" : "ghost"}
                    onClick={() => navigate(item.path)}
                    className={`gap-2 ${
                      isActive(item.path)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
            </div>

            {/* Right side - Actions and User Menu */}
            <div className="flex items-center space-x-2">
              {/* PDA/DCP buttons - only on home page and desktop */}
              {isAuthenticated && location.pathname === "/" && (
                <div className="hidden lg:flex items-center space-x-1">
                  <Button
                    onClick={onPdaClick}
                    variant="outline"
                    size="sm"
                    className="gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <Award className="h-4 w-4" />
                    PDA
                  </Button>
                  <Button
                    onClick={onDcpClick}
                    variant="outline"
                    size="sm"
                    className="gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <Award className="h-4 w-4" />
                    DCP
                  </Button>
                </div>
              )}

              {/* User info and logout - desktop only */}
              {isAuthenticated ? (
                <div className="hidden lg:flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {user?.username}
                  </span>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => navigate("/login")}
                  variant="ghost"
                  size="sm"
                  className="hidden lg:flex gap-2 text-muted-foreground hover:text-foreground"
                >
                  Login
                </Button>
              )}

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Mobile/Tablet menu button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMobileMenuToggle}
                className="lg:hidden"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile/Tablet Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile/Tablet Sidebar */}
      <div
        className={`
        fixed top-0 left-0 h-full w-64 max-w-[75vw] bg-background border-r border-border/40 
        transform transition-transform duration-300 ease-in-out z-50 lg:hidden
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/40">
            <h2 className="text-base font-semibold text-foreground">
              Navigation
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation Items */}
          <ScrollbarVertical className="flex-1 p-4">
            <div className="space-y-1">
              {navItems.map((item) => {
                if (!item.show) return null;
                const Icon = item.icon;
                return (
                  <Button
                    key={item.path}
                    variant={isActive(item.path) ? "default" : "ghost"}
                    onClick={() => handleNavClick(item.path)}
                    className={`w-full justify-start gap-2 h-10 ${
                      isActive(item.path)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{item.label}</span>
                  </Button>
                );
              })}
            </div>

            {/* PDA/DCP buttons for mobile/tablet */}
            {isAuthenticated && location.pathname === "/" && (
              <div className="mt-6 space-y-2">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Quick Actions
                </h3>
                <div className="space-y-1">
                  <Button
                    onClick={() => {
                      onPdaClick?.();
                      setIsMobileMenuOpen(false);
                    }}
                    variant="outline"
                    className="w-full justify-start gap-2 h-9"
                  >
                    <Award className="h-4 w-4" />
                    <span className="text-sm">PDA</span>
                  </Button>
                  <Button
                    onClick={() => {
                      onDcpClick?.();
                      setIsMobileMenuOpen(false);
                    }}
                    variant="outline"
                    className="w-full justify-start gap-2 h-9"
                  >
                    <Award className="h-4 w-4" />
                    <span className="text-sm">DCP</span>
                  </Button>
                </div>
              </div>
            )}
          </ScrollbarVertical>

          {/* Sidebar Footer */}
          <div className="border-t border-border/40 p-4">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="text-xs text-muted-foreground">
                  <div className="font-medium text-foreground">
                    Logged in as:
                  </div>
                  <div className="text-sm">{user?.username}</div>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full justify-start gap-2 h-9 text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Logout</span>
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => {
                  navigate("/login");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full gap-2 h-9"
              >
                <span className="text-sm">Login</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

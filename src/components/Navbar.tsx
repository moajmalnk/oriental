import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ScrollbarVertical } from "@/components/ui/scrollbar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  BookOpen,
  Users,
  Home,
  LogOut,
  Award,
  Menu,
  X,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { useState, useEffect } from "react";

interface SidebarProps {
  onBulkCertificateClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onBulkCertificateClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size for mobile
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobileMenuOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen, isMobile]);

  const handleLogout = () => {
    logout();
    navigate("/");
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    {
      path: "/",
      label: "Home",
      icon: Home,
      show: isAuthenticated,
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
    {
      path: "/announcements",
      label: "Announcements",
      icon: MessageSquare,
      show: isAuthenticated,
    },
  ];

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Theme Toggle - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Mobile Menu Toggle Button - Only show for authenticated users */}
      {isAuthenticated && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMobileMenuToggle}
          className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-background/95 backdrop-blur border border-border/40"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>
      )}

      {/* Mobile Overlay */}
      {isMobileMenuOpen && isMobile && isAuthenticated && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Fixed Sidebar - Only show for authenticated users */}
      {isAuthenticated && (
        <div
          className={`
          fixed top-0 left-0 h-full w-64 bg-background border-r border-border/40 
          transform transition-transform duration-300 ease-in-out z-50
          ${
            isMobile
              ? isMobileMenuOpen
                ? "translate-x-0"
                : "-translate-x-full"
              : "translate-x-0"
          }
          lg:translate-x-0
        `}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/40">
              <h2 className="text-sm font-semibold text-foreground font-['Poppins']">
                result.kugoriental.com
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-muted-foreground hover:text-foreground h-8 w-8 p-0 lg:hidden"
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
                      size="sm"
                      className={`w-full justify-start gap-3 h-10 px-3 ${
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

              {/* Bulk Certificate button */}
              {isAuthenticated && location.pathname === "/" && (
                <div className="mt-6 space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Quick Actions
                  </h3>
                  <Button
                    onClick={() => {
                      onBulkCertificateClick?.();
                      if (isMobile) {
                        setIsMobileMenuOpen(false);
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-3 h-10 px-3"
                  >
                    <Award className="h-4 w-4" />
                    <span className="text-sm">Bulk Certificates</span>
                  </Button>
                </div>
              )}
            </ScrollbarVertical>

            {/* Sidebar Footer */}
            <div className="border-t border-border/40 p-4">
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  <div className="font-medium text-foreground">
                    Logged in as:
                  </div>
                  <div className="text-sm">{user?.username}</div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-3 h-10 px-3 text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="text-sm">Logout</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to logout? You will need to login
                        again to access the admin panel.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleLogout}>
                        Logout
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

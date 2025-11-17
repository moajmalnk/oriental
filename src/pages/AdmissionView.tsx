import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OptimizedImage } from "@/components/OptimizedImage";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Admission interface matching backend model
interface Admission {
  id: number;
  full_name: string;
  email: string;
  aadhar_number: string;
  date_of_birth: string;
  gender: string;
  marital_status: string;
  guardian: string;
  religion: string;
  blood_group: string;
  contact_no1: string;
  contact_no2?: string | null;
  profession: string;
  student_photo?: string | null;
  present_address: string;
  city: string;
  district: string;
  pin_code: string;
  post: string;
  school_name: string;
  board_name: string;
  year: number;
  student_signature?: string | null;
  study_center?: string | null;
  course?: number | null;
  register_number?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  created_at: string;
  updated_at: string;
}

interface DetailCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number | null | undefined;
}

const DetailCard: React.FC<DetailCardProps> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="mt-1 text-muted-foreground">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
      <p className="text-base font-semibold text-foreground break-words">
        {value || "—"}
      </p>
    </div>
  </div>
);

function AdmissionView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [admission, setAdmission] = useState<Admission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch admission details
  const fetchAdmission = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/admissions/detail/${id}/`);
      setAdmission(response.data);
    } catch (error: any) {
      console.error("Error fetching admission:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load admission"
      );
      toast({
        title: "Error",
        description: "Failed to load admission details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle status change (route to approval page for APPROVED, direct update for others)
  const handleStatusChange = (
    newStatus: "PENDING" | "APPROVED" | "REJECTED"
  ) => {
    if (newStatus === "APPROVED") {
      navigate(`/admission-approve/${id}`);
      return;
    }

    // Direct update for PENDING/REJECTED
    handleStatusUpdate(newStatus);
  };

  // Update status (for PENDING/REJECTED)
  const handleStatusUpdate = async (
    newStatus: "PENDING" | "APPROVED" | "REJECTED"
  ) => {
    if (!admission) return;

    try {
      setIsUpdating(true);
      // Update only the status field
      const formData = new FormData();
      formData.append("status", newStatus);

      // Include all required fields to avoid validation errors
      formData.append("full_name", admission.full_name);
      formData.append("email", admission.email);
      formData.append("aadhar_number", admission.aadhar_number);
      formData.append("date_of_birth", admission.date_of_birth);
      formData.append("gender", admission.gender);
      formData.append("marital_status", admission.marital_status);
      formData.append("guardian", admission.guardian);
      formData.append("religion", admission.religion);
      formData.append("blood_group", admission.blood_group);
      formData.append("contact_no1", admission.contact_no1);
      if (admission.contact_no2) {
        formData.append("contact_no2", admission.contact_no2);
      }
      formData.append("profession", admission.profession);
      formData.append("present_address", admission.present_address);
      formData.append("city", admission.city);
      formData.append("district", admission.district);
      formData.append("pin_code", admission.pin_code);
      formData.append("post", admission.post);
      formData.append("school_name", admission.school_name);
      formData.append("board_name", admission.board_name);
      formData.append("year", String(admission.year));

      const response = await api.put(
        `/api/admissions/update/${id}/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setAdmission(response.data);
      toast({
        title: "Success",
        description: `Admission status updated to ${newStatus}`,
      });
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete admission
  const handleDelete = async () => {
    if (!admission) return;

    try {
      setIsDeleting(true);
      await api.delete(`/api/admissions/delete/${id}/`);
      toast({
        title: "Success",
        description: "Admission deleted successfully",
      });
      navigate("/admissions");
    } catch (error: any) {
      console.error("Error deleting admission:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete admission",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchAdmission();
    }
  }, [id]);

  // Get photo URL
  const getPhotoUrl = (photoPath: string | null | undefined): string | null => {
    if (!photoPath) return null;
    if (photoPath.startsWith("http")) return photoPath;
    const baseUrl = (
      import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
    ).replace(/\/$/, "");
    return `${baseUrl}${
      photoPath.startsWith("/") ? photoPath : `/${photoPath}`
    }`;
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "default";
      case "REJECTED":
        return "destructive";
      case "PENDING":
      default:
        return "secondary";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-4 w-4" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4" />;
      case "PENDING":
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-6 px-4 max-w-5xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !admission) {
    return (
      <Layout>
        <div className="container mx-auto py-6 px-4 max-w-5xl">
          <div className="text-center py-12">
            <p className="text-destructive mb-4">
              {error || "Admission not found"}
            </p>
            <Button onClick={() => navigate("/admissions")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admissions
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const photoUrl = getPhotoUrl(admission.student_photo);
  const signatureUrl = getPhotoUrl(admission.student_signature);

  return (
    <Layout>
      <div className="container mx-auto py-6 px-4 max-w-5xl">
        {/* Header Section */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/admissions")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admissions
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              {photoUrl ? (
                <OptimizedImage
                  src={photoUrl}
                  alt={admission.full_name}
                  className="h-20 w-20 sm:h-24 sm:w-24 object-cover rounded-full border-4 border-background shadow-lg ring-2 ring-primary/20"
                />
              ) : (
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-4 border-background shadow-lg ring-2 ring-primary/20 flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl font-bold text-primary">
                    {admission.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </span>
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    {admission.full_name}
                  </h1>
                  <Badge
                    variant={getStatusBadgeVariant(admission.status)}
                    className="gap-1"
                  >
                    {getStatusIcon(admission.status)}
                    {admission.status}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{admission.email}</p>
                <p className="text-sm text-muted-foreground">
                  Applied on {formatDate(admission.created_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Select
                value={admission.status}
                onValueChange={(value) =>
                  handleStatusChange(
                    value as "PENDING" | "APPROVED" | "REJECTED"
                  )
                }
                disabled={isUpdating || admission.status === "APPROVED"}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
              {admission.status !== "APPROVED" && (
                <Button
                  size="sm"
                  onClick={() => navigate(`/admission-approve/${admission.id}`)}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Proceed to Approval
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Personal Information Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailCard
                icon={<User className="h-4 w-4" />}
                label="Full Name"
                value={admission.full_name}
              />
              <DetailCard
                icon={<FileText className="h-4 w-4" />}
                label="Aadhar Number"
                value={admission.aadhar_number}
              />
              <DetailCard
                icon={<Calendar className="h-4 w-4" />}
                label="Date of Birth"
                value={formatDate(admission.date_of_birth)}
              />
              <DetailCard
                icon={<Mail className="h-4 w-4" />}
                label="Email"
                value={admission.email}
              />
              <DetailCard
                icon={<User className="h-4 w-4" />}
                label="Gender"
                value={
                  admission.gender.charAt(0).toUpperCase() +
                  admission.gender.slice(1)
                }
              />
              <DetailCard
                icon={<User className="h-4 w-4" />}
                label="Marital Status"
                value={
                  admission.marital_status.charAt(0).toUpperCase() +
                  admission.marital_status.slice(1)
                }
              />
              <DetailCard
                icon={<User className="h-4 w-4" />}
                label="Guardian Name"
                value={admission.guardian}
              />
              <DetailCard
                icon={<User className="h-4 w-4" />}
                label="Religion"
                value={admission.religion}
              />
              <DetailCard
                icon={<User className="h-4 w-4" />}
                label="Blood Group"
                value={admission.blood_group}
              />
              <DetailCard
                icon={<Phone className="h-4 w-4" />}
                label="Contact No 1"
                value={admission.contact_no1}
              />
              {admission.contact_no2 && (
                <DetailCard
                  icon={<Phone className="h-4 w-4" />}
                  label="Contact No 2"
                  value={admission.contact_no2}
                />
              )}
              <DetailCard
                icon={<FileText className="h-4 w-4" />}
                label="Profession"
                value={admission.profession}
              />
            </div>
          </CardContent>
        </Card>

        {/* Address Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <DetailCard
                  icon={<MapPin className="h-4 w-4" />}
                  label="Present Address"
                  value={admission.present_address}
                />
              </div>
              <DetailCard
                icon={<MapPin className="h-4 w-4" />}
                label="City"
                value={admission.city}
              />
              <DetailCard
                icon={<MapPin className="h-4 w-4" />}
                label="District"
                value={admission.district}
              />
              <DetailCard
                icon={<MapPin className="h-4 w-4" />}
                label="Pin Code"
                value={admission.pin_code}
              />
              <DetailCard
                icon={<MapPin className="h-4 w-4" />}
                label="Post"
                value={admission.post}
              />
            </div>
          </CardContent>
        </Card>

        {/* Details of Qualifying Exam Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Details of Qualifying Exam
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <DetailCard
                icon={<FileText className="h-4 w-4" />}
                label="School Name"
                value={admission.school_name}
              />
              <DetailCard
                icon={<FileText className="h-4 w-4" />}
                label="Board Name"
                value={admission.board_name}
              />
              <DetailCard
                icon={<Calendar className="h-4 w-4" />}
                label="Year"
                value={admission.year}
              />
            </div>
            {signatureUrl && (
              <div className="mt-6">
                <p className="text-sm font-medium text-muted-foreground mb-3">
                  Student Signature
                </p>
                <div className="border rounded-lg p-4 bg-muted/50">
                  <img
                    src={signatureUrl}
                    alt="Student Signature"
                    className="max-w-xs h-32 object-contain"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Office Use Section */}
        {(admission.study_center ||
          admission.course ||
          admission.register_number) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Office Use
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {admission.study_center && (
                  <DetailCard
                    icon={<MapPin className="h-4 w-4" />}
                    label="Study Center"
                    value={admission.study_center}
                  />
                )}
                {admission.course && (
                  <DetailCard
                    icon={<FileText className="h-4 w-4" />}
                    label="Course ID"
                    value={admission.course}
                  />
                )}
                {admission.register_number && (
                  <DetailCard
                    icon={<FileText className="h-4 w-4" />}
                    label="Register Number"
                    value={admission.register_number}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                admission application for <strong>{admission.full_name}</strong>{" "}
                and remove all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}

export default AdmissionView;

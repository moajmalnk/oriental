import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  User,
  MessageSquare,
} from "lucide-react";
import { announcementAPI } from "@/services/api";
import { Announcement, AnnouncementFormData } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/Layout";

const Announcements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formData, setFormData] = useState<AnnouncementFormData>({
    message: "",
    is_active: true,
    expires_by: "",
  });
  const [expiryDate, setExpiryDate] = useState("");
  const [expiryTime, setExpiryTime] = useState("");
  const { toast } = useToast();

  // Get timezone offset for datetime
  const getTimezoneOffset = () => {
    const offset = new Date().getTimezoneOffset();
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset) % 60;
    const sign = offset <= 0 ? "+" : "-";
    return `${sign}${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  // Load announcements
  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await announcementAPI.getAnnouncements();
      setAnnouncements(response.data);
    } catch (error) {
      console.error("Error loading announcements:", error);
      toast({
        title: "Error",
        description: "Failed to load announcements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Combine date and time with timezone offset
    const combinedDateTime =
      expiryDate && expiryTime
        ? `${expiryDate}T${expiryTime}:00${getTimezoneOffset()}`
        : formData.expires_by;

    const submitData = {
      ...formData,
      expires_by: combinedDateTime,
    };

    try {
      if (editingAnnouncement) {
        await announcementAPI.updateAnnouncement(
          editingAnnouncement.id!,
          submitData
        );
        toast({
          title: "Success",
          description: "Announcement updated successfully",
        });
        setIsEditDialogOpen(false);
      } else {
        await announcementAPI.createAnnouncement(submitData);
        toast({
          title: "Success",
          description: "Announcement created successfully",
        });
        setIsCreateDialogOpen(false);
      }

      setFormData({ message: "", is_active: true, expires_by: "" });
      setExpiryDate("");
      setExpiryTime("");
      setEditingAnnouncement(null);
      loadAnnouncements();
    } catch (error: any) {
      console.error("Error saving announcement:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to save announcement",
        variant: "destructive",
      });
    }
  };

  // Handle edit
  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      message: announcement.message,
      is_active: announcement.is_active,
      expires_by: announcement.expires_by,
    });

    // Parse date and time from the existing datetime
    const dateTime = announcement.expires_by;
    if (dateTime.includes("T")) {
      // Handle timezone-aware datetime
      const dateTimePart = dateTime.split(/[+-]/)[0]; // Remove timezone info
      const [date, time] = dateTimePart.split("T");
      setExpiryDate(date);
      setExpiryTime(time.split(".")[0]); // Remove milliseconds
    }

    setIsEditDialogOpen(true);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await announcementAPI.deleteAnnouncement(deleteId);
      toast({
        title: "Success",
        description: "Announcement deleted successfully",
      });
      setDeleteId(null);
      loadAnnouncements();
    } catch (error: any) {
      console.error("Error deleting announcement:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete announcement",
        variant: "destructive",
      });
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Check if announcement is expired
  const isExpired = (expiresBy: string) => {
    return new Date(expiresBy) < new Date();
  };

  // Check if announcement is active and not expired
  const isActive = (announcement: Announcement) => {
    return announcement.is_active && !isExpired(announcement.expires_by);
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Announcements</h1>
            <p className="text-muted-foreground">Manage system announcements</p>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Announcement</DialogTitle>
                <DialogDescription>
                  Create a new announcement that will be displayed to users.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="message">Message</Label>
                    <Input
                      id="message"
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder="Enter announcement message"
                      maxLength={50}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="expires_by">Expires By</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <DatePicker
                        value={expiryDate}
                        onChange={(value) => setExpiryDate(value)}
                        placeholder="Select date"
                      />
                      <TimePicker
                        value={expiryTime}
                        onChange={(value) => setExpiryTime(value)}
                        placeholder="Select time"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_active: checked })
                      }
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Announcement</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Announcement</DialogTitle>
              <DialogDescription>
                Update the announcement details.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-message">Message</Label>
                  <Input
                    id="edit-message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Enter announcement message"
                    maxLength={50}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-expires_by">Expires By</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <DatePicker
                      value={expiryDate}
                      onChange={(value) => setExpiryDate(value)}
                      placeholder="Select date"
                    />
                    <TimePicker
                      value={expiryTime}
                      onChange={(value) => setExpiryTime(value)}
                      placeholder="Select time"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                  <Label htmlFor="edit-is_active">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update Announcement</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={deleteId !== null}
          onOpenChange={() => setDeleteId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                announcement.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteId(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Announcements List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : announcements.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No announcements</h3>
              <p className="text-muted-foreground text-center">
                Create your first announcement to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {announcements.map((announcement) => (
              <Card key={announcement.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {announcement.message}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Expires: {formatDate(announcement.expires_by)}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          Created: {formatDate(announcement.created_at!)}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          isActive(announcement)
                            ? "default"
                            : isExpired(announcement.expires_by)
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {isActive(announcement)
                          ? "Active"
                          : isExpired(announcement.expires_by)
                          ? "Expired"
                          : "Inactive"}
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(announcement)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(announcement.id!)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Announcements;

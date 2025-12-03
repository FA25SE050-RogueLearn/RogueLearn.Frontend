"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ChevronLeft, Loader2, Plus, Pencil, Trash2, Tag as TagIcon } from "lucide-react";
import Link from "next/link";
import eventServiceApi from "@/api/eventServiceApi";
import type { Tag } from "@/types/event-service";
import { toast } from "sonner";

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [tagName, setTagName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const response = await eventServiceApi.getAllTags();
      if (response.success && response.data) {
        setTags(Array.isArray(response.data) ? response.data : []);
      } else {
        toast.error("Failed to load tags");
      }
    } catch {
      toast.error("Error loading tags");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!tagName.trim()) {
      toast.error("Tag name is required");
      return;
    }

    setSubmitting(true);
    try {
      const response = await eventServiceApi.createTag(tagName.trim());
      if (response.success) {
        toast.success("Tag created successfully");
        setIsCreateModalOpen(false);
        setTagName("");
        fetchTags();
      } else {
        toast.error(response.error?.message || "Failed to create tag");
      }
    } catch {
      toast.error("Error creating tag");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedTag || !tagName.trim()) {
      toast.error("Tag name is required");
      return;
    }

    setSubmitting(true);
    try {
      const response = await eventServiceApi.updateTag(selectedTag.id, tagName.trim());
      if (response.success) {
        toast.success("Tag updated successfully");
        setIsEditModalOpen(false);
        setSelectedTag(null);
        setTagName("");
        fetchTags();
      } else {
        toast.error(response.error?.message || "Failed to update tag");
      }
    } catch {
      toast.error("Error updating tag");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTag) return;

    setSubmitting(true);
    try {
      const response = await eventServiceApi.deleteTag(selectedTag.id);
      if (response.success) {
        toast.success("Tag deleted successfully");
        setIsDeleteModalOpen(false);
        setSelectedTag(null);
        fetchTags();
      } else {
        toast.error(response.error?.message || "Failed to delete tag");
      }
    } catch {
      toast.error("Error deleting tag");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (tag: Tag) => {
    setSelectedTag(tag);
    setTagName(tag.name);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (tag: Tag) => {
    setSelectedTag(tag);
    setIsDeleteModalOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm" className="border-[#f5c16c]/30 text-[#f5c16c] hover:bg-[#f5c16c]/10">
            <Link href="/admin/content" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" /> Back
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#f5c16c]">Problem Tags</h1>
            <p className="text-sm text-white/60">Manage tags for categorizing problems</p>
          </div>
          <Button 
            onClick={() => { setTagName(""); setIsCreateModalOpen(true); }}
            className="bg-[#7289da] hover:bg-[#7289da]/90 text-white"
          >
            <Plus className="mr-2 h-4 w-4" /> Create Tag
          </Button>
        </div>

        <Card className="bg-[#1a1410] border-[#f5c16c]/20">
          <CardHeader className="border-b border-[#f5c16c]/10">
            <CardTitle className="text-[#f5c16c]">Available Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#f5c16c]" />
              </div>
            ) : tags.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <TagIcon className="h-12 w-12 text-[#f5c16c]/40 mb-4" />
                <p className="text-white mb-2">No tags found</p>
                <p className="text-xs text-white/50">Create your first tag to get started</p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {tags.map((tag) => (
                  <div 
                    key={tag.id} 
                    className="flex items-center justify-between rounded-lg border border-[#f5c16c]/20 bg-[#0a0506] p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f5c16c]/10 border border-[#f5c16c]/30">
                        <TagIcon className="h-5 w-5 text-[#f5c16c]" />
                      </div>
                      <span className="font-medium text-white">{tag.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-[#f5c16c]/30 text-[#f5c16c] hover:bg-[#f5c16c]/10"
                        onClick={() => openEditModal(tag)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        onClick={() => openDeleteModal(tag)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Tag Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-[#1a1410] border-[#f5c16c]/20">
          <DialogHeader>
            <DialogTitle className="text-[#f5c16c]">Create New Tag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Enter tag name"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              className="bg-[#0a0506] border-[#f5c16c]/20 text-white placeholder:text-white/40"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} className="border-[#f5c16c]/30 text-white hover:bg-[#f5c16c]/10">
              Cancel
            </Button>
            <Button 
              onClick={handleCreate} 
              disabled={submitting}
              className="bg-[#f5c16c] hover:bg-[#f5c16c]/90 text-[#0a0506]"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Tag Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-[#1a1410] border-[#f5c16c]/20">
          <DialogHeader>
            <DialogTitle className="text-[#f5c16c]">Edit Tag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Enter tag name"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              className="bg-[#0a0506] border-[#f5c16c]/20 text-white placeholder:text-white/40"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="border-[#f5c16c]/30 text-white hover:bg-[#f5c16c]/10">
              Cancel
            </Button>
            <Button 
              onClick={handleEdit} 
              disabled={submitting}
              className="bg-[#f5c16c] hover:bg-[#f5c16c]/90 text-[#0a0506]"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-[#1a1410] border-[#f5c16c]/20">
          <DialogHeader>
            <DialogTitle className="text-[#f5c16c]">Delete Tag</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-white/70">
              Are you sure you want to delete the tag <strong className="text-white">&quot;{selectedTag?.name}&quot;</strong>? 
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="border-[#f5c16c]/30 text-white hover:bg-[#f5c16c]/10">
              Cancel
            </Button>
            <Button 
              onClick={handleDelete} 
              disabled={submitting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

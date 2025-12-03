"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Plus, Pencil, Trash2, Trophy, Search, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import achievementsApi from "@/api/achievementsApi";
import type { AchievementDto, CreateAchievementCommand, UpdateAchievementCommand } from "@/types/achievement";

type AchievementFormData = {
  key: string;
  name: string;
  description: string;
  ruleType: string;
  ruleConfig: string;
  category: string;
  icon: string;
  version: number;
  isActive: boolean;
  sourceService: string;
  iconFile?: File | null;
};

const defaultFormData: AchievementFormData = {
  key: "",
  name: "",
  description: "",
  ruleType: "",
  ruleConfig: "",
  category: "",
  icon: "",
  version: 1,
  isActive: true,
  sourceService: "RogueLearn",
  iconFile: null,
};

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<AchievementDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementDto | null>(null);
  const [formData, setFormData] = useState<AchievementFormData>(defaultFormData);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const response = await achievementsApi.getAll();
      if (response.isSuccess && response.data) {
        const data = response.data.achievements;
        setAchievements(Array.isArray(data) ? data : []);
      } else {
        toast.error("Failed to load achievements");
      }
    } catch (e: unknown) {
      const err = e as { normalized?: { message?: string }; message?: string };
      toast.error(err?.normalized?.message || err?.message || "Error loading achievements");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.key.trim() || !formData.name.trim() || !formData.sourceService.trim()) {
      toast.error("Key, Name, and Source Service are required");
      return;
    }

    setSubmitting(true);
    try {
      if (formData.iconFile) {
        await achievementsApi.createWithIconUpload({
          key: formData.key,
          name: formData.name,
          description: formData.description,
          ruleType: formData.ruleType || undefined,
          ruleConfig: formData.ruleConfig || undefined,
          category: formData.category || undefined,
          icon: formData.icon || undefined,
          version: formData.version,
          isActive: formData.isActive,
          sourceService: formData.sourceService,
          iconFile: formData.iconFile,
          iconFileName: formData.iconFile.name,
          contentType: formData.iconFile.type,
        });
      } else {
        const payload: CreateAchievementCommand = {
          key: formData.key,
          name: formData.name,
          description: formData.description,
          ruleType: formData.ruleType || undefined,
          ruleConfig: formData.ruleConfig || undefined,
          category: formData.category || undefined,
          icon: formData.icon || undefined,
          version: formData.version,
          isActive: formData.isActive,
          sourceService: formData.sourceService,
        };
        await achievementsApi.create(payload);
      }
      toast.success("Achievement created successfully");
      setIsCreateModalOpen(false);
      setFormData(defaultFormData);
      fetchAchievements();
    } catch (e: unknown) {
      const err = e as { normalized?: { message?: string }; message?: string };
      toast.error(err?.normalized?.message || err?.message || "Error creating achievement");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedAchievement) return;
    if (!formData.key.trim() || !formData.name.trim() || !formData.sourceService.trim()) {
      toast.error("Key, Name, and Source Service are required");
      return;
    }

    setSubmitting(true);
    try {
      if (formData.iconFile) {
        await achievementsApi.updateWithIconUpload(selectedAchievement.id, {
          key: formData.key,
          name: formData.name,
          description: formData.description,
          ruleType: formData.ruleType || undefined,
          ruleConfig: formData.ruleConfig || undefined,
          category: formData.category || undefined,
          icon: formData.icon || undefined,
          version: formData.version,
          isActive: formData.isActive,
          sourceService: formData.sourceService,
          iconFile: formData.iconFile,
          iconFileName: formData.iconFile.name,
          contentType: formData.iconFile.type,
        });
      } else {
        const payload: Omit<UpdateAchievementCommand, "id"> = {
          key: formData.key,
          name: formData.name,
          description: formData.description,
          ruleType: formData.ruleType || undefined,
          ruleConfig: formData.ruleConfig || undefined,
          category: formData.category || undefined,
          icon: formData.icon || undefined,
          version: formData.version,
          isActive: formData.isActive,
          sourceService: formData.sourceService,
        };
        await achievementsApi.update(selectedAchievement.id, payload);
      }
      toast.success("Achievement updated successfully");
      setIsEditModalOpen(false);
      setSelectedAchievement(null);
      setFormData(defaultFormData);
      fetchAchievements();
    } catch (e: unknown) {
      const err = e as { normalized?: { message?: string }; message?: string };
      toast.error(err?.normalized?.message || err?.message || "Error updating achievement");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAchievement) return;

    setSubmitting(true);
    try {
      await achievementsApi.remove(selectedAchievement.id);
      toast.success("Achievement deleted successfully");
      setIsDeleteModalOpen(false);
      setSelectedAchievement(null);
      fetchAchievements();
    } catch (e: unknown) {
      const err = e as { normalized?: { message?: string }; message?: string };
      toast.error(err?.normalized?.message || err?.message || "Error deleting achievement");
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setFormData(defaultFormData);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (achievement: AchievementDto) => {
    setSelectedAchievement(achievement);
    setFormData({
      key: achievement.key,
      name: achievement.name,
      description: achievement.description,
      ruleType: achievement.ruleType || "",
      ruleConfig: achievement.ruleConfig || "",
      category: achievement.category || "",
      icon: achievement.icon || "",
      version: achievement.version,
      isActive: achievement.isActive,
      sourceService: achievement.sourceService,
      iconFile: null,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (achievement: AchievementDto) => {
    setSelectedAchievement(achievement);
    setIsDeleteModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFormData({ ...formData, iconFile: file || null });
  };

  const filteredAchievements = achievements.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.key.toLowerCase().includes(search.toLowerCase()) ||
      a.category?.toLowerCase().includes(search.toLowerCase())
  );

  const renderForm = () => (
    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-white/70">Key *</Label>
          <Input
            placeholder="e.g., first_problem_solved"
            value={formData.key}
            onChange={(e) => setFormData({ ...formData, key: e.target.value })}
            className="bg-[#0a0506] border-[#f5c16c]/20 text-white placeholder:text-white/40"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-white/70">Name *</Label>
          <Input
            placeholder="e.g., First Victory"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="bg-[#0a0506] border-[#f5c16c]/20 text-white placeholder:text-white/40"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-white/70">Description</Label>
        <Textarea
          placeholder="Describe the achievement..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="bg-[#0a0506] border-[#f5c16c]/20 text-white placeholder:text-white/40 min-h-[80px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-white/70">Category</Label>
          <Input
            placeholder="e.g., Combat, Learning"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="bg-[#0a0506] border-[#f5c16c]/20 text-white placeholder:text-white/40"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-white/70">Source Service *</Label>
          <Input
            placeholder="e.g., RogueLearn"
            value={formData.sourceService}
            onChange={(e) => setFormData({ ...formData, sourceService: e.target.value })}
            className="bg-[#0a0506] border-[#f5c16c]/20 text-white placeholder:text-white/40"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-white/70">Rule Type</Label>
          <Input
            placeholder="e.g., count, threshold"
            value={formData.ruleType}
            onChange={(e) => setFormData({ ...formData, ruleType: e.target.value })}
            className="bg-[#0a0506] border-[#f5c16c]/20 text-white placeholder:text-white/40"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-white/70">Rule Config (JSON)</Label>
          <Input
            placeholder='e.g., {"count": 10}'
            value={formData.ruleConfig}
            onChange={(e) => setFormData({ ...formData, ruleConfig: e.target.value })}
            className="bg-[#0a0506] border-[#f5c16c]/20 text-white placeholder:text-white/40"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-white/70">Icon Name</Label>
          <Input
            placeholder="e.g., trophy, star"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            className="bg-[#0a0506] border-[#f5c16c]/20 text-white placeholder:text-white/40"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-white/70">Version</Label>
          <Input
            type="number"
            min={1}
            value={formData.version}
            onChange={(e) => setFormData({ ...formData, version: parseInt(e.target.value) || 1 })}
            className="bg-[#0a0506] border-[#f5c16c]/20 text-white"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-white/70">Icon File (optional)</Label>
        <div className="flex items-center gap-3">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="bg-[#0a0506] border-[#f5c16c]/20 text-white file:bg-[#f5c16c]/10 file:text-[#f5c16c] file:border-0 file:mr-3 file:px-3 file:py-1 file:rounded"
          />
          {formData.iconFile && (
            <span className="text-sm text-[#f5c16c]">
              <ImageIcon className="h-4 w-4 inline mr-1" />
              {formData.iconFile.name}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Switch
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
        />
        <Label className="text-white/70">Active</Label>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#f5c16c]">Achievements Management</h1>
            <p className="text-sm text-white/60">Create and manage achievements for the platform</p>
          </div>
          <Button onClick={openCreateModal} className="bg-[#7289da] hover:bg-[#7289da]/90 text-white">
            <Plus className="mr-2 h-4 w-4" /> Create Achievement
          </Button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            placeholder="Search achievements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-[#0a0506] border-[#f5c16c]/20 text-white placeholder:text-white/40"
          />
        </div>

        <Card className="bg-[#1a1410] border-[#f5c16c]/20">
          <CardHeader className="border-b border-[#f5c16c]/10">
            <CardTitle className="text-[#f5c16c]">Achievements ({filteredAchievements.length})</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#f5c16c]" />
              </div>
            ) : filteredAchievements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Trophy className="h-12 w-12 text-[#f5c16c]/40 mb-4" />
                <p className="text-white mb-2">No achievements found</p>
                <p className="text-xs text-white/50">Create your first achievement to get started</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="rounded-lg border border-[#f5c16c]/20 bg-[#0a0506] p-4 hover:border-[#f5c16c]/40 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f5c16c]/10 border border-[#f5c16c]/30">
                          {achievement.iconUrl ? (
                            <Image src={achievement.iconUrl} alt={achievement.name} width={24} height={24} className="h-6 w-6 object-contain" />
                          ) : (
                            <Trophy className="h-5 w-5 text-[#f5c16c]" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{achievement.name}</h3>
                          <p className="text-xs text-white/50">{achievement.key}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-[#f5c16c] hover:bg-[#f5c16c]/10"
                          onClick={() => openEditModal(achievement)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/10"
                          onClick={() => openDeleteModal(achievement)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-white/60 line-clamp-2 mb-3">
                      {achievement.description || "No description"}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {achievement.category && (
                          <span className="px-2 py-1 rounded bg-[#f5c16c]/10 text-[#f5c16c]">
                            {achievement.category}
                          </span>
                        )}
                        <span className="text-white/40">v{achievement.version}</span>
                      </div>
                      <span
                        className={`px-2 py-1 rounded ${
                          achievement.isActive
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {achievement.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-[#1a1410] border-[#f5c16c]/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#f5c16c]">Create New Achievement</DialogTitle>
          </DialogHeader>
          {renderForm()}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              className="border-[#f5c16c]/30 text-white hover:bg-[#f5c16c]/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={submitting}
              className="bg-[#f5c16c] hover:bg-[#f5c16c]/90 text-[#0a0506]"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-[#1a1410] border-[#f5c16c]/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#f5c16c]">Edit Achievement</DialogTitle>
          </DialogHeader>
          {renderForm()}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="border-[#f5c16c]/30 text-white hover:bg-[#f5c16c]/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              disabled={submitting}
              className="bg-[#f5c16c] hover:bg-[#f5c16c]/90 text-[#0a0506]"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-[#1a1410] border-[#f5c16c]/20">
          <DialogHeader>
            <DialogTitle className="text-[#f5c16c]">Delete Achievement</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-white/70">
              Are you sure you want to delete the achievement{" "}
              <strong className="text-white">&quot;{selectedAchievement?.name}&quot;</strong>? This action cannot be
              undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              className="border-[#f5c16c]/30 text-white hover:bg-[#f5c16c]/10"
            >
              Cancel
            </Button>
            <Button onClick={handleDelete} disabled={submitting} className="bg-red-500 hover:bg-red-600 text-white">
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

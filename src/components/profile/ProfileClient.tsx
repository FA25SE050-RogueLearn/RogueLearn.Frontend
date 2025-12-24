// src/components/profile/ProfileClient.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    ArrowLeft,
    LogOut,
    Mail,
    Calendar,
    Flame,
    Sparkles,
    Save,
    GraduationCap,
    Map,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { updateMyProfile, getMyContext } from "@/api/usersApi";
import onboardingApi from "@/api/onboardingApi";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";
import { AcademicRoute, CareerClass } from "@/types/onboarding";

interface UserProfile {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    bio: string;
    level: number;
    experiencePoints: number;
    totalQuests: number;
    achievements: number;
    roles: string[];
    createdAt: string;
    skills: string[];
    routeId?: string;
    classId?: string;
}

interface ProfileClientProps {
    initialProfile: UserProfile | null;
}

export function ProfileClient({ initialProfile }: ProfileClientProps) {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(initialProfile);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // Form states
    const [firstName, setFirstName] = useState(profile?.firstName || "");
    const [lastName, setLastName] = useState(profile?.lastName || "");
    const [bio, setBio] = useState(profile?.bio || "");
    
    // Academic states
    const [routes, setRoutes] = useState<AcademicRoute[]>([]);
    const [classes, setClasses] = useState<CareerClass[]>([]);
    const [selectedRoute, setSelectedRoute] = useState(profile?.routeId || "");
    const [selectedClass, setSelectedClass] = useState(profile?.classId || "");

    // Fetch options for dropdowns
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [routesRes, classesRes] = await Promise.all([
                    onboardingApi.getRoutes(),
                    onboardingApi.getClasses()
                ]);

                if (routesRes.isSuccess && routesRes.data) {
                    setRoutes(routesRes.data);
                }
                if (classesRes.isSuccess && classesRes.data) {
                    setClasses(classesRes.data);
                }
            } catch (error) {
                console.error("Failed to fetch academic options", error);
            }
        };
        fetchOptions();
    }, []);

    const handleSaveProfile = async () => {
        setIsSaving(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            // Update profile including academic path (routeId = program, classId = specialization)
            await updateMyProfile({
                firstName,
                lastName,
                bio,
                routeId: selectedRoute || undefined,
                classId: selectedClass || undefined,
            });

            // Fetch updated profile after save
            const response = await getMyContext();
            if (response.isSuccess && response.data) {
                setProfile(response.data as unknown as UserProfile);
            }

            setIsEditing(false);
            setSuccessMessage("Profile updated successfully!");

            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error: any) {
            setErrorMessage(
                error.message || "Failed to save profile. Please try again."
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = async () => {
        if (confirm("Are you sure you want to sign out?")) {
            try {
                const supabase = createClient();
                await supabase.auth.signOut();
                router.push("/login");
            } catch (error) {
                setErrorMessage("Logout failed");
            }
        }
    };

    const handleResetForm = () => {
        if (profile) {
            setFirstName(profile.firstName);
            setLastName(profile.lastName);
            setBio(profile.bio);
            setSelectedRoute(profile.routeId || "");
            setSelectedClass(profile.classId || "");
            setIsEditing(false);
        }
    };

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <div className="text-center">
                    <p className="text-xl text-white/70">Failed to load profile</p>
                    <Link href="/dashboard">
                        <Button className="mt-4">Back to Dashboard</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const avatarInitials = `${profile.firstName?.[0] || profile.username?.[0] || "?"}${profile.lastName?.[0] || ""}`.toUpperCase();
    const memberSince = new Date(profile.createdAt).toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric",
        }
    );

    return (
        <div className="relative min-h-screen pb-20">
            {/* Alerts */}
            <div className="fixed top-20 left-4 right-4 z-50 max-w-md">
                {successMessage && (
                    <div className="p-4 mb-4 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 animate-in">
                        {successMessage}
                    </div>
                )}
                {errorMessage && (
                    <div className="p-4 mb-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 animate-in">
                        {errorMessage}
                    </div>
                )}
            </div>

            {/* Header */}
            <div className="mb-8">
                <Link href="/dashboard">
                    <Button variant="ghost" className="text-white/60 hover:text-[#f5c16c]">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </Link>
                <h1 className="text-4xl md:text-5xl font-bold mt-4">
                    My Profile
                </h1>
                <p className="text-white/50 mt-2">Manage your RogueLearn scholar profile</p>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <Card className="relative overflow-hidden border-[#f5c16c]/20 bg-gradient-to-br from-[#2d1810] via-[#1a0a08] to-[#0a0506]">
                        <CardContent className="p-6">
                            {/* Avatar */}
                            <div className="flex flex-col items-center gap-4 text-center mb-6">
                                <Avatar className="w-24 h-24 border-4 border-[#f5c16c] shadow-lg shadow-[#f5c16c]/30">
                                    <AvatarFallback className="bg-gradient-to-br from-[#d23187] to-[#f5c16c] text-white text-lg font-bold">
                                        {avatarInitials}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        {profile.firstName} {profile.lastName}
                                    </h2>
                                    <p className="text-sm text-white/50 mt-1">{profile.email}</p>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-[#f5c16c]/20 mb-6" />

                            {/* Roles */}
                            <div className="mb-6">
                                <h3 className="text-xs uppercase tracking-widest font-semibold text-[#f5c16c] mb-3">
                                    Roles
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {profile.roles.map((role) => (
                                        <span
                                            key={role}
                                            className="px-3 py-1 text-xs rounded-full bg-[#d23187]/20 border border-[#d23187]/60 text-[#f5c16c] font-medium"
                                        >
                                            {role}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-lg bg-[#f5c16c]/10 border border-[#f5c16c]/40 text-center">
                                    <div className="text-xl font-bold text-[#f5c16c]">
                                        {profile.level ?? 0}
                                    </div>
                                    <div className="text-xs text-white/50 mt-1 uppercase tracking-wider">
                                        Level
                                    </div>
                                </div>
                                <div className="p-3 rounded-lg bg-[#f5c16c]/10 border border-[#f5c16c]/40 text-center">
                                    <div className="text-xl font-bold text-[#f5c16c]">
                                        {(profile.experiencePoints ?? 0).toLocaleString()}
                                    </div>
                                    <div className="text-xs text-white/50 mt-1 uppercase tracking-wider">
                                        XP
                                    </div>
                                </div>
                                <div className="p-3 rounded-lg bg-[#f5c16c]/10 border border-[#f5c16c]/40 text-center">
                                    <div className="text-xl font-bold text-[#f5c16c]">
                                        {profile.totalQuests ?? 0}
                                    </div>
                                    <div className="text-xs text-white/50 mt-1 uppercase tracking-wider">
                                        Quests
                                    </div>
                                </div>
                                <div className="p-3 rounded-lg bg-[#f5c16c]/10 border border-[#f5c16c]/40 text-center">
                                    <div className="text-xl font-bold text-[#f5c16c]">
                                        {profile.achievements ?? 0}
                                    </div>
                                    <div className="text-xs text-white/50 mt-1 uppercase tracking-wider">
                                        Achievements
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Edit Profile Card */}
                    <Card className="relative overflow-hidden border-[#f5c16c]/20 bg-gradient-to-br from-[#2d1810] via-[#1a0a08] to-[#0a0506]">
                        <CardHeader>
                            <CardTitle className="text-[#f5c16c] uppercase tracking-widest">
                                {isEditing ? "Edit Profile" : "Profile Information"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* First Name & Last Name */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs uppercase tracking-widest font-semibold text-[#f5c16c] mb-2">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full px-3 py-2 rounded-lg bg-[#1a0a08] border border-[#f5c16c]/20 text-white placeholder-white/30 disabled:opacity-50 focus:outline-none focus:border-[#f5c16c] focus:shadow-lg focus:shadow-[#f5c16c]/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-widest font-semibold text-[#f5c16c] mb-2">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full px-3 py-2 rounded-lg bg-[#1a0a08] border border-[#f5c16c]/20 text-white placeholder-white/30 disabled:opacity-50 focus:outline-none focus:border-[#f5c16c] focus:shadow-lg focus:shadow-[#f5c16c]/20"
                                    />
                                </div>
                            </div>

                             {/* Academic Settings - Only editable */}
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                <div>
                                    <label className="block text-xs uppercase tracking-widest font-semibold text-[#f5c16c] mb-2 flex items-center gap-2">
                                        <Map className="w-3 h-3" /> Academic Route
                                    </label>
                                    <Select 
                                        disabled={!isEditing} 
                                        value={selectedRoute} 
                                        onValueChange={setSelectedRoute}
                                    >
                                        <SelectTrigger className="w-full bg-[#1a0a08] border border-[#f5c16c]/20 text-white h-[42px]">
                                            <SelectValue placeholder="Select Route..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1a0a08] border-[#f5c16c]/20 text-white">
                                            {routes.map((r) => (
                                                <SelectItem key={r.id} value={r.id}>
                                                    {r.programCode} - {r.programName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-widest font-semibold text-[#f5c16c] mb-2 flex items-center gap-2">
                                        <GraduationCap className="w-3 h-3" /> Career Class
                                    </label>
                                    <Select 
                                        disabled={!isEditing} 
                                        value={selectedClass} 
                                        onValueChange={setSelectedClass}
                                    >
                                        <SelectTrigger className="w-full bg-[#1a0a08] border border-[#f5c16c]/20 text-white h-[42px]">
                                            <SelectValue placeholder="Select Class..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1a0a08] border-[#f5c16c]/20 text-white">
                                            {classes.map((c) => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Bio */}
                            <div>
                                <label className="block text-xs uppercase tracking-widest font-semibold text-[#f5c16c] mb-2">
                                    Bio
                                </label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    disabled={!isEditing}
                                    placeholder="Tell us about yourself..."
                                    className="w-full px-3 py-2 rounded-lg bg-[#1a0a08] border border-[#f5c16c]/20 text-white placeholder-white/30 disabled:opacity-50 focus:outline-none focus:border-[#f5c16c] focus:shadow-lg focus:shadow-[#f5c16c]/20 resize-none min-h-24"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4">
                                {!isEditing ? (
                                    <Button
                                        onClick={() => setIsEditing(true)}
                                        className="flex-1 bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black font-semibold hover:from-[#d4a855] hover:to-[#f5c16c]"
                                    >
                                        Edit Profile
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            onClick={handleSaveProfile}
                                            disabled={isSaving}
                                            className="flex-1 bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black font-semibold hover:from-[#d4a855] hover:to-[#f5c16c] disabled:opacity-50"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Save Changes
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            onClick={handleResetForm}
                                            variant="outline"
                                            className="flex-1 border-[#f5c16c]/40 bg-[#f5c16c]/10 text-[#f5c16c] hover:bg-[#f5c16c]/20"
                                        >
                                            ↻ Cancel
                                        </Button>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Account Information Card */}
                    <Card className="relative overflow-hidden border-[#f5c16c]/20 bg-gradient-to-br from-[#2d1810] via-[#1a0a08] to-[#0a0506]">
                        <CardHeader>
                            <CardTitle className="text-[#f5c16c] uppercase tracking-widest">
                                Account Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-start gap-3">
                                    <Mail className="w-5 h-5 text-[#f5c16c] flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="text-xs uppercase tracking-widest text-white/50 font-semibold">
                                            Email Address
                                        </p>
                                        <p className="text-white mt-1">{profile.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Calendar className="w-5 h-5 text-[#f5c16c] flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="text-xs uppercase tracking-widest text-white/50 font-semibold">
                                            Member Since
                                        </p>
                                        <p className="text-white mt-1">{memberSince}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Skills Card */}
                    {profile.skills && profile.skills.length > 0 && (
                        <Card className="relative overflow-hidden border-[#f5c16c]/20 bg-gradient-to-br from-[#2d1810] via-[#1a0a08] to-[#0a0506]">
                            <CardHeader>
                                <CardTitle className="text-[#f5c16c] uppercase tracking-widest">
                                    Top Skills
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.map((skill) => (
                                        <span
                                            key={skill}
                                            className="px-3 py-1.5 text-xs rounded-full bg-[#f5c16c]/10 border border-[#f5c16c]/40 text-[#f5c16c] font-medium hover:bg-[#f5c16c]/20 transition-colors"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Danger Zone Card */}
                    <Card className="relative overflow-hidden border-red-500/30 bg-gradient-to-br from-red-950/20 via-[#1a0a08] to-[#0a0506]">
                        <CardHeader>
                            <CardTitle className="text-red-400 uppercase tracking-widest">
                                Danger Zone
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-white/60 text-sm mb-4">
                                Irreversible actions. Proceed with caution.
                            </p>
                            <Button
                                onClick={handleLogout}
                                className="w-full bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import UserProfileModal from "@/components/profile/UserProfileModal";

export default function ProfileModalLauncher({ label = "Open Profile", defaultTab }: { label?: string, defaultTab?: "profile" | "settings" | "verification" }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" className="border-amber-700/50 text-amber-300" onClick={() => setOpen(true)}>
        {label}
      </Button>
      <UserProfileModal open={open} onOpenChange={setOpen} defaultTab={defaultTab} />
    </>
  );
}
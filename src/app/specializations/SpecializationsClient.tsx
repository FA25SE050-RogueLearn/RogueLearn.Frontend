"use client";

import { useEffect, useState } from "react";
import classesApi from "@/api/classesApi";
import { ClassEntity } from "@/types/classes";

export default function SpecializationsClient() {
  const [classes, setClasses] = useState<ClassEntity[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    classesApi
      .getAll()
      .then((res) => {
        if (!mounted) return;
        setClasses(res.data ?? []);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message ?? "Failed to load classes");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <div>Loading specializations...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  if (!classes || classes.length === 0) {
    return <div>No specializations available.</div>;
  }

  return (
    <div>
      <h1>Choose Your Specialization</h1>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((c) => (
          <li key={c.id} className="border rounded p-4">
            <div className="font-semibold">{c.name}</div>
            <div className="text-sm text-gray-600">Difficulty: {c.difficultyLevel}</div>
            {/* Add action button to select specialization when backend endpoint ready */}
          </li>
        ))}
      </ul>
    </div>
  );
}
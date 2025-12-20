// roguelearn-web/src/app/admin/layout.tsx
"use client";

import { SubjectImportProvider } from "@/contexts/SubjectImportContext";

export default function AdminRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SubjectImportProvider>
            {children}
        </SubjectImportProvider>
    );
}
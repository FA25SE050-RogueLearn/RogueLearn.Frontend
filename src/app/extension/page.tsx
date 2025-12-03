// roguelearn-web/src/app/extension/page.tsx
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Chrome, Globe, AlertCircle, CheckCircle2, FolderOpen, Settings, ToggleLeft, Upload, Sparkles } from "lucide-react";
import Link from "next/link";

const installSteps = [
  {
    title: "Download the Extension",
    description: "Click the download button above to get the extension ZIP file for your browser.",
    icon: Download,
  },
  {
    title: "Extract the ZIP File",
    description: "Right-click the downloaded file and select \"Extract All\" to unzip it to a folder you can easily find.",
    icon: FolderOpen,
  },
  {
    title: "Open Extensions Page",
    description: "Open Chrome and go to chrome://extensions in your address bar, or click Menu → More Tools → Extensions.",
    icon: Settings,
  },
  {
    title: "Enable Developer Mode",
    description: "Toggle the \"Developer mode\" switch in the top-right corner of the page.",
    icon: ToggleLeft,
  },
  {
    title: "Load the Extension",
    description: "Click \"Load unpacked\" and select the extracted folder containing the extension files.",
    icon: Upload,
  },
  {
    title: "Done!",
    description: "The RogueLearn extension is now installed. You'll see its icon in your browser toolbar.",
    icon: Sparkles,
  },
];

export default async function ExtensionPage() {
  // URLs for extension downloads
  const chromeExtensionUrl = "/extensions/wxt-react-starter-0.0.0-chrome.zip";
  const firefoxExtensionUrl = "/extensions/wxt-react-starter-0.0.0-firefox.zip";

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-8 pb-12">
        {/* Page Header */}
        <section className="relative overflow-hidden rounded-[24px] border border-[#f5c16c]/20 bg-gradient-to-r from-[#2a140f]/95 via-[#1a0b08]/95 to-[#2a140f]/95 p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(210,49,135,0.15),transparent_50%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(245,193,108,0.1),transparent_50%)]" />
          
          <div className="relative z-10 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-[#f5c16c]/30 bg-gradient-to-br from-[#d23187]/30 to-[#f5c16c]/20 shadow-lg shadow-[#d23187]/20">
              <Download className="h-10 w-10 text-[#f5c16c]" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              RogueLearn Extension
            </h1>
            <p className="mt-2 text-[#f5c16c]/70">
              Enhance your learning experience with powerful browser tools
            </p>
          </div>
        </section>

        {/* Download Buttons */}
        <section className="grid gap-4 sm:grid-cols-2">
          {/* Chrome Download */}
          <Card className="group relative overflow-hidden border-[#f5c16c]/20 bg-gradient-to-br from-[#1f0d09]/95 to-[#2a1510]/95 transition-all duration-300 hover:border-[#f5c16c]/40 hover:shadow-[0_0_30px_rgba(210,49,135,0.15)]">
            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#4285F4]/10 blur-2xl transition-opacity duration-300 group-hover:bg-[#4285F4]/20" />
            <CardContent className="relative p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#4285F4]/30 bg-[#4285F4]/10">
                  <Chrome className="h-7 w-7 text-[#4285F4]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">Chrome / Edge</h3>
                  <p className="text-sm text-[#f5c16c]/60">Chromium-based browsers</p>
                </div>
              </div>
              <Link href={chromeExtensionUrl} download>
                <Button className="mt-4 w-full bg-gradient-to-r from-[#d23187] via-[#f061a6] to-[#f5c16c] text-sm font-semibold text-[#2b130f] hover:opacity-90">
                  <Download className="mr-2 h-4 w-4" />
                  Download for Chrome
                </Button>
              </Link>
              <div className="mt-3 flex items-center justify-center gap-1 text-xs text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                <span>Supported</span>
              </div>
            </CardContent>
          </Card>

          {/* Firefox Download */}
          <Card className="group relative overflow-hidden border-[#f5c16c]/20 bg-gradient-to-br from-[#1f0d09]/95 to-[#2a1510]/95 transition-all duration-300 hover:border-[#f5c16c]/40 hover:shadow-[0_0_30px_rgba(210,49,135,0.15)]">
            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#FF7139]/10 blur-2xl transition-opacity duration-300 group-hover:bg-[#FF7139]/20" />
            <CardContent className="relative p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#FF7139]/30 bg-[#FF7139]/10">
                  <Globe className="h-7 w-7 text-[#FF7139]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">Firefox</h3>
                  <p className="text-sm text-[#f5c16c]/60">Mozilla Firefox browser</p>
                </div>
              </div>
              <Link href={firefoxExtensionUrl} download>
                <Button className="mt-4 w-full bg-gradient-to-r from-[#d23187] via-[#f061a6] to-[#f5c16c] text-sm font-semibold text-[#2b130f] hover:opacity-90">
                  <Download className="mr-2 h-4 w-4" />
                  Download for Firefox
                </Button>
              </Link>
              <div className="mt-3 flex items-center justify-center gap-1 text-xs text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                <span>Supported</span>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Installation Steps */}
        <Card className="relative overflow-hidden border-[#f5c16c]/20 bg-gradient-to-br from-[#1f0d09]/95 to-[#2a1510]/95">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,193,108,0.05),transparent_50%)]" />
          <CardHeader className="relative border-b border-[#f5c16c]/10">
            <CardTitle className="text-xl text-white">Installation Instructions</CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-6 pt-6">
            {installSteps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-[#f5c16c]/30 bg-gradient-to-br from-[#d23187]/30 to-[#f5c16c]/20 text-sm font-bold text-white shadow-lg">
                  {index + 1}
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-semibold text-white">{step.title}</h3>
                  <p className="mt-1 text-sm text-[#f5c16c]/70">{step.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Warning Note */}
        <Card className="relative overflow-hidden border-amber-500/30 bg-gradient-to-r from-amber-950/30 to-amber-900/20">
          <CardContent className="flex items-start gap-4 p-5">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10">
              <AlertCircle className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h4 className="font-semibold text-amber-200">Developer Mode Notice</h4>
              <p className="mt-1 text-sm text-amber-400/80">
                Since this extension is installed in developer mode, your browser may show a warning on startup. 
                This is normal for extensions not from the official store. Click &quot;Cancel&quot; or dismiss the warning to continue using the extension.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

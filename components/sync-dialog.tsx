"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Copy,
  Download,
  Upload,
  Share2,
  Check,
  AlertCircle,
} from "lucide-react";
import type { SoullinkData } from "@/hooks/use-soullink-data";

interface SyncDialogProps {
  data: SoullinkData;
  onImportData: (data: SoullinkData) => void;
}

export function SyncDialog({ data, onImportData }: SyncDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState("");

  const exportData = JSON.stringify(data, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([exportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pokemon-soullink-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    try {
      const parsedData = JSON.parse(importText);

      // Basic validation
      if (!parsedData.player1 || !parsedData.player2) {
        throw new Error("Invalid data format: Missing player data");
      }

      onImportData(parsedData);
      setImportText("");
      setImportError("");
      setIsOpen(false);
    } catch (error) {
      setImportError(
        error instanceof Error ? error.message : "Invalid JSON format"
      );
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setImportText(content);
      };
      reader.readAsText(file);
    }
  };

  const generateShareableLink = () => {
    const compressed = btoa(JSON.stringify(data));
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?data=${compressed}`;
  };

  const handleShare = async () => {
    const shareUrl = generateShareableLink();

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Pokemon Soullink Progress",
          text: "Check out our Pokemon Soullink progress!",
          url: shareUrl,
        });
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 bg-transparent"
        >
          <Share2 className="h-4 w-4" />
          Sync & Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Sync & Share Progress
          </DialogTitle>
          <DialogDescription>
            Export your progress to share with friends or import data from your
            Soullink partner
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="export" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
              <TabsTrigger value="export">Export</TabsTrigger>
              <TabsTrigger value="import">Import</TabsTrigger>
              <TabsTrigger value="share">Share</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              <TabsContent value="export" className="space-y-3 mt-3">
                <div className="space-y-3">
                  <Label>Export Your Progress</Label>
                  <p className="text-sm text-muted-foreground">
                    Copy this data and send it to your Soullink partner, or save
                    it as a backup
                  </p>

                  <Textarea
                    value={exportData}
                    readOnly
                    className="h-32 font-mono text-xs resize-none"
                    placeholder="Your progress data will appear here..."
                  />

                  <div className="flex gap-2">
                    <Button onClick={handleCopy} className="flex-1" size="sm">
                      {copied ? (
                        <Check className="h-4 w-4 mr-2" />
                      ) : (
                        <Copy className="h-4 w-4 mr-2" />
                      )}
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      className="flex-1 bg-transparent"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="import" className="space-y-3 mt-3">
                <div className="space-y-3">
                  <Label>Import Partner's Progress</Label>
                  <p className="text-sm text-muted-foreground">
                    Paste your partner's exported data or upload a file to sync
                    your progress
                  </p>

                  <Textarea
                    value={importText}
                    onChange={(e) => {
                      setImportText(e.target.value);
                      setImportError("");
                    }}
                    className="h-32 font-mono text-xs resize-none"
                    placeholder="Paste your partner's exported data here..."
                  />

                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="flex-1"
                      size="sm"
                    />
                    <Button
                      onClick={handleImport}
                      disabled={!importText.trim()}
                      size="sm"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Import
                    </Button>
                  </div>

                  {importError && (
                    <Alert className="border-destructive/50 bg-destructive/5">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <AlertDescription className="text-destructive text-sm">
                        {importError}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="share" className="space-y-3 mt-3">
                <div className="space-y-3">
                  <Label>Share Progress Link</Label>
                  <p className="text-sm text-muted-foreground">
                    Generate a shareable link that contains your current
                    progress
                  </p>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      The link contains your complete progress data. Only share
                      with trusted friends.
                    </AlertDescription>
                  </Alert>

                  <Button onClick={handleShare} className="w-full" size="sm">
                    {copied ? (
                      <Check className="h-4 w-4 mr-2" />
                    ) : (
                      <Share2 className="h-4 w-4 mr-2" />
                    )}
                    {copied ? "Link Copied!" : "Generate & Share Link"}
                  </Button>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

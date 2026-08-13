"use client";

import React, { useState } from "react";
import { ObjectItem } from "@/types";
import { formatDate } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Calendar, Trash2, ExternalLink, Loader2, Image as ImageIcon, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface ObjectDetailDialogProps {
  object: ObjectItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: string) => Promise<void>;
}

export function ObjectDetailDialog({
  object,
  open,
  onOpenChange,
  onDelete,
}: ObjectDetailDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!object) return null;

  const handleDelete = async () => {
    if (window.confirm(`Voulez-vous vraiment supprimer définitivement "${object.title}" ?`)) {
      try {
        setIsDeleting(true);
        await onDelete(object.id);
        toast.success("Objet supprimé avec succès");
        onOpenChange(false);
      } catch (error: any) {
        toast.error(error.message || "Erreur lors de la suppression");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const copyUrl = () => {
    if (object.imageUrl) {
      navigator.clipboard.writeText(object.imageUrl);
      setCopied(true);
      toast.success("URL de l'image copiée dans le presse-papier");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-2 mb-1">
            <Badge variant="outline" className="text-[11px] font-mono">
              ID: {object.id.slice(-8)}
            </Badge>
            <span className="text-xs text-muted-foreground">•</span>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(object.createdAt)}</span>
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
            {object.title}
          </DialogTitle>
        </DialogHeader>

        {/* Large Image Preview */}
        <div className="relative mt-2 overflow-hidden rounded-xl border border-border bg-muted/40 aspect-video max-h-80 w-full flex items-center justify-center">
          {object.imageUrl ? (
            <img
              src={object.imageUrl}
              alt={object.title}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center text-muted-foreground">
              <ImageIcon className="h-10 w-10 opacity-40 mb-1" />
              <span className="text-xs">Pas d&apos;image disponible</span>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="mt-4 space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Description
          </h4>
          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap rounded-lg bg-muted/30 p-4 border border-border/50">
            {object.description || "Aucune description fournie."}
          </p>
        </div>

        {/* S3 URL Reference */}
        {object.imageUrl && (
          <div className="mt-2 space-y-1.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Lien Stockage S3
            </h4>
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-2.5 text-xs text-muted-foreground">
              <span className="truncate max-w-[400px] font-mono text-[11px]">
                {object.imageUrl}
              </span>
              <div className="flex items-center space-x-1 shrink-0 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyUrl}
                  className="h-7 px-2 text-xs"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
                <a
                  href={object.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-7 items-center justify-center rounded-md px-2 text-xs font-medium hover:bg-muted text-foreground"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Actions Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center"
          >
            {isDeleting ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            )}
            Supprimer cet objet
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

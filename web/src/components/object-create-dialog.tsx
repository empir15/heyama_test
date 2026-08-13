"use client";

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { CreateObjectPayload } from "@/types";
import { UploadCloud, Image as ImageIcon, X, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ObjectCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateObjectPayload) => Promise<void>;
}

export function ObjectCreateDialog({
  open,
  onOpenChange,
  onSubmit,
}: ObjectCreateDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setErrorMessage(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Veuillez sélectionner un fichier image valide (JPEG, PNG, WebP, etc.)");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage("L'image ne doit pas dépasser 10 Mo");
        return;
      }
      setErrorMessage(null);
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage("Veuillez saisir un titre");
      return;
    }

    if (!description.trim()) {
      setErrorMessage("Veuillez saisir une description");
      return;
    }

    if (!selectedFile) {
      setErrorMessage("Veuillez sélectionner une image");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        file: selectedFile,
      });

      toast.success("Objet créé avec succès !");
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      setErrorMessage(error.message || "Une erreur est survenue lors de la création");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isSubmitting) {
          if (!nextOpen) resetForm();
          onOpenChange(nextOpen);
        }
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">
            Créer un nouvel Objet
          </DialogTitle>
          <DialogDescription>
            Remplissez les détails ci-dessous et téléversez une image pour ajouter l&apos;objet à la collection.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center space-x-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Titre de l&apos;objet <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="ex: Montre connectée Série 7"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Description <span className="text-destructive">*</span>
            </label>
            <Textarea
              placeholder="Décrivez l'objet en détail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Image de l&apos;objet <span className="text-destructive">*</span>
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {!previewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/80 bg-muted/30 p-6 text-center hover:border-violet-500/50 hover:bg-violet-500/5 transition-colors cursor-pointer"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/10 text-violet-600 mb-2">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <p className="text-xs font-medium text-foreground">
                  Cliquez pour choisir une image
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  PNG, JPG, WebP ou GIF jusqu&apos;à 10 Mo
                </p>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-xl border border-border bg-muted/20">
                <img
                  src={previewUrl}
                  alt="Aperçu"
                  className="h-44 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  disabled={isSubmitting}
                  className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white hover:bg-black transition-colors"
                  title="Supprimer l'image"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="p-2 text-center text-xs text-muted-foreground bg-background/80 backdrop-blur-xs">
                  {selectedFile?.name} ({(selectedFile ? selectedFile.size / 1024 / 1024 : 0).toFixed(2)} Mo)
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md shadow-indigo-500/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Téléversement en cours...
                </>
              ) : (
                "Créer l'Objet"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

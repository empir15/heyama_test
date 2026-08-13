"use client";

import React, { useState } from "react";
import { ObjectItem } from "@/types";
import { formatDate } from "@/lib/utils";
import { Calendar, Trash2, Eye, Loader2, ImageIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface ObjectCardProps {
  object: ObjectItem;
  onViewDetails: (object: ObjectItem) => void;
  onDelete: (id: string) => Promise<void>;
}

export function ObjectCard({
  object,
  onViewDetails,
  onDelete,
}: ObjectCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${object.title}" ?`)) {
      try {
        setIsDeleting(true);
        await onDelete(object.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div
      onClick={() => onViewDetails(object)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card text-card-foreground shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/5 cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted/50">
        {!imageError && object.imageUrl ? (
          <img
            src={object.imageUrl}
            alt={object.title}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-muted/80 to-muted text-muted-foreground">
            <ImageIcon className="h-10 w-10 opacity-40 mb-1" />
            <span className="text-xs font-medium">Image non disponible</span>
          </div>
        )}

        {/* Hover overlay hint */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-3">
          <span className="text-xs font-medium text-white flex items-center">
            <Eye className="mr-1.5 h-3.5 w-3.5" /> Cliquer pour agrandir
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-base leading-snug tracking-tight text-foreground line-clamp-1 group-hover:text-violet-600 transition-colors">
            {object.title}
          </h3>
        </div>

        <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed flex-1">
          {object.description || "Aucune description fournie."}
        </p>

        {/* Footer info & actions */}
        <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-1.5 text-[11px]">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
            <span>{formatDate(object.createdAt)}</span>
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(object);
              }}
              title="Détails"
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              disabled={isDeleting}
              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={handleDelete}
              title="Supprimer"
            >
              {isDeleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

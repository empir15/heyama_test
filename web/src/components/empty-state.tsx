"use client";

import React from "react";
import { PackageOpen, Plus } from "lucide-react";
import { Button } from "./ui/button";

interface EmptyStateProps {
  onOpenCreate: () => void;
}

export function EmptyState({ onOpenCreate }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 bg-card/40 p-12 text-center shadow-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 mb-4 shadow-sm">
        <PackageOpen className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">Aucun objet pour le moment</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        Votre collection est vide. Créez votre premier objet avec une image, un titre et une description pour le voir apparaître instantanément.
      </p>
      <Button
        onClick={onOpenCreate}
        className="mt-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md shadow-indigo-500/20"
      >
        <Plus className="mr-2 h-4 w-4" />
        Créer mon premier objet
      </Button>
    </div>
  );
}

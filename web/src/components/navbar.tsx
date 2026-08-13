"use client";

import React from "react";
import { Plus, Radio, Sparkles, Layers } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface NavbarProps {
  onOpenCreate: () => void;
  isConnected: boolean;
  totalCount: number;
}

export function Navbar({ onOpenCreate, isConnected, totalCount }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md transition-all">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                Heyama
              </span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-medium text-muted-foreground border-border">
                Objects Manager
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Gestionnaire d&apos;objets synchronisé en temps réel
            </p>
          </div>
        </div>

        {/* Right action & connection state */}
        <div className="flex items-center space-x-3">
          {/* Socket.IO Status Badge */}
          <div className="flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-full border border-border/80 bg-muted/40">
            <span
              className={`h-2 w-2 rounded-full ${
                isConnected
                  ? "bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50"
                  : "bg-amber-500"
              }`}
            />
            <span className="text-muted-foreground text-[11px] font-medium hidden md:inline">
              {isConnected ? "Temps réel actif" : "Connexion..."}
            </span>
          </div>

          {/* New Object Button */}
          <Button
            onClick={onOpenCreate}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md shadow-indigo-500/25 transition-all active:scale-[0.98]"
            size="sm"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            <span>Ajouter un objet</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

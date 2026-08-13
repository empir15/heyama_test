"use client";

import React from "react";
import { Layers, Zap, Clock, ShieldCheck } from "lucide-react";

interface StatsBarProps {
  totalCount: number;
  lastUpdated?: Date | null;
}

export function StatsBar({ totalCount, lastUpdated }: StatsBarProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {/* Total Objects */}
      <div className="flex items-center space-x-3.5 rounded-xl border border-border/70 bg-card/60 p-4 shadow-sm backdrop-blur-sm">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Total des Objets</p>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {totalCount}
            </span>
            <span className="text-xs text-muted-foreground">
              {totalCount <= 1 ? "élément" : "éléments"}
            </span>
          </div>
        </div>
      </div>

      {/* Real-time sync */}


      {/* Storage backend */}

    </div>
  );
}

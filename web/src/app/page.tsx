"use client";

import React, { useEffect, useState, useCallback } from "react";
import { ObjectItem, CreateObjectPayload } from "@/types";
import { getObjects, createObject, deleteObject } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { Navbar } from "@/components/navbar";
import { StatsBar } from "@/components/stats-bar";
import { ObjectCard } from "@/components/object-card";
import { ObjectCreateDialog } from "@/components/object-create-dialog";
import { ObjectDetailDialog } from "@/components/object-detail-dialog";
import { EmptyState } from "@/components/empty-state";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  RefreshCw,
  Sparkles,
  Loader2,
  AlertCircle,
  Radio,
} from "lucide-react";
import { toast } from "sonner";

export default function HomePage() {
  const [objects, setObjects] = useState<ObjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedObject, setSelectedObject] = useState<ObjectItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Fetch objects from backend API
  const loadObjects = useCallback(async (showToast = false) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getObjects();
      setObjects(data);
      if (showToast) {
        toast.success("Liste des objets actualisée");
      }
    } catch (err: any) {
      console.error("Failed to load objects:", err);
      setError(
        err.message ||
          "Impossible de contacter l'API backend. Assurez-vous que le serveur NestJS est démarré sur http://localhost:3001"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load & Socket.IO listeners setup
  useEffect(() => {
    loadObjects();

    const socket = getSocket();

    const handleConnect = () => {
      setIsSocketConnected(true);
    };

    const handleDisconnect = () => {
      setIsSocketConnected(false);
    };

    const handleObjectCreated = (newObject: ObjectItem) => {
      const formatted = {
        ...newObject,
        id: newObject.id || (newObject as any)._id,
      };

      setObjects((prev) => {
        // Prevent duplicate insertion if this client already received it
        if (prev.some((item) => item.id === formatted.id)) {
          return prev;
        }
        return [formatted, ...prev];
      });

      toast.info(`Nouvel objet ajouté en temps réel : "${formatted.title}"`, {
        icon: <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />,
      });
    };

    const handleObjectDeleted = ({ id }: { id: string }) => {
      setObjects((prev) => prev.filter((item) => item.id !== id));

      // Close detail modal if the deleted object was currently open
      setSelectedObject((current) => (current?.id === id ? null : current));
      setIsDetailOpen((open) => (selectedObject?.id === id ? false : open));

      toast.info("Un objet a été supprimé en temps réel", {
        icon: <Radio className="h-4 w-4 text-amber-400" />,
      });
    };

    // Socket events
    if (socket.connected) {
      setIsSocketConnected(true);
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("object:created", handleObjectCreated);
    socket.on("object:deleted", handleObjectDeleted);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("object:created", handleObjectCreated);
      socket.off("object:deleted", handleObjectDeleted);
    };
  }, [loadObjects]);

  // Handle Object Creation
  const handleCreateObject = async (payload: CreateObjectPayload) => {
    const created = await createObject(payload);
    // Real-time socket will also receive event, but we can optimistically update
    setObjects((prev) => {
      if (prev.some((item) => item.id === created.id)) return prev;
      return [created, ...prev];
    });
  };

  // Handle Object Deletion
  const handleDeleteObject = async (id: string) => {
    await deleteObject(id);
    setObjects((prev) => prev.filter((item) => item.id !== id));
    toast.success("Objet supprimé de MongoDB et du bucket S3");
  };

  // Open detail modal
  const handleViewDetails = (object: ObjectItem) => {
    setSelectedObject(object);
    setIsDetailOpen(true);
  };

  // Filtered list based on search query
  const filteredObjects = objects.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navigation */}
      <Navbar
        onOpenCreate={() => setIsCreateOpen(true)}
        isConnected={isSocketConnected}
        totalCount={objects.length}
      />

      {/* Main Container */}
      <main className="flex-1 container mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-8">
        {/* Hero & Description */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
              Collection d&apos;Objets
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Synchronisation instantanée via Socket.IO • Stockage S3 (Non-AWS) • Base MongoDB
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadObjects(true)}
              disabled={loading}
              className="text-xs border-border"
            >
              <RefreshCw
                className={`mr-1.5 h-3.5 w-3.5 ${
                  loading ? "animate-spin" : ""
                }`}
              />
              Rafraîchir
            </Button>
          </div>
        </div>

        {/* System Stats Cards */}
        <StatsBar totalCount={objects.length} />

        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par titre ou mot-clé..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-card/60 border-border"
            />
          </div>

          {searchQuery && (
            <p className="text-xs text-muted-foreground self-start sm:self-center">
              {filteredObjects.length} résultat{filteredObjects.length > 1 ? "s" : ""} trouvé{filteredObjects.length > 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Content Area */}
        {loading && objects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-violet-500 mb-3" />
            <p className="text-sm">Chargement des objets depuis l&apos;API...</p>
          </div>
        ) : error && objects.length === 0 ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-8 text-center">
            <div className="flex justify-center mb-3 text-destructive">
              <AlertCircle className="h-10 w-10" />
            </div>
            <h3 className="text-base font-semibold text-destructive">
              Erreur de connexion avec le serveur
            </h3>
            <p className="mt-1.5 max-w-md mx-auto text-xs text-destructive/80">
              {error}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadObjects()}
              className="mt-4 border-destructive/40 text-destructive hover:bg-destructive/20"
            >
              Réessayer
            </Button>
          </div>
        ) : filteredObjects.length === 0 ? (
          searchQuery ? (
            <div className="rounded-xl border border-border/80 bg-card/40 p-12 text-center">
              <p className="text-sm text-muted-foreground">
                Aucun objet ne correspond à votre recherche &ldquo;{searchQuery}&rdquo;.
              </p>
              <Button
                variant="link"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="mt-2 text-violet-400"
              >
                Effacer la recherche
              </Button>
            </div>
          ) : (
            <EmptyState onOpenCreate={() => setIsCreateOpen(true)} />
          )
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredObjects.map((object) => (
              <ObjectCard
                key={object.id}
                object={object}
                onViewDetails={handleViewDetails}
                onDelete={handleDeleteObject}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        <div className="container mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Test Technique Heyama - Développeur Fullstack</span>
          <span className="text-[11px] text-muted-foreground/80">
            NestJS • Next.js • MongoDB • S3 Storage • Socket.IO
          </span>
        </div>
      </footer>

      {/* Create Object Modal */}
      <ObjectCreateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateObject}
      />

      {/* Detail Object Modal */}
      <ObjectDetailDialog
        object={selectedObject}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onDelete={handleDeleteObject}
      />
    </div>
  );
}

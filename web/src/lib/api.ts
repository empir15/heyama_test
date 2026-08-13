import { ObjectItem, CreateObjectPayload } from "@/types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * Fetch all objects
 */
export async function getObjects(): Promise<ObjectItem[]> {
  const response = await fetch(`${API_BASE_URL}/objects`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération des objets (${response.status})`);
  }

  const data = await response.json();
  return data.map((item: any) => ({
    ...item,
    id: item.id || item._id,
  }));
}

/**
 * Fetch a single object by ID
 */
export async function getObjectById(id: string): Promise<ObjectItem> {
  const response = await fetch(`${API_BASE_URL}/objects/${id}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Objet introuvable (${response.status})`);
  }

  const item = await response.json();
  return {
    ...item,
    id: item.id || item._id,
  };
}

/**
 * Create a new object with file upload (multipart/form-data)
 */
export async function createObject(payload: CreateObjectPayload): Promise<ObjectItem> {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("description", payload.description);
  formData.append("file", payload.file);

  const response = await fetch(`${API_BASE_URL}/objects`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message ||
        `Échec de la création de l'objet (${response.status})`
    );
  }

  const item = await response.json();
  return {
    ...item,
    id: item.id || item._id,
  };
}

/**
 * Delete an object by ID
 */
export async function deleteObject(id: string): Promise<{ success: boolean; id: string }> {
  const response = await fetch(`${API_BASE_URL}/objects/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Échec de la suppression (${response.status})`
    );
  }

  return response.json();
}

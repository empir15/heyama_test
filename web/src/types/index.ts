export interface ObjectItem {
  id: string;
  _id?: string;
  title: string;
  description: string;
  imageUrl: string;
  imageKey?: string;
  createdAt: string;
}

export interface CreateObjectPayload {
  title: string;
  description: string;
  file: File;
}

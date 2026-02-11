export interface Card {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  image: string;
  points: number;
  duration: number;
  type: "normal" | "rare" | "trap";
  ownerId: string | { _id: string; username: string } | null;
  expiresAt: string | null;
}

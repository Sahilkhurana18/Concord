// Shared types between web and server — keeps the API contract honest.

export type Permission = "view" | "edit";

export interface DocMeta {
  id: string;
  title: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Collaborator {
  docId: string;
  email: string;
  permission: Permission;
  status: "invited" | "accepted";
  invitedAt: string;
}

export interface ShareLink {
  token: string;          // signed JWT
  docId: string;
  permission: Permission;
  expiresAt: string | null; // null = never expires
  createdAt: string;
}

export interface InviteRequest {
  docId: string;
  email: string;
  permission: Permission;
  invitedByUserId: string;
}

export interface CreateShareLinkRequest {
  docId: string;
  permission: Permission;
  expiresInHours?: number; // omit for a non-expiring link
}

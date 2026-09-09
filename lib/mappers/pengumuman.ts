import { formatIndonesianDate } from "@/lib/date";
import type { Pengumuman, PengumumanAttachment } from "@/types/content";

export interface SupabasePengumumanAttachmentRow {
  id: number;
  pengumuman_id: number;
  label: string;
  asset_type: "image" | "document" | "video" | "audio" | "other";
  resource_type: "image" | "video" | "raw";
  secure_url: string;
  public_id: string;
  asset_id?: string | null;
  mime_type?: string | null;
  format?: string | null;
  bytes?: number | null;
  sort_order?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface SupabasePengumumanRow {
  id: number;
  judul: string;
  isi: string;
  lampiran?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  pengumuman_attachments?: SupabasePengumumanAttachmentRow[] | null;
}

export function mapPengumumanAttachment(row: SupabasePengumumanAttachmentRow): PengumumanAttachment {
  return {
    id: row.id,
    pengumuman_id: row.pengumuman_id,
    label: row.label,
    asset_type: row.asset_type,
    resource_type: row.resource_type,
    secure_url: row.secure_url,
    public_id: row.public_id,
    asset_id: row.asset_id ?? null,
    mime_type: row.mime_type ?? null,
    format: row.format ?? null,
    bytes: typeof row.bytes === "number" ? row.bytes : null,
    sort_order: typeof row.sort_order === "number" ? row.sort_order : 0,
    created_at: row.created_at ?? undefined,
    updated_at: row.updated_at ?? undefined,
  };
}

export function mapPengumuman(row: SupabasePengumumanRow): Pengumuman {
  const attachments: PengumumanAttachment[] = Array.isArray(row.pengumuman_attachments)
    ? row.pengumuman_attachments
        .map(mapPengumumanAttachment)
        .sort((a, b) => a.sort_order - b.sort_order)
    : [];

  return {
    id: row.id,
    judul: row.judul,
    isi: row.isi ?? "",
    lampiran: row.lampiran ?? null,
    created_at: row.created_at ?? "",
    updated_at: row.updated_at ?? undefined,
    created_at_formatted: formatIndonesianDate(row.created_at),
    attachments,
  };
}

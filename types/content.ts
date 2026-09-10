export type DatabaseId = number;
export type MediaReference = string | null;

export interface PageSetting {
  id?: DatabaseId;
  logo: MediaReference;
  judul_hero: string | null;
  deskripsi_hero: string | null;
  gambar_hero: MediaReference;
  gambar_hero1: MediaReference;
  gambar_hero2: MediaReference;
  gambar_hero3: MediaReference;
  judul_sejarah: string | null;
  deskripsi_sejarah: string | null;
  syarat_pendaftaran: string | null;
  gambar_sejarah: MediaReference;
  gambar_sejarah1: MediaReference;
  gambar_sejarah2: MediaReference;
  gambar_sejarah3: MediaReference;
  visi: string | null;
  misi: string | null;
  judul_video: string | null;
  deskripsi_video: string | null;
  url_video: string | null;
  url_video1: string | null;
  url_video2: string | null;
  gambar_struktur_organisasi: MediaReference;
  created_at?: string;
  updated_at?: string;
}

export type ArtikelStatus = "draft" | "published" | "archived";

export interface Artikel {
  id: DatabaseId;
  judul: string;
  slug: string;
  gambar: MediaReference;
  isi: string;
  excerpt: string | null;
  legacy_user_id: number | null;
  author_id: string | null;
  id_user?: number | null;
  kategori: string;
  status: ArtikelStatus;
  published_at: string | null;
  view_count: number;
  created_at?: string;
  updated_at?: string;
}

export type AttachmentAssetType = "image" | "document" | "video" | "audio" | "other";
export type AttachmentResourceType = "image" | "video" | "raw";

export interface PengumumanAttachment {
  id: DatabaseId;
  pengumuman_id: DatabaseId;
  label: string;
  asset_type: AttachmentAssetType;
  resource_type: AttachmentResourceType;
  secure_url: string;
  public_id: string;
  asset_id?: string | null;
  mime_type?: string | null;
  format?: string | null;
  bytes?: number | null;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Pengumuman {
  id: DatabaseId;
  judul: string;
  isi: string;
  lampiran: MediaReference;
  created_at: string;
  updated_at?: string;
  created_at_formatted?: string;
  attachments?: PengumumanAttachment[];
}

export interface Ekstrakurikuler {
  id: DatabaseId;
  nama: string;
  deskripsi: string | null;
  nama_pembina: string | null;
  nama_ketua: string | null;
  jadwal: string | null;
  lokasi: string | null;
  gambar: MediaReference;
  created_at?: string;
  updated_at?: string;
}

export interface GalleryImage {
  id: DatabaseId;
  gallery_id: DatabaseId;
  path: MediaReference;
  caption: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Gallery {
  id: DatabaseId;
  nama_galeri: string;
  deskripsi: string | null;
  created_at?: string;
  updated_at?: string;
  created_at_formatted?: string;
  images: GalleryImage[];
}

export type PersonType = "pelatih" | "warga" | "siswa";

export interface Person {
  id: DatabaseId;
  nama: string;
  tipe: PersonType;
  foto: MediaReference;
  sabuk?: string | null;
  jenis_kelamin?: string | null;
  alamat?: string | null;
  no_hp?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PeopleStatistics {
  siswa: number;
  pelatih: number;
  warga: number;
  ekstrakurikuler: number;
  galeri?: number;
}

export interface HomeData {
  pageSetting: PageSetting;
  popularArticles: Artikel[];
  announcements: Pengumuman[];
  extracurriculars: Ekstrakurikuler[];
  statistics: PeopleStatistics;
  extendedSettings?: import("@/lib/services/site-settings").SiteExtendedSettings;
  source: "supabase" | "fallback";
}

export interface DokumenItem {
  id: DatabaseId;
  tipe_dokumen_id: DatabaseId;
  nama_dokumen: string;
  path: string;
  created_at?: string;
  updated_at?: string;
}

export interface TipeDokumen {
  id: DatabaseId;
  nama: string;
  deskripsi: string | null;
  created_at?: string;
  updated_at?: string;
  dokumen: DokumenItem[];
}


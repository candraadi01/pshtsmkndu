"use server";

import { revalidatePath } from "next/cache";
import { uploadToCloudinary, isCloudinaryConfigured, deleteFromCloudinary } from "@/lib/cloudinary";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatVideoEmbedUrl } from "@/lib/media";
import { requireAdmin, requireSuperAdmin, getCurrentUserProfile } from "./auth";
import { logAdminActivity } from "./activity-logger";
import { saveStoredArticle, deleteStoredArticle } from "./article-store";
import { saveStoredAnnouncement, deleteStoredAnnouncement } from "./announcement-store";
import {
  saveStoredGallery,
  deleteStoredGallery,
  addStoredGalleryPhoto,
  deleteStoredGalleryPhoto,
} from "./gallery-store";
import {
  saveStoredPerson,
  deleteStoredPerson,
} from "./people-store";
import {
  saveStoredDocumentCategory,
  deleteStoredDocumentCategory,
  saveStoredDocument,
  deleteStoredDocument,
} from "./document-store";
import {
  saveStoredEkstrakurikuler,
  deleteStoredEkstrakurikuler,
} from "./ekskul-store";
import {
  saveStoredPageSettings,
} from "./settings-store";
import type { PageSetting, Person } from "@/types/content";

// Helper to slugify
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Helper to handle file upload either via Cloudinary or return existing URL
async function handleFileUpload(
  file: File | null,
  folder: string,
  existingUrl: string = ""
): Promise<string> {
  if (!file || file.size === 0) return existingUrl;

  if (isCloudinaryConfigured()) {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      return await uploadToCloudinary(buffer, folder);
    } catch (err) {
      console.warn("Cloudinary upload failed, attempting local storage fallback:", err);
    }
  }

  // Fallback: save to public/storage/uploads
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name) || ".png";
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "storage", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, fileName), buffer);
    return `/storage/uploads/${fileName}`;
  } catch (localErr) {
    console.warn("Local storage fallback failed:", localErr);
    return existingUrl;
  }
}

// ==========================================
// 1. ARTIKEL CRUD
// ==========================================
export async function saveArticleAction(formData: FormData) {
  const profile = await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const judul = (formData.get("judul") as string)?.trim();
  const isi = (formData.get("isi") as string)?.trim();
  const kategori = (formData.get("kategori") as string)?.trim() || "Umum";
  const status = (formData.get("status") as string) || "published";
  const existingGambar = (formData.get("existing_gambar") as string) || "";
  const file = formData.get("gambar_file") as File | null;

  if (!judul || !isi) {
    return { success: false, error: "Judul dan isi artikel wajib diisi." };
  }

  const slug = slugify(judul) + (id ? "" : `-${Date.now().toString().slice(-4)}`);
  const gambar = await handleFileUpload(file, "psht_smkndu/artikel", existingGambar);

  const payload: Record<string, unknown> = {
    judul,
    slug,
    isi,
    excerpt: isi.replace(/<[^>]*>/g, "").slice(0, 160) + "...",
    kategori,
    status,
    gambar: gambar || existingGambar,
    author_id: profile?.id || null,
    published_at: status === "published" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  // 1. Save in Supabase
  try {
    if (id) {
      await supabase.from("artikel").update(payload).eq("id", id);
    } else {
      payload.created_at = new Date().toISOString();
      payload.view_count = 0;
      await supabase.from("artikel").insert(payload);
    }
  } catch (err) {
    console.warn("Supabase artikel sync warning:", err);
  }

  // 2. Persist in resilient dual-layer store
  await saveStoredArticle({
    id: id || undefined,
    judul,
    slug,
    isi,
    kategori,
    status,
    gambar: gambar || existingGambar,
    author_id: profile?.id || null,
  });

  await logAdminActivity({
    action: id ? "EDIT_ARTIKEL" : "TAMBAH_ARTIKEL",
    entity: "artikel",
    details: `${id ? "Memperbarui" : "Menambahkan"} artikel "${judul}" (Kategori: ${kategori}, Status: ${status})`,
  });

  revalidatePath("/", "layout");
  revalidatePath("/artikel");
  revalidatePath("/admin/artikel");
  return { success: true };
}

export async function deleteArticleAction(id: number): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data: item } = await supabase.from("artikel").select("judul").eq("id", id).maybeSingle();
  
  try {
    await supabase.from("artikel").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase artikel delete warning:", err);
  }

  await deleteStoredArticle(id);

  await logAdminActivity({
    action: "HAPUS_ARTIKEL",
    entity: "artikel",
    details: `Menghapus artikel "${item?.judul || id}"`,
  });

  revalidatePath("/", "layout");
  revalidatePath("/artikel");
  revalidatePath("/admin/artikel");
  return { success: true };
}

// ==========================================
// 2. PENGUMUMAN CRUD (Super Admin Only)
// ==========================================
export async function savePengumumanAction(formData: FormData) {
  await requireSuperAdmin();
  const supabase = await createSupabaseServerClient();

  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const judul = (formData.get("judul") as string)?.trim();
  const isi = (formData.get("isi") as string)?.trim();
  const existingLampiran = (formData.get("existing_lampiran") as string) || "";
  const file = formData.get("lampiran_file") as File | null;

  if (!judul || !isi) {
    return { success: false, error: "Judul dan isi pengumuman wajib diisi." };
  }

  const lampiran = await handleFileUpload(file, "psht_smkndu/pengumuman", existingLampiran);

  const payload: Record<string, unknown> = {
    judul,
    isi,
    lampiran: lampiran || existingLampiran || "",
    updated_at: new Date().toISOString(),
  };

  try {
    if (id) {
      await supabase.from("pengumuman").update(payload).eq("id", id);
    } else {
      payload.created_at = new Date().toISOString();
      await supabase.from("pengumuman").insert(payload);
    }
  } catch (err) {
    console.warn("Supabase pengumuman sync warning:", err);
  }

  await saveStoredAnnouncement({
    id: id || undefined,
    judul,
    isi,
    lampiran: lampiran || existingLampiran || "",
  });

  await logAdminActivity({
    action: id ? "EDIT_PENGUMUMAN" : "TAMBAH_PENGUMUMAN",
    entity: "pengumuman",
    details: `${id ? "Memperbarui" : "Menambahkan"} pengumuman "${judul}"`,
  });

  revalidatePath("/", "layout");
  revalidatePath("/pengumuman");
  revalidatePath("/admin/pengumuman");
  return { success: true };
}

export async function deletePengumumanAction(id: number): Promise<{ success: boolean; error?: string }> {
  await requireSuperAdmin();
  const supabase = await createSupabaseServerClient();
  const { data: item } = await supabase.from("pengumuman").select("judul").eq("id", id).maybeSingle();
  
  try {
    await supabase.from("pengumuman").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase pengumuman delete warning:", err);
  }

  await deleteStoredAnnouncement(id);

  await logAdminActivity({
    action: "HAPUS_PENGUMUMAN",
    entity: "pengumuman",
    details: `Menghapus pengumuman "${item?.judul || id}"`,
  });

  revalidatePath("/", "layout");
  revalidatePath("/pengumuman");
  revalidatePath("/admin/pengumuman");
  return { success: true };
}

// ==========================================
// 3. PEOPLE CRUD (Pelatih, Warga, Siswa)
// ==========================================
// Catatan RBAC: Role 'admin' HANYA boleh mengelola 'siswa'. Role 'super_admin' boleh mengelola semua.
export async function savePersonAction(formData: FormData) {
  const profile = await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const nama = (formData.get("nama") as string)?.trim();
  const tipe = (formData.get("tipe") as string)?.trim(); // 'pelatih' | 'warga' | 'siswa'
  const jenis_kelamin = (formData.get("jenis_kelamin") as string) || null;
  const alamat = (formData.get("alamat") as string)?.trim() || null;
  const no_hp = (formData.get("no_hp") as string)?.trim() || null;
  const existingFoto = (formData.get("existing_foto") as string) || "";
  const file = formData.get("foto_file") as File | null;

  if (!nama || !tipe) {
    return { success: false, error: "Nama dan tipe anggota wajib diisi." };
  }

  // Hak Akses: Admin biasa HANYA boleh mengelola tipe siswa!
  if (profile.role === "admin" && tipe !== "siswa") {
    return {
      success: false,
      error: "Akses Ditolak: Akun Admin hanya diizinkan untuk mengelola data Siswa.",
    };
  }

  // Jika update data lama, pastikan tipe yang diubah bukan pelatih/warga jika role admin
  if (profile.role === "admin" && id) {
    const { data: currentPerson } = await supabase
      .from("people")
      .select("tipe")
      .eq("id", id)
      .maybeSingle();

    if (currentPerson && currentPerson.tipe !== "siswa") {
      return {
        success: false,
        error: "Akses Ditolak: Anda tidak memiliki izin untuk memodifikasi data selain Siswa.",
      };
    }
  }

  const foto = await handleFileUpload(file, "psht_smkndu/people", existingFoto);
  const sabuk = (formData.get("sabuk") as string)?.trim() || null;

  const payload: Record<string, unknown> = {
    nama,
    tipe,
    sabuk: tipe === "siswa" ? (sabuk || "Polos") : null,
    jenis_kelamin,
    alamat,
    no_hp,
    foto: foto || existingFoto || null,
    updated_at: new Date().toISOString(),
  };

  if (id) {
    try {
      await supabase.from("people").update(payload).eq("id", id);
    } catch (err) {
      console.warn("Supabase update people warning:", err);
    }
  } else {
    payload.created_at = new Date().toISOString();
    try {
      await supabase.from("people").insert(payload);
    } catch (err) {
      console.warn("Supabase insert people warning:", err);
    }
  }

  await saveStoredPerson({
    ...(id ? { id } : {}),
    nama,
    tipe: tipe as "pelatih" | "warga" | "siswa",
    sabuk: tipe === "siswa" ? (sabuk || "Polos") : undefined,
    jenis_kelamin: (jenis_kelamin as "L" | "P" | null) || undefined,
    alamat: alamat || undefined,
    no_hp: no_hp || undefined,
    foto: (foto || existingFoto || null) as string | null,
  });

  await logAdminActivity({
    action: id ? `EDIT_${tipe.toUpperCase()}` : `TAMBAH_${tipe.toUpperCase()}`,
    entity: `people (${tipe})`,
    details: `${id ? "Memperbarui" : "Menambahkan"} data ${tipe} "${nama}"`,
  });

  revalidatePath("/", "layout");
  revalidatePath("/pelatih");
  revalidatePath("/warga");
  revalidatePath("/siswa");
  revalidatePath("/admin/people");
  return { success: true };
}

export async function deletePersonAction(id: number) {
  const profile = await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data: targetPerson } = await supabase
    .from("people")
    .select("nama, tipe, foto")
    .eq("id", id)
    .maybeSingle();

  // Hak Akses: Admin biasa HANYA boleh menghapus siswa!
  if (profile.role === "admin" && targetPerson && targetPerson.tipe !== "siswa") {
    return {
      success: false,
      error: "Akses Ditolak: Akun Admin hanya diizinkan untuk menghapus data Siswa.",
    };
  }

  try {
    await supabase.from("people").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase delete people warning:", err);
  }

  const { deleted } = await deleteStoredPerson(id);
  const fotoToDelete = targetPerson?.foto || deleted?.foto;
  if (fotoToDelete) {
    await deleteFromCloudinary(fotoToDelete);
  }

  await logAdminActivity({
    action: `HAPUS_${(targetPerson?.tipe || "ANGGOTA").toUpperCase()}`,
    entity: `people`,
    details: `Menghapus data anggota "${targetPerson?.nama || id}"`,
  });

  revalidatePath("/", "layout");
  revalidatePath("/pelatih");
  revalidatePath("/warga");
  revalidatePath("/siswa");
  revalidatePath("/admin/people");
  return { success: true };
}

// ==========================================
// 4. GALERI & FOTO CRUD (Super Admin Only)
// ==========================================
export async function saveGalleryAction(formData: FormData) {
  await requireSuperAdmin();
  const supabase = await createSupabaseServerClient();

  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const nama_galeri = (formData.get("nama_galeri") as string)?.trim();
  const deskripsi = (formData.get("deskripsi") as string)?.trim() || null;

  if (!nama_galeri) return { success: false, error: "Nama galeri wajib diisi." };

  const payload = { nama_galeri, deskripsi, updated_at: new Date().toISOString() };

  try {
    if (id) {
      await supabase.from("galleries").update(payload).eq("id", id);
    } else {
      await supabase.from("galleries").insert({ ...payload, created_at: new Date().toISOString() });
    }
  } catch (err) {
    console.warn("Supabase gallery warning:", err);
  }

  await saveStoredGallery({ id, nama_galeri, deskripsi });

  await logAdminActivity({
    action: id ? "EDIT_GALERI" : "TAMBAH_GALERI",
    entity: "galeri",
    details: `${id ? "Memperbarui" : "Menambahkan"} album galeri "${nama_galeri}"`,
  });

  revalidatePath("/", "layout");
  revalidatePath("/galeri");
  revalidatePath("/admin/galeri");
  return { success: true };
}

export async function deleteGalleryAction(id: number): Promise<{ success: boolean; error?: string }> {
  await requireSuperAdmin();
  const supabase = await createSupabaseServerClient();
  const { data: item } = await supabase.from("galleries").select("nama_galeri").eq("id", id).maybeSingle();

  try {
    await supabase.from("images").delete().eq("gallery_id", id);
    await supabase.from("galleries").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase delete gallery warning:", err);
  }

  await deleteStoredGallery(id);

  await logAdminActivity({
    action: "HAPUS_GALERI",
    entity: "galeri",
    details: `Menghapus album galeri "${item?.nama_galeri || id}"`,
  });

  revalidatePath("/", "layout");
  revalidatePath("/galeri");
  revalidatePath("/admin/galeri");
  return { success: true };
}

export async function addGalleryPhotoAction(formData: FormData) {
  await requireSuperAdmin();
  const supabase = await createSupabaseServerClient();

  const gallery_id = Number(formData.get("gallery_id"));
  const caption = (formData.get("caption") as string)?.trim() || "";
  const file = formData.get("photo_file") as File | null;

  if (!gallery_id || !file || file.size === 0) {
    return { success: false, error: "Galeri dan file foto wajib dipilih." };
  }

  const path = await handleFileUpload(file, "psht_smkndu/galeri");
  if (!path) return { success: false, error: "Gagal mengupload foto." };

  try {
    await supabase.from("images").insert({
      gallery_id,
      path,
      caption,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("Supabase image insert warning:", err);
  }

  const { success, error } = await addStoredGalleryPhoto({
    gallery_id,
    path,
    caption,
  });

  if (!success) {
    return { success: false, error: error || "Gagal menyimpan foto ke galeri" };
  }

  await logAdminActivity({
    action: "UPLOAD_FOTO_GALERI",
    entity: "galeri",
    details: `Mengunggah foto baru ke album ID ${gallery_id} (${caption || "tanpa caption"})`,
  });

  revalidatePath("/", "layout");
  revalidatePath("/galeri");
  revalidatePath("/admin/galeri");
  return { success: true };
}

export async function deleteGalleryPhotoAction(id: number): Promise<{ success: boolean; error?: string }> {
  await requireSuperAdmin();
  const supabase = await createSupabaseServerClient();

  try {
    await supabase.from("images").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase image delete warning:", err);
  }

  const { deletedPhoto } = await deleteStoredGalleryPhoto(id);
  if (deletedPhoto?.path) {
    await deleteFromCloudinary(deletedPhoto.path);
  }

  await logAdminActivity({
    action: "HAPUS_FOTO_GALERI",
    entity: "galeri",
    details: `Menghapus foto galeri ID ${id}`,
  });

  revalidatePath("/", "layout");
  revalidatePath("/galeri");
  revalidatePath("/admin/galeri");
  return { success: true };
}

// ==========================================
// 5. DOKUMEN & KATEGORI CRUD (Super Admin Only)
// ==========================================
export async function saveTipeDokumenAction(formData: FormData) {
  await requireSuperAdmin();
  const supabase = await createSupabaseServerClient();

  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const nama = (formData.get("nama") as string)?.trim();
  const deskripsi = (formData.get("deskripsi") as string)?.trim() || null;

  if (!nama) return { success: false, error: "Nama kategori dokumen wajib diisi." };

  const payload = { nama, deskripsi, updated_at: new Date().toISOString() };
  try {
    if (id) {
      await supabase.from("tipe_dokumen").update(payload).eq("id", id);
    } else {
      await supabase.from("tipe_dokumen").insert({ ...payload, created_at: new Date().toISOString() });
    }
  } catch (err) {
    console.warn("Supabase tipe_dokumen warning:", err);
  }

  await saveStoredDocumentCategory({ id, nama, deskripsi });

  await logAdminActivity({
    action: id ? "EDIT_KATEGORI_DOKUMEN" : "TAMBAH_KATEGORI_DOKUMEN",
    entity: "dokumen",
    details: `${id ? "Memperbarui" : "Menambahkan"} kategori dokumen "${nama}"`,
  });

  revalidatePath("/", "layout");
  revalidatePath("/dokumen");
  revalidatePath("/admin/dokumen");
  return { success: true };
}

export async function deleteTipeDokumenAction(id: number): Promise<{ success: boolean; error?: string }> {
  await requireSuperAdmin();
  const supabase = await createSupabaseServerClient();

  try {
    await supabase.from("dokumen").delete().eq("tipe_dokumen_id", id);
    await supabase.from("tipe_dokumen").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase delete tipe_dokumen warning:", err);
  }

  await deleteStoredDocumentCategory(id);

  await logAdminActivity({
    action: "HAPUS_KATEGORI_DOKUMEN",
    entity: "dokumen",
    details: `Menghapus kategori dokumen ID ${id}`,
  });

  revalidatePath("/", "layout");
  revalidatePath("/dokumen");
  revalidatePath("/admin/dokumen");
  return { success: true };
}

export async function saveDokumenAction(formData: FormData) {
  await requireSuperAdmin();
  const supabase = await createSupabaseServerClient();

  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const tipe_dokumen_id = Number(formData.get("tipe_dokumen_id"));
  const nama_dokumen = (formData.get("nama_dokumen") as string)?.trim();
  const existingPath = (formData.get("existing_path") as string) || "";
  const file = formData.get("dokumen_file") as File | null;

  if (!nama_dokumen || !tipe_dokumen_id) {
    return { success: false, error: "Nama dokumen dan tipe kategori wajib diisi." };
  }

  const path = await handleFileUpload(file, "psht_smkndu/dokumen", existingPath);

  const payload = {
    tipe_dokumen_id,
    nama_dokumen,
    path: path || existingPath,
    updated_at: new Date().toISOString(),
  };

  try {
    if (id) {
      await supabase.from("dokumen").update(payload).eq("id", id);
    } else {
      await supabase.from("dokumen").insert({ ...payload, created_at: new Date().toISOString() });
    }
  } catch (err) {
    console.warn("Supabase dokumen warning:", err);
  }

  await saveStoredDocument({
    id,
    tipe_dokumen_id,
    nama_dokumen,
    path: path || existingPath,
  });

  await logAdminActivity({
    action: id ? "EDIT_DOKUMEN" : "TAMBAH_DOKUMEN",
    entity: "dokumen",
    details: `${id ? "Memperbarui" : "Menambahkan"} berkas dokumen "${nama_dokumen}"`,
  });

  revalidatePath("/", "layout");
  revalidatePath("/dokumen");
  revalidatePath("/admin/dokumen");
  return { success: true };
}

export async function deleteDokumenAction(id: number): Promise<{ success: boolean; error?: string }> {
  await requireSuperAdmin();
  const supabase = await createSupabaseServerClient();
  const { data: item } = await supabase.from("dokumen").select("nama_dokumen, path").eq("id", id).maybeSingle();

  try {
    await supabase.from("dokumen").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase delete dokumen warning:", err);
  }

  const { deleted } = await deleteStoredDocument(id);
  const pathToDelete = item?.path || deleted?.path;
  if (pathToDelete) {
    await deleteFromCloudinary(pathToDelete);
  }

  await logAdminActivity({
    action: "HAPUS_DOKUMEN",
    entity: "dokumen",
    details: `Menghapus dokumen "${item?.nama_dokumen || id}"`,
  });

  revalidatePath("/", "layout");
  revalidatePath("/dokumen");
  revalidatePath("/admin/dokumen");
  return { success: true };
}

// ==========================================
// 6. EKSTRAKURIKULER CRUD (Super Admin Only)
// ==========================================
export async function saveEkstrakurikulerAction(formData: FormData) {
  await requireSuperAdmin();
  const supabase = await createSupabaseServerClient();

  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const nama = (formData.get("nama") as string)?.trim();
  const deskripsi = (formData.get("deskripsi") as string)?.trim() || null;
  const nama_pembina = (formData.get("nama_pembina") as string)?.trim() || null;
  const nama_ketua = (formData.get("nama_ketua") as string)?.trim() || null;
  const jadwal = (formData.get("jadwal") as string)?.trim() || null;
  const lokasi = (formData.get("lokasi") as string)?.trim() || null;
  const existingGambar = (formData.get("existing_gambar") as string) || "";
  const file = formData.get("gambar_file") as File | null;

  if (!nama) return { success: false, error: "Nama ekstrakurikuler wajib diisi." };

  const gambar = await handleFileUpload(file, "psht_smkndu/ekskul", existingGambar);

  const payload = {
    nama,
    deskripsi,
    nama_pembina,
    nama_ketua,
    jadwal,
    lokasi,
    gambar: gambar || existingGambar || null,
    updated_at: new Date().toISOString(),
  };

  try {
    if (id) {
      await supabase.from("ekstrakurikuler").update(payload).eq("id", id);
    } else {
      await supabase.from("ekstrakurikuler").insert({ ...payload, created_at: new Date().toISOString() });
    }
  } catch (err) {
    console.warn("Supabase ekstrakurikuler warning:", err);
  }

  await saveStoredEkstrakurikuler({
    id: id || undefined,
    nama,
    deskripsi,
    nama_pembina,
    nama_ketua,
    jadwal,
    lokasi,
    gambar: gambar || existingGambar || null,
  });

  await logAdminActivity({
    action: id ? "EDIT_EKSTRAKURIKULER" : "TAMBAH_EKSTRAKURIKULER",
    entity: "ekstrakurikuler",
    details: `${id ? "Memperbarui" : "Menambahkan"} informasi ekstrakurikuler "${nama}"`,
  });

  revalidatePath("/", "layout");
  revalidatePath("/ekstrakurikuler");
  revalidatePath("/admin/ekstrakurikuler");
  return { success: true };
}

export async function deleteEkstrakurikulerAction(id: number): Promise<{ success: boolean; error?: string }> {
  await requireSuperAdmin();
  const supabase = await createSupabaseServerClient();
  const { data: item } = await supabase.from("ekstrakurikuler").select("nama, gambar").eq("id", id).maybeSingle();

  try {
    await supabase.from("ekstrakurikuler").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase delete ekstrakurikuler warning:", err);
  }

  const { deleted } = await deleteStoredEkstrakurikuler(id);
  const imgToDelete = item?.gambar || deleted?.gambar;
  if (imgToDelete) {
    await deleteFromCloudinary(imgToDelete);
  }

  await logAdminActivity({
    action: "HAPUS_EKSTRAKURIKULER",
    entity: "ekstrakurikuler",
    details: `Menghapus ekstrakurikuler "${item?.nama || id}"`,
  });

  revalidatePath("/", "layout");
  revalidatePath("/ekstrakurikuler");
  revalidatePath("/admin/ekstrakurikuler");
  return { success: true };
}

// ==========================================
// 7. PAGE SETTINGS (Logo, Hero, Visi Misi, dll - Super Admin Only)
// ==========================================
export async function savePageSettingsAction(formData: FormData) {
  const profile = await getCurrentUserProfile();
  if (!profile || profile.role !== "super_admin") {
    return {
      success: false,
      error: "Akses ditolak: Hanya akun Super Admin yang diizinkan memperbarui pengaturan website.",
    };
  }
  const supabase = await createSupabaseServerClient();

  const judul_hero = (formData.get("judul_hero") as string) || null;
  const deskripsi_hero = (formData.get("deskripsi_hero") as string) || null;
  const visi = (formData.get("visi") as string) || null;
  const misi = (formData.get("misi") as string) || null;
  const syarat_pendaftaran = (formData.get("syarat_pendaftaran") as string) || "Hubungi pengurus untuk pendaftaran.";

  const judul_sejarah = (formData.get("judul_sejarah") as string)?.trim() || null;
  const deskripsi_sejarah = (formData.get("deskripsi_sejarah") as string)?.trim() || null;

  const judul_video = (formData.get("judul_video") as string)?.trim() || null;
  const deskripsi_video = (formData.get("deskripsi_video") as string)?.trim() || null;
  const rawUrlVideo = (formData.get("url_video") as string)?.trim() || null;
  const rawUrlVideo1 = (formData.get("url_video1") as string)?.trim() || null;
  const rawUrlVideo2 = (formData.get("url_video2") as string)?.trim() || null;

  const url_video = formatVideoEmbedUrl(rawUrlVideo) || null;
  const url_video1 = formatVideoEmbedUrl(rawUrlVideo1) || null;
  const url_video2 = formatVideoEmbedUrl(rawUrlVideo2) || null;

  const logoFile = formData.get("logo_file") as File | null;
  const existingLogo = (formData.get("existing_logo") as string) || null;
  const logo = await handleFileUpload(logoFile, "psht_smkndu/settings", existingLogo || "");

  // Universal helper to handle image slots (Upload & Remove)
  const resolveImageSlot = async (
    fileKey: string,
    existingKey: string,
    removeKey: string,
    folder: string = "psht_smkndu/settings"
  ) => {
    const isRemoved = formData.get(removeKey) === "true";
    const existing = (formData.get(existingKey) as string)?.trim() || null;
    if (isRemoved) {
      if (existing) await deleteFromCloudinary(existing);
      return null;
    }
    const file = formData.get(fileKey) as File | null;
    if (file && file.size > 0) {
      return await handleFileUpload(file, folder, existing || "");
    }
    return existing;
  };

  // 1. Hero 4-Slot Slider Images
  const gambar_hero = await resolveImageSlot("gambar_hero_file", "existing_gambar_hero", "remove_gambar_hero", "psht_smkndu/hero");
  const gambar_hero1 = await resolveImageSlot("gambar_hero1_file", "existing_gambar_hero1", "remove_gambar_hero1", "psht_smkndu/hero");
  const gambar_hero2 = await resolveImageSlot("gambar_hero2_file", "existing_gambar_hero2", "remove_gambar_hero2", "psht_smkndu/hero");
  const gambar_hero3 = await resolveImageSlot("gambar_hero3_file", "existing_gambar_hero3", "remove_gambar_hero3", "psht_smkndu/hero");

  // 2. Sejarah 4-Slot Images
  const gambar_sejarah = await resolveImageSlot("gambar_sejarah_file", "existing_gambar_sejarah", "remove_gambar_sejarah", "psht_smkndu/sejarah");
  const gambar_sejarah1 = await resolveImageSlot("gambar_sejarah1_file", "existing_gambar_sejarah1", "remove_gambar_sejarah1", "psht_smkndu/sejarah");
  const gambar_sejarah2 = await resolveImageSlot("gambar_sejarah2_file", "existing_gambar_sejarah2", "remove_gambar_sejarah2", "psht_smkndu/sejarah");
  const gambar_sejarah3 = await resolveImageSlot("gambar_sejarah3_file", "existing_gambar_sejarah3", "remove_gambar_sejarah3", "psht_smkndu/sejarah");

  // 3. Extended Settings (Social Media, Contact, Maps, Footer, Stats Override)
  const { saveSiteExtendedSettings } = await import("@/lib/services/site-settings-server");
  const whatsapp = (formData.get("whatsapp") as string)?.trim() || "";
  const instagram = (formData.get("instagram") as string)?.trim() || "";
  const tiktok = (formData.get("tiktok") as string)?.trim() || "";
  const alamat = (formData.get("alamat") as string)?.trim() || "";
  const maps_embed_url = (formData.get("maps_embed_url") as string)?.trim() || "";
  const maps_link = (formData.get("maps_link") as string)?.trim() || "";
  const email = (formData.get("email") as string)?.trim() || "";
  const telepon = (formData.get("telepon") as string)?.trim() || "";
  const footer_slogan = (formData.get("footer_slogan") as string)?.trim() || "";
  const footer_copyright = (formData.get("footer_copyright") as string)?.trim() || "";

  const statSiswaRaw = formData.get("stat_siswa_override") as string;
  const statPelatihRaw = formData.get("stat_pelatih_override") as string;
  const statWargaRaw = formData.get("stat_warga_override") as string;
  const statGaleriRaw = formData.get("stat_galeri_override") as string;

  saveSiteExtendedSettings({
    whatsapp,
    instagram,
    tiktok,
    alamat,
    maps_embed_url,
    maps_link,
    email,
    telepon,
    footer_slogan,
    footer_copyright,
    stat_siswa_override: statSiswaRaw ? Number(statSiswaRaw) : null,
    stat_pelatih_override: statPelatihRaw ? Number(statPelatihRaw) : null,
    stat_warga_override: statWargaRaw ? Number(statWargaRaw) : null,
    stat_galeri_override: statGaleriRaw ? Number(statGaleriRaw) : null,
  });

  const payload: Record<string, unknown> = {
    judul_hero,
    deskripsi_hero,
    gambar_hero,
    gambar_hero1,
    gambar_hero2,
    gambar_hero3,
    judul_sejarah,
    deskripsi_sejarah,
    gambar_sejarah,
    gambar_sejarah1,
    gambar_sejarah2,
    gambar_sejarah3,
    visi,
    misi,
    syarat_pendaftaran,
    judul_video,
    deskripsi_video,
    url_video,
    url_video1,
    url_video2,
    logo: logo || existingLogo,
    updated_at: new Date().toISOString(),
  };

  // 1. Dual sync to Supabase (safe try/catch)
  try {
    const { data: existing } = await supabase.from("page_settings").select("id").limit(1).maybeSingle();
    if (existing) {
      await supabase.from("page_settings").update(payload).eq("id", existing.id);
    } else {
      payload.created_at = new Date().toISOString();
      await supabase.from("page_settings").insert(payload);
    }
  } catch (err) {
    console.warn("Supabase page_settings warning:", err);
  }

  // 2. Persist in resilient settings-store
  await saveStoredPageSettings(payload as unknown as Partial<PageSetting>);

  await logAdminActivity({
    action: "UPDATE_PENGATURAN_WEBSITE",
    entity: "settings",
    details: `Memperbarui pengaturan website, logo, profil sejarah, atau visi-misi`,
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  revalidatePath("/kontak");
  revalidatePath("/struktur-organisasi");
  revalidatePath("/admin");
  return { success: true };
}

// ==========================================
// 8. USER & ADMIN MANAGEMENT (Super Admin Only)
// ==========================================
export async function updateUserRoleAction(targetUserId: string, newRole: "admin" | "super_admin") {
  await requireSuperAdmin();
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq("id", targetUserId);

  if (error) return { success: false, error: error.message };

  await logAdminActivity({
    action: "UPDATE_ROLE_ADMIN",
    entity: "users",
    details: `Mengubah hak akses user ID ${targetUserId} menjadi "${newRole}"`,
  });

  revalidatePath("/admin/users");
  return { success: true };
}

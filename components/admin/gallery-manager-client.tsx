"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import {
  saveGalleryAction,
  deleteGalleryAction,
  addGalleryPhotoAction,
  deleteGalleryPhotoAction,
} from "@/lib/services/admin-crud";
import { resolveMediaUrl } from "@/lib/media";

interface GalleryItem {
  id: number;
  nama_galeri: string;
  slug: string;
  deskripsi?: string | null;
  images?: Array<{
    id: number;
    path: string;
    caption?: string | null;
  }>;
}

export default function GalleryManagerClient({ initialGalleries }: { initialGalleries: GalleryItem[] }) {
  const [galleries, setGalleries] = useState<GalleryItem[]>(initialGalleries);
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [selectedGalleryId, setSelectedGalleryId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");

  const handleCreateAlbum = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await saveGalleryAction(formData);
      if (res.success) {
        setIsAlbumModalOpen(false);
        window.location.reload();
      } else {
        setErrorMsg(res.error || "Gagal membuat album");
      }
    });
  };

  const handleUploadPhoto = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedGalleryId) return;
    setErrorMsg("");
    const formData = new FormData(e.currentTarget);
    formData.append("gallery_id", String(selectedGalleryId));

    startTransition(async () => {
      const res = await addGalleryPhotoAction(formData);
      if (res.success) {
        setIsPhotoModalOpen(false);
        window.location.reload();
      } else {
        setErrorMsg(res.error || "Gagal mengunggah foto");
      }
    });
  };

  const handleDeleteAlbum = (id: number, name: string) => {
    if (!confirm(`Hapus album "${name}" beserta seluruh fotonya?`)) return;
    startTransition(async () => {
      const res = await deleteGalleryAction(id);
      if (res.success) {
        setGalleries((prev) => prev.filter((g) => g.id !== id));
      } else {
        alert("Gagal menghapus: " + res.error);
      }
    });
  };

  const handleDeletePhoto = (photoId: number) => {
    if (!confirm("Hapus foto ini?")) return;
    startTransition(async () => {
      const res = await deleteGalleryPhotoAction(photoId);
      if (res.success) {
        window.location.reload();
      } else {
        alert("Gagal menghapus: " + res.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Action */}
      <div className="flex justify-between items-center bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900">Total {galleries.length} Album Dokumentasi</h3>
          <p className="text-xs text-slate-500 font-medium">Unggah foto kegiatan silat, kejuaraan, dan prosesi warga</p>
        </div>
        <button
          onClick={() => { setErrorMsg(""); setIsAlbumModalOpen(true); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-black text-xs sm:text-sm shadow-sm shadow-purple-500/25 hover:shadow transition-all shrink-0"
        >
          <i className="fa-solid fa-folder-plus text-xs" />
          <span>Buat Album Baru</span>
        </button>
      </div>

      {galleries.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 shadow-sm text-slate-400 font-medium">
          <i className="fa-regular fa-images text-3xl mb-2 block opacity-40" />
          Belum ada album galeri. Silakan buat album baru terlebih dahulu.
        </div>
      ) : (
        <div className="space-y-6">
          {galleries.map((album) => (
            <div key={album.id} className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4 border-t-4 border-t-purple-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center text-xs">
                      <i className="fa-solid fa-folder-open" />
                    </div>
                    <span>{album.nama_galeri}</span>
                  </h3>
                  {album.deskripsi && (
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{album.deskripsi}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setSelectedGalleryId(album.id);
                      setErrorMsg("");
                      setIsPhotoModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 transition-colors shadow-2xs"
                  >
                    <i className="fa-solid fa-cloud-arrow-up text-xs" />
                    <span>Upload Foto</span>
                  </button>
                  <button
                    onClick={() => handleDeleteAlbum(album.id, album.nama_galeri)}
                    disabled={isPending}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 text-xs transition-colors"
                    title="Hapus Album"
                  >
                    <i className="fa-solid fa-trash-can" />
                  </button>
                </div>
              </div>

              {/* Photos Grid */}
              {(!album.images || album.images.length === 0) ? (
                <div className="py-8 text-center text-xs text-slate-400 font-medium bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                  Album ini belum memiliki foto. Klik &quot;Upload Foto&quot; untuk menambahkan dokumentasi.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {album.images.map((img) => (
                    <div
                      key={img.id}
                      className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs hover:shadow-md transition-all"
                    >
                      <Image
                        src={resolveMediaUrl(img.path)}
                        alt={img.caption || album.nama_galeri}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 backdrop-blur-2xs">
                        <button
                          onClick={() => handleDeletePhoto(img.id)}
                          className="p-2.5 rounded-xl bg-rose-600 text-white text-xs hover:bg-rose-700 shadow-md transition-transform hover:scale-110"
                          title="Hapus Foto"
                        >
                          <i className="fa-solid fa-trash" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Album Modal */}
      {isAlbumModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <i className="fa-solid fa-folder-plus text-purple-600" />
                <span>Buat Album Galeri Baru</span>
              </h3>
              <button onClick={() => setIsAlbumModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <i className="fa-solid fa-xmark text-lg" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateAlbum} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Nama Album *
                </label>
                <input
                  type="text"
                  name="nama_galeri"
                  required
                  placeholder="Contoh: Latihan Gabungan 2026..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Deskripsi Singkat (Opsional)
                </label>
                <textarea
                  name="deskripsi"
                  rows={3}
                  placeholder="Keterangan mengenai momen atau kegiatan dalam album..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAlbumModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs font-black shadow-sm disabled:opacity-50"
                >
                  {isPending ? "Menyimpan..." : "Buat Album"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Upload Modal */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <i className="fa-solid fa-cloud-arrow-up text-purple-600" />
                <span>Upload Foto ke Album</span>
              </h3>
              <button onClick={() => setIsPhotoModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <i className="fa-solid fa-xmark text-lg" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleUploadPhoto} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Pilih Berkas Foto *
                </label>
                <input
                  type="file"
                  name="photo_file"
                  accept="image/*"
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-purple-500 file:text-white file:font-bold hover:file:bg-purple-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Keterangan / Caption Foto (Opsional)
                </label>
                <input
                  type="text"
                  name="caption"
                  placeholder="Contoh: Sesi sabung atau penyerahan piala..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs font-black shadow-sm disabled:opacity-50"
                >
                  {isPending ? "Mengunggah..." : "Unggah Sekarang"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

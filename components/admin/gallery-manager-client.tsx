"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { saveGalleryAction, deleteGalleryAction, addGalleryPhotoAction, deleteGalleryPhotoAction } from "@/lib/services/admin-crud";
import { resolveMediaUrl } from "@/lib/media";

interface GalleryItem {
  id: number;
  nama_galeri: string;
  deskripsi?: string | null;
  images?: Array<{ id: number; path: string; caption?: string | null }>;
}

export default function GalleryManagerClient({ initialGalleries }: { initialGalleries: GalleryItem[] }) {
  const [galleries, setGalleries] = useState<GalleryItem[]>(initialGalleries);
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [selectedGalleryId, setSelectedGalleryId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");

  const handleCreateAlbum = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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

  const handleAddPhoto = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await addGalleryPhotoAction(formData);
      if (res.success) {
        setIsPhotoModalOpen(false);
        window.location.reload();
      } else {
        setErrorMsg(res.error || "Gagal mengupload foto");
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
      <div className="flex justify-end">
        <button
          onClick={() => { setErrorMsg(""); setIsAlbumModalOpen(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-xs sm:text-sm shadow-md transition-all"
        >
          <i className="fa-solid fa-folder-plus text-xs" />
          <span>Buat Album Baru</span>
        </button>
      </div>

      {galleries.length === 0 ? (
        <div className="p-12 text-center bg-[#151d2a] rounded-3xl border border-gray-800 text-gray-500">
          Belum ada album galeri. Silakan buat album baru terlebih dahulu.
        </div>
      ) : (
        <div className="space-y-6">
          {galleries.map((album) => (
            <div key={album.id} className="bg-[#151d2a] rounded-3xl border border-gray-800 p-6 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <i className="fa-solid fa-folder text-amber-400" />
                    <span>{album.nama_galeri}</span>
                  </h3>
                  {album.deskripsi && (
                    <p className="text-xs text-gray-400 mt-0.5">{album.deskripsi}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedGalleryId(album.id);
                      setErrorMsg("");
                      setIsPhotoModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-semibold border border-blue-500/20"
                  >
                    <i className="fa-solid fa-cloud-arrow-up text-xs" />
                    <span>Upload Foto</span>
                  </button>
                  <button
                    onClick={() => handleDeleteAlbum(album.id, album.nama_galeri)}
                    disabled={isPending}
                    className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs"
                    title="Hapus Album"
                  >
                    <i className="fa-solid fa-trash-can" />
                  </button>
                </div>
              </div>

              {/* Photos Grid */}
              {(!album.images || album.images.length === 0) ? (
                <p className="text-xs text-gray-500 py-4 text-center">
                  Album ini belum memiliki foto. Klik &quot;Upload Foto&quot; untuk menambahkan dokumentasi.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {album.images.map((img) => (
                    <div
                      key={img.id}
                      className="group relative aspect-square rounded-xl overflow-hidden bg-gray-900 border border-gray-800"
                    >
                      <Image
                        src={resolveMediaUrl(img.path)}
                        alt={img.caption || album.nama_galeri}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                        <button
                          onClick={() => handleDeletePhoto(img.id)}
                          className="p-2 rounded-lg bg-red-600 text-white text-xs hover:bg-red-700 shadow-md"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#1e293b] w-full max-w-md rounded-3xl p-6 border border-gray-700 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white">Buat Album Galeri Baru</h3>
            {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}
            <form onSubmit={handleCreateAlbum} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-300 font-semibold mb-1">Nama Album *</label>
                <input
                  type="text"
                  name="nama_galeri"
                  required
                  placeholder="Contoh: Latihan Gabungan 2026..."
                  className="w-full px-3 py-2 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-300 font-semibold mb-1">Deskripsi Singkat</label>
                <textarea
                  name="deskripsi"
                  rows={3}
                  placeholder="Deskripsi kegiatan atau momentum dalam album..."
                  className="w-full px-3 py-2 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAlbumModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-xs"
                >
                  Simpan Album
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Upload Modal */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#1e293b] w-full max-w-md rounded-3xl p-6 border border-gray-700 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white">Upload Foto ke Album</h3>
            {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}
            <form onSubmit={handleAddPhoto} className="space-y-3">
              <input type="hidden" name="gallery_id" value={selectedGalleryId || ""} />
              <div>
                <label className="block text-xs text-gray-300 font-semibold mb-1">Pilih Foto (Cloudinary) *</label>
                <input
                  type="file"
                  name="photo_file"
                  accept="image/*"
                  required
                  className="w-full px-3 py-2 bg-[#0f172a] border border-gray-700 rounded-xl text-gray-300 text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:bg-amber-500 file:text-gray-950"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-300 font-semibold mb-1">Keterangan / Caption (Opsional)</label>
                <input
                  type="text"
                  name="caption"
                  placeholder="Contoh: Sambung persaudaraan..."
                  className="w-full px-3 py-2 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-xs"
                >
                  Upload Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

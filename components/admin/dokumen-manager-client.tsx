"use client";

import { useState, useTransition } from "react";
import { saveTipeDokumenAction, deleteTipeDokumenAction, saveDokumenAction, deleteDokumenAction } from "@/lib/services/admin-crud";

interface DokumenItem {
  id: number;
  nama_dokumen: string;
  path: string;
  tipe_dokumen_id: number;
}

interface CategoryItem {
  id: number;
  nama: string;
  deskripsi?: string | null;
  dokumen?: DokumenItem[];
}

export default function DokumenManagerClient({ initialCategories }: { initialCategories: CategoryItem[] }) {
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");

  const handleCreateCategory = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await saveTipeDokumenAction(formData);
      if (res.success) {
        setIsCatModalOpen(false);
        window.location.reload();
      } else {
        setErrorMsg(res.error || "Gagal menyimpan kategori");
      }
    });
  };

  const handleAddDocument = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await saveDokumenAction(formData);
      if (res.success) {
        setIsFileModalOpen(false);
        window.location.reload();
      } else {
        setErrorMsg(res.error || "Gagal mengupload berkas dokumen");
      }
    });
  };

  const handleDeleteCategory = (id: number, name: string) => {
    if (!confirm(`Hapus kategori dokumen "${name}" beserta seluruh berkasnya?`)) return;
    startTransition(async () => {
      const res = await deleteTipeDokumenAction(id);
      if (res.success) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert("Gagal menghapus: " + res.error);
      }
    });
  };

  const handleDeleteFile = (id: number) => {
    if (!confirm("Hapus berkas dokumen ini?")) return;
    startTransition(async () => {
      const res = await deleteDokumenAction(id);
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
          onClick={() => { setErrorMsg(""); setIsCatModalOpen(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-xs sm:text-sm shadow-md transition-all"
        >
          <i className="fa-solid fa-plus text-xs" />
          <span>Tambah Kategori Dokumen</span>
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="p-12 text-center bg-[#151d2a] rounded-3xl border border-gray-800 text-gray-500">
          Belum ada kategori dokumen. Klik &quot;Tambah Kategori Dokumen&quot; untuk memulai.
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-[#151d2a] rounded-3xl border border-gray-800 p-6 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <i className="fa-solid fa-folder-open text-amber-400" />
                    <span>{cat.nama}</span>
                  </h3>
                  {cat.deskripsi && (
                    <p className="text-xs text-gray-400 mt-0.5">{cat.deskripsi}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedCatId(cat.id);
                      setErrorMsg("");
                      setIsFileModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-semibold border border-blue-500/20"
                  >
                    <i className="fa-solid fa-file-arrow-up text-xs" />
                    <span>Unggah Berkas Baru</span>
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id, cat.nama)}
                    disabled={isPending}
                    className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs"
                    title="Hapus Kategori"
                  >
                    <i className="fa-solid fa-trash-can" />
                  </button>
                </div>
              </div>

              {/* Document Files List */}
              {(!cat.dokumen || cat.dokumen.length === 0) ? (
                <p className="text-xs text-gray-500 py-3 text-center">
                  Belum ada berkas dalam kategori ini.
                </p>
              ) : (
                <div className="divide-y divide-gray-800/60">
                  {cat.dokumen.map((doc) => (
                    <div
                      key={doc.id}
                      className="py-3 flex items-center justify-between gap-4 hover:bg-gray-800/20 rounded-xl px-3 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                          <i className="fa-solid fa-file-pdf text-sm" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-semibold text-gray-200 truncate">
                            {doc.nama_dokumen}
                          </div>
                          <div className="text-[11px] text-gray-500 font-mono truncate">{doc.path}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={doc.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs"
                          title="Buka / Unduh"
                        >
                          <i className="fa-solid fa-download text-[11px]" />
                        </a>
                        <button
                          onClick={() => handleDeleteFile(doc.id)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs"
                          title="Hapus Berkas"
                        >
                          <i className="fa-solid fa-trash-can" />
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

      {/* Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#1e293b] w-full max-w-md rounded-3xl p-6 border border-gray-700 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white">Tambah Kategori Dokumen</h3>
            {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}
            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-300 font-semibold mb-1">Nama Kategori *</label>
                <input
                  type="text"
                  name="nama"
                  required
                  placeholder="Contoh: Surat Keputusan (SK) Pengurus..."
                  className="w-full px-3 py-2 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-300 font-semibold mb-1">Deskripsi</label>
                <textarea
                  name="deskripsi"
                  rows={3}
                  placeholder="Keterangan dokumen..."
                  className="w-full px-3 py-2 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-xs"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Upload Modal */}
      {isFileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#1e293b] w-full max-w-md rounded-3xl p-6 border border-gray-700 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white">Unggah Berkas Dokumen</h3>
            {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}
            <form onSubmit={handleAddDocument} className="space-y-3">
              <input type="hidden" name="tipe_dokumen_id" value={selectedCatId || ""} />
              <div>
                <label className="block text-xs text-gray-300 font-semibold mb-1">Nama Dokumen *</label>
                <input
                  type="text"
                  name="nama_dokumen"
                  required
                  placeholder="Contoh: SK Pengurus Periode 2025-2026.pdf"
                  className="w-full px-3 py-2 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-300 font-semibold mb-1">File Berkas (PDF/Doc) *</label>
                <input
                  type="file"
                  name="dokumen_file"
                  required
                  className="w-full px-3 py-2 bg-[#0f172a] border border-gray-700 rounded-xl text-gray-300 text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:bg-amber-500 file:text-gray-950"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFileModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-xs"
                >
                  Unggah Berkas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

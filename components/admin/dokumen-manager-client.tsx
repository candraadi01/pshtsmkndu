"use client";

import { useState, useTransition } from "react";
import {
  saveTipeDokumenAction,
  deleteTipeDokumenAction,
  saveDokumenAction,
  deleteDokumenAction,
} from "@/lib/services/admin-crud";

interface CategoryDoc {
  id: number;
  nama: string;
  deskripsi?: string | null;
  dokumen?: Array<{
    id: number;
    nama_dokumen: string;
    path: string;
    created_at?: string;
  }>;
}

export default function DokumenManagerClient({ initialCategories }: { initialCategories: CategoryDoc[] }) {
  const [categories, setCategories] = useState<CategoryDoc[]>(initialCategories);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");

  const handleCreateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await saveTipeDokumenAction(formData);
      if (res.success) {
        setIsCatModalOpen(false);
        window.location.reload();
      } else {
        setErrorMsg(res.error || "Gagal membuat kategori dokumen");
      }
    });
  };

  const handleUploadFile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCatId) return;
    setErrorMsg("");
    const formData = new FormData(e.currentTarget);
    formData.append("tipe_dokumen_id", String(selectedCatId));

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
      {/* Top Action Bar */}
      <div className="flex justify-between items-center bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900">Total {categories.length} Kategori Dokumen</h3>
          <p className="text-xs text-slate-500 font-medium">Kelola berkas PDF resmi, pedoman organisasi, dan formulir pendaftaran</p>
        </div>
        <button
          onClick={() => { setErrorMsg(""); setIsCatModalOpen(true); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs sm:text-sm shadow-sm shadow-emerald-500/25 hover:shadow transition-all shrink-0"
        >
          <i className="fa-solid fa-plus text-xs" />
          <span>Tambah Kategori Dokumen</span>
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 shadow-sm text-slate-400 font-medium">
          <i className="fa-regular fa-folder-open text-3xl mb-2 block opacity-40" />
          Belum ada kategori dokumen. Klik &quot;Tambah Kategori Dokumen&quot; untuk memulai.
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4 border-t-4 border-t-emerald-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center text-xs">
                      <i className="fa-solid fa-folder-open" />
                    </div>
                    <span>{cat.nama}</span>
                  </h3>
                  {cat.deskripsi && (
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{cat.deskripsi}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setSelectedCatId(cat.id);
                      setErrorMsg("");
                      setIsFileModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition-colors shadow-2xs"
                  >
                    <i className="fa-solid fa-file-arrow-up text-xs" />
                    <span>Unggah Berkas Baru</span>
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id, cat.nama)}
                    disabled={isPending}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 text-xs transition-colors"
                    title="Hapus Kategori"
                  >
                    <i className="fa-solid fa-trash-can" />
                  </button>
                </div>
              </div>

              {/* Document Files List */}
              {(!cat.dokumen || cat.dokumen.length === 0) ? (
                <div className="py-6 text-center text-xs text-slate-400 font-medium bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                  Belum ada berkas dalam kategori ini. Klik &quot;Unggah Berkas Baru&quot;.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {cat.dokumen.map((doc) => (
                    <div
                      key={doc.id}
                      className="py-3 flex items-center justify-between gap-4 hover:bg-emerald-50/30 rounded-2xl px-3 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/80 flex items-center justify-center shrink-0">
                          <i className="fa-solid fa-file-pdf text-base" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {doc.nama_dokumen}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono truncate">{doc.path}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <a
                          href={doc.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                          title="Buka / Unduh Berkas"
                        >
                          <i className="fa-solid fa-download text-[11px] text-emerald-600" />
                          <span>Unduh</span>
                        </a>
                        <button
                          onClick={() => handleDeleteFile(doc.id)}
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 text-xs transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <i className="fa-solid fa-folder-plus text-emerald-600" />
                <span>Tambah Kategori Dokumen</span>
              </h3>
              <button onClick={() => setIsCatModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <i className="fa-solid fa-xmark text-lg" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateCategory} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Nama Kategori Dokumen *
                </label>
                <input
                  type="text"
                  name="nama"
                  required
                  placeholder="Contoh: SK Organisasi, Formulir Pendaftaran..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Deskripsi Kategori (Opsional)
                </label>
                <textarea
                  name="deskripsi"
                  rows={3}
                  placeholder="Keterangan singkat kategori dokumen..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-black shadow-sm disabled:opacity-50"
                >
                  {isPending ? "Menyimpan..." : "Simpan Kategori"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Upload Modal */}
      {isFileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <i className="fa-solid fa-file-arrow-up text-emerald-600" />
                <span>Unggah Berkas Dokumen</span>
              </h3>
              <button onClick={() => setIsFileModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <i className="fa-solid fa-xmark text-lg" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleUploadFile} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Nama Dokumen / Judul *
                </label>
                <input
                  type="text"
                  name="nama_dokumen"
                  required
                  placeholder="Contoh: Formulir Pendaftaran Siswa 2026.pdf"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Pilih File Berkas (PDF, DOC, ZIP, dll) *
                </label>
                <input
                  type="file"
                  name="dokumen_file"
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-emerald-500 file:text-white file:font-bold hover:file:bg-emerald-600 transition-all"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFileModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-black shadow-sm disabled:opacity-50"
                >
                  {isPending ? "Mengunggah..." : "Unggah Berkas"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

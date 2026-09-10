"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { savePengumumanAction, deletePengumumanAction } from "@/lib/services/admin-crud";
import { formatIndonesianDate } from "@/lib/date";

interface PengumumanItem {
  id: number;
  judul: string;
  isi: string;
  lampiran?: string | null;
  created_at?: string;
}

export default function PengumumanManagerClient({ initialPengumuman }: { initialPengumuman: PengumumanItem[] }) {
  const [list, setList] = useState<PengumumanItem[]>(initialPengumuman);
  const [search, setSearch] = useState("");
  const [editingItem, setEditingItem] = useState<PengumumanItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");

  const filtered = list.filter((p) => p.judul.toLowerCase().includes(search.toLowerCase()));

  const handleOpenCreate = () => {
    setEditingItem(null);
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: PengumumanItem) => {
    setEditingItem(item);
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleDelete = (id: number, title: string) => {
    if (!confirm(`Hapus pengumuman "${title}"?`)) return;

    startTransition(async () => {
      const res = await deletePengumumanAction(id);
      if (res.success) {
        setList((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert("Gagal menghapus: " + res.error);
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await savePengumumanAction(formData);
      if (res.success) {
        setIsModalOpen(false);
        window.location.reload();
      } else {
        setErrorMsg(res.error || "Gagal menyimpan pengumuman");
      }
    });
  };

  return (
    <div className="space-y-5">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul pengumuman..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-medium"
          />
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-black text-xs sm:text-sm shadow-sm shadow-rose-500/25 hover:shadow transition-all shrink-0"
        >
          <i className="fa-solid fa-plus text-xs" />
          <span>Tambah Pengumuman</span>
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm border-t-4 border-t-rose-500">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-600 text-[11px] uppercase tracking-wider font-extrabold">
                <th className="py-3.5 px-5 font-bold">Judul Pengumuman</th>
                <th className="py-3.5 px-4 font-bold">Lampiran / Berkas</th>
                <th className="py-3.5 px-4 font-bold">Tanggal Rilis</th>
                <th className="py-3.5 px-5 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 font-medium">
                    <i className="fa-regular fa-bell text-3xl mb-2 block opacity-40" />
                    Tidak ada pengumuman ditemukan.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-rose-50/30 transition-colors">
                    <td className="py-4 px-5 max-w-md">
                      <div className="font-bold text-slate-900 line-clamp-1">{item.judul}</div>
                      <div className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">{item.isi}</div>
                    </td>
                    <td className="py-4 px-4">
                      {item.lampiran ? (
                        <a
                          href={item.lampiran}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold border border-blue-200 transition-colors"
                        >
                          <i className="fa-solid fa-paperclip text-[10px]" />
                          <span>Unduh Lampiran</span>
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Tidak ada lampiran</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-slate-500 text-xs font-medium">
                      {formatIndonesianDate(item.created_at)}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/pengumuman/${item.id}`}
                          target="_blank"
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                          title="Lihat Publik"
                        >
                          <i className="fa-solid fa-arrow-up-right-from-square text-xs" />
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200/60 transition-colors"
                          title="Edit Pengumuman"
                        >
                          <i className="fa-solid fa-pen-to-square text-xs" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.judul)}
                          disabled={isPending}
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/60 transition-colors"
                          title="Hapus Pengumuman"
                        >
                          <i className="fa-solid fa-trash-can text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center text-xs">
                  <i className="fa-solid fa-bullhorn" />
                </div>
                <span>{editingItem ? "Edit Pengumuman" : "Buat Pengumuman Baru"}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100">
                <i className="fa-solid fa-xmark text-lg" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex gap-2 items-center font-semibold">
                <i className="fa-solid fa-circle-exclamation text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {editingItem && <input type="hidden" name="id" value={editingItem.id} />}
              {editingItem?.lampiran && <input type="hidden" name="existing_lampiran" value={editingItem.lampiran} />}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Judul Pengumuman *
                </label>
                <input
                  type="text"
                  name="judul"
                  defaultValue={editingItem?.judul || ""}
                  required
                  placeholder="Contoh: Jadwal Ujian Kenaikan Tingkat Polos ke Jambon..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  File Lampiran / Dokumen PDF (Opsional)
                </label>
                <input
                  type="file"
                  name="lampiran_file"
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-rose-500 file:text-white file:font-bold hover:file:bg-rose-600 transition-all"
                />
                {editingItem?.lampiran && (
                  <p className="mt-1.5 text-[11px] text-slate-500">
                    Lampiran saat ini: <span className="font-mono text-slate-700 truncate">{editingItem.lampiran}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Isi Rincian Pengumuman *
                </label>
                <textarea
                  name="isi"
                  rows={6}
                  defaultValue={editingItem?.isi || ""}
                  required
                  placeholder="Tuliskan isi pengumuman secara rinci..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all leading-relaxed font-medium"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-black shadow-sm disabled:opacity-50 flex items-center gap-2 transition-all"
                >
                  {isPending && <i className="fa-solid fa-circle-notch fa-spin" />}
                  <span>{editingItem ? "Simpan Perubahan" : "Terbitkan Pengumuman"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

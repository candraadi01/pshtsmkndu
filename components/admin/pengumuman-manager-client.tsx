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
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-[#151d2a] p-4 rounded-2xl border border-gray-800">
        <div className="relative flex-1 max-w-sm">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul pengumuman..."
            className="w-full pl-9 pr-4 py-2 bg-[#0b0f17] border border-gray-700/80 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-xs sm:text-sm shadow-md transition-all"
        >
          <i className="fa-solid fa-plus text-xs" />
          <span>Tambah Pengumuman</span>
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-[#151d2a] rounded-3xl border border-gray-800 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-[#0f172a] text-gray-400 text-[11px] uppercase tracking-wider">
                <th className="p-4 font-semibold">Judul Pengumuman</th>
                <th className="p-4 font-semibold">Lampiran / Berkas</th>
                <th className="p-4 font-semibold">Tanggal Rilis</th>
                <th className="p-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    Tidak ada pengumuman ditemukan.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="p-4 max-w-md">
                      <div className="font-bold text-gray-200 line-clamp-1">{item.judul}</div>
                      <div className="text-xs text-gray-400 line-clamp-2 mt-0.5">{item.isi}</div>
                    </td>
                    <td className="p-4">
                      {item.lampiran ? (
                        <a
                          href={item.lampiran}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 hover:text-blue-300 text-xs border border-blue-500/20"
                        >
                          <i className="fa-solid fa-paperclip text-[10px]" />
                          <span>Unduh Lampiran</span>
                        </a>
                      ) : (
                        <span className="text-xs text-gray-500">- Tidak ada -</span>
                      )}
                    </td>
                    <td className="p-4 text-gray-400 text-xs">
                      {formatIndonesianDate(item.created_at)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/pengumuman/${item.id}`}
                          target="_blank"
                          className="p-2 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
                          title="Lihat Publik"
                        >
                          <i className="fa-solid fa-arrow-up-right-from-square text-xs" />
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors"
                          title="Edit"
                        >
                          <i className="fa-solid fa-pen-to-square text-xs" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.judul)}
                          disabled={isPending}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                          title="Hapus"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#1e293b] w-full max-w-xl rounded-3xl p-6 sm:p-8 border border-gray-700 shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-700/80 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-bullhorn text-amber-400" />
                <span>{editingItem ? "Edit Pengumuman" : "Buat Pengumuman Baru"}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white p-1">
                <i className="fa-solid fa-xmark text-lg" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-900/40 border border-red-500/50 text-red-200 text-xs rounded-xl flex gap-2 items-center">
                <i className="fa-solid fa-circle-exclamation" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {editingItem && <input type="hidden" name="id" value={editingItem.id} />}
              {editingItem?.lampiran && <input type="hidden" name="existing_lampiran" value={editingItem.lampiran} />}

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-300 mb-1">
                  Judul Pengumuman *
                </label>
                <input
                  type="text"
                  name="judul"
                  defaultValue={editingItem?.judul || ""}
                  required
                  placeholder="Contoh: Jadwal UKT Sabuk Hijau ke Putih..."
                  className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-300 mb-1">
                  Upload File Lampiran / Surat (Cloudinary)
                </label>
                <input
                  type="file"
                  name="lampiran_file"
                  className="w-full px-3.5 py-2 bg-[#0f172a] border border-gray-700 rounded-xl text-gray-300 text-xs file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-amber-500 file:text-gray-950 file:font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-300 mb-1">
                  Isi Lengkap Pengumuman *
                </label>
                <textarea
                  name="isi"
                  rows={6}
                  defaultValue={editingItem?.isi || ""}
                  required
                  placeholder="Tuliskan isi pengumuman atau instruksi di sini..."
                  className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700/80">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-gray-950 text-xs font-bold shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {isPending && <i className="fa-solid fa-circle-notch fa-spin" />}
                  <span>Simpan Pengumuman</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

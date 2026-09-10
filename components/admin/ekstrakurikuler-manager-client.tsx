"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { saveEkstrakurikulerAction, deleteEkstrakurikulerAction } from "@/lib/services/admin-crud";
import { resolveMediaUrl } from "@/lib/media";

interface EkskulItem {
  id: number;
  nama: string;
  deskripsi?: string | null;
  nama_pembina?: string | null;
  nama_ketua?: string | null;
  jadwal?: string | null;
  lokasi?: string | null;
  gambar?: string | null;
}

export default function EkstrakurikulerManagerClient({ initialItems }: { initialItems: EkskulItem[] }) {
  const [items, setItems] = useState<EkskulItem[]>(initialItems);
  const [editingItem, setEditingItem] = useState<EkskulItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");

  const handleOpenCreate = () => {
    setEditingItem(null);
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: EkskulItem) => {
    setEditingItem(item);
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleDelete = (id: number, nama: string) => {
    if (!confirm(`Hapus kegiatan ekstrakurikuler "${nama}"?`)) return;

    startTransition(async () => {
      const res = await deleteEkstrakurikulerAction(id);
      if (res.success) {
        setItems((prev) => prev.filter((i) => i.id !== id));
      } else {
        alert("Gagal menghapus: " + res.error);
      }
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await saveEkstrakurikulerAction(formData);
      if (res.success) {
        setIsModalOpen(false);
        window.location.reload();
      } else {
        setErrorMsg(res.error || "Gagal menyimpan");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900">Total {items.length} Ekstrakurikuler Aktif</h3>
          <p className="text-xs text-slate-500 font-medium">Kelola jadwal latihan, pembina, dan lokasi ekstrakurikuler silat</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-black text-xs sm:text-sm shadow-sm shadow-teal-500/25 hover:shadow transition-all shrink-0"
        >
          <i className="fa-solid fa-plus text-xs" />
          <span>Tambah Kegiatan Ekskul</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row gap-4 border-t-4 border-t-teal-500">
            <div className="w-24 h-24 rounded-2xl bg-slate-100 shrink-0 overflow-hidden relative border border-slate-200 shadow-2xs">
              <Image
                src={resolveMediaUrl(item.gambar)}
                alt={item.nama}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-base truncate">{item.nama}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">{item.deskripsi || "Tanpa deskripsi"}</p>
                <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600 font-medium">
                  {item.jadwal && (
                    <span className="flex items-center gap-1.5">
                      <i className="fa-regular fa-clock text-amber-500" />
                      <span>{item.jadwal}</span>
                    </span>
                  )}
                  {item.lokasi && (
                    <span className="flex items-center gap-1.5">
                      <i className="fa-solid fa-location-dot text-blue-500" />
                      <span>{item.lokasi}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200/60 text-xs font-bold transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id, item.nama)}
                  disabled={isPending}
                  className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/60 text-xs transition-colors"
                  title="Hapus"
                >
                  <i className="fa-solid fa-trash-can" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xl space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <i className="fa-solid fa-award text-teal-600" />
                <span>{editingItem ? "Edit Ekstrakurikuler" : "Tambah Ekstrakurikuler"}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <i className="fa-solid fa-xmark text-lg" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {editingItem && <input type="hidden" name="id" value={editingItem.id} />}
              {editingItem?.gambar && <input type="hidden" name="existing_gambar" value={editingItem.gambar} />}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Nama Ekstrakurikuler *
                </label>
                <input
                  type="text"
                  name="nama"
                  defaultValue={editingItem?.nama || ""}
                  required
                  placeholder="Contoh: Pencak Silat PSHT Rayon SMKN Darul Ulum"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Nama Pembina
                  </label>
                  <input
                    type="text"
                    name="nama_pembina"
                    defaultValue={editingItem?.nama_pembina || ""}
                    placeholder="Nama Pembina / Pelatih"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Nama Ketua / Koordinator
                  </label>
                  <input
                    type="text"
                    name="nama_ketua"
                    defaultValue={editingItem?.nama_ketua || ""}
                    placeholder="Nama Ketua Siswa"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Jadwal Latihan
                  </label>
                  <input
                    type="text"
                    name="jadwal"
                    defaultValue={editingItem?.jadwal || ""}
                    placeholder="Contoh: Setiap Jumat 15.00"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Lokasi Latihan
                  </label>
                  <input
                    type="text"
                    name="lokasi"
                    defaultValue={editingItem?.lokasi || ""}
                    placeholder="Contoh: Lapangan SMKNDU"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Foto Dokumentasi / Logo Ekskul
                </label>
                <input
                  type="file"
                  name="gambar_file"
                  accept="image/*"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:bg-teal-500 file:text-white file:font-bold hover:file:bg-teal-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Deskripsi Kegiatan
                </label>
                <textarea
                  name="deskripsi"
                  rows={3}
                  defaultValue={editingItem?.deskripsi || ""}
                  placeholder="Informasi singkat kegiatan silat..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white text-xs font-black shadow-sm disabled:opacity-50"
                >
                  {isPending ? "Menyimpan..." : "Simpan Kegiatan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

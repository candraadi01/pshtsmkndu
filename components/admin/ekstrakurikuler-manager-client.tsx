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
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-xs sm:text-sm shadow-md transition-all"
        >
          <i className="fa-solid fa-plus text-xs" />
          <span>Tambah Kegiatan Ekskul</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-[#151d2a] rounded-3xl border border-gray-800 p-6 shadow-md flex gap-4">
            <div className="w-24 h-24 rounded-2xl bg-gray-800 shrink-0 overflow-hidden relative border border-gray-700">
              <Image
                src={resolveMediaUrl(item.gambar)}
                alt={item.nama}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-white text-base truncate">{item.nama}</h3>
                <p className="text-xs text-gray-400 line-clamp-2 mt-1">{item.deskripsi || "Tanpa deskripsi"}</p>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-400">
                  {item.jadwal && <span><i className="fa-regular fa-clock mr-1 text-amber-400" />{item.jadwal}</span>}
                  {item.lokasi && <span><i className="fa-solid fa-location-dot mr-1 text-blue-400" />{item.lokasi}</span>}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-gray-800/60">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-xs font-semibold"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id, item.nama)}
                  disabled={isPending}
                  className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs"
                >
                  <i className="fa-solid fa-trash-can" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#1e293b] w-full max-w-xl rounded-3xl p-6 sm:p-8 border border-gray-700 shadow-2xl space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white">
              {editingItem ? "Edit Ekstrakurikuler" : "Tambah Ekstrakurikuler"}
            </h3>
            {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}
            <form onSubmit={handleSubmit} className="space-y-3">
              {editingItem && <input type="hidden" name="id" value={editingItem.id} />}
              {editingItem?.gambar && <input type="hidden" name="existing_gambar" value={editingItem.gambar} />}

              <div>
                <label className="block text-xs text-gray-300 font-semibold mb-1">Nama Kegiatan *</label>
                <input
                  type="text"
                  name="nama"
                  defaultValue={editingItem?.nama || ""}
                  required
                  placeholder="Contoh: Pencak Silat Prestasi..."
                  className="w-full px-3 py-2 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-300 font-semibold mb-1">Nama Pembina</label>
                  <input
                    type="text"
                    name="nama_pembina"
                    defaultValue={editingItem?.nama_pembina || ""}
                    className="w-full px-3 py-2 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-300 font-semibold mb-1">Nama Ketua</label>
                  <input
                    type="text"
                    name="nama_ketua"
                    defaultValue={editingItem?.nama_ketua || ""}
                    className="w-full px-3 py-2 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-300 font-semibold mb-1">Jadwal Latihan</label>
                  <input
                    type="text"
                    name="jadwal"
                    defaultValue={editingItem?.jadwal || ""}
                    placeholder="Contoh: Selasa & Jumat, 15.30"
                    className="w-full px-3 py-2 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-300 font-semibold mb-1">Lokasi Latihan</label>
                  <input
                    type="text"
                    name="lokasi"
                    defaultValue={editingItem?.lokasi || ""}
                    placeholder="Contoh: Lapangan Utama SMKN DU"
                    className="w-full px-3 py-2 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-300 font-semibold mb-1">Foto Sampul (Cloudinary)</label>
                <input
                  type="file"
                  name="gambar_file"
                  accept="image/*"
                  className="w-full px-3 py-2 bg-[#0f172a] border border-gray-700 rounded-xl text-gray-300 text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:bg-amber-500 file:text-gray-950"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-300 font-semibold mb-1">Deskripsi Kegiatan</label>
                <textarea
                  name="deskripsi"
                  rows={3}
                  defaultValue={editingItem?.deskripsi || ""}
                  className="w-full px-3 py-2 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
    </div>
  );
}

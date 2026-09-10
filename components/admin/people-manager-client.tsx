"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { savePersonAction, deletePersonAction } from "@/lib/services/admin-crud";
import { resolveMediaUrl } from "@/lib/media";

interface PersonItem {
  id: number;
  nama: string;
  tipe: "pelatih" | "warga" | "siswa";
  jabatan?: string | null;
  tingkat?: string | null;
  sabuk?: string | null;
  foto?: string | null;
  no_hp?: string | null;
  alamat?: string | null;
  jenis_kelamin?: string | null;
  urutan?: number | null;
}

export default function PeopleManagerClient({
  initialPeople,
  role,
  userRole,
}: {
  initialPeople: PersonItem[];
  role?: string;
  userRole?: string;
}) {
  const isSuperAdmin = (userRole || role || "super_admin") === "super_admin";
  const [people, setPeople] = useState<PersonItem[]>(initialPeople);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>(isSuperAdmin ? "all" : "siswa");
  const [editingPerson, setEditingPerson] = useState<PersonItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");

  const filtered = people.filter((p) => {
    const matchSearch = p.nama.toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === "all" || p.tipe === activeTab;
    return matchSearch && matchTab;
  });

  const handleOpenCreate = () => {
    setEditingPerson(null);
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (person: PersonItem) => {
    setEditingPerson(person);
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`Hapus data ${name}? Tindakan ini tidak dapat dibatalkan.`)) return;

    startTransition(async () => {
      const res = await deletePersonAction(id);
      if (res.success) {
        setPeople((prev) => prev.filter((p) => p.id !== id));
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
      const res = await savePersonAction(formData);
      if (res.success) {
        setIsModalOpen(false);
        window.location.reload();
      } else {
        setErrorMsg(res.error || "Gagal menyimpan data anggota");
      }
    });
  };

  const handleExportCSV = () => {
    const targetData = filtered;
    if (targetData.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }

    const headers = ["No", "Nama Lengkap", "Kategori", "Sabuk", "Jenis Kelamin", "No WhatsApp", "Alamat"];
    const rows = targetData.map((item, index) => [
      index + 1,
      `"${(item.nama || "").replace(/"/g, '""')}"`,
      `"${item.tipe === "siswa" ? "Siswa" : item.tipe === "pelatih" ? "Pelatih" : "Warga"}"`,
      `"${item.tipe === "siswa" ? (item.sabuk || "Polos") : "-"}"`,
      `"${item.jenis_kelamin === "L" ? "Laki-laki" : item.jenis_kelamin === "P" ? "Perempuan" : "-"}"`,
      `"${(item.no_hp || "-").replace(/"/g, '""')}"`,
      `"${(item.alamat || "-").replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    const categoryName = activeTab === "all" ? "anggota" : activeTab;
    link.href = url;
    link.download = `data-${categoryName}-psht-smkndu-${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getBadgeColor = (tipe: string) => {
    switch (tipe) {
      case "pelatih":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "warga":
        return "bg-amber-50 text-amber-800 border border-amber-200";
      case "siswa":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border border-slate-200";
    }
  };

  const getSabukBadge = (sabuk?: string | null) => {
    switch (sabuk?.toLowerCase().trim()) {
      case "polos":
        return "bg-slate-100 text-slate-700 border border-slate-300";
      case "jambon":
        return "bg-pink-50 text-pink-700 border border-pink-300";
      case "hijau":
        return "bg-emerald-50 text-emerald-700 border border-emerald-300";
      case "putih":
        return "bg-sky-50 text-sky-700 border border-sky-300";
      default:
        return "bg-slate-50 text-slate-500 border border-slate-200";
    }
  };

  return (
    <div className="space-y-5">
      {/* Tabs & Search Action Bar */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {isSuperAdmin ? (
            [
              { id: "all", label: "Semua Anggota" },
              { id: "pelatih", label: "Pelatih" },
              { id: "warga", label: "Warga" },
              { id: "siswa", label: "Siswa" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-extrabold">
              <i className="fa-solid fa-user-graduate" />
              <span>Daftar Siswa PSHT ({filtered.length})</span>
            </div>
          )}
        </div>

        <div className="flex gap-2.5 items-center">
          <div className="relative flex-1 md:w-64">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama anggota..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition-colors shrink-0"
            title="Ekspor CSV"
          >
            <i className="fa-solid fa-file-excel text-xs" />
            <span className="hidden sm:inline">Ekspor CSV</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-sm shadow-amber-500/25 hover:shadow transition-all shrink-0"
          >
            <i className="fa-solid fa-user-plus text-xs" />
            <span>Tambah</span>
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm border-t-4 border-t-indigo-500">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-600 text-[11px] uppercase tracking-wider font-extrabold">
                <th className="py-3.5 px-5 font-bold">Anggota</th>
                <th className="py-3.5 px-4 font-bold">Kategori</th>
                <th className="py-3.5 px-4 font-bold">Jabatan / Tingkat</th>
                <th className="py-3.5 px-4 font-bold">Kontak & Alamat</th>
                <th className="py-3.5 px-5 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                    <i className="fa-regular fa-users text-3xl mb-2 block opacity-40" />
                    Tidak ada data anggota ditemukan.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-slate-100 shrink-0 overflow-hidden relative border border-slate-200 flex items-center justify-center text-slate-400 shadow-2xs">
                          {item.foto ? (
                            <Image
                              src={resolveMediaUrl(item.foto)}
                              alt={item.nama}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <span className="font-black text-xs text-indigo-600">
                              {item.nama.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{item.nama}</span>
                            {item.jenis_kelamin && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                ({item.jenis_kelamin === "L" ? "L" : "P"})
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">ID: #{item.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${getBadgeColor(item.tipe)}`}>
                        {item.tipe}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        {item.jabatan && (
                          <div className="text-xs font-bold text-slate-800">{item.jabatan}</div>
                        )}
                        {item.tingkat && (
                          <div className="text-[11px] text-slate-500 font-medium">{item.tingkat}</div>
                        )}
                        {item.tipe === "siswa" && (
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold ${getSabukBadge(item.sabuk)}`}>
                            Sabuk {item.sabuk || "Polos"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-xs text-slate-700 font-medium">
                        {item.no_hp ? (
                          <span className="flex items-center gap-1 text-slate-600">
                            <i className="fa-brands fa-whatsapp text-emerald-600 text-xs" />
                            <span>{item.no_hp}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                        <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                          {item.alamat || "Alamat belum diisi"}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200/60 transition-colors"
                          title="Edit"
                        >
                          <i className="fa-solid fa-pen-to-square text-xs" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.nama)}
                          disabled={isPending}
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/60 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xl space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <i className="fa-solid fa-user-gear text-indigo-600" />
                <span>{editingPerson ? "Edit Data Anggota" : "Tambah Anggota Baru"}</span>
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
              {editingPerson && <input type="hidden" name="id" value={editingPerson.id} />}
              {editingPerson?.foto && <input type="hidden" name="existing_foto" value={editingPerson.foto} />}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  name="nama"
                  defaultValue={editingPerson?.nama || ""}
                  required
                  placeholder="Contoh: Mas Budi Santoso"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Kategori *
                  </label>
                  <select
                    name="tipe"
                    defaultValue={editingPerson?.tipe || (isSuperAdmin ? "siswa" : "siswa")}
                    disabled={!isSuperAdmin}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium disabled:opacity-60"
                  >
                    {isSuperAdmin && <option value="pelatih">Pelatih</option>}
                    {isSuperAdmin && <option value="warga">Warga</option>}
                    <option value="siswa">Siswa</option>
                  </select>
                  {!isSuperAdmin && <input type="hidden" name="tipe" value="siswa" />}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    name="jenis_kelamin"
                    defaultValue={editingPerson?.jenis_kelamin || "L"}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Field: Siswa (Sabuk) vs Pelatih/Warga (Jabatan/Tingkat) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Sabuk (Khusus Siswa)
                  </label>
                  <select
                    name="sabuk"
                    defaultValue={editingPerson?.sabuk || "Polos"}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                  >
                    <option value="Polos">Polos (Hitam)</option>
                    <option value="Jambon">Jambon (Merah Muda)</option>
                    <option value="Hijau">Hijau</option>
                    <option value="Putih">Putih Kecil</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Jabatan (Pelatih/Warga)
                  </label>
                  <input
                    type="text"
                    name="jabatan"
                    defaultValue={editingPerson?.jabatan || ""}
                    placeholder="Contoh: Ketua Rayon, Pelatih Utama"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    No WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    name="no_hp"
                    defaultValue={editingPerson?.no_hp || ""}
                    placeholder="Contoh: 08123456789"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Foto Profil
                  </label>
                  <input
                    type="file"
                    name="foto_file"
                    accept="image/*"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-500 file:text-white file:font-bold hover:file:bg-indigo-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Alamat Lengkap
                </label>
                <textarea
                  name="alamat"
                  rows={2}
                  defaultValue={editingPerson?.alamat || ""}
                  placeholder="Contoh: Dusun Krajan, Desa Kedungrejo, Muncar..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
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
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white text-xs font-black shadow-sm disabled:opacity-50"
                >
                  {isPending ? "Menyimpan..." : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

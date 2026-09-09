"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { savePersonAction, deletePersonAction } from "@/lib/services/admin-crud";
import { resolveMediaUrl } from "@/lib/media";

interface PersonItem {
  id: number;
  nama: string;
  tipe: "pelatih" | "warga" | "siswa" | string;
  sabuk?: string | null;
  jenis_kelamin?: string | null;
  alamat?: string | null;
  no_hp?: string | null;
  foto?: string | null;
}

export default function PeopleManagerClient({
  initialPeople,
  userRole = "admin",
}: {
  initialPeople: PersonItem[];
  userRole?: string;
}) {
  const isSuperAdmin = userRole === "super_admin";
  const [people, setPeople] = useState<PersonItem[]>(initialPeople);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>(isSuperAdmin ? "all" : "siswa");
  const [formTipe, setFormTipe] = useState<string>("siswa");
  const [editingPerson, setEditingPerson] = useState<PersonItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");

  const filtered = people.filter((p) => {
    // Admin biasa hanya bisa melihat dan mencari siswa
    if (!isSuperAdmin && p.tipe !== "siswa") return false;
    const matchSearch = p.nama.toLowerCase().includes(search.toLowerCase());
    const matchTab = isSuperAdmin ? (activeTab === "all" || p.tipe === activeTab) : p.tipe === "siswa";
    return matchSearch && matchTab;
  });

  const handleOpenCreate = () => {
    setEditingPerson(null);
    setFormTipe(isSuperAdmin && activeTab !== "all" ? activeTab : "siswa");
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (person: PersonItem) => {
    setEditingPerson(person);
    setFormTipe(person.tipe);
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleDelete = (id: number, nama: string) => {
    if (!confirm(`Hapus data anggota "${nama}"?`)) return;

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
        return "bg-amber-500/10 text-amber-400 border border-amber-500/30";
      case "warga":
        return "bg-purple-500/10 text-purple-400 border border-purple-500/30";
      case "siswa":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/30";
      default:
        return "bg-gray-800 text-gray-300";
    }
  };

  const getSabukBadge = (sabuk?: string | null) => {
    switch (sabuk?.toLowerCase().trim()) {
      case "polos":
        return "bg-gray-800 text-gray-200 border border-gray-600";
      case "jambon":
        return "bg-pink-500/20 text-pink-300 border border-pink-500/40";
      case "hijau":
        return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40";
      case "putih":
        return "bg-sky-500/20 text-sky-200 border border-sky-400/50";
      default:
        return "bg-gray-800 text-gray-400 border border-gray-700";
    }
  };

  return (
    <div className="space-y-4">
      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center bg-[#151d2a] p-4 rounded-2xl border border-gray-800">
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
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-amber-500 text-gray-950 font-bold shadow-sm"
                    : "bg-gray-800/80 text-gray-300 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold">
              <i className="fa-solid fa-user-graduate" />
              <span>Daftar Siswa PSHT ({filtered.length})</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 items-center">
          <div className="relative flex-1 md:w-64">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isSuperAdmin ? "Cari nama anggota..." : "Cari nama siswa..."}
              className="w-full pl-9 pr-4 py-2 bg-[#0b0f17] border border-gray-700/80 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all shrink-0"
            title="Ekspor data siswa / anggota ke Excel / CSV"
          >
            <i className="fa-solid fa-file-excel text-sm text-emerald-100" />
            <span className="hidden sm:inline">Export Excel</span>
            <span className="sm:hidden">Export</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-xs sm:text-sm shadow-md transition-all shrink-0"
          >
            <i className="fa-solid fa-user-plus text-xs" />
            <span>{isSuperAdmin ? "Tambah Anggota" : "Tambah Siswa"}</span>
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-[#151d2a] rounded-3xl border border-gray-800 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-[#0f172a] text-gray-400 text-[11px] uppercase tracking-wider">
                <th className="p-4 font-semibold">Nama & Foto</th>
                <th className="p-4 font-semibold">Kategori</th>
                <th className="p-4 font-semibold">Gender</th>
                <th className="p-4 font-semibold">No. HP</th>
                <th className="p-4 font-semibold">Alamat</th>
                <th className="p-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Tidak ada anggota ditemukan.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-800 shrink-0 overflow-hidden relative border border-gray-700">
                          <Image
                            src={resolveMediaUrl(item.foto)}
                            alt={item.nama}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="font-bold text-gray-200">{item.nama}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold capitalize ${getBadgeColor(item.tipe)}`}>
                          {item.tipe}
                        </span>
                        {item.tipe === "siswa" && (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${getSabukBadge(item.sabuk)}`}>
                            Sabuk {item.sabuk || "Polos"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">
                      {item.jenis_kelamin === "L" ? "Laki-laki" : item.jenis_kelamin === "P" ? "Perempuan" : "-"}
                    </td>
                    <td className="p-4 text-gray-400 font-mono text-xs">
                      {item.no_hp || "-"}
                    </td>
                    <td className="p-4 text-gray-400 text-xs max-w-xs truncate">
                      {item.alamat || "-"}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors"
                          title="Edit"
                        >
                          <i className="fa-solid fa-pen-to-square text-xs" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.nama)}
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
                <i className={`fa-solid ${isSuperAdmin ? "fa-user-shield" : "fa-user-graduate"} text-amber-400`} />
                <span>
                  {editingPerson
                    ? isSuperAdmin ? "Edit Anggota" : "Edit Data Siswa"
                    : isSuperAdmin ? "Tambah Anggota Baru" : "Tambah Siswa Baru"}
                </span>
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
              {editingPerson && <input type="hidden" name="id" value={editingPerson.id} />}
              {editingPerson?.foto && <input type="hidden" name="existing_foto" value={editingPerson.foto} />}

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-300 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  name="nama"
                  defaultValue={editingPerson?.nama || ""}
                  required
                  placeholder={isSuperAdmin ? "Contoh: Mas Budi Santoso..." : "Contoh: Siswa Ahmad Fauzi..."}
                  className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {isSuperAdmin ? (
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-300 mb-1">
                      Kategori Keanggotaan *
                    </label>
                    <select
                      name="tipe"
                      value={formTipe}
                      onChange={(e) => setFormTipe(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                    >
                      <option value="pelatih">Pelatih</option>
                      <option value="warga">Warga</option>
                      <option value="siswa">Siswa</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-300 mb-1">
                      Kategori Keanggotaan
                    </label>
                    <input type="hidden" name="tipe" value="siswa" />
                    <div className="px-3.5 py-2.5 bg-[#0b0f17] border border-blue-500/40 rounded-xl text-blue-400 font-semibold text-sm flex items-center gap-2">
                      <i className="fa-solid fa-user-graduate text-xs" />
                      <span>Siswa (Terkunci)</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-300 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    name="jenis_kelamin"
                    defaultValue={editingPerson?.jenis_kelamin || "L"}
                    className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              {/* Kategori Sabuk (Khusus Siswa) */}
              {(formTipe === "siswa" || !isSuperAdmin) && (
                <div className="p-3.5 rounded-2xl bg-[#0d1525] border border-amber-500/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <i className="fa-solid fa-award text-xs" />
                      <span>Kategori / Tingkatan Sabuk Siswa *</span>
                    </label>
                    <span className="text-[10px] text-gray-400 font-medium">PSHT SMKN Darul Ulum</span>
                  </div>
                  <select
                    name="sabuk"
                    defaultValue={editingPerson?.sabuk || "Polos"}
                    required
                    className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-amber-500/50 rounded-xl text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  >
                    <option value="Polos">🥋 Sabuk Polos (Hitam / Siswa Pemula)</option>
                    <option value="Jambon">🥋 Sabuk Jambon (Merah Muda)</option>
                    <option value="Hijau">🥋 Sabuk Hijau</option>
                    <option value="Putih">🥋 Sabuk Putih (Putih Kecil / Pra-Warga)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-300 mb-1">
                  Nomor WhatsApp / HP
                </label>
                <input
                  type="text"
                  name="no_hp"
                  defaultValue={editingPerson?.no_hp || ""}
                  placeholder="Contoh: 08123456789"
                  className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-300 mb-1">
                  Alamat Asal
                </label>
                <input
                  type="text"
                  name="alamat"
                  defaultValue={editingPerson?.alamat || ""}
                  placeholder="Contoh: Wringinputih, Muncar"
                  className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-300 mb-1">
                  Foto Profil (Cloudinary Upload)
                </label>
                <input
                  type="file"
                  name="foto_file"
                  accept="image/*"
                  className="w-full px-3.5 py-2 bg-[#0f172a] border border-gray-700 rounded-xl text-gray-300 text-xs file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-amber-500 file:text-gray-950 file:font-semibold"
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
                  <span>Simpan Anggota</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

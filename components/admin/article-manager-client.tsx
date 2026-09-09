"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { saveArticleAction, deleteArticleAction } from "@/lib/services/admin-crud";
import { formatIndonesianDate } from "@/lib/date";
import { resolveMediaUrl } from "@/lib/media";

interface ArticleItem {
  id: number;
  judul: string;
  slug: string;
  kategori?: string;
  status: string;
  isi: string;
  gambar?: string | null;
  view_count?: number;
  created_at?: string;
}

export default function ArticleManagerClient({ initialArticles }: { initialArticles: ArticleItem[] }) {
  const [articles, setArticles] = useState<ArticleItem[]>(initialArticles);
  const [search, setSearch] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("all");
  const [editingArticle, setEditingArticle] = useState<ArticleItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");

  const filtered = articles.filter((a) => {
    const matchSearch = a.judul.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedKategori === "all" || (a.kategori || "Umum") === selectedKategori;
    return matchSearch && matchCat;
  });

  const handleOpenCreate = () => {
    setEditingArticle(null);
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (article: ArticleItem) => {
    setEditingArticle(article);
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleDelete = (id: number, title: string) => {
    if (!confirm(`Hapus artikel "${title}"? Tindakan ini tidak dapat dibatalkan.`)) return;

    startTransition(async () => {
      const res = await deleteArticleAction(id);
      if (res.success) {
        setArticles((prev) => prev.filter((a) => a.id !== id));
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
      const res = await saveArticleAction(formData);
      if (res.success) {
        setIsModalOpen(false);
        window.location.reload();
      } else {
        setErrorMsg(res.error || "Gagal menyimpan artikel");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-[#151d2a] p-4 rounded-2xl border border-gray-800">
        <div className="flex flex-1 gap-2 items-center">
          <div className="relative flex-1 max-w-sm">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul artikel..."
              className="w-full pl-9 pr-4 py-2 bg-[#0b0f17] border border-gray-700/80 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={selectedKategori}
            onChange={(e) => setSelectedKategori(e.target.value)}
            className="bg-[#0b0f17] border border-gray-700/80 text-gray-300 text-xs sm:text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Semua Kategori</option>
            <option value="Umum">Umum</option>
            <option value="Prestasi">Prestasi</option>
            <option value="Kegiatan">Kegiatan</option>
            <option value="Materi">Materi</option>
          </select>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-xs sm:text-sm shadow-md transition-all"
        >
          <i className="fa-solid fa-plus text-xs" />
          <span>Tambah Artikel</span>
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-[#151d2a] rounded-3xl border border-gray-800 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-[#0f172a] text-gray-400 text-[11px] uppercase tracking-wider">
                <th className="p-4 font-semibold">Artikel</th>
                <th className="p-4 font-semibold">Kategori</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-center">Penonton</th>
                <th className="p-4 font-semibold">Tanggal</th>
                <th className="p-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Tidak ada artikel yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="p-4 max-w-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-800 shrink-0 overflow-hidden relative border border-gray-700">
                          <Image
                            src={resolveMediaUrl(item.gambar)}
                            alt={item.judul}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-gray-200 line-clamp-1">{item.judul}</div>
                          <div className="text-[11px] text-gray-500 font-mono line-clamp-1">/{item.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">
                      <span className="px-2.5 py-1 rounded-md bg-gray-800 text-xs">
                        {item.kategori || "Umum"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                        item.status === "published"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      }`}>
                        {item.status === "published" ? "Publik" : "Draft"}
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold text-amber-400">
                      <i className="fa-solid fa-eye text-xs mr-1 opacity-70" />
                      {(item.view_count || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="p-4 text-gray-400 text-xs">
                      {formatIndonesianDate(item.created_at)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/artikel/${item.slug}`}
                          target="_blank"
                          className="p-2 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
                          title="Pratinjau Publik"
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#1e293b] w-full max-w-2xl rounded-3xl p-6 sm:p-8 border border-gray-700 shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-700/80 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-newspaper text-amber-400" />
                <span>{editingArticle ? "Edit Artikel" : "Tambah Artikel Baru"}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white p-1"
              >
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
              {editingArticle && <input type="hidden" name="id" value={editingArticle.id} />}
              {editingArticle?.gambar && <input type="hidden" name="existing_gambar" value={editingArticle.gambar} />}

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-300 mb-1">
                  Judul Artikel *
                </label>
                <input
                  type="text"
                  name="judul"
                  defaultValue={editingArticle?.judul || ""}
                  required
                  placeholder="Contoh: Kejurnas Silat Madiun 2026..."
                  className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-300 mb-1">
                    Kategori
                  </label>
                  <select
                    name="kategori"
                    defaultValue={editingArticle?.kategori || "Umum"}
                    className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="Umum">Umum</option>
                    <option value="Prestasi">Prestasi</option>
                    <option value="Kegiatan">Kegiatan</option>
                    <option value="Materi">Materi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-300 mb-1">
                    Status Publikasi
                  </label>
                  <select
                    name="status"
                    defaultValue={editingArticle?.status || "published"}
                    className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="published">Publikasikan Langsung</option>
                    <option value="draft">Simpan sebagai Draf</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-300 mb-1">
                  Foto Sampul (Cloudinary Upload)
                </label>
                <input
                  type="file"
                  name="gambar_file"
                  accept="image/*"
                  className="w-full px-3.5 py-2 bg-[#0f172a] border border-gray-700 rounded-xl text-gray-300 text-xs file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-amber-500 file:text-gray-950 file:font-semibold"
                />
                {editingArticle?.gambar && (
                  <p className="mt-1 text-[11px] text-gray-400">
                    Saat ini: <span className="font-mono text-gray-300 truncate">{editingArticle.gambar}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-300 mb-1">
                  Isi Konten Artikel *
                </label>
                <textarea
                  name="isi"
                  rows={8}
                  defaultValue={editingArticle?.isi || ""}
                  required
                  placeholder="Tuliskan berita lengkap di sini..."
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
                  <span>{editingArticle ? "Simpan Perubahan" : "Publikasikan Artikel"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

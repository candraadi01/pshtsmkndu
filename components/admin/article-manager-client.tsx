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
    <div className="space-y-5">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm">
        <div className="flex flex-1 flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
          <div className="relative flex-1 max-w-md">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul artikel..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
            />
          </div>

          <select
            value={selectedKategori}
            onChange={(e) => setSelectedKategori(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
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
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-sm shadow-amber-500/25 hover:shadow transition-all shrink-0"
        >
          <i className="fa-solid fa-plus text-xs" />
          <span>Tambah Artikel</span>
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm border-t-4 border-t-amber-500">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-600 text-[11px] uppercase tracking-wider font-extrabold">
                <th className="py-3.5 px-5 font-bold">Artikel</th>
                <th className="py-3.5 px-4 font-bold">Kategori</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold text-center">Penonton</th>
                <th className="py-3.5 px-4 font-bold">Tanggal</th>
                <th className="py-3.5 px-5 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    <i className="fa-regular fa-newspaper text-3xl mb-2 block opacity-40" />
                    Tidak ada artikel yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="py-4 px-5 max-w-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 shrink-0 overflow-hidden relative border border-slate-200 shadow-2xs">
                          <Image
                            src={resolveMediaUrl(item.gambar)}
                            alt={item.judul}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-900 line-clamp-1">{item.judul}</div>
                          <div className="text-[11px] text-slate-400 font-mono line-clamp-1 mt-0.5">/{item.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200/80 text-[11px] font-bold text-slate-700">
                        {item.kategori || "Umum"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${
                          item.status === "published"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        {item.status === "published" ? "Publik" : "Draf"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center font-black text-amber-600">
                      <span className="inline-flex items-center gap-1">
                        <i className="fa-solid fa-eye text-xs text-amber-500 opacity-80" />
                        <span>{(item.view_count || 0).toLocaleString("id-ID")}</span>
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-500 text-xs font-medium">
                      {formatIndonesianDate(item.created_at)}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/artikel/${item.slug}`}
                          target="_blank"
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                          title="Pratinjau Publik"
                        >
                          <i className="fa-solid fa-arrow-up-right-from-square text-xs" />
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200/60 transition-colors"
                          title="Edit Artikel"
                        >
                          <i className="fa-solid fa-pen-to-square text-xs" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.judul)}
                          disabled={isPending}
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/60 transition-colors"
                          title="Hapus Artikel"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center text-xs">
                  <i className="fa-solid fa-newspaper" />
                </div>
                <span>{editingArticle ? "Edit Artikel" : "Tambah Artikel Baru"}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
              >
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
              {editingArticle && <input type="hidden" name="id" value={editingArticle.id} />}
              {editingArticle?.gambar && <input type="hidden" name="existing_gambar" value={editingArticle.gambar} />}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Judul Artikel *
                </label>
                <input
                  type="text"
                  name="judul"
                  defaultValue={editingArticle?.judul || ""}
                  required
                  placeholder="Contoh: Kejurnas Silat Madiun 2026..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Kategori
                  </label>
                  <select
                    name="kategori"
                    defaultValue={editingArticle?.kategori || "Umum"}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                  >
                    <option value="Umum">Umum</option>
                    <option value="Prestasi">Prestasi</option>
                    <option value="Kegiatan">Kegiatan</option>
                    <option value="Materi">Materi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Status Publikasi
                  </label>
                  <select
                    name="status"
                    defaultValue={editingArticle?.status || "published"}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                  >
                    <option value="published">Publikasikan Langsung</option>
                    <option value="draft">Simpan sebagai Draf</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Foto Sampul (Cloudinary Upload)
                </label>
                <input
                  type="file"
                  name="gambar_file"
                  accept="image/*"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-amber-500 file:text-slate-950 file:font-bold hover:file:bg-amber-600 transition-all"
                />
                {editingArticle?.gambar && (
                  <p className="mt-1.5 text-[11px] text-slate-500">
                    Foto saat ini: <span className="font-mono text-slate-700 truncate">{editingArticle.gambar}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Isi Konten Artikel *
                </label>
                <textarea
                  name="isi"
                  rows={8}
                  defaultValue={editingArticle?.isi || ""}
                  required
                  placeholder="Tuliskan berita lengkap di sini..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all leading-relaxed font-medium"
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
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 text-xs font-black shadow-sm disabled:opacity-50 flex items-center gap-2 transition-all"
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

"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import { savePageSettingsAction } from "@/lib/services/admin-crud";
import { resolveMediaUrl, formatVideoEmbedUrl } from "@/lib/media";
import type { SiteExtendedSettings } from "@/lib/services/site-settings";

interface PageSettingsData {
  id?: number;
  logo?: string | null;
  judul_hero?: string | null;
  deskripsi_hero?: string | null;
  gambar_hero?: string | null;
  gambar_hero1?: string | null;
  gambar_hero2?: string | null;
  gambar_hero3?: string | null;
  judul_sejarah?: string | null;
  deskripsi_sejarah?: string | null;
  gambar_sejarah?: string | null;
  gambar_sejarah1?: string | null;
  gambar_sejarah2?: string | null;
  gambar_sejarah3?: string | null;
  visi?: string | null;
  misi?: string | null;
  syarat_pendaftaran?: string | null;
  judul_video?: string | null;
  deskripsi_video?: string | null;
  url_video?: string | null;
  url_video1?: string | null;
  url_video2?: string | null;
}

interface ImageSlotProps {
  slotNumber: number;
  title: string;
  namePrefix: string;
  initialUrl?: string | null;
  isPrimary?: boolean;
  disabled?: boolean;
}

function UniversalImageSlot({
  slotNumber,
  title,
  namePrefix,
  initialUrl,
  isPrimary,
  disabled,
}: ImageSlotProps) {
  const [preview, setPreview] = useState<string | null>(initialUrl || null);
  const [isRemoved, setIsRemoved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("Ukuran foto terlalu besar (maksimal 10MB per foto). Mohon pilih file yang lebih kecil.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      setIsRemoved(false);
    }
  };

  const handleRemove = () => {
    setIsRemoved(true);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRestore = () => {
    setIsRemoved(false);
    setPreview(initialUrl || null);
  };

  return (
    <div
      className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
        isRemoved
          ? "border-rose-200 bg-rose-50/50"
          : "border-slate-200 bg-slate-50/80 hover:border-slate-300"
      }`}
    >
      <input type="hidden" name={`existing_${namePrefix}`} value={initialUrl || ""} />
      <input type="hidden" name={`remove_${namePrefix}`} value={isRemoved ? "true" : "false"} />

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <i className="fa-solid fa-image text-amber-500 text-xs" />
            <span>{title}</span>
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isPrimary
                ? "bg-amber-100 text-amber-800 border border-amber-200"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {isPrimary ? "Slide 1 (Utama)" : `Slide ${slotNumber}`}
          </span>
        </div>

        {/* Thumbnail Preview */}
        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 mb-2 flex items-center justify-center shadow-2xs">
          {isRemoved ? (
            <div className="text-center p-2 text-rose-500 text-xs font-medium">
              <i className="fa-solid fa-trash-can text-lg block mb-1" />
              <span>Foto Dihapus</span>
            </div>
          ) : preview ? (
            <Image
              src={resolveMediaUrl(preview)}
              alt={title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="text-center p-2 text-slate-400 text-xs font-medium">
              <i className="fa-solid fa-cloud-arrow-up text-lg block mb-1 opacity-50" />
              <span>Belum ada foto</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2 mt-1">
        {!disabled && (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              name={`${namePrefix}_file`}
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:bg-slate-200 file:text-slate-800 file:font-bold hover:file:bg-slate-300 transition-all"
            />
          </div>
        )}

        {!disabled && (preview || isRemoved) && (
          <div className="flex justify-end pt-1">
            {isRemoved ? (
              <button
                type="button"
                onClick={handleRestore}
                className="text-[11px] font-bold text-amber-700 hover:underline flex items-center gap-1"
              >
                <i className="fa-solid fa-rotate-left" />
                <span>Batal Hapus</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRemove}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                <i className="fa-solid fa-trash" />
                <span>Hapus Foto Ini</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SettingsManagerClient({
  initialSettings,
  initialExtendedSettings,
  isSuperAdmin,
}: {
  initialSettings: PageSettingsData | null;
  initialExtendedSettings?: SiteExtendedSettings | null;
  isSuperAdmin: boolean;
}) {
  const [settings] = useState<PageSettingsData | null>(initialSettings);
  const [extSettings] = useState<SiteExtendedSettings | null>(initialExtendedSettings || null);
  const [logoPreview, setLogoPreview] = useState<string | null>(settings?.logo || null);
  const [videoUrl, setVideoUrl] = useState(settings?.url_video || "");
  const [mapsEmbedUrl, setMapsEmbedUrl] = useState(extSettings?.maps_embed_url || "");
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState({ text: "", isError: false });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file logo maksimal 5MB.");
        e.target.value = "";
        return;
      }
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg({ text: "", isError: false });
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await savePageSettingsAction(formData);
      if (res.success) {
        setMsg({ text: "Seluruh pengaturan website berhasil disimpan!", isError: false });
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setMsg({ text: res.error || "Gagal menyimpan pengaturan", isError: true });
      }
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm border-t-4 border-t-blue-500">
      {msg.text && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm mb-6 flex items-center gap-2.5 font-bold ${
            msg.isError
              ? "bg-rose-50 border border-rose-200 text-rose-700"
              : "bg-emerald-50 border border-emerald-200 text-emerald-700"
          }`}
        >
          <i className={`fa-solid ${msg.isError ? "fa-circle-exclamation text-rose-600" : "fa-circle-check text-emerald-600"}`} />
          <span>{msg.text}</span>
        </div>
      )}

      {!isSuperAdmin && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-2xl mb-6 font-semibold">
          <i className="fa-solid fa-circle-info mr-1.5 text-amber-600" />
          Hanya <strong>Super Admin</strong> yang memiliki otoritas mengubah konfigurasi inti website.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <input type="hidden" name="existing_logo" value={settings?.logo || ""} />

        {/* 1. Logo Section */}
        <div className="border-b border-slate-100 pb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Logo Utama Website
          </label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 p-2 flex items-center justify-center shrink-0 shadow-2xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveMediaUrl(logoPreview || "/sh-emblem.png")}
                alt="Logo Preview"
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/sh-emblem.png";
                }}
              />
            </div>
            <div className="flex-1">
              <input
                type="file"
                name="logo_file"
                accept="image/*"
                disabled={!isSuperAdmin}
                onChange={handleLogoChange}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-amber-500 file:text-slate-950 file:font-bold hover:file:bg-amber-600 disabled:opacity-50 transition-all"
              />
              <p className="mt-1.5 text-[11px] text-slate-500">
                Pilih file logo baru (PNG transparan disarankan) untuk mengganti logo di header dan footer.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Banner Hero Section */}
        <div className="space-y-5 border-b border-slate-100 pb-6">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <i className="fa-solid fa-panorama text-amber-500" />
              <span>Banner Hero Utama & Slide Foto Beranda</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Atur teks sambutan utama dan 4 foto latar belakang slide banner atas beranda.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Judul Sambutan Hero
              </label>
              <input
                type="text"
                name="judul_hero"
                defaultValue={settings?.judul_hero || "Persaudaraan Setia Hati Terate"}
                disabled={!isSuperAdmin}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-50 transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Deskripsi Singkat / Slogan Hero
              </label>
              <input
                type="text"
                name="deskripsi_hero"
                defaultValue={
                  settings?.deskripsi_hero ||
                  "Sub Rayon SMKN Darul Ulum Muncar, Cabang Banyuwangi - Pusat Informasi & Prestasi Pencak Silat."
                }
                disabled={!isSuperAdmin}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-50 transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Foto-Foto Slide Banner Hero (Maksimal 4 Foto)
              </label>
              <span className="text-[11px] text-slate-500">
                Slider otomatis & panah navigasi di beranda
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <UniversalImageSlot
                slotNumber={1}
                title="Slide Hero 1"
                namePrefix="gambar_hero"
                initialUrl={settings?.gambar_hero}
                isPrimary
                disabled={!isSuperAdmin}
              />
              <UniversalImageSlot
                slotNumber={2}
                title="Slide Hero 2"
                namePrefix="gambar_hero1"
                initialUrl={settings?.gambar_hero1}
                disabled={!isSuperAdmin}
              />
              <UniversalImageSlot
                slotNumber={3}
                title="Slide Hero 3"
                namePrefix="gambar_hero2"
                initialUrl={settings?.gambar_hero2}
                disabled={!isSuperAdmin}
              />
              <UniversalImageSlot
                slotNumber={4}
                title="Slide Hero 4"
                namePrefix="gambar_hero3"
                initialUrl={settings?.gambar_hero3}
                disabled={!isSuperAdmin}
              />
            </div>
          </div>
        </div>

        {/* 3. Profil Sejarah Organisasi Section */}
        <div className="space-y-5 border-b border-slate-100 pb-6">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <i className="fa-solid fa-landmark text-amber-500" />
              <span>Profil Sejarah Organisasi (Beranda)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola judul, naskah deskripsi sejarah, serta foto-foto slide galeri sejarah yang tampil di tab Beranda website.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Judul Bagian Sejarah
            </label>
            <input
              type="text"
              name="judul_sejarah"
              defaultValue={settings?.judul_sejarah || "Sejarah Organisasi"}
              disabled={!isSuperAdmin}
              placeholder="Contoh: Sejarah Organisasi"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-50 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Deskripsi / Naskah Sejarah
            </label>
            <textarea
              name="deskripsi_sejarah"
              rows={4}
              defaultValue={
                settings?.deskripsi_sejarah ||
                "Persaudaraan Setia Hati Terate menjadi ruang untuk membentuk pribadi yang berbudi luhur, tahu benar dan salah, serta menjaga persaudaraan di lingkungan SMKN Darul Ulum Muncar."
              }
              disabled={!isSuperAdmin}
              placeholder="Tuliskan ringkasan naskah sejarah di sini..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-50 leading-relaxed transition-all font-medium"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Foto-Foto Slide Sejarah (Maksimal 4 Foto)
              </label>
              <span className="text-[11px] text-slate-500">
                Carousel slide foto di samping naskah sejarah
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <UniversalImageSlot
                slotNumber={1}
                title="Foto Sejarah 1"
                namePrefix="gambar_sejarah"
                initialUrl={settings?.gambar_sejarah}
                isPrimary
                disabled={!isSuperAdmin}
              />
              <UniversalImageSlot
                slotNumber={2}
                title="Foto Sejarah 2"
                namePrefix="gambar_sejarah1"
                initialUrl={settings?.gambar_sejarah1}
                disabled={!isSuperAdmin}
              />
              <UniversalImageSlot
                slotNumber={3}
                title="Foto Sejarah 3"
                namePrefix="gambar_sejarah2"
                initialUrl={settings?.gambar_sejarah2}
                disabled={!isSuperAdmin}
              />
              <UniversalImageSlot
                slotNumber={4}
                title="Foto Sejarah 4"
                namePrefix="gambar_sejarah3"
                initialUrl={settings?.gambar_sejarah3}
                disabled={!isSuperAdmin}
              />
            </div>
          </div>
        </div>

        {/* 4. Visi & Misi Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-slate-100 pb-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Visi Organisasi</label>
            <textarea
              name="visi"
              rows={4}
              defaultValue={settings?.visi || "Membentuk manusia berbudi pekerti luhur tahu benar dan salah."}
              disabled={!isSuperAdmin}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-50 transition-all font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Misi Organisasi</label>
            <textarea
              name="misi"
              rows={4}
              defaultValue={settings?.misi || "Melestarikan budaya bangsa melalui seni beladiri pencak silat persaudaraan."}
              disabled={!isSuperAdmin}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-50 transition-all font-medium"
            />
          </div>
        </div>

        {/* 5. Kontak & Media Sosial Section */}
        <div className="space-y-5 border-b border-slate-100 pb-6">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <i className="fa-solid fa-share-nodes text-blue-600" />
              <span>Media Sosial & Kontak Resmi Website</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Mengatur tombol melayang (floating icon WhatsApp, Instagram, TikTok) di sebelah kanan beranda, footer, dan halaman kontak.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                <i className="fa-brands fa-whatsapp text-emerald-600" />
                <span>Nomor / Link WhatsApp</span>
              </label>
              <input
                type="text"
                name="whatsapp"
                defaultValue={extSettings?.whatsapp || "6282338184217"}
                placeholder="Contoh: 6282338184217 atau https://wa.me/..."
                disabled={!isSuperAdmin}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-50 transition-all font-medium"
              />
              <p className="text-[10px] text-slate-400 mt-1 font-medium">Bisa nomor awalan 62 atau link wa.me</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                <i className="fa-brands fa-instagram text-pink-600" />
                <span>Link / Username Instagram</span>
              </label>
              <input
                type="text"
                name="instagram"
                defaultValue={extSettings?.instagram || "https://instagram.com/psht.smkndu"}
                placeholder="https://instagram.com/psht.smkndu"
                disabled={!isSuperAdmin}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-50 transition-all font-medium"
              />
              <p className="text-[10px] text-slate-400 mt-1 font-medium">Link URL atau username Instagram</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                <i className="fa-brands fa-tiktok text-slate-800" />
                <span>Link / Username TikTok</span>
              </label>
              <input
                type="text"
                name="tiktok"
                defaultValue={extSettings?.tiktok || "https://www.tiktok.com/@candratokez1"}
                placeholder="https://www.tiktok.com/@..."
                disabled={!isSuperAdmin}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-50 transition-all font-medium"
              />
              <p className="text-[10px] text-slate-400 mt-1 font-medium">Link URL atau username TikTok</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                <i className="fa-solid fa-envelope text-amber-600" />
                <span>Email Resmi Organisasi</span>
              </label>
              <input
                type="email"
                name="email"
                defaultValue={extSettings?.email || "psht.smkndu@gmail.com"}
                placeholder="psht.smkndu@gmail.com"
                disabled={!isSuperAdmin}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-50 transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                <i className="fa-solid fa-phone text-blue-600" />
                <span>Nomor Telepon / Kontak Kantor</span>
              </label>
              <input
                type="text"
                name="telepon"
                defaultValue={extSettings?.telepon || "+62 823-3818-4217"}
                placeholder="+62 823-3818-4217"
                disabled={!isSuperAdmin}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-50 transition-all font-medium"
              />
            </div>
          </div>
        </div>

        {/* 6. Alamat & Peta Google Maps */}
        <div className="space-y-5 border-b border-slate-100 pb-6">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <i className="fa-solid fa-map-location-dot text-rose-500" />
              <span>Alamat Lengkap & Peta Google Maps</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Atur teks alamat fisik, link embed peta (iframe), dan link petunjuk arah yang tampil di footer serta halaman Kontak.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Alamat Fisik / Sekretariat
            </label>
            <textarea
              name="alamat"
              rows={2}
              defaultValue={
                extSettings?.alamat ||
                "JL. KH. Askandar Km.2 Wringinputih - Muncar, Banyuwangi, Jawa Timur, Indonesia 68472"
              }
              disabled={!isSuperAdmin}
              placeholder="Tuliskan alamat lengkap..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-50 transition-all font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                URL Embed Google Maps (src iframe)
              </label>
              <input
                type="text"
                name="maps_embed_url"
                value={mapsEmbedUrl}
                onChange={(e) => setMapsEmbedUrl(e.target.value)}
                placeholder="https://www.google.com/maps/embed?pb=..."
                disabled={!isSuperAdmin}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-50 transition-all"
              />
              <p className="text-[10px] text-slate-400 mt-1 font-medium">
                Didapat dari Google Maps: <em>Bagikan &rarr; Sematkan peta (salin atribut src)</em>
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Link Langsung Petunjuk Arah (Navigasi)
              </label>
              <input
                type="text"
                name="maps_link"
                defaultValue={extSettings?.maps_link || "https://maps.google.com/?q=SMKN+Darul+Ulum+Muncar"}
                placeholder="https://maps.google.com/?q=..."
                disabled={!isSuperAdmin}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-50 transition-all"
              />
              <p className="text-[10px] text-slate-400 mt-1 font-medium">
                Link yang dibuka saat pengguna menekan tombol &quot;Petunjuk Arah Maps&quot;.
              </p>
            </div>
          </div>

          {/* Live Preview Google Maps */}
          {mapsEmbedUrl && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <i className="fa-solid fa-eye text-amber-500 text-xs" />
                <span>Pratinjau Peta Google Maps</span>
              </span>
              <div className="w-full h-48 sm:h-64 rounded-xl overflow-hidden bg-slate-200 border border-slate-300">
                <iframe
                  src={mapsEmbedUrl}
                  title="Preview Peta Lokasi"
                  className="w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>
          )}
        </div>

        {/* 7. Video Profile Section ("Mengenal Lebih Jauh") */}
        <div className="space-y-5 border-b border-slate-100 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <i className="fa-solid fa-film text-rose-500" />
                <span>Video Profil Beranda (&quot;Mengenal Lebih Jauh&quot;)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Atur judul, deskripsi, dan link YouTube video profil yang tampil di bagian Beranda website.
              </p>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <i className="fa-brands fa-youtube text-sm text-rose-600" />
              <span>YouTube Player</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Judul Video Profil
              </label>
              <input
                type="text"
                name="judul_video"
                defaultValue={settings?.judul_video || "Video Profil PSHT SMKNDU"}
                disabled={!isSuperAdmin}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-50 transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Deskripsi Singkat Video
              </label>
              <input
                type="text"
                name="deskripsi_video"
                defaultValue={
                  settings?.deskripsi_video ||
                  "Saksikan perjalanan inspiratif kami dalam membangun organisasi yang menjunjung tinggi persatuan."
                }
                disabled={!isSuperAdmin}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-50 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Link Video Utama (Video 1) *
              </label>
              <input
                type="text"
                name="url_video"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                disabled={!isSuperAdmin}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-50 transition-all font-medium"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Mendukung link biasa YouTube (<code className="text-amber-600 font-bold">youtube.com/watch?v=...</code>), link share (<code className="text-amber-600 font-bold">youtu.be/...</code>), Shorts, maupun embed.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Link Video Playlist 2 (Opsional)
                </label>
                <input
                  type="text"
                  name="url_video1"
                  defaultValue={settings?.url_video1 || ""}
                  placeholder="https://www.youtube.com/watch?v=..."
                  disabled={!isSuperAdmin}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-50 transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Link Video Playlist 3 (Opsional)
                </label>
                <input
                  type="text"
                  name="url_video2"
                  defaultValue={settings?.url_video2 || ""}
                  placeholder="https://www.youtube.com/watch?v=..."
                  disabled={!isSuperAdmin}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-50 transition-all font-medium"
                />
              </div>
            </div>

            {/* Live Video Preview Box */}
            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                <i className="fa-solid fa-eye text-amber-500" />
                <span>Pratinjau Pemutar Video Langsung (Live Preview)</span>
              </span>
              <div className="relative aspect-video max-w-lg mx-auto overflow-hidden rounded-xl border border-slate-200 bg-black shadow-sm flex items-center justify-center">
                {formatVideoEmbedUrl(videoUrl) ? (
                  <iframe
                    src={formatVideoEmbedUrl(videoUrl)}
                    title="Pratinjau Video Profil"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="text-center p-6 text-slate-400 space-y-2">
                    <i className="fa-brands fa-youtube text-4xl text-slate-300" />
                    <p className="text-xs">Masukkan link YouTube di atas untuk melihat pratinjau pemutar video.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 8. Footer & Statistik Section */}
        <div className="space-y-5 border-b border-slate-100 pb-6">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <i className="fa-solid fa-chart-simple text-amber-500" />
              <span>Pengaturan Footer & Statistik Beranda</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Atur teks slogan dan hak cipta footer, serta opsi penyesuaian angka statistik di beranda.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Slogan Footer
              </label>
              <input
                type="text"
                name="footer_slogan"
                defaultValue={extSettings?.footer_slogan || "Suro Diro Jayaningrat Lebur Dening Pangastuti"}
                disabled={!isSuperAdmin}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-50 transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Teks Copyright Footer
              </label>
              <input
                type="text"
                name="footer_copyright"
                defaultValue={extSettings?.footer_copyright || "© 2025 MasCan"}
                disabled={!isSuperAdmin}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-50 transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Penyesuaian Manual Angka Statistik Beranda (Opsional)
            </label>
            <p className="text-[11px] text-slate-400 mb-3">
              Biarkan kosong jika ingin angka dihitung otomatis dari database (jumlah siswa, pelatih, warga, galeri).
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 font-bold mb-1">Siswa Aktif</label>
                <input
                  type="number"
                  name="stat_siswa_override"
                  defaultValue={extSettings?.stat_siswa_override ?? ""}
                  placeholder="Otomatis"
                  disabled={!isSuperAdmin}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-50 font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 font-bold mb-1">Pelatih</label>
                <input
                  type="number"
                  name="stat_pelatih_override"
                  defaultValue={extSettings?.stat_pelatih_override ?? ""}
                  placeholder="Otomatis"
                  disabled={!isSuperAdmin}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-50 font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 font-bold mb-1">Warga</label>
                <input
                  type="number"
                  name="stat_warga_override"
                  defaultValue={extSettings?.stat_warga_override ?? ""}
                  placeholder="Otomatis"
                  disabled={!isSuperAdmin}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-50 font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 font-bold mb-1">Galeri Foto</label>
                <input
                  type="number"
                  name="stat_galeri_override"
                  defaultValue={extSettings?.stat_galeri_override ?? ""}
                  placeholder="Otomatis"
                  disabled={!isSuperAdmin}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-50 font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 9. Syarat Pendaftaran */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Syarat & Ketentuan Pendaftaran Anggota Baru
          </label>
          <textarea
            name="syarat_pendaftaran"
            rows={4}
            defaultValue={
              settings?.syarat_pendaftaran ||
              "1. Berstatus siswa/siswi aktif SMKN Darul Ulum Muncar.\n2. Mengisi formulir pendaftaran resmi.\n3. Memperoleh izin tertulis dari orang tua/wali.\n4. Siap menaati AD/ART dan tata tertib latihan PSHT."
            }
            disabled={!isSuperAdmin}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-50 transition-all font-medium leading-relaxed"
          />
        </div>

        {isSuperAdmin && (
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isPending}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 disabled:opacity-50 flex items-center gap-2.5 transition transform active:scale-95"
            >
              {isPending && <i className="fa-solid fa-circle-notch fa-spin" />}
              <i className="fa-solid fa-floppy-disk" />
              <span>Simpan Seluruh Pengaturan Website</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

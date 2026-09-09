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
          ? "border-red-900/40 bg-red-950/10"
          : "border-gray-800 bg-[#0c121e] hover:border-gray-700"
      }`}
    >
      <input type="hidden" name={`existing_${namePrefix}`} value={initialUrl || ""} />
      <input type="hidden" name={`remove_${namePrefix}`} value={isRemoved ? "true" : "false"} />

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
            <i className="fa-solid fa-image text-amber-400 text-xs" />
            <span>{title}</span>
          </span>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              isPrimary
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "bg-gray-800 text-gray-400"
            }`}
          >
            {isPrimary ? "Slide 1 (Utama)" : `Slide ${slotNumber}`}
          </span>
        </div>

        {/* Thumbnail Preview */}
        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black/50 border border-gray-800 flex items-center justify-center mb-3 group">
          {preview && !isRemoved ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveMediaUrl(preview)}
                alt={title}
                className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/sh-emblem.png";
                }}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                  className="px-3 py-1.5 bg-black/85 hover:bg-black text-white text-xs font-semibold rounded-lg border border-white/20 backdrop-blur-sm shadow"
                >
                  <i className="fa-solid fa-camera mr-1.5" /> Ganti
                </button>
              </div>
            </>
          ) : (
            <div className="text-center p-3 text-gray-500 flex flex-col items-center justify-center">
              <i
                className={`fa-solid ${
                  isRemoved ? "fa-trash-can text-red-400" : "fa-cloud-arrow-up text-gray-600"
                } text-xl mb-1`}
              />
              <p className="text-[11px] font-medium">
                {isRemoved ? "Ditandai Dihapus" : "Belum ada foto"}
              </p>
            </div>
          )}
        </div>
      </div>

      <div>
        <input
          ref={fileInputRef}
          type="file"
          name={`${namePrefix}_file`}
          accept="image/*"
          disabled={disabled}
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="flex-1 py-1.5 px-3 bg-gray-800/90 hover:bg-gray-800 text-gray-200 text-xs font-semibold rounded-lg border border-gray-700 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <i className="fa-solid fa-upload text-[11px]" />
            <span>{preview && !isRemoved ? "Ubah" : "Pilih Foto"}</span>
          </button>

          {preview && !isRemoved && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              title="Hapus foto ini"
              className="p-1.5 px-2.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs rounded-lg border border-red-800/50 transition disabled:opacity-50"
            >
              <i className="fa-solid fa-trash-can text-xs" />
            </button>
          )}

          {isRemoved && (
            <button
              type="button"
              onClick={handleRestore}
              disabled={disabled}
              title="Batalkan penghapusan"
              className="p-1.5 px-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg border border-gray-600 transition"
            >
              <i className="fa-solid fa-rotate-left text-xs mr-1" />
              <span>Batal</span>
            </button>
          )}
        </div>
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
    <div className="bg-[#151d2a] rounded-3xl border border-gray-800 p-6 sm:p-8 shadow-xl">
      {msg.text && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm mb-6 flex items-center gap-2.5 ${
            msg.isError
              ? "bg-red-900/40 border border-red-500/50 text-red-200"
              : "bg-emerald-900/40 border border-emerald-500/50 text-emerald-200"
          }`}
        >
          <i className={`fa-solid ${msg.isError ? "fa-circle-exclamation" : "fa-circle-check"}`} />
          <span>{msg.text}</span>
        </div>
      )}

      {!isSuperAdmin && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs rounded-xl mb-6">
          <i className="fa-solid fa-info-circle mr-1.5" />
          Hanya <strong>Super Admin</strong> yang memiliki otoritas mengubah konfigurasi inti website.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <input type="hidden" name="existing_logo" value={settings?.logo || ""} />

        {/* 1. Logo Section */}
        <div className="border-b border-gray-800 pb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
            Logo Utama Website
          </label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-black/60 border border-gray-700 p-2 flex items-center justify-center shrink-0">
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
                className="w-full px-3 py-2 bg-[#0f172a] border border-gray-700 rounded-xl text-gray-300 text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:bg-amber-500 file:text-gray-950 disabled:opacity-50"
              />
              <p className="mt-1 text-[11px] text-gray-500">
                Pilih file logo baru (PNG transparan disarankan) untuk mengganti logo di header dan footer.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Banner Hero Section */}
        <div className="space-y-5 border-b border-gray-800 pb-6">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <i className="fa-solid fa-panorama text-amber-400" />
              <span>Banner Hero Utama & Slide Foto Beranda</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Atur teks sambutan utama dan 4 foto latar belakang slide banner atas beranda.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Judul Sambutan Hero
              </label>
              <input
                type="text"
                name="judul_hero"
                defaultValue={settings?.judul_hero || "Persaudaraan Setia Hati Terate"}
                disabled={!isSuperAdmin}
                className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
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
                className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                Foto-Foto Slide Banner Hero (Maksimal 4 Foto)
              </label>
              <span className="text-[11px] text-gray-400">
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
        <div className="space-y-5 border-b border-gray-800 pb-6">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <i className="fa-solid fa-landmark text-amber-400" />
              <span>Profil Sejarah Organisasi (Beranda)</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Kelola judul, naskah deskripsi sejarah, serta foto-foto slide galeri sejarah yang tampil di tab Beranda website.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Judul Bagian Sejarah
            </label>
            <input
              type="text"
              name="judul_sejarah"
              defaultValue={settings?.judul_sejarah || "Sejarah Organisasi"}
              disabled={!isSuperAdmin}
              placeholder="Contoh: Sejarah Organisasi"
              className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
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
              className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 disabled:opacity-50 leading-relaxed"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                Foto-Foto Slide Sejarah (Maksimal 4 Foto)
              </label>
              <span className="text-[11px] text-gray-400">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-gray-800 pb-6">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Visi Organisasi</label>
            <textarea
              name="visi"
              rows={4}
              defaultValue={settings?.visi || "Membentuk manusia berbudi pekerti luhur tahu benar dan salah."}
              disabled={!isSuperAdmin}
              className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Misi Organisasi</label>
            <textarea
              name="misi"
              rows={4}
              defaultValue={settings?.misi || "Melestarikan budaya bangsa melalui seni beladiri pencak silat persaudaraan."}
              disabled={!isSuperAdmin}
              className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 disabled:opacity-50"
            />
          </div>
        </div>

        {/* 5. Kontak & Media Sosial Section */}
        <div className="space-y-5 border-b border-gray-800 pb-6">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <i className="fa-solid fa-share-nodes text-amber-400" />
              <span>Media Sosial & Kontak Resmi Website</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Mengatur tombol melayang (floating icon WhatsApp, Instagram, TikTok) di sebelah kanan beranda, footer, dan halaman kontak.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
                <i className="fa-brands fa-whatsapp text-emerald-400" />
                <span>Nomor / Link WhatsApp</span>
              </label>
              <input
                type="text"
                name="whatsapp"
                defaultValue={extSettings?.whatsapp || "6282338184217"}
                placeholder="Contoh: 6282338184217 atau https://wa.me/..."
                disabled={!isSuperAdmin}
                className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 disabled:opacity-50"
              />
              <p className="text-[10px] text-gray-500 mt-1">Bisa nomor awalan 62 atau link wa.me</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
                <i className="fa-brands fa-instagram text-pink-400" />
                <span>Link / Username Instagram</span>
              </label>
              <input
                type="text"
                name="instagram"
                defaultValue={extSettings?.instagram || "https://instagram.com/psht.smkndu"}
                placeholder="https://instagram.com/psht.smkndu"
                disabled={!isSuperAdmin}
                className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 disabled:opacity-50"
              />
              <p className="text-[10px] text-gray-500 mt-1">Link URL atau username Instagram</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
                <i className="fa-brands fa-tiktok text-gray-200" />
                <span>Link / Username TikTok</span>
              </label>
              <input
                type="text"
                name="tiktok"
                defaultValue={extSettings?.tiktok || "https://www.tiktok.com/@candratokez1"}
                placeholder="https://www.tiktok.com/@..."
                disabled={!isSuperAdmin}
                className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 disabled:opacity-50"
              />
              <p className="text-[10px] text-gray-500 mt-1">Link URL atau username TikTok</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
                <i className="fa-solid fa-envelope text-amber-400" />
                <span>Email Resmi Organisasi</span>
              </label>
              <input
                type="email"
                name="email"
                defaultValue={extSettings?.email || "psht.smkndu@gmail.com"}
                placeholder="psht.smkndu@gmail.com"
                disabled={!isSuperAdmin}
                className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
                <i className="fa-solid fa-phone text-amber-400" />
                <span>Nomor Telepon / Kontak Kantor</span>
              </label>
              <input
                type="text"
                name="telepon"
                defaultValue={extSettings?.telepon || "+62 823-3818-4217"}
                placeholder="+62 823-3818-4217"
                disabled={!isSuperAdmin}
                className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* 6. Alamat & Peta Google Maps */}
        <div className="space-y-5 border-b border-gray-800 pb-6">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <i className="fa-solid fa-map-location-dot text-amber-400" />
              <span>Alamat Lengkap & Peta Google Maps</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Atur teks alamat fisik, link embed peta (iframe), dan link petunjuk arah yang tampil di footer serta halaman Kontak.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
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
              className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                URL Embed Google Maps (src iframe)
              </label>
              <input
                type="text"
                name="maps_embed_url"
                value={mapsEmbedUrl}
                onChange={(e) => setMapsEmbedUrl(e.target.value)}
                placeholder="https://www.google.com/maps/embed?pb=..."
                disabled={!isSuperAdmin}
                className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-amber-500 disabled:opacity-50"
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Didapat dari Google Maps: <em>Bagikan &rarr; Sematkan peta (salin atribut src)</em>
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Link Langsung Petunjuk Arah (Navigasi)
              </label>
              <input
                type="text"
                name="maps_link"
                defaultValue={extSettings?.maps_link || "https://maps.google.com/?q=SMKN+Darul+Ulum+Muncar"}
                placeholder="https://maps.google.com/?q=..."
                disabled={!isSuperAdmin}
                className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-amber-500 disabled:opacity-50"
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Link yang dibuka saat pengguna menekan tombol "Petunjuk Arah Maps".
              </p>
            </div>
          </div>

          {/* Live Preview Google Maps */}
          {mapsEmbedUrl && (
            <div className="p-3 bg-[#0c121e] rounded-2xl border border-gray-800">
              <span className="text-xs font-bold text-gray-300 mb-2 flex items-center gap-1.5">
                <i className="fa-solid fa-eye text-amber-400 text-xs" />
                <span>Pratinjau Peta Google Maps</span>
              </span>
              <div className="w-full h-48 sm:h-64 rounded-xl overflow-hidden bg-black border border-gray-700/60">
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
        <div className="space-y-5 border-b border-gray-800 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <i className="fa-solid fa-film text-amber-400" />
                <span>Video Profil Beranda ("Mengenal Lebih Jauh")</span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Atur judul, deskripsi, dan link YouTube video profil yang tampil di bagian Beranda website.
              </p>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <i className="fa-brands fa-youtube text-sm" />
              <span>YouTube Player</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Judul Video Profil
              </label>
              <input
                type="text"
                name="judul_video"
                defaultValue={settings?.judul_video || "Video Profil PSHT SMKNDU"}
                disabled={!isSuperAdmin}
                className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
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
                className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Link Video Utama (Video 1) *
              </label>
              <input
                type="text"
                name="url_video"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                disabled={!isSuperAdmin}
                className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 disabled:opacity-50 font-mono text-xs"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Mendukung link biasa YouTube (<code className="text-amber-400">youtube.com/watch?v=...</code>), link share (<code className="text-amber-400">youtu.be/...</code>), Shorts, maupun embed.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Link Video Playlist 2 (Opsional)
                </label>
                <input
                  type="text"
                  name="url_video1"
                  defaultValue={settings?.url_video1 || ""}
                  placeholder="https://www.youtube.com/watch?v=..."
                  disabled={!isSuperAdmin}
                  className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 disabled:opacity-50 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Link Video Playlist 3 (Opsional)
                </label>
                <input
                  type="text"
                  name="url_video2"
                  defaultValue={settings?.url_video2 || ""}
                  placeholder="https://www.youtube.com/watch?v=..."
                  disabled={!isSuperAdmin}
                  className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 disabled:opacity-50 font-mono text-xs"
                />
              </div>
            </div>

            {/* Live Video Preview Box */}
            <div className="mt-4 p-4 rounded-2xl bg-[#0b0f17] border border-gray-800 space-y-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <i className="fa-solid fa-eye text-amber-400" />
                <span>Pratinjau Pemutar Video Langsung (Live Preview)</span>
              </span>
              <div className="relative aspect-video max-w-lg mx-auto overflow-hidden rounded-xl border border-gray-700/60 bg-black shadow-lg flex items-center justify-center">
                {formatVideoEmbedUrl(videoUrl) ? (
                  <iframe
                    src={formatVideoEmbedUrl(videoUrl)}
                    title="Pratinjau Video Profil"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="text-center p-6 text-gray-500 space-y-2">
                    <i className="fa-brands fa-youtube text-4xl text-gray-600" />
                    <p className="text-xs">Masukkan link YouTube di atas untuk melihat pratinjau pemutar video.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 8. Footer & Statistik Section */}
        <div className="space-y-5 border-b border-gray-800 pb-6">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <i className="fa-solid fa-chart-simple text-amber-400" />
              <span>Pengaturan Footer & Statistik Beranda</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Atur teks slogan dan hak cipta footer, serta opsi penyesuaian angka statistik di beranda.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Slogan Footer
              </label>
              <input
                type="text"
                name="footer_slogan"
                defaultValue={extSettings?.footer_slogan || "Suro Diro Jayaningrat Lebur Dening Pangastuti"}
                disabled={!isSuperAdmin}
                className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Teks Copyright Footer
              </label>
              <input
                type="text"
                name="footer_copyright"
                defaultValue={extSettings?.footer_copyright || "© 2025 MasCan"}
                disabled={!isSuperAdmin}
                className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
              Penyesuaian Manual Angka Statistik Beranda (Opsional)
            </label>
            <p className="text-[11px] text-gray-400 mb-3">
              Biarkan kosong jika ingin angka dihitung otomatis dari database (jumlah siswa, pelatih, warga, galeri).
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Siswa Aktif</label>
                <input
                  type="number"
                  name="stat_siswa_override"
                  defaultValue={extSettings?.stat_siswa_override ?? ""}
                  placeholder="Otomatis"
                  disabled={!isSuperAdmin}
                  className="w-full px-3 py-2 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Pelatih</label>
                <input
                  type="number"
                  name="stat_pelatih_override"
                  defaultValue={extSettings?.stat_pelatih_override ?? ""}
                  placeholder="Otomatis"
                  disabled={!isSuperAdmin}
                  className="w-full px-3 py-2 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Warga</label>
                <input
                  type="number"
                  name="stat_warga_override"
                  defaultValue={extSettings?.stat_warga_override ?? ""}
                  placeholder="Otomatis"
                  disabled={!isSuperAdmin}
                  className="w-full px-3 py-2 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Galeri Foto</label>
                <input
                  type="number"
                  name="stat_galeri_override"
                  defaultValue={extSettings?.stat_galeri_override ?? ""}
                  placeholder="Otomatis"
                  disabled={!isSuperAdmin}
                  className="w-full px-3 py-2 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 9. Syarat Pendaftaran */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
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
            className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 disabled:opacity-50"
          />
        </div>

        {isSuperAdmin && (
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isPending}
              className="px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-sm shadow-xl shadow-amber-500/25 disabled:opacity-50 flex items-center gap-2.5 transition transform active:scale-95"
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

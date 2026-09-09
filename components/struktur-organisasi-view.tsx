"use client";

import { useState } from "react";
import { resolveMediaUrl } from "@/lib/media";

interface StrukturOrganisasiViewProps {
  gambarStruktur?: string | null;
}

interface JabatanItem {
  posisi: string;
  nama: string;
  tugas: string[];
  kategori: "pembina" | "pimpinan" | "administrasi" | "bidang";
  icon: string;
}

const daftarJabatan: JabatanItem[] = [
  {
    posisi: "Pelindung & Pembina",
    nama: "Kepala SMKN Darul Ulum Muncar & Dewan Rayon",
    tugas: [
      "Memberikan arahan, bimbingan, dan perlindungan hukum bagi seluruh kegiatan organisasi.",
      "Memastikan kegiatan latihan selaras dengan tata tertib sekolah dan nilai-nilai luhur PSHT.",
    ],
    kategori: "pembina",
    icon: "fa-shield-halved",
  },
  {
    posisi: "Ketua Rayon",
    nama: "Penanggung Jawab Rayon SMKN Darul Ulum Muncar",
    tugas: [
      "Memimpin seluruh jalannya kegiatan organisasi dan latihan di lingkungan sekolah.",
      "Mengkoordinasikan seluruh seksi kepengurusan dan bertanggung jawab kepada Cabang Banyuwangi.",
      "Menjalin komunikasi formal dengan pihak sekolah dan pengurus ranting/cabang.",
    ],
    kategori: "pimpinan",
    icon: "fa-user-tie",
  },
  {
    posisi: "Wakil Ketua Rayon",
    nama: "Koordinator Lapangan & Operasional",
    tugas: [
      "Membantu tugas Ketua Rayon dalam pengawasan teknis latihan dan kegiatan harian.",
      "Mewakili Ketua apabila berhalangan hadir dalam kegiatan resmi.",
    ],
    kategori: "pimpinan",
    icon: "fa-users-gear",
  },
  {
    posisi: "Sekretaris",
    nama: "Biro Administrasi & Kearsipan",
    tugas: [
      "Mengelola surat-menyurat, proposal, arsip data siswa, data warga, dan perizinan resmi.",
      "Menyusun notula rapat dan laporan pertanggungjawaban kegiatan.",
    ],
    kategori: "administrasi",
    icon: "fa-file-signature",
  },
  {
    posisi: "Bendahara",
    nama: "Biro Keuangan & Anggaran",
    tugas: [
      "Mengatur pemasukan, pengeluaran kas, serta transparansi pembukuan keuangan rayon.",
      "Menyusun anggaran dana kebutuhan latihan, seragam, sabuk, dan perlengkapan.",
    ],
    kategori: "administrasi",
    icon: "fa-wallet",
  },
  {
    posisi: "Seksi Kepelatihan & Teknik",
    nama: "Tim Pelatih Resmi PSHT Rayon",
    tugas: [
      "Menyusun silabus materi latihan teknik (senam, jurus dasar, pasangan, dan sambung).",
      "Memimpin evaluasi kenaikan tingkat sabuk siswa (Polos, Jambon, Hijau, Putih).",
    ],
    kategori: "bidang",
    icon: "fa-hand-fist",
  },
  {
    posisi: "Seksi Pembinaan Kerohanian",
    nama: "Divisi Ke-SH-an & Budi Luhur",
    tugas: [
      "Menanamkan falsafah budi pekerti luhur tahu benar dan salah kepada seluruh siswa.",
      "Membimbing pembinaan mental, spiritual, dan etika persaudaraan setia hati.",
    ],
    kategori: "bidang",
    icon: "fa-heart",
  },
  {
    posisi: "Seksi Humas & Publikasi",
    nama: "Divisi Komunikasi & Dokumentasi",
    tugas: [
      "Mengelola informasi resmi, website, media sosial, serta dokumentasi foto dan video.",
      "Menghubungkan komunikasi antar-rayon, ranting, alumni, dan pihak luar.",
    ],
    kategori: "bidang",
    icon: "fa-bullhorn",
  },
  {
    posisi: "Seksi Perlengkapan & Logistik",
    nama: "Divisi Sarana & Prasarana",
    tugas: [
      "Menyiapkan matras, sakral, sabuk, dan alat penunjang keselamatan latihan.",
      "Memelihara sarana prasarana latihan agar selalu siap dan aman digunakan.",
    ],
    kategori: "bidang",
    icon: "fa-boxes-stacked",
  },
];

export default function StrukturOrganisasiView({ gambarStruktur }: StrukturOrganisasiViewProps) {
  const [activeTab, setActiveTab] = useState<"bagan" | "rincian">("bagan");
  const [modalImage, setModalImage] = useState<string | null>(null);

  const imageUrl = gambarStruktur ? resolveMediaUrl(gambarStruktur) : null;

  return (
    <div className="w-full lg:w-[65%] bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-2xl border border-gray-200">
      {/* Title */}
      <div className="border-l-4 border-gray-600 pl-4 mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 tracking-tight">
          Struktur Organisasi
        </h1>
        <p className="text-gray-500 mt-1.5 text-sm">
          Bagan susunan kepengurusan Persaudaraan Setia Hati Terate (PSHT) Rayon SMKN Darul Ulum Muncar
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-3 mb-8">
        <button
          type="button"
          onClick={() => setActiveTab("bagan")}
          className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "bagan"
              ? "bg-[#4a5568] text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <i className="fa-solid fa-sitemap mr-1.5" />
          Bagan Struktur
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("rincian")}
          className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "rincian"
              ? "bg-[#4a5568] text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <i className="fa-solid fa-list-check mr-1.5" />
          Tugas & Wewenang
        </button>
      </div>

      {/* Tab 1: Bagan Struktur */}
      {activeTab === "bagan" && (
        <div className="space-y-8">
          {/* If image uploaded */}
          {imageUrl && (
            <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50 p-4">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Foto / Bagan Resmi
                </span>
                <button
                  type="button"
                  onClick={() => setModalImage(imageUrl)}
                  className="text-xs text-gray-600 hover:text-black font-medium inline-flex items-center gap-1"
                >
                  <i className="fa-solid fa-expand" />
                  Perbesar Gambar
                </button>
              </div>
              <div
                className="cursor-pointer group relative rounded-lg overflow-hidden flex items-center justify-center max-h-[500px]"
                onClick={() => setModalImage(imageUrl)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Bagan Struktur Organisasi PSHT Rayon SMKN Darul Ulum Muncar"
                  className="w-full h-auto object-contain transition duration-300 group-hover:scale-[1.01]"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-black/75 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-md">
                    Klik untuk melihat resolusi penuh
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Hierarchical Tree */}
          <div className="p-4 sm:p-6 bg-[#f8fafc] rounded-xl border border-gray-200/80">
            <h3 className="text-center text-sm font-bold text-gray-700 uppercase tracking-wider mb-6">
              Bagan Hirarki Kepengurusan
            </h3>

            {/* Level 1: Pembina */}
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-zinc-800 to-zinc-900 text-white p-4 rounded-xl shadow-sm text-center w-full max-w-md border border-zinc-700">
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-300 block mb-1">
                  Pelindung & Pembina
                </span>
                <h4 className="text-sm sm:text-base font-bold text-white">
                  Kepala Sekolah SMKN Darul Ulum & Dewan Rayon
                </h4>
              </div>
            </div>

            {/* Connector Line */}
            <div className="w-0.5 h-6 bg-gray-300 mx-auto -mt-6 mb-2"></div>

            {/* Level 2: Ketua & Wakil */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
              <div className="bg-[#4a5568] text-white p-4 rounded-xl shadow-sm text-center flex-1 max-w-xs border border-gray-600">
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-200 block mb-1">
                  Pimpinan Utama
                </span>
                <h4 className="text-sm font-bold">Ketua Rayon</h4>
                <p className="text-xs text-gray-200 mt-0.5">Penanggung Jawab Organisasi</p>
              </div>

              <div className="bg-[#4a5568] text-white p-4 rounded-xl shadow-sm text-center flex-1 max-w-xs border border-gray-600">
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-200 block mb-1">
                  Pimpinan Pelaksana
                </span>
                <h4 className="text-sm font-bold">Wakil Ketua Rayon</h4>
                <p className="text-xs text-gray-200 mt-0.5">Koordinator Operasional</p>
              </div>
            </div>

            {/* Connector Line */}
            <div className="w-0.5 h-6 bg-gray-300 mx-auto -mt-6 mb-2"></div>

            {/* Level 3: Sekretaris & Bendahara */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
              <div className="bg-white text-gray-800 p-3.5 rounded-xl shadow-sm text-center flex-1 max-w-xs border border-gray-200">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-1 text-gray-600 text-xs">
                  <i className="fa-solid fa-file-signature" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">Sekretaris</h4>
                <p className="text-[11px] text-gray-500">Administrasi & Surat-Menyurat</p>
              </div>

              <div className="bg-white text-gray-800 p-3.5 rounded-xl shadow-sm text-center flex-1 max-w-xs border border-gray-200">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-1 text-gray-600 text-xs">
                  <i className="fa-solid fa-wallet" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">Bendahara</h4>
                <p className="text-[11px] text-gray-500">Keuangan & Anggaran Kas</p>
              </div>
            </div>

            {/* Connector Line */}
            <div className="w-0.5 h-6 bg-gray-300 mx-auto -mt-6 mb-2"></div>

            {/* Level 4: Bidang-Bidang / Seksi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {daftarJabatan
                .filter((j) => j.kategori === "bidang")
                .map((bidang) => (
                  <div
                    key={bidang.posisi}
                    className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm hover:border-gray-400 transition duration-200"
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className="w-7 h-7 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center text-xs shrink-0">
                        <i className={`fa-solid ${bidang.icon}`} />
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                        {bidang.posisi}
                      </h4>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed pl-9">
                      {bidang.tugas[0]}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Rincian Tugas & Wewenang */}
      {activeTab === "rincian" && (
        <div className="space-y-4">
          {daftarJabatan.map((item) => (
            <div
              key={item.posisi}
              className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 shadow-sm hover:shadow-md transition duration-200"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#4a5568] text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
                  <i className={`fa-solid ${item.icon}`} />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <h3 className="text-base font-bold text-gray-900">{item.posisi}</h3>
                    <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full w-fit">
                      {item.nama}
                    </span>
                  </div>

                  <ul className="space-y-1.5 mt-2">
                    {item.tugas.map((t, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
                        <i className="fa-solid fa-check text-[#4a5568] text-[10px] mt-1 shrink-0" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Image Modal Lightbox */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setModalImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setModalImage(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
              aria-label="Tutup"
            >
              <i className="fa-solid fa-xmark text-sm" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={modalImage}
              alt="Bagan Struktur Organisasi Resolusi Penuh"
              className="max-h-[85vh] w-auto mx-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}

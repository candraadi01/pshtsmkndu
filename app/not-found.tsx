import Link from "next/link";
import Image from "next/image";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] text-black">
      <SiteHeader />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 flex items-center justify-center">
        <div className="w-full bg-[#242b35] text-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 shadow-2xl border border-gray-700/80 text-center">
          {/* Logo Badge */}
          <div className="inline-flex items-center justify-center p-2 bg-black rounded-2xl mb-6 shadow-inner border border-amber-500/30">
            <Image
              src="/sh-emblem.png"
              alt="Lambang SH Terate"
              width={72}
              height={72}
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-xl"
              priority
            />
          </div>

          {/* 404 Big Number */}
          <div className="text-6xl sm:text-8xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 mb-4">
            404
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-sm sm:text-base text-gray-300 max-w-lg mx-auto leading-relaxed mb-8">
            Mohon maaf, halaman atau jurus yang Anda tuju tidak ditemukan atau mungkin sudah dipindahkan.
            Mari kembali ke langkah yang tepat.
          </p>

          {/* Quick Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-sm sm:text-base shadow-lg hover:shadow-amber-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <i className="fa-solid fa-house" />
              <span>Kembali ke Beranda</span>
            </Link>

            <Link
              href="/artikel"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#323b49] hover:bg-[#3d4757] text-white font-medium text-sm sm:text-base border border-gray-600/60 transition-all transform hover:-translate-y-0.5"
            >
              <i className="fa-solid fa-newspaper text-amber-400" />
              <span>Baca Artikel</span>
            </Link>
          </div>

          {/* Shortcuts Grid */}
          <div className="border-t border-gray-700/80 pt-6 mt-6">
            <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-4">
              Pilihan Navigasi Lainnya
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
              <Link
                href="/galeri"
                className="p-3 bg-[#323b49]/70 hover:bg-[#323b49] rounded-xl border border-gray-700/60 text-gray-200 hover:text-white transition-colors flex flex-col items-center gap-1.5"
              >
                <i className="fa-solid fa-images text-base text-gray-400" />
                <span>Galeri Foto</span>
              </Link>
              <Link
                href="/struktur-organisasi"
                className="p-3 bg-[#323b49]/70 hover:bg-[#323b49] rounded-xl border border-gray-700/60 text-gray-200 hover:text-white transition-colors flex flex-col items-center gap-1.5"
              >
                <i className="fa-solid fa-sitemap text-base text-gray-400" />
                <span>Organisasi</span>
              </Link>
              <Link
                href="/registrasi"
                className="p-3 bg-[#323b49]/70 hover:bg-[#323b49] rounded-xl border border-gray-700/60 text-gray-200 hover:text-white transition-colors flex flex-col items-center gap-1.5"
              >
                <i className="fa-solid fa-user-plus text-base text-gray-400" />
                <span>Pendaftaran</span>
              </Link>
              <Link
                href="/kontak"
                className="p-3 bg-[#323b49]/70 hover:bg-[#323b49] rounded-xl border border-gray-700/60 text-gray-200 hover:text-white transition-colors flex flex-col items-center gap-1.5"
              >
                <i className="fa-solid fa-address-book text-base text-gray-400" />
                <span>Kontak</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

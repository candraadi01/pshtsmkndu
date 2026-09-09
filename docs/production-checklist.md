# Rencana & Catatan Pengembangan Selanjutnya (Production Checklist)
Dokumen ini merangkum hal-hal yang siap dikerjakan pada sesi berikutnya untuk menyempurnakan website PSHT SMKN Darul Ulum Muncar.

---

## 1. Tampilan & Branding (Quick Wins)
- [x] **Favicon PSHT di Tab Browser**:
  - Konfigurasi `app/layout.tsx` menggunakan `public/logo.png` sebagai favicon agar di tab browser muncul lambang resmi PSHT.
- [x] **OpenGraph / WhatsApp Link Preview**:
  - Tambahkan metadata OpenGraph & Twitter Card di `layout.tsx` agar saat link dibagikan di WhatsApp/Telegram/Facebook muncul thumbnail logo PSHT dan deskripsi resmi yang rapi.
- [x] **Halaman 404 Kustom (`app/not-found.tsx`)**:
  - Buat halaman 404 berdesain PSHT dengan header, footer, ilustrasi/teks ramah, dan tombol *"Kembali ke Beranda"*.

---

## 2. Optimasi Mesin Pencari (SEO)
- [x] **`app/sitemap.ts`**: Peta situs otomatis untuk Google Search Console.
- [x] **`app/robots.ts`**: Pengaturan perayapan bot mesin pencari.

---

## 3. Data & Backend (Admin CMS & RBAC)
- [x] **Koneksi Supabase (Live Database)**:
  - Database terhubung di `.env.local` dan migration RLS write policies siap di `supabase/migrations/0003_admin_rbac_and_analytics.sql`.
- [x] **Manajemen Konten (CMS/Admin Lengkap)**:
  - Dashboard Admin (`/admin`), Login aman (`/admin/login`), dan kontrol akses ganda (Super Admin & Admin).
  - Perekaman traffic pengunjung & lead penonton artikel.
  - CRUD lengkap untuk Artikel, Pengumuman, Galeri, Anggota (Pelatih/Warga/Siswa), Dokumen, Ekstrakurikuler, dan Pengaturan Logo via Cloudinary.

---

## 4. Deployment
- [ ] Setup hosting di Vercel / VPS (Build Next.js sudah teruji 100% lulus tanpa error).

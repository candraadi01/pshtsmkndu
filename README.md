# PSHT SMKN DU — Next.js migration

Ini adalah tahap awal migrasi dari Laravel + Inertia/Vue ke Next.js. Tampilan utama dipertahankan berdasarkan komponen dan halaman yang ada di project Laravel.

## Menjalankan project

```bash
npm install
npm run typecheck
npm run dev
```

Buka `http://localhost:3000`.

## Status tahap awal

- Layout global, Header, Footer, dan halaman Home sudah dipindahkan.
- Aset dari `storage/app/public` Laravel tersedia di `public/storage`.
- Home membaca Supabase melalui `lib/services/home.ts` bila konfigurasi tersedia.
- Tanpa credential, Home otomatis memakai fallback terpisah di `lib/demo-data.ts`.
- URL media absolut (termasuk Cloudinary) dan path `/storage` lama didukung oleh adapter `lib/media.ts`.
- Konflik schema Laravel dicatat di `docs/laravel-schema-audit.md`; schema belum diubah.

## Konfigurasi

Salin `.env.example` menjadi `.env.local`, lalu isi hanya pada mesin lokal. Jangan commit `.env.local`.

Field `NEXT_PUBLIC_*` dapat terlihat di browser. `SUPABASE_SERVICE_ROLE_KEY` dan `CLOUDINARY_API_SECRET` hanya boleh dipakai pada kode server.

## Batas tahap pertama

Halaman selain Home masih berupa target navigasi dan akan dimigrasikan pada tahap berikutnya. Auth produksi, dashboard admin, migrasi data, upload Cloudinary, dan perubahan schema belum dikerjakan.

Jangan menaruh credential asli di repository. Gunakan file `.env.local` untuk variabel Supabase dan Cloudinary.

# Audit schema Laravel untuk migrasi

Tahap pertama tidak mengubah schema Laravel maupun Supabase.

| Area | Konflik | Mapping aman untuk tahap 2 |
| --- | --- | --- |
| `people.tipe` | Migration: `guru`, `staf`, `siswa`; controller: `pelatih`, `warga`, `siswa` | Audit nilai SQLite dahulu; jangan konversi `guru`/`staf` otomatis. |
| `people.sabuk` | Ada di model, tidak ada di migration | Buat nullable hanya setelah audit data dan UI. |
| `page_settings` | Model memuat `syarat_pendaftaran`, `gambar_sejarah1..3`, `url_video1..2`; migration tidak | TypeScript mempertahankannya sebagai nullable; schema menunggu audit SQLite. |
| `dokumen` | `up()` membuat `dokumen`, `down()` menghapus `dokumens` | Gunakan nama kanonis `dokumen`; jangan rollback untuk memperbaikinya. |
| Role | `super admin` dan `super_admin` tidak konsisten | Tentukan nilai kanonis saat tahap Auth, lalu mapping eksplisit. |
| Home/auth | Controller memakai auth, route melepas middleware | Home Next.js tetap publik; kebijakan Auth difinalisasi tahap 2. |
| Media | Laravel memakai `/storage/...` | Adapter menerima URL absolut Cloudinary dan path lokal selama transisi. |

Tipe `PageSetting` sengaja merupakan superset model dan migration agar tidak ada field hilang diam-diam.

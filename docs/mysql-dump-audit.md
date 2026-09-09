# Audit alternatif dump MySQL `psht.sql`

Tanggal audit: 4 September 2026
Sumber: `E:\PORTOFOLIO WEB CANDRA\psht\psht.sql`
Mode: parser baca-saja; dump tidak dieksekusi dan tidak dimodifikasi

## Status sumber dan batas kesimpulan

Header dump menyatakan:

- phpMyAdmin 5.2.1
- host `localhost`
- MySQL 8.0.30
- PHP 8.3.15
- waktu pembuatan dump: **30 Mei 2025 pukul 11:24 AM**
- database bernama `psht`

Ukuran file adalah 36.810 byte dan SHA-256-nya `6016E5A4B1546BAE1337F9E5272141028B6E67E17D9A333164F40CB56BC71E22`.

Dump ini adalah **snapshot kandidat per 30 Mei 2025**, bukan bukti bahwa isinya otomatis sama dengan database produksi terbaru. Header tidak menyatakan zona waktu waktu pembuatan; `SET time_zone = "+00:00"` mengatur sesi import, tetapi tidak cukup untuk menyimpulkan zona waktu saat dump dibuat.

Dump juga memuat hash password Laravel dan payload sesi. Nilai sensitif tersebut dibaca hanya untuk struktur/jumlah row dan tidak disalin ke laporan. File dump tidak boleh dipublikasikan atau dimasukkan ke repository publik tanpa sanitasi.

## Metode audit

Seluruh statement `CREATE TABLE`, `INSERT INTO`, `ALTER TABLE ... ADD KEY`, dan `ADD CONSTRAINT` diparse tanpa menjalankan SQL. Parser memperlakukan titik koma di dalam string sebagai data, bukan akhir statement. Hasil dibandingkan dengan migration, model, controller, Filament resource, dan halaman Vue pada project Laravel.

Tidak ada database sementara yang dibuat. Tidak ada source code, database Laravel, migration Supabase, data, Auth, Cloudinary, atau UI yang diubah.

## Ringkasan tabel dan jumlah row

| Tabel | Row | Kategori |
| --- | ---: | --- |
| `artikel` | 6 | Data aplikasi |
| `cache` | 5 | Infrastruktur Laravel |
| `cache_locks` | 0 | Infrastruktur Laravel |
| `dokumen` | 3 | Data aplikasi |
| `ekstrakurikuler` | 1 | Data aplikasi |
| `galleries` | 1 | Data aplikasi |
| `images` | 3 | Data aplikasi |
| `migrations` | 12 | Metadata Laravel |
| `page_settings` | 1 | Data aplikasi |
| `password_reset_tokens` | 0 | Auth Laravel |
| `pengumuman` | 1 | Data aplikasi |
| `people` | 33 | Data aplikasi |
| `personal_access_tokens` | 0 | Auth Laravel/Sanctum |
| `sessions` | 10 | Infrastruktur/Auth Laravel |
| `tipe_dokumen` | 2 | Data aplikasi |
| `users` | 2 | Auth/data pengguna Laravel |
| **Total** | **81** | Semua row dalam dump |

## Struktur lengkap

Notasi: `NN` = NOT NULL; `NULL` = nullable. Default yang tidak dicantumkan berarti tidak ada default eksplisit. Semua integer bertanda `UNSIGNED` di dump.

### `artikel`

| Kolom | Tipe | Null | Default | Keterangan |
| --- | --- | --- | --- | --- |
| `id` | `bigint unsigned` | NN | — | PK, AUTO_INCREMENT |
| `judul` | `varchar(255)` | NN | — | — |
| `slug` | `varchar(255)` | NN | — | UNIQUE |
| `gambar` | `varchar(255)` | NULL | NULL | — |
| `isi` | `text` | NN | — | — |
| `excerpt` | `text` | NULL | implicit NULL | — |
| `id_user` | `bigint unsigned` | NN | — | FK dan index ke `users.id` |
| `kategori` | `varchar(255)` | NN | — | — |
| `status` | `enum('draft','published','archived')` | NN | `draft` | — |
| `published_at` | `timestamp` | NULL | NULL | — |
| `view_count` | `bigint unsigned` | NN | `0` | — |
| `created_at` | `timestamp` | NULL | NULL | — |
| `updated_at` | `timestamp` | NULL | NULL | — |

Keys: PK `id`; unique `artikel_slug_unique(slug)`; index `artikel_id_user_foreign(id_user)`; FK `id_user → users.id ON DELETE CASCADE`.

### `cache`

| Kolom | Tipe | Null | Default |
| --- | --- | --- | --- |
| `key` | `varchar(255)` | NN | — |
| `value` | `mediumtext` | NN | — |
| `expiration` | `int` | NN | — |

Key: PK `key`.

### `cache_locks`

| Kolom | Tipe | Null | Default |
| --- | --- | --- | --- |
| `key` | `varchar(255)` | NN | — |
| `owner` | `varchar(255)` | NN | — |
| `expiration` | `int` | NN | — |

Key: PK `key`.

### `dokumen`

| Kolom | Tipe | Null | Default | Keterangan |
| --- | --- | --- | --- | --- |
| `id` | `bigint unsigned` | NN | — | PK, AUTO_INCREMENT |
| `tipe_dokumen_id` | `bigint unsigned` | NN | — | FK dan index |
| `nama_dokumen` | `varchar(255)` | NN | — | — |
| `path` | `varchar(255)` | NN | — | — |
| `created_at` | `timestamp` | NULL | NULL | — |
| `updated_at` | `timestamp` | NULL | NULL | — |

Keys: PK `id`; index `fk_dokumen_tipe_dokumen(tipe_dokumen_id)`; FK `tipe_dokumen_id → tipe_dokumen.id ON DELETE CASCADE`.

### `ekstrakurikuler`

| Kolom | Tipe | Null | Default |
| --- | --- | --- | --- |
| `id` | `bigint unsigned` | NN | — |
| `nama` | `varchar(255)` | NN | — |
| `deskripsi` | `text` | NULL | implicit NULL |
| `nama_pembina` | `varchar(255)` | NULL | NULL |
| `nama_ketua` | `varchar(255)` | NULL | NULL |
| `jadwal` | `varchar(255)` | NULL | NULL |
| `lokasi` | `varchar(255)` | NULL | NULL |
| `gambar` | `varchar(255)` | NULL | NULL |
| `created_at` | `timestamp` | NULL | NULL |
| `updated_at` | `timestamp` | NULL | NULL |

Key: PK `id`, AUTO_INCREMENT. Tidak ada unique/index lain.

### `galleries`

| Kolom | Tipe | Null | Default |
| --- | --- | --- | --- |
| `id` | `bigint unsigned` | NN | — |
| `nama_galeri` | `varchar(255)` | NN | — |
| `deskripsi` | `text` | NULL | implicit NULL |
| `created_at` | `timestamp` | NULL | NULL |
| `updated_at` | `timestamp` | NULL | NULL |

Key: PK `id`, AUTO_INCREMENT.

### `images`

| Kolom | Tipe | Null | Default | Keterangan |
| --- | --- | --- | --- | --- |
| `id` | `bigint unsigned` | NN | — | PK, AUTO_INCREMENT |
| `gallery_id` | `bigint unsigned` | NN | — | FK dan index |
| `path` | `varchar(255)` | NN | — | — |
| `caption` | `varchar(255)` | NULL | NULL | — |
| `created_at` | `timestamp` | NULL | NULL | — |
| `updated_at` | `timestamp` | NULL | NULL | — |

Keys: PK `id`; index `images_gallery_id_foreign(gallery_id)`; FK `gallery_id → galleries.id ON DELETE CASCADE`.

### `migrations`

| Kolom | Tipe | Null | Default |
| --- | --- | --- | --- |
| `id` | `int unsigned` | NN | — |
| `migration` | `varchar(255)` | NN | — |
| `batch` | `int` | NN | — |

Key: PK `id`, AUTO_INCREMENT.

### `page_settings`

| Kolom | Tipe | Null | Default |
| --- | --- | --- | --- |
| `id` | `bigint unsigned` | NN | — |
| `logo` | `varchar(255)` | NULL | NULL |
| `judul_hero` | `varchar(255)` | NULL | NULL |
| `deskripsi_hero` | `text` | NULL | implicit NULL |
| `gambar_hero` | `varchar(255)` | NULL | NULL |
| `judul_sejarah` | `varchar(255)` | NULL | NULL |
| `deskripsi_sejarah` | `longtext` | NULL | implicit NULL |
| `gambar_sejarah` | `varchar(255)` | NULL | NULL |
| `judul_video` | `varchar(255)` | NULL | NULL |
| `deskripsi_video` | `text` | NULL | implicit NULL |
| `url_video` | `varchar(255)` | NULL | NULL |
| `url_video2` | `varchar(255)` | NULL | NULL |
| `url_video1` | `varchar(255)` | NULL | NULL |
| `visi` | `text` | NULL | implicit NULL |
| `misi` | `text` | NULL | implicit NULL |
| `gambar_struktur_organisasi` | `varchar(255)` | NULL | NULL |
| `syarat_pendaftaran` | `text` | NN | — |
| `created_at` | `timestamp` | NULL | NULL |
| `updated_at` | `timestamp` | NULL | NULL |
| `gambar_hero1` | `varchar(255)` | NULL | NULL |
| `gambar_hero2` | `varchar(255)` | NULL | NULL |
| `gambar_hero3` | `varchar(255)` | NULL | NULL |
| `gambar_sejarah1` | `varchar(255)` | NULL | NULL |
| `gambar_sejarah2` | `varchar(255)` | NULL | NULL |
| `gambar_sejarah3` | `varchar(255)` | NULL | NULL |

Key: PK `id`, AUTO_INCREMENT. Tidak ada constraint singleton/unique.

### `password_reset_tokens`

| Kolom | Tipe | Null | Default |
| --- | --- | --- | --- |
| `email` | `varchar(255)` | NN | — |
| `token` | `varchar(255)` | NN | — |
| `created_at` | `timestamp` | NULL | NULL |

Key: PK `email`.

### `pengumuman`

| Kolom | Tipe | Null | Default |
| --- | --- | --- | --- |
| `id` | `bigint unsigned` | NN | — |
| `judul` | `varchar(255)` | NN | — |
| `isi` | `text` | NN | — |
| `lampiran` | `text` | NN | — |
| `created_at` | `timestamp` | NULL | NULL |
| `updated_at` | `timestamp` | NULL | NULL |

Key: PK `id`, AUTO_INCREMENT.

### `people`

| Kolom | Tipe | Null | Default |
| --- | --- | --- | --- |
| `id` | `bigint unsigned` | NN | — |
| `nama` | `varchar(255)` | NN | — |
| `tipe` | `enum('pelatih','warga','siswa')` | NN | — |
| `jenis_kelamin` | `enum('L','P')` | NULL | NULL |
| `alamat` | `text` | NULL | implicit NULL |
| `no_hp` | `varchar(255)` | NULL | NULL |
| `foto` | `varchar(255)` | NULL | NULL |
| `created_at` | `timestamp` | NULL | NULL |
| `updated_at` | `timestamp` | NULL | NULL |

Key: PK `id`, AUTO_INCREMENT. Kolom `sabuk` tidak ada.

### `personal_access_tokens`

| Kolom | Tipe | Null | Default |
| --- | --- | --- | --- |
| `id` | `bigint unsigned` | NN | — |
| `tokenable_type` | `varchar(255)` | NN | — |
| `tokenable_id` | `bigint unsigned` | NN | — |
| `name` | `varchar(255)` | NN | — |
| `token` | `varchar(64)` | NN | — |
| `abilities` | `text` | NULL | implicit NULL |
| `last_used_at` | `timestamp` | NULL | NULL |
| `expires_at` | `timestamp` | NULL | NULL |
| `created_at` | `timestamp` | NULL | NULL |
| `updated_at` | `timestamp` | NULL | NULL |

Keys: PK `id`, AUTO_INCREMENT; unique `personal_access_tokens_token_unique(token)`; composite index `(tokenable_type, tokenable_id)`. Tidak ada FK karena relasi polymorphic.

### `sessions`

| Kolom | Tipe | Null | Default |
| --- | --- | --- | --- |
| `id` | `varchar(255)` | NN | — |
| `user_id` | `bigint unsigned` | NULL | NULL |
| `ip_address` | `varchar(45)` | NULL | NULL |
| `user_agent` | `text` | NULL | implicit NULL |
| `payload` | `longtext` | NN | — |
| `last_activity` | `int` | NN | — |

Keys: PK `id`; index `sessions_user_id_index(user_id)`; index `sessions_last_activity_index(last_activity)`. Tidak ada FK formal untuk `user_id`.

### `tipe_dokumen`

| Kolom | Tipe | Null | Default |
| --- | --- | --- | --- |
| `id` | `bigint unsigned` | NN | — |
| `nama` | `varchar(255)` | NN | — |
| `deskripsi` | `text` | NULL | implicit NULL |
| `created_at` | `timestamp` | NULL | NULL |
| `updated_at` | `timestamp` | NULL | NULL |

Key: PK `id`, AUTO_INCREMENT. `nama` tidak unique.

### `users`

| Kolom | Tipe | Null | Default |
| --- | --- | --- | --- |
| `id` | `bigint unsigned` | NN | — |
| `name` | `varchar(255)` | NN | — |
| `email` | `varchar(255)` | NN | — |
| `role` | `varchar(255)` | NN | `user` |
| `email_verified_at` | `timestamp` | NULL | NULL |
| `password` | `varchar(255)` | NN | — |
| `remember_token` | `varchar(100)` | NULL | NULL |
| `created_at` | `timestamp` | NULL | NULL |
| `updated_at` | `timestamp` | NULL | NULL |

Keys: PK `id`, AUTO_INCREMENT; unique `users_email_unique(email)`.

## Nilai unik dan distribusi

| Field | Nilai dalam INSERT | Jumlah |
| --- | --- | ---: |
| `people.tipe` | `siswa` | 12 |
| `people.tipe` | `pelatih` | 5 |
| `people.tipe` | `warga` | 16 |
| `users.role` | `admin` | 1 |
| `users.role` | `super admin` | 1 |
| `artikel.status` | `published` | 6 |

Tidak ada row aktual menggunakan `people.tipe = guru`, `people.tipe = staf`, `users.role = user`, `users.role = super_admin`, atau status artikel `draft`/`archived`. Ketiadaan nilai dalam snapshot ini tidak membuktikan bahwa nilai tersebut tidak pernah atau tidak boleh digunakan.

## Field tambahan `page_settings`

Dump mengonfirmasi bahwa field tambahan berikut benar-benar ada pada snapshot dan sebagian berisi data:

| Field | Ada di dump | Nilai row snapshot | Ada di migration awal | Ada di model/UI |
| --- | --- | --- | --- | --- |
| `gambar_hero1` | Ya | Terisi | Ya | Ya |
| `gambar_hero2` | Ya | Terisi | Ya | Ya |
| `gambar_hero3` | Ya | Terisi | Ya | Ya |
| `syarat_pendaftaran` | Ya, NOT NULL | Terisi | Tidak | Ya, model/Registrasi/Filament |
| `gambar_sejarah1` | Ya | Terisi | Tidak | Ya |
| `gambar_sejarah2` | Ya | Terisi | Tidak | Ya |
| `gambar_sejarah3` | Ya | Terisi | Tidak | Ya |
| `url_video1` | Ya | Terisi | Tidak | Ya |
| `url_video2` | Ya | NULL | Tidak | Ya |

Tidak ditemukan file migration tambahan yang menambahkan enam kolom yang absen dari migration awal. Dump kemungkinan mencerminkan perubahan schema manual atau migration yang tidak disertakan, tetapi penyebabnya tidak dapat dipastikan dari bukti yang tersedia.

## Pemeriksaan orphan records

| Relasi | Child row diperiksa | Orphan | Hasil |
| --- | ---: | ---: | --- |
| `artikel.id_user → users.id` | 6 | 0 | Semua mengarah ke user ID 1 |
| `images.gallery_id → galleries.id` | 3 | 0 | Semua mengarah ke gallery ID 1 |
| `dokumen.tipe_dokumen_id → tipe_dokumen.id` | 3 | 0 | Semua mengarah ke tipe ID 2 |
| `sessions.user_id → users.id` (relasi logis, tanpa FK dump) | 1 non-null dari 10 | 0 | User ID 1 tersedia |

`personal_access_tokens` kosong, sehingga relasi polymorphic-nya tidak memiliki row untuk diuji. `password_reset_tokens` juga kosong.

## Perbandingan dump dengan migration, model, controller, dan UI

### Perbedaan yang didukung bukti

| Area | Dump SQL | Source Laravel | Dampak/Status |
| --- | --- | --- | --- |
| Backend database | Dump MySQL 8.0.30 | Konteks migrasi sebelumnya menyebut SQLite | ⚠️ Dump adalah snapshot alternatif, bukan bukti backend produksi terbaru. |
| `people.tipe` | Enum `pelatih`, `warga`, `siswa`; data memakai ketiganya | Migration mendefinisikan `guru`, `staf`, `siswa`; controller, Home, widget, dan form memakai `pelatih`/`warga`/`siswa` | ⚠️ Dump mendukung controller/UI, bukan migration awal. Jangan mapping `guru` atau `staf` tanpa sumber data lain. |
| `people.sabuk` | Kolom tidak ada | Model `$fillable`, form Siswa, kolom/filter UI memakai `sabuk` | ⚠️ Source mencoba memakai field yang tidak tersedia pada snapshot. Tidak ada data sabuk yang bisa diaudit. |
| Warga Filament | Data memiliki 16 `warga` | `WargaResource` menyimpan default `warga`, tetapi query resource memfilter `siswa` | ⚠️ Daftar admin Warga kemungkinan menampilkan data siswa. |
| Pelatih Filament | Data memiliki 5 `pelatih` | `PelatihResource` menyimpan default `pelatih`, tetapi query resource memfilter `siswa` | ⚠️ Daftar admin Pelatih kemungkinan menampilkan data siswa. |
| `page_settings` ekstra | Enam kolom ekstra di luar migration awal tersedia; lima terisi, `url_video2` NULL | Model, Home, Registrasi, dan Filament menggunakan field-field itu | ⚠️ Dump/UI selaras, tetapi riwayat migration tidak lengkap. |
| `syarat_pendaftaran` nullability | NOT NULL | Tidak ada pada migration awal; TypeScript tahap 1 menganggap nullable | ⚠️ Keputusan nullability Supabase belum dibuat. Snapshot hanya memiliki satu row terisi. |
| `users.role` | Data: `admin`, `super admin`; default schema `user` | Seeder memakai `super admin`; middleware, model, panel, dan pilihan Filament memakai `super_admin` | ⚠️ User ID 2 dengan `super admin` tidak cocok dengan pemeriksaan akses `super_admin`, sehingga berpotensi ditolak. |
| `pengumuman.aktif` | Tidak ada | Model melakukan cast `aktif` ke boolean | ⚠️ Cast menunjuk field yang tidak terdapat pada dump maupun migration. UI publik tidak terbukti memerlukannya. |
| Nama tabel dokumen | `dokumen` | Migration `up()` membuat `dokumen`, tetapi `down()` menghapus `dokumens` | ⚠️ Dump mengonfirmasi nama aktual singular `dokumen`. |
| Nama tabel tipe dokumen | `tipe_dokumen` | Migration `up()` membuat `tipe_dokumen`, tetapi `down()` menghapus `tipe_dokumens` | ⚠️ Dump mengonfirmasi nama aktual singular `tipe_dokumen`. |
| Relasi model Dokumen | FK aktual `dokumen.tipe_dokumen_id` | Method `documentType()` memanggil `belongsTo(TipeDokumen::class)` tanpa nama FK | ⚠️ Konvensi Laravel akan mencari `document_type_id`, sehingga relasi model berpotensi salah; controller menggunakan relasi balik `TipeDokumen::with('dokumen')`. |
| Page settings singleton | Dump berisi 1 row, tanpa unique/singleton constraint | Filament memakai `first()` dan halaman create melarang jumlah ≥1 | ⚠️ Singleton hanya dijaga oleh aplikasi, bukan database. |
| Timestamp | Semua timestamp aplikasi nullable/default NULL | Migration Laravel `$table->timestamps()` juga nullable | Selaras; zona waktu data historis belum dapat disimpulkan. |
| Artikel | 6 row, semuanya `published`, seluruh `id_user=1`, slug unique | Model/controller memakai slug, status published, view count, relasi user | Selaras untuk snapshot. |
| Pengumuman lampiran | `lampiran` NOT NULL; row terisi | Migration juga text wajib; model fillable | Selaras pada Laravel; adapter tahap 1 yang nullable lebih longgar dan perlu diselaraskan nanti. |

### Bagian yang selaras

- Struktur `artikel`, `ekstrakurikuler`, `galleries`, `images`, `pengumuman`, dan tabel inti `users` secara umum sesuai migration masing-masing.
- Tiga FK formal dan `ON DELETE CASCADE` sesuai migration.
- Unique index slug artikel, email user, dan token personal access sesuai migration.
- Controller Home menghitung `siswa`, `pelatih`, dan `warga`; nilai tersebut tersedia pada dump.
- Home dan Filament memakai artikel berstatus `published`; seluruh artikel snapshot memenuhi filter.
- UI Home memakai slider hero, sejarah, dan video tambahan yang memang terdapat dalam dump.

## Hal yang tetap belum jelas

Audit tidak membuat keputusan mapping untuk hal berikut:

1. Apakah dump 30 Mei 2025 adalah salinan terakhir dari database yang pernah digunakan.
2. Apakah database produksi terbaru sebenarnya MySQL atau SQLite.
3. Asal perubahan schema `page_settings` yang tidak tercatat dalam migration.
4. Apakah `sabuk` pernah ada pada database lain atau hanya tertinggal di source.
5. Apakah nilai role kanonis yang diinginkan `super admin` atau `super_admin`.
6. Apakah `lampiran` dan `syarat_pendaftaran` harus tetap NOT NULL di Supabase.
7. Zona waktu timestamp historis.
8. Apakah tabel infrastruktur Laravel perlu diarsipkan; audit ini tidak menyatakan tabel tersebut harus dimigrasikan.

## Kesimpulan audit

`psht.sql` menyediakan snapshot schema dan data yang jauh lebih lengkap daripada file SQLite kosong. Bukti terkuat untuk rancangan selanjutnya adalah:

- domain aktual `people.tipe` pada snapshot adalah `siswa`, `pelatih`, dan `warga`;
- role aktual adalah `admin` dan `super admin`;
- seluruh artikel snapshot berstatus `published`;
- field tambahan `page_settings` benar-benar ada dan digunakan;
- `sabuk` dan `pengumuman.aktif` tidak terdapat dalam dump;
- tidak ada orphan pada relasi data yang dapat diuji;
- beberapa source Filament dan Auth bertentangan dengan data/schema dump.

Temuan ini belum otomatis menjadi keputusan schema Supabase. Finalisasi mapping harus menunggu review dan persetujuan eksplisit.

# Audit SQLite Aktual

Tanggal audit: 4 September 2026
Mode akses: baca-saja (`DatabaseSync(..., { readOnly: true })`)

## Ringkasan eksekutif

Audit schema dan data aktual **tidak dapat dilanjutkan** karena satu-satunya file SQLite yang tersedia berukuran **0 byte**. File ini valid sebagai file kosong, tetapi tidak berisi schema, tabel, index, atau row.

Tidak ada migration, source code, database, data, Auth, Cloudinary, atau UI yang diubah selama audit. File ini adalah satu-satunya artefak yang dibuat.

## Sumber yang diperiksa

| Sumber | Path | Ukuran | Hasil |
| --- | --- | ---: | --- |
| Folder Laravel asli | `E:\PORTOFOLIO WEB CANDRA\psht\database\database.sqlite` | 0 byte | Kosong |
| ZIP Laravel asli | `database/database.sqlite` di `WEBSITEPSHT TANPA NODEMODULES.zip` | 0 byte | Kosong |
| Salinan audit | `work/laravel-audit/database/database.sqlite` | 0 byte | Kosong |

SHA-256 file sumber: `E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855` (hash standar file kosong).

Pencarian rekursif pada `E:\PORTOFOLIO WEB CANDRA\psht` tidak menemukan file `.sqlite`, `.sqlite3`, atau `.db` lain.

## Hasil PRAGMA dan katalog SQLite

| Pemeriksaan | Hasil aktual |
| --- | --- |
| `PRAGMA database_list` | Database `main` menunjuk ke file sumber di atas |
| `PRAGMA schema_version` | `0` |
| `PRAGMA user_version` | `0` |
| `PRAGMA foreign_keys` | `1` pada koneksi audit |
| `sqlite_master` untuk table/view | Tidak ada row |
| `sqlite_master` untuk index | Tidak ada row |

Karena daftar tabel kosong, `PRAGMA table_info`, `PRAGMA foreign_key_list`, dan `PRAGMA index_list` per tabel tidak memiliki target untuk dijalankan.

## Inventaris tabel, kolom, foreign key, index, dan jumlah row

Tidak ada tabel aktual dalam file SQLite yang tersedia. Oleh sebab itu:

- Nama tabel aktual: tidak tersedia.
- Kolom dan tipe data aktual: tidak tersedia.
- Foreign key aktual: tidak tersedia.
- Index aktual: tidak tersedia.
- Jumlah row per tabel: tidak tersedia.

Schema pada migration Laravel tidak dicatat sebagai schema aktual di laporan ini karena permintaan audit secara khusus mensyaratkan pembacaan database SQLite aktual.

## Nilai unik yang diminta

| Field | Status |
| --- | --- |
| `people.tipe` | Tidak dapat diperiksa; tabel `people` tidak ada dalam file aktual |
| `users.role` | Tidak dapat diperiksa; tabel `users` tidak ada dalam file aktual |
| `artikel.status` | Tidak dapat diperiksa; tabel `artikel` tidak ada dalam file aktual |

Tidak ada kesimpulan atau mapping nilai yang dibuat berdasarkan asumsi.

## Field tambahan `page_settings`

Keberadaan field tambahan tidak dapat diverifikasi karena tabel `page_settings` tidak ada dalam database aktual yang tersedia. Field berikut tetap berstatus belum jelas:

- `syarat_pendaftaran`
- `gambar_sejarah1`
- `gambar_sejarah2`
- `gambar_sejarah3`
- `url_video1`
- `url_video2`

## Pemeriksaan orphan records

Pemeriksaan berikut tidak dapat dijalankan karena tabelnya tidak tersedia:

- `artikel.id_user` yang tidak memiliki pasangan pada `users.id`.
- `images.gallery_id` yang tidak memiliki pasangan pada `galleries.id`.
- `dokumen.tipe_dokumen_id` yang tidak memiliki pasangan pada `tipe_dokumen.id`.

Hasilnya bukan “tidak ada orphan”, melainkan **tidak dapat diverifikasi**.

## Status dan kebutuhan tindak lanjut

Audit SQLite aktual berstatus **terblokir oleh database sumber kosong**. Untuk melanjutkan tanpa asumsi, diperlukan salinan read-only dari `database.sqlite` yang dipakai oleh aplikasi Laravel dan berisi data nyata.

Setelah file tersedia, audit berikut dapat dijalankan tanpa mengubah database:

1. Inventaris `sqlite_master`.
2. `PRAGMA table_info`, `foreign_key_list`, dan `index_list` untuk setiap tabel.
3. `COUNT(*)` untuk setiap tabel.
4. `SELECT DISTINCT` untuk tiga field konflik.
5. Pemeriksaan kolom aktual `page_settings`.
6. Anti-join untuk menemukan orphan records.

Tidak ada pekerjaan Phase 2 lain yang dimulai.

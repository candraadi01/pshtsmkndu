# Laporan review draft migration Supabase

Tanggal review: 4 September 2026
Status: draft diperbaiki, belum diterapkan

## Perubahan

1. Policy baca `artikel` diubah dari `using (true)` menjadi `using (status = 'published')`.
2. `artikel.author_id` sekarang konsisten menunjuk `public.profiles(id)`.
3. Kolom penghubung pada `legacy_users` diperjelas dari `auth_user_id` menjadi `profile_id`, juga menunjuk `public.profiles(id)`.
4. Alasan teknis relasi Auth ditambahkan: konten bergantung pada profil aplikasi, sedangkan profil tetap memiliki FK 1:1 ke `auth.users`.
5. Akses anonim `page_settings`, `tipe_dokumen`, dan `dokumen` dipertahankan setelah audit source Laravel mengonfirmasi bahwa konten dan unduhan tersebut memang publik.
6. Dampak pencabutan akses dicatat: Home, Registrasi, Struktur Organisasi, Header, daftar tipe dokumen, atau unduhan dapat terputus.
7. Aturan eksplisit ditambahkan bahwa query `people` tidak boleh memakai `select('*')`; hanya `id,nama,tipe,foto` yang boleh dipilih oleh client.

## Verifikasi batasan

- Migration tidak dijalankan.
- Tidak ada `INSERT`, import dump, atau pemindahan data.
- Tidak ada akun Auth dibuat.
- Tidak ada credential ditambahkan.
- Tidak ada password hash Laravel disimpan.
- Tidak ada upload Cloudinary.
- Tidak ada UI atau source aplikasi diubah.

## Validasi yang dijalankan

- `git diff --check`.
- Audit seluruh policy dan grant.
- Pencarian policy artikel yang terlalu luas.
- Pencarian grant write untuk `anon`/`authenticated`.
- Pemeriksaan FK `author_id` dan relasi desain.
- Pemeriksaan bahwa grant `people` hanya mencantumkan empat kolom publik.

Typecheck/build tidak diperlukan karena perubahan terbatas pada Markdown dan draft SQL; source aplikasi tidak disentuh.

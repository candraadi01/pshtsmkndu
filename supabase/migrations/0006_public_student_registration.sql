-- Allow public prospective students to register themselves via online form
-- Restricted to only tipe = 'siswa' and cannot tamper with 'pelatih' or 'warga'

grant insert (nama, tipe, sabuk, jenis_kelamin, alamat, no_hp, created_at, updated_at)
  on table public.people to anon, authenticated;

create policy people_public_register_siswa
  on public.people
  for insert
  to anon, authenticated
  with check (tipe = 'siswa');

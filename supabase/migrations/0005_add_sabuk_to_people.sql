-- Migration 0005: Add sabuk column to people table for PSHT student belt levels

begin;

alter table public.people 
add column if not exists sabuk text;

comment on column public.people.sabuk is 'Tingkatan sabuk siswa PSHT: Polos (Hitam), Jambon, Hijau, Putih.';

commit;

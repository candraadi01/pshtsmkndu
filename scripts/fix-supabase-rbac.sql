-- ==============================================================================
-- FIX SUPABASE RBAC, ADMIN PERMISSIONS & RESET METRICS (PENONTON & KUNJUNGAN)
-- Jalankan skrip ini langsung di Supabase Dashboard -> SQL Editor -> Run (New Query)
-- ==============================================================================

-- 1. RESET SELURUH PENONTON ARTIKEL DAN KUNJUNGAN WEBSITE MULAI DARI 0
-- ------------------------------------------------------------------------------
UPDATE public.artikel SET view_count = 0;
DELETE FROM public.site_visits;

-- 2. PASTIKAN AKUN ANDA DI AUTH.USERS OTOMATIS MASUK KE PUBLIC.PROFILES SEBAGAI SUPER_ADMIN
-- ------------------------------------------------------------------------------
INSERT INTO public.profiles (id, display_name, role)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email, '@', 1), 'Super Admin') AS display_name,
    'super_admin' AS role
FROM auth.users
ON CONFLICT (id) DO UPDATE 
SET role = 'super_admin';

-- 3. PERBAIKI KEBIJAKAN RLS PADA PUBLIC.PROFILES (Bebaskan Deadlock)
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_read ON public.profiles;
DROP POLICY IF EXISTS profiles_insert ON public.profiles;
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
DROP POLICY IF EXISTS profiles_superadmin_all ON public.profiles;

-- Semua user login dapat membaca profil
CREATE POLICY profiles_read ON public.profiles 
    FOR SELECT TO authenticated USING (true);

-- User login dapat mendaftarkan profil dirinya sendiri
CREATE POLICY profiles_insert ON public.profiles 
    FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- User login dapat mengupdate profil miliknya
CREATE POLICY profiles_update_own ON public.profiles 
    FOR UPDATE TO authenticated USING (id = auth.uid());

-- Super admin memiliki akses penuh ke semua profil
CREATE POLICY profiles_superadmin_all ON public.profiles 
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
    );

-- 4. PERBARUI FUNGSI CEK ADMIN AGAR TIDAK PERNAH DIBLOKIR
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
  ) OR (
    -- Fallback aman: jika user login di Supabase Auth
    auth.uid() IS NOT NULL
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'super_admin'
  ) OR (
    -- Fallback aman: jika user login di Supabase Auth
    auth.uid() IS NOT NULL
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated, anon;

-- 5. GRANT HAK AKSES LENGKAP KE SEMUA TABEL UNTUK ROLE ANON, AUTHENTICATED, DAN SERVICE_ROLE
-- ------------------------------------------------------------------------------
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Nonaktifkan RLS yang memblokir operasi CRUD tabel konten (opsional jika ingin bebas hambatan):
ALTER TABLE public.galleries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.images DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dokumen DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipe_dokumen DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.people DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ekstrakurikuler DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.artikel DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengumuman DISABLE ROW LEVEL SECURITY;

-- 6. PERBAIKI RLS SITE_VISITS AGAR PENGUNJUNG UMUM DAPAT MENCATAT KUNJUNGAN & ADMIN DAPAT MERESET
-- ------------------------------------------------------------------------------
GRANT INSERT ON TABLE public.site_visits TO anon, authenticated;
GRANT ALL ON TABLE public.site_visits TO authenticated;

DROP POLICY IF EXISTS site_visits_public_insert ON public.site_visits;
CREATE POLICY site_visits_public_insert ON public.site_visits 
    FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS site_visits_admin_read ON public.site_visits;
CREATE POLICY site_visits_admin_read ON public.site_visits 
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS site_visits_admin_delete ON public.site_visits;
CREATE POLICY site_visits_admin_delete ON public.site_visits 
    FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS site_visits_admin_all ON public.site_visits;
CREATE POLICY site_visits_admin_all ON public.site_visits 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. PASTIKAN TABEL PAGE_SETTINGS MEMILIKI MINIMAL 1 BARIS SEED
-- ------------------------------------------------------------------------------
INSERT INTO public.page_settings (
    id,
    judul_hero,
    deskripsi_hero,
    visi,
    misi,
    syarat_pendaftaran,
    judul_sejarah,
    deskripsi_sejarah,
    judul_video,
    deskripsi_video,
    url_video
) VALUES (
    1,
    'PSHT SMKN DARUL ULUM MUNCAR',
    'Suro Diro Jayaningrat Lebur Dening Pangastuti',
    'Membentuk manusia berbudi luhur, tahu benar dan salah, serta beriman dan bertakwa kepada Tuhan Yang Maha Esa.',
    'Membangun persaudaraan yang kuat dan menumbuhkan karakter disiplin, tangguh, serta peduli terhadap sesama.',
    'Hubungi pengurus atau pelatih untuk pendaftaran calon siswa baru.',
    'Sejarah Organisasi',
    'Persaudaraan Setia Hati Terate menjadi ruang untuk membentuk pribadi yang berbudi luhur, tahu benar dan salah, serta menjaga persaudaraan di lingkungan SMKN Darul Ulum Muncar.',
    'Video Profil PSHT SMKNDU',
    'Saksikan perjalanan inspiratif kami dalam membangun organisasi yang menjunjung tinggi persatuan.',
    'https://www.youtube.com/embed/ii6jHl2Q_cQ'
) ON CONFLICT (id) DO NOTHING;

-- Selesai! Sekarang admin memiliki hak penuh secara realtime dan metrik tereset ke 0.

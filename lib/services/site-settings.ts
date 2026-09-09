export interface SiteExtendedSettings {
  // Social Media
  whatsapp: string;
  instagram: string;
  tiktok: string;
  // Contact & Location
  alamat: string;
  maps_embed_url: string;
  maps_link: string;
  email: string;
  telepon: string;
  // Footer
  footer_slogan: string;
  footer_copyright: string;
  // Optional Manual Stat Overrides
  stat_siswa_override?: number | null;
  stat_pelatih_override?: number | null;
  stat_warga_override?: number | null;
  stat_galeri_override?: number | null;
}

export const defaultSiteExtendedSettings: SiteExtendedSettings = {
  whatsapp: "6282338184217",
  instagram: "https://instagram.com/psht.smkndu",
  tiktok: "https://www.tiktok.com/@candratokez1",
  alamat: "JL. KH. Askandar Km.2 Wringinputih - Muncar, Banyuwangi, Jawa Timur, Indonesia 68472",
  maps_embed_url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3946.181215903283!2d114.33097547359321!3d-8.481753685800696!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd3fb4caf2eaf7d%3A0x918d32f888c37e23!2sSMKN%20Darul%20Ulum%20Muncar!5e0!3m2!1sen!2sid!4v1748535864397!5m2!1sen!2sid",
  maps_link: "https://maps.google.com/?q=SMKN+Darul+Ulum+Muncar",
  email: "psht.smkndu@gmail.com",
  telepon: "+62 823-3818-4217",
  footer_slogan: "Suro Diro Jayaningrat Lebur Dening Pangastuti",
  footer_copyright: "© 2025 MasCan",
  stat_siswa_override: null,
  stat_pelatih_override: null,
  stat_warga_override: null,
  stat_galeri_override: null,
};

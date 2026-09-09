import Link from "next/link";
import { defaultSiteExtendedSettings, type SiteExtendedSettings } from "@/lib/services/site-settings";

export default function SiteFooter({
  extendedSettings,
}: {
  extendedSettings?: SiteExtendedSettings | null;
} = {}) {
  const ext = extendedSettings || defaultSiteExtendedSettings;

  const rawWa = ext.whatsapp || "6282338184217";
  const waUrl = rawWa.startsWith("http") ? rawWa : `https://wa.me/${rawWa.replace(/\D/g, "")}`;
  const rawIg = ext.instagram || "https://www.instagram.com/psht.smkndu";
  const igUrl = rawIg.startsWith("http") ? rawIg : `https://instagram.com/${rawIg.replace(/^@/, "")}`;
  const rawTt = ext.tiktok || "https://www.tiktok.com/@candratokez1";
  const ttUrl = rawTt.startsWith("http") ? rawTt : `https://www.tiktok.com/@${rawTt.replace(/^@/, "")}`;

  return (
    <footer className="relative overflow-hidden bg-black pb-6 pt-12 text-white">
      <div className="animate-pulse-line absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-white via-black to-white" />
      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 md:grid-cols-3">
        <div className="flex items-start gap-4">
          <img className="h-16 w-auto object-contain mt-1" src="/storage/psht-logo-hd.png" alt="Logo Resmi PSHT" />
          <div>
            <h2 className="text-2xl font-bold tracking-wide">
              TERATE <span className="text-white/70">SMKNDU</span>
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/80">
              {ext.footer_slogan || "Suro Diro Jayaningrat Lebur Dening Pangastuti"}
            </p>
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/70">Menu</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/" className="hover:text-white/70">Beranda</Link>
            </li>
            <li>
              <Link href="/artikel" className="hover:text-white/70">Artikel</Link>
            </li>
            <li>
              <Link href="/ekstrakurikuler" className="hover:text-white/70">Ekstrakurikuler</Link>
            </li>
            <li>
              <Link href="/kontak" className="hover:text-white/70">Kontak</Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/70">Hubungi Kami</h3>
          <p className="text-sm text-white/80 whitespace-pre-line leading-relaxed">
            {ext.alamat || "PSHT SMKN DARUL ULUM MUNCAR\nJL. KH. Askandar Km.2 Wringinputih - Muncar, Banyuwangi, Jawa Timur"}
          </p>
        </div>
      </div>
      <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-white/20 px-6 pt-4 text-sm text-white/60 md:flex-row">
        <span>{ext.footer_copyright || "© 2025 MasCan"}</span>
        <div className="flex gap-4">
          {igUrl && <a href={igUrl} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Instagram</a>}
          {waUrl && <a href={waUrl} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">WhatsApp</a>}
          {ttUrl && <a href={ttUrl} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">TikTok</a>}
        </div>
      </div>
    </footer>
  );
}

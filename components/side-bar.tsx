import Link from "next/link";
import { formatIndonesianDate } from "@/lib/date";
import type { Artikel, Pengumuman } from "@/types/content";

interface SideBarProps {
  popularArticles: Artikel[];
  pengumuman?: Pengumuman[];
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

function getShortMonth(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
  try {
    const d = new Date(dateStr);
    return months[d.getMonth()] || "";
  } catch {
    return "";
  }
}

function getDayNumber(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return String(d.getDate());
  } catch {
    return "";
  }
}

export default function SideBar({ popularArticles, pengumuman }: SideBarProps) {
  return (
    <aside className="w-full lg:w-[35%] bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl md:border-l-4 md:border-gray-600 border border-gray-200 flex flex-col justify-between">
      <div>
        {/* Artikel Populer Section */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-6 text-gray-800 border-b-2 border-gray-500 pb-2 inline-block">
            Artikel Populer
          </h2>

          <ul className="space-y-4">
            {popularArticles.slice(0, 5).map((item, index) => (
              <li
                key={item.id}
                className="bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-3.5 hover:shadow-sm transition duration-200"
              >
                <div className="flex-shrink-0 w-7 h-7 bg-[#4a5568] text-white rounded-md flex items-center justify-center font-bold text-xs select-none">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/artikel/${item.slug}`}
                    className="text-gray-900 font-bold hover:text-gray-600 transition-colors duration-200 line-clamp-2 block text-sm leading-snug"
                    title={`Baca artikel: ${item.judul}`}
                  >
                    {item.judul}
                  </Link>
                  <div className="flex items-center text-xs text-gray-400 mt-1">
                    <i className="fa-regular fa-calendar mr-1.5 flex-shrink-0" />
                    <span className="truncate">{formatIndonesianDate(item.published_at)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 text-center">
            <Link
              href="/artikel"
              className="inline-block px-5 py-2 bg-white text-gray-600 border border-gray-400 rounded-md hover:bg-gray-600 hover:text-white transition-colors duration-200 text-xs font-semibold"
            >
              Lihat Semua Artikel
            </Link>
          </div>
        </div>

        {/* Pengumuman Terbaru Section */}
        {pengumuman && pengumuman.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-6 text-gray-800 border-b-2 border-gray-600 pb-2 inline-block">
              Pengumuman Terbaru
            </h2>

            <ul className="space-y-4">
              {pengumuman.slice(0, 1).map((item) => (
                <li
                  key={item.id}
                  className="bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-3.5 hover:shadow-sm transition duration-200"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-[#4a5568] text-white rounded-full flex flex-col items-center justify-center font-bold text-xs leading-none select-none">
                    <span>{getDayNumber(item.created_at)}</span>
                    <span className="text-[10px] uppercase mt-0.5">{getShortMonth(item.created_at)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/pengumuman/${item.id}`}
                      className="text-gray-900 font-bold hover:text-gray-600 transition-colors duration-200 line-clamp-2 block text-sm leading-snug"
                      title={`Baca pengumuman: ${item.judul}`}
                    >
                      {item.judul}
                    </Link>
                    <div className="flex items-center text-xs text-gray-400 mt-1">
                      <i className="fa-regular fa-bell mr-1.5 flex-shrink-0" />
                      <span className="truncate">{item.created_at_formatted || formatIndonesianDate(item.created_at)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 text-center">
              <Link
                href="/pengumuman"
                className="inline-block px-5 py-2 bg-white text-gray-600 border border-gray-400 rounded-md hover:bg-gray-600 hover:text-white transition-colors duration-200 text-xs font-semibold"
              >
                Lihat Semua Pengumuman
              </Link>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

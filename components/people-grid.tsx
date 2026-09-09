"use client";

import { useMemo, useState, useEffect } from "react";
import { resolveMediaUrl } from "@/lib/media";
import type { Person } from "@/types/content";

interface PeopleGridProps {
  people: Person[];
  roleLabel: string;
  emptyMessage?: string;
}

const getSabukColor = (sabuk?: string | null) => {
  if (!sabuk) return "bg-gray-100 text-gray-800";

  switch (sabuk.toLowerCase().trim()) {
    case "polos":
      return "bg-gray-100 text-gray-800";
    case "jambon":
      return "bg-pink-100 text-pink-800";
    case "hijau":
      return "bg-green-100 text-green-800";
    case "putih":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatPhone = (phone?: string | null) => {
  if (!phone) return "-";
  return phone;
};

export default function PeopleGrid({
  people,
  roleLabel,
  emptyMessage = "Belum ada data yang dipublikasikan saat ini.",
}: PeopleGridProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const isSiswa = roleLabel.toLowerCase().includes("siswa");

  // Reset page to 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  // Filter and search logic
  const filteredAndSearchedPeople = useMemo(() => {
    return people.filter((item) => {
      const matchesSearch =
        search === "" ||
        item.nama.toLowerCase().includes(search.toLowerCase().trim());

      const matchesFilter =
        filter === "" ||
        (item.sabuk &&
          item.sabuk.toLowerCase().trim() === filter.toLowerCase().trim());

      return matchesSearch && matchesFilter;
    });
  }, [people, search, filter]);

  const totalPages = Math.ceil(filteredAndSearchedPeople.length / itemsPerPage);

  const paginatedPeople = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredAndSearchedPeople.slice(start, end);
  }, [filteredAndSearchedPeople, currentPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section with Search and Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-700 border-b-4 border-gray-500 pb-2 max-w-max">
          Daftar {roleLabel}
        </h1>

        <div className="w-full md:w-auto flex flex-col md:flex-row gap-3">
          {/* Filter Sabuk (khusus siswa) */}
          {isSiswa && (
            <div className="relative w-full sm:w-auto">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500 bg-white w-full sm:w-auto sm:min-w-[150px] text-sm text-gray-700 outline-none"
              >
                <option value="">Semua Sabuk</option>
                <option value="polos">Polos</option>
                <option value="jambon">Jambon</option>
                <option value="hijau">Hijau</option>
                <option value="putih">Putih</option>
              </select>
            </div>
          )}

          {/* Search Input */}
          <div className="relative w-full md:w-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Cari ${roleLabel.toLowerCase()}...`}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500 w-full md:min-w-[250px] text-sm text-gray-900 outline-none"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 absolute left-3 top-2.5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Filter Info */}
      {(filter || search) && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>
            Menampilkan {filteredAndSearchedPeople.length} dari {people.length} {roleLabel.toLowerCase()}
          </span>
          <div className="flex gap-2">
            {filter && (
              <span className="px-2 py-1 bg-gray-200 rounded-full text-xs flex items-center">
                Sabuk: {filter}
                <button
                  type="button"
                  onClick={() => setFilter("")}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </span>
            )}
            {search && (
              <span className="px-2 py-1 bg-gray-200 rounded-full text-xs flex items-center">
                Pencarian: {search}
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredAndSearchedPeople.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-700">
            Tidak ada {roleLabel.toLowerCase()} yang ditemukan
          </h3>
          <p className="text-gray-500 mt-2">
            Coba dengan kata kunci pencarian yang berbeda atau ubah filter
          </p>
        </div>
      ) : (
        /* Student Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {paginatedPeople.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden transition duration-300 hover:shadow-xl hover:border-gray-300"
            >
              {/* Foto dan Nama */}
              <div className="p-4 pb-1 flex flex-col items-center text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.foto ? resolveMediaUrl(item.foto) : "/storage/people.png"}
                  alt={`Foto ${item.nama}`}
                  className="w-64 h-64 rounded-xl object-cover border-2 border-gray-300 shadow-sm mb-3"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/storage/people.png";
                  }}
                />
                <h2 className="text-lg text-left font-semibold text-gray-800 truncate w-full">
                  {item.nama}
                </h2>
              </div>

              {/* Info Detail */}
              <div className="border-t border-gray-100"></div>
              <div className="p-4 pt-0 text-sm text-gray-700 space-y-2">
                {isSiswa && (
                  <div className="flex">
                    <span className="text-gray-500 w-28">Sabuk:</span>
                    <span className="flex-1 font-medium text-gray-800 capitalize">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getSabukColor(
                          item.sabuk
                        )}`}
                      >
                        {item.sabuk}
                      </span>
                    </span>
                  </div>
                )}
                <div className="flex">
                  <span className="text-gray-500 w-28">Jenis Kelamin:</span>
                  <span className="flex-1 font-medium text-gray-800">
                    {item.jenis_kelamin === "L" || item.jenis_kelamin === "Laki-Laki"
                      ? "Laki-Laki"
                      : "Perempuan"}
                  </span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-28">Alamat:</span>
                  <span className="flex-1 line-clamp-2 text-gray-800">{item.alamat}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-28">No HP:</span>
                  <span className="flex-1 font-medium text-gray-800">{formatPhone(item.no_hp)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded border text-sm font-medium ${
              currentPage === 1
                ? "bg-gray-200 text-gray-500 cursor-not-allowed border-gray-200"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => goToPage(page)}
              className={`px-3 py-1 rounded border text-sm font-medium ${
                currentPage === page
                  ? "bg-gray-600 text-white border-gray-600"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded border text-sm font-medium ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-500 cursor-not-allowed border-gray-200"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

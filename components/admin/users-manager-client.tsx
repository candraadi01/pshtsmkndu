"use client";

import { useState, useTransition } from "react";
import { updateUserRoleAction } from "@/lib/services/admin-crud";
import { formatIndonesianDate } from "@/lib/date";

interface ProfileItem {
  id: string;
  display_name: string | null;
  role: "super_admin" | "admin" | "user" | string;
  created_at?: string;
}

export default function UsersManagerClient({
  profiles,
  currentUserId,
}: {
  profiles: ProfileItem[];
  currentUserId: string;
}) {
  const [list, setList] = useState<ProfileItem[]>(profiles);
  const [isPending, startTransition] = useTransition();

  const handleToggleRole = (userId: string, currentRole: string) => {
    if (userId === currentUserId) {
      alert("Anda tidak dapat mengubah peran akun Anda sendiri.");
      return;
    }

    const newRole = currentRole === "super_admin" ? "admin" : "super_admin";
    if (!confirm(`Ubah peran administrator ini menjadi ${newRole === "super_admin" ? "Super Admin" : "Admin"}?`)) {
      return;
    }

    startTransition(async () => {
      const res = await updateUserRoleAction(userId, newRole);
      if (res.success) {
        setList((prev) =>
          prev.map((p) => (p.id === userId ? { ...p, role: newRole } : p))
        );
      } else {
        alert("Gagal mengubah peran: " + res.error);
      }
    });
  };

  return (
    <div className="bg-[#151d2a] rounded-3xl border border-gray-800 overflow-hidden shadow-xl">
      <div className="p-6 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">Daftar Administrator Terdaftar</h3>
          <p className="text-xs text-gray-400">Total {list.length} pengguna memiliki hak akses</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-[#0f172a] text-gray-400 text-[11px] uppercase tracking-wider">
              <th className="p-4 font-semibold">Nama / Pengguna</th>
              <th className="p-4 font-semibold">Peran Saat Ini</th>
              <th className="p-4 font-semibold">Terdaftar Pada</th>
              <th className="p-4 font-semibold text-right">Kelola Hak Akses</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {list.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  Belum ada profil pengguna terdaftar.
                </td>
              </tr>
            ) : (
              list.map((item) => {
                const isSelf = item.id === currentUserId;
                const isSuper = item.role === "super_admin";

                return (
                  <tr key={item.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center font-bold text-amber-400 text-xs border border-gray-700">
                          {(item.display_name || "A")[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-gray-200 flex items-center gap-2">
                            <span>{item.display_name || "Admin"}</span>
                            {isSelf && (
                              <span className="px-2 py-0.5 rounded-full bg-gray-800 text-[10px] text-gray-400 border border-gray-700">
                                Akun Anda
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-gray-500 font-mono truncate max-w-xs">{item.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          isSuper
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                            : "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                        }`}
                      >
                        <i className={`fa-solid ${isSuper ? "fa-crown text-amber-400" : "fa-user-shield text-blue-400"} text-[10px]`} />
                        <span>{isSuper ? "Super Admin" : "Admin"}</span>
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 text-xs">
                      {item.created_at ? formatIndonesianDate(item.created_at) : "-"}
                    </td>
                    <td className="p-4 text-right">
                      {!isSelf ? (
                        <button
                          onClick={() => handleToggleRole(item.id, item.role)}
                          disabled={isPending}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            isSuper
                              ? "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/30"
                              : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30"
                          }`}
                        >
                          {isSuper ? "Turunkan ke Admin" : "Jadikan Super Admin"}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-500 italic">Akun aktif</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

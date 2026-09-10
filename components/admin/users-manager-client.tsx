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
    <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm border-t-4 border-t-amber-500">
      <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <i className="fa-solid fa-user-shield text-amber-500" />
            <span>Daftar Administrator Terdaftar</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Total {list.length} pengguna memiliki kredensial dan hak akses admin</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-600 text-[11px] uppercase tracking-wider font-extrabold">
              <th className="py-3.5 px-5 font-bold">Nama / Pengguna</th>
              <th className="py-3.5 px-4 font-bold">Peran Saat Ini</th>
              <th className="py-3.5 px-4 font-bold">Terdaftar Pada</th>
              <th className="py-3.5 px-5 font-bold text-right">Kelola Hak Akses</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-400 font-medium">
                  Belum ada profil pengguna terdaftar.
                </td>
              </tr>
            ) : (
              list.map((item) => {
                const isSelf = item.id === currentUserId;
                const isSuper = item.role === "super_admin";

                return (
                  <tr key={item.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-xs shrink-0 border border-amber-200">
                          {(item.display_name || "A")[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span>{item.display_name || "Admin"}</span>
                            {isSelf && (
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-600 font-bold border border-slate-200">
                                Akun Anda
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono truncate max-w-xs">{item.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          isSuper
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-blue-50 text-blue-800 border border-blue-200"
                        }`}
                      >
                        <i className={`fa-solid ${isSuper ? "fa-crown text-amber-600" : "fa-user-shield text-blue-600"} text-xs`} />
                        <span>{isSuper ? "Super Admin" : "Admin"}</span>
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-500 text-xs font-medium">
                      {item.created_at ? formatIndonesianDate(item.created_at) : "-"}
                    </td>
                    <td className="py-4 px-5 text-right">
                      {!isSelf ? (
                        <button
                          onClick={() => handleToggleRole(item.id, item.role)}
                          disabled={isPending}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            isSuper
                              ? "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                              : "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200"
                          }`}
                        >
                          {isSuper ? "Turunkan ke Admin" : "Jadikan Super Admin"}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Akun Anda saat ini</span>
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

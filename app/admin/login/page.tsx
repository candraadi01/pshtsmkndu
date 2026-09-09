"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { loginAction } from "@/lib/services/auth";

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-8 bg-[#1e293b] p-8 sm:p-10 rounded-3xl shadow-2xl border border-gray-700/80 relative z-10">
        {/* Logo & Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-2 bg-black/60 rounded-2xl mb-4 border border-amber-500/40 shadow-inner">
            <Image
              src="/sh-emblem.png"
              alt="Logo PSHT SMKNDU"
              width={80}
              height={80}
              className="w-16 h-16 object-contain"
              priority
            />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Portal Administrator
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-400">
            PSHT Sub Rayon SMKN Darul Ulum Muncar
          </p>
        </div>

        {/* Error Alert */}
        {state?.error && (
          <div className="p-4 rounded-xl bg-red-900/40 border border-red-500/50 text-red-200 text-xs sm:text-sm flex items-start gap-3">
            <i className="fa-solid fa-circle-exclamation text-red-400 mt-0.5 text-base" />
            <span>{state.error}</span>
          </div>
        )}

        {/* Login Form */}
        <form action={formAction} className="mt-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
              Email Administrator
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                <i className="fa-solid fa-envelope" />
              </span>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="nama@domain.com"
                className="w-full pl-10 pr-4 py-3 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                <i className="fa-solid fa-lock" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-3 bg-[#0f172a] border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-200 transition-colors"
                aria-label="Toggle password visibility"
              >
                <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-gray-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all transform active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-right-to-bracket" />
                <span>Masuk ke Dashboard</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-amber-400 transition-colors"
          >
            <i className="fa-solid fa-arrow-left" />
            <span>Kembali ke Website Utama</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

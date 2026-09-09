"use client";

import { useState, useTransition } from "react";
import { submitRegistrationAction, type RegistrationPayload } from "@/app/registrasi/actions";

interface RegistrasiFormProps {
  syaratPendaftaranHtml: string;
}

export default function RegistrasiForm({ syaratPendaftaranHtml }: RegistrasiFormProps) {
  const [activeTab, setActiveTab] = useState<"syarat" | "form">("syarat");
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState<RegistrationPayload>({
    nama: "",
    jenis_kelamin: "L",
    no_hp: "",
    alamat: "",
    kelas: "",
    motivasi: "",
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<{
    code: string;
    payload: RegistrationPayload;
    message: string;
    registeredInDb: boolean;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const res = await submitRegistrationAction(formData);
      if (!res.success) {
        setErrorMessage(res.error || "Gagal mengirim pendaftaran. Periksa input Anda.");
      } else {
        setSubmittedData({
          code: res.registrationCode,
          payload: { ...formData },
          message: res.message || "Pendaftaran Anda telah berhasil diproses!",
          registeredInDb: res.registeredInDb,
        });
      }
    });
  };

  const getWhatsAppUrl = () => {
    if (!submittedData) return "#";
    const p = submittedData.payload;
    const text =
      `*PENDAFTARAN CALON SISWA PSHT SMKN DARUL ULUM MUNCAR*\n\n` +
      `*No. Registrasi:* ${submittedData.code}\n` +
      `*Nama Lengkap:* ${p.nama}\n` +
      `*Jenis Kelamin:* ${p.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}\n` +
      `*No. WhatsApp:* ${p.no_hp}\n` +
      `*Kelas/Jurusan:* ${p.kelas || "-"}\n` +
      `*Alamat:* ${p.alamat}\n` +
      (p.motivasi ? `*Motivasi:* ${p.motivasi}\n` : "") +
      `\n_Halo Kak/Pengurus PSHT, saya telah mengisi formulir registrasi online di website resmi. Mohon konfirmasi jadwal dan informasi latihan selanjutnya. Terima kasih!_`;

    return `https://wa.me/6282338184217?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="w-full">
      {/* Tab Switcher */}
      <div className="flex border-b border-gray-200 mb-6 sm:mb-8">
        <button
          type="button"
          onClick={() => setActiveTab("syarat")}
          className={`flex-1 py-3 px-4 text-center font-semibold text-sm sm:text-base border-b-2 transition-all flex items-center justify-center gap-2 ${
            activeTab === "syarat"
              ? "border-black text-black"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <i className="fa-solid fa-clipboard-list text-sm" />
          <span>Syarat &amp; Ketentuan</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("form")}
          className={`flex-1 py-3 px-4 text-center font-semibold text-sm sm:text-base border-b-2 transition-all flex items-center justify-center gap-2 ${
            activeTab === "form"
              ? "border-black text-black"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <i className="fa-solid fa-user-plus text-sm" />
          <span>Formulir Online</span>
        </button>
      </div>

      {/* Tab 1: Syarat Pendaftaran */}
      {activeTab === "syarat" && (
        <div className="space-y-6">
          <div
            className="prose prose-sm sm:prose max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: syaratPendaftaranHtml }}
          />

          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <p className="text-xs text-gray-500 text-center sm:text-left">
              Sudah memahami syarat di atas? Lanjutkan pengisian formulir pendaftaran.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab("form")}
              className="w-full sm:w-auto px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-all shadow-md inline-flex items-center justify-center gap-2"
            >
              <span>Isi Formulir Sekarang</span>
              <i className="fa-solid fa-arrow-right text-xs" />
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Formulir Pendaftaran */}
      {activeTab === "form" && (
        <div>
          {submittedData ? (
            /* Success Receipt View */
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-6 sm:p-8 text-center space-y-5 animate-fadeIn">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
                <i className="fa-solid fa-circle-check text-3xl" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 bg-emerald-200 text-emerald-800 text-xs font-bold rounded-full uppercase tracking-wider mb-2">
                  Pendaftaran Berhasil Dibuat
                </span>
                <h3 className="text-2xl font-bold text-gray-900">
                  Selamat, {submittedData.payload.nama}!
                </h3>
                <p className="text-sm text-gray-600 mt-1 max-w-md mx-auto">
                  {submittedData.message}
                </p>
              </div>

              {/* Detail Card */}
              <div className="bg-white rounded-xl p-4 sm:p-5 border border-emerald-200/80 text-left max-w-lg mx-auto shadow-sm text-sm space-y-2">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Nomor Registrasi:</span>
                  <span className="font-mono font-bold text-black">{submittedData.code}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Nama:</span>
                  <span className="font-semibold text-gray-900">{submittedData.payload.nama}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Jenis Kelamin:</span>
                  <span className="text-gray-900">
                    {submittedData.payload.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">WhatsApp:</span>
                  <span className="font-mono text-gray-900">{submittedData.payload.no_hp}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Kelas/Jurusan:</span>
                  <span className="text-gray-900">{submittedData.payload.kelas || "-"}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-gray-500">Status Awal:</span>
                  <span className="inline-flex items-center gap-1 font-bold text-gray-900">
                    <span className="h-2.5 w-2.5 rounded-full bg-gray-400 border border-black" />
                    Siswa Sabuk Polos
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold rounded-xl shadow-lg hover:from-emerald-700 hover:to-green-700 transition-all flex items-center justify-center gap-2 text-sm active:scale-95"
                >
                  <i className="fab fa-whatsapp text-lg" />
                  <span>Kirim Konfirmasi ke WhatsApp Pengurus</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedData(null);
                    setFormData({
                      nama: "",
                      jenis_kelamin: "L",
                      no_hp: "",
                      alamat: "",
                      kelas: "",
                      motivasi: "",
                    });
                  }}
                  className="w-full sm:w-auto px-5 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all text-sm"
                >
                  Daftarkan Siswa Lain
                </button>
              </div>
            </div>
          ) : (
            /* The Registration Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                  <i className="fa-solid fa-circle-exclamation text-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1.5">
                  Nama Lengkap Siswa <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <i className="fa-solid fa-user text-sm" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Contoh: Muhammad Bintang Terate"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Jenis Kelamin & No WhatsApp in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Jenis Kelamin */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1.5">
                    Jenis Kelamin <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, jenis_kelamin: "L" })}
                      className={`py-2 px-3 rounded-xl border text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition ${
                        formData.jenis_kelamin === "L"
                          ? "border-black bg-black text-white shadow-sm"
                          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <i className="fa-solid fa-mars" />
                      <span>Laki-laki</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, jenis_kelamin: "P" })}
                      className={`py-2 px-3 rounded-xl border text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition ${
                        formData.jenis_kelamin === "P"
                          ? "border-black bg-black text-white shadow-sm"
                          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <i className="fa-solid fa-venus" />
                      <span>Perempuan</span>
                    </button>
                  </div>
                </div>

                {/* No WhatsApp / HP */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1.5">
                    Nomor WhatsApp / HP Aktif <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600">
                      <i className="fab fa-whatsapp text-base" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={formData.no_hp}
                      onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                      placeholder="Contoh: 0821xxxxxxxx"
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Kelas / Jurusan */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1.5">
                  Kelas / Jurusan / Asal Sekolah
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <i className="fa-solid fa-graduation-cap text-sm" />
                  </div>
                  <input
                    type="text"
                    value={formData.kelas}
                    onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                    placeholder="Contoh: Kelas X TKJ 1 SMKN Darul Ulum (atau Umum)"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Alamat Lengkap */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1.5">
                  Alamat Tempat Tinggal <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3.5 pointer-events-none text-gray-400">
                    <i className="fa-solid fa-location-dot text-sm" />
                  </div>
                  <textarea
                    required
                    rows={2}
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    placeholder="Dusun, Desa/Kelurahan, RT/RW, Kecamatan"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition resize-none"
                  />
                </div>
              </div>

              {/* Motivasi */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1.5">
                  Alasan / Motivasi Bergabung <span className="text-gray-400 font-normal">(Opsional)</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.motivasi}
                  onChange={(e) => setFormData({ ...formData, motivasi: e.target.value })}
                  placeholder="Ceritakan singkat motivasi Anda belajar silat dan bela negara di PSHT..."
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-3 px-6 bg-black text-white font-bold rounded-xl shadow-lg hover:bg-gray-800 active:scale-[0.99] disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sedang Mengirim Pendaftaran...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane text-sm" />
                      <span>Kirim Pendaftaran Online</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

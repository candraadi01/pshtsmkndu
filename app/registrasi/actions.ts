"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface RegistrationPayload {
  nama: string;
  jenis_kelamin: "L" | "P";
  no_hp: string;
  alamat: string;
  kelas?: string;
  motivasi?: string;
}

export interface RegistrationResult {
  success: boolean;
  registeredInDb: boolean;
  registrationCode: string;
  error?: string;
  message?: string;
}

export async function submitRegistrationAction(
  data: RegistrationPayload
): Promise<RegistrationResult> {
  const { nama, jenis_kelamin, no_hp, alamat, kelas, motivasi } = data;

  if (!nama || nama.trim().length < 3) {
    return {
      success: false,
      registeredInDb: false,
      registrationCode: "",
      error: "Nama lengkap wajib diisi (minimal 3 karakter).",
    };
  }

  if (!no_hp || no_hp.trim().length < 9) {
    return {
      success: false,
      registeredInDb: false,
      registrationCode: "",
      error: "Nomor WhatsApp / HP tidak valid (minimal 9 digit).",
    };
  }

  if (!alamat || alamat.trim().length < 3) {
    return {
      success: false,
      registeredInDb: false,
      registrationCode: "",
      error: "Alamat lengkap wajib diisi.",
    };
  }

  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const registrationCode = `REG-PSHT-${new Date().getFullYear()}-${randomSuffix}`;

  try {
    const supabase = await createSupabaseServerClient();
    
    // Gabungkan info kelas & motivasi ke kolom alamat jika ada
    const detailAlamat = [
      alamat.trim(),
      kelas?.trim() ? `[Kelas: ${kelas.trim()}]` : null,
      motivasi?.trim() ? `[Motivasi: ${motivasi.trim()}]` : null,
    ]
      .filter(Boolean)
      .join(" - ");

    const { data: inserted, error } = await supabase
      .from("people")
      .insert({
        nama: nama.trim(),
        tipe: "siswa",
        sabuk: "Polos",
        jenis_kelamin,
        alamat: detailAlamat,
        no_hp: no_hp.trim(),
        created_at: new Date().toISOString(),
      })
      .select("id")
      .maybeSingle();

    if (error) {
      console.warn("Public registration db insert skipped/failed:", error.message);
      return {
        success: true,
        registeredInDb: false,
        registrationCode,
        message: "Pendaftaran online siap! Lanjutkan kirim ke WhatsApp Pengurus untuk verifikasi.",
      };
    }

    revalidatePath("/siswa");
    revalidatePath("/admin/people");

    return {
      success: true,
      registeredInDb: true,
      registrationCode: `REG-PSHT-${inserted?.id || randomSuffix}`,
      message: "Pendaftaran Anda telah berhasil dicatat ke sistem kami!",
    };
  } catch (err: unknown) {
    console.error("Error during registration action:", err);
    return {
      success: true,
      registeredInDb: false,
      registrationCode,
      message: "Pendaftaran online siap dikirim ke WhatsApp Pengurus.",
    };
  }
}

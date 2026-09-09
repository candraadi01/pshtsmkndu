"use client";

import { useEffect, useState } from "react";

// Variabel ini hidup selama sesi client di memori JavaScript browser.
// Ketika di-hardrefresh (F5) atau URL diketik ulang, memori di-reset (hasLoaded = false, animasi muncul).
// Ketika user mengklik link navigasi ("Beranda") di dalam web, hasLoaded bernilai true (animasi TIDAK muncul).
let hasLoaded = false;

export default function Preloader() {
  const [shouldSkip] = useState(() => hasLoaded);
  const [progress, setProgress] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (shouldSkip) return;

    hasLoaded = true;

    // 2.5 detik total durasi animasi
    const startTime = Date.now();
    const duration = 2500;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (elapsed >= duration) {
        clearInterval(interval);
        setIsFading(true);
        setTimeout(() => {
          setIsDone(true);
        }, 700); // Waktu transisi fade out selesai
      }
    }, 25);

    return () => clearInterval(interval);
  }, [shouldSkip]);

  if (isDone || shouldSkip) return null;

  return (
    <div
      id="psht-preloader"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#070707] text-white transition-all duration-700 ease-in-out ${
        isFading ? "pointer-events-none opacity-0 scale-105" : "opacity-100 scale-100"
      }`}
      style={{
        background:
          "radial-gradient(circle at 50% 45%, #181818 0%, #0c0c0c 55%, #050505 100%)",
      }}
      aria-label="Loading Website PSHT SMKN Darul Ulum"
    >
      <style>{`

        @keyframes silatStance {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-4px) scale(1.01);
          }
        }

        @keyframes silatLeftArm {
          0% {
            transform: rotate(0deg) translate(0, 0);
          }
          30% {
            transform: rotate(-25deg) translate(-8px, -5px);
          }
          65% {
            transform: rotate(15deg) translate(6px, 2px);
          }
          100% {
            transform: rotate(0deg) translate(0, 0);
          }
        }

        @keyframes silatRightArm {
          0% {
            transform: rotate(0deg) translate(0, 0);
          }
          35% {
            transform: rotate(35deg) translate(14px, -10px);
          }
          70% {
            transform: rotate(-15deg) translate(-6px, 4px);
          }
          100% {
            transform: rotate(0deg) translate(0, 0);
          }
        }

        @keyframes moriFlutter {
          0%, 100% {
            transform: rotate(0deg) skewX(0deg);
          }
          25% {
            transform: rotate(-8deg) skewX(-4deg);
          }
          75% {
            transform: rotate(8deg) skewX(4deg);
          }
        }

        @keyframes energyPulse {
          0% {
            transform: scale(0.7);
            opacity: 0.15;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.45;
          }
          100% {
            transform: scale(0.7);
            opacity: 0.15;
          }
        }

        @keyframes auraRing {
          0% {
            transform: rotate(0deg) scale(0.9);
            opacity: 0.3;
          }
          50% {
            transform: rotate(180deg) scale(1.05);
            opacity: 0.6;
          }
          100% {
            transform: rotate(360deg) scale(0.9);
            opacity: 0.3;
          }
        }

        .silat-body-anim {
          animation: silatStance 2.2s ease-in-out infinite;
          transform-origin: center bottom;
        }

        .silat-left-arm {
          animation: silatLeftArm 1.8s ease-in-out infinite;
          transform-origin: 75px 85px;
        }

        .silat-right-arm {
          animation: silatRightArm 1.8s ease-in-out infinite;
          transform-origin: 125px 85px;
        }

        .mori-belt {
          animation: moriFlutter 1.4s ease-in-out infinite;
          transform-origin: 100px 125px;
        }

        .energy-glow {
          animation: energyPulse 2s ease-in-out infinite;
        }

        .aura-mandala {
          animation: auraRing 12s linear infinite;
        }
      `}</style>

      {/* Center Arena */}
      <div className="relative flex flex-col items-center justify-center">
        {/* Background Energy Ring */}
        <div className="aura-mandala absolute h-64 w-64 rounded-full border border-white/10 [border-top-color:white] [border-bottom-color:white/40] md:h-80 md:w-80" />
        <div className="energy-glow absolute h-52 w-52 rounded-full bg-white/5 blur-2xl md:h-64 md:w-64" />

        {/* Pencak Silat Animated Silhouette */}
        <div className="silat-body-anim relative h-48 w-48 drop-shadow-[0_0_25px_rgba(255,255,255,0.25)] md:h-56 md:w-56">
          <svg
            viewBox="0 0 200 200"
            className="h-full w-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Bayangan Lantai */}
            <ellipse
              cx="100"
              cy="185"
              rx="45"
              ry="8"
              fill="black"
              opacity="0.6"
            />

            {/* Aura jurus titik pusat */}
            <circle
              cx="100"
              cy="110"
              r="30"
              fill="white"
              opacity="0.05"
            />

            {/* Kaki Kiri & Kuda-kuda (Stance) */}
            <path
              d="M85 125 L65 155 L50 180 L68 184 L80 162 L92 135 Z"
              fill="#FFFFFF"
            />
            {/* Kaki Kanan (Kuda-kuda Belakang/Serong) */}
            <path
              d="M115 125 L135 150 L152 178 L136 182 L120 156 L108 135 Z"
              fill="#E5E5E5"
            />

            {/* Badan (Sakral Hitam bergaris putih elegan) */}
            <path
              d="M82 85 L76 130 L124 130 L118 85 L108 78 L92 78 Z"
              fill="#1F1F1F"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Kerah Sakral Khas Silat V-Neck */}
            <path
              d="M92 78 L100 102 L108 78"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Kain Mori / Sabuk Putih PSHT Berkibar */}
            <g className="mori-belt">
              {/* Ikatan sabuk pinggang */}
              <rect
                x="74"
                y="124"
                width="52"
                height="7"
                rx="3.5"
                fill="#FFFFFF"
              />
              {/* Ujung kain mori yang menjuntai */}
              <path
                d="M96 128 C94 145 92 160 88 172 C93 169 98 152 101 128 Z"
                fill="#FFFFFF"
              />
              <path
                d="M101 128 C103 142 108 156 112 166 C107 160 104 146 103 128 Z"
                fill="#E2E2E2"
              />
            </g>

            {/* Tangan Kiri - Jurus Tangkisan / Pasang */}
            <g className="silat-left-arm">
              {/* Bahu ke Siku */}
              <path
                d="M80 86 L58 102 L44 95 L68 78 Z"
                fill="#1F1F1F"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              {/* Lengan Bawah ke Telapak */}
              <path
                d="M44 95 L32 80 L39 74 L54 88 Z"
                fill="#1F1F1F"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              {/* Telapak Tangan Terbuka (Sikap Pasang) */}
              <path
                d="M32 80 L24 72 C22 69 25 66 28 68 L37 73 Z"
                fill="#FFFFFF"
              />
            </g>

            {/* Tangan Kanan - Jurus Sodokan / Pukulan Meluncur */}
            <g className="silat-right-arm">
              {/* Bahu ke Siku */}
              <path
                d="M120 86 L144 100 L156 94 L132 78 Z"
                fill="#1F1F1F"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              {/* Lengan Bawah & Kepalan Tinju */}
              <path
                d="M156 94 L175 90 L174 80 L150 82 Z"
                fill="#1F1F1F"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              {/* Kepalan Tangan Pesilat */}
              <circle
                cx="180"
                cy="85"
                r="7"
                fill="#FFFFFF"
              />
              {/* Garis efek kejut jurus (strike effect) */}
              <path
                d="M190 85 L200 85 M188 77 L196 73 M188 93 L196 97"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.8"
              />
            </g>

            {/* Kepala & Udeng (Ikat Kepala Khas PSHT) */}
            <circle
              cx="100"
              cy="62"
              r="14"
              fill="#FFFFFF"
            />
            {/* Udeng / Ikat Kepala Silat */}
            <path
              d="M86 58 C94 50 106 50 114 58 L113 54 C105 47 95 47 87 54 Z"
              fill="#1F1F1F"
            />
            {/* Ekor Udeng di Belakang Kepala */}
            <path
              d="M87 58 C83 62 80 67 82 73 C85 70 86 65 88 61 Z"
              fill="#FFFFFF"
            />
          </svg>
        </div>

        {/* Judul & Identitas */}
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white/90 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-white" />
            PSHT SMKN Darul Ulum Muncar
          </div>

          <h2 className="mt-2 text-lg font-extrabold tracking-wider text-white md:text-xl">
            MEMAYU HAYUNING BAWANA
          </h2>
          <p className="mt-0.5 text-xs text-neutral-400 italic">
            Suro Diro Jayaningrat Lebur Dening Pangastuti
          </p>
        </div>

        {/* Progress Bar Dinamis */}
        <div className="mt-6 w-56">
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-1.5">
            <span>MEMUAT SITUS...</span>
            <span className="font-semibold text-white">{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-neutral-400 via-white to-neutral-200 transition-all duration-75 ease-out shadow-[0_0_12px_rgba(255,255,255,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

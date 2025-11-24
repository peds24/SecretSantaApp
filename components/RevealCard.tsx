"use client";

import { useState } from "react";
import { Gift, Sparkles, Star, Snowflake } from "lucide-react";

export function RevealCard({ receiverName }: { receiverName: string }) {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <div className="w-full max-w-sm md:max-w-md mx-auto my-8 md:my-12 perspective-1000 group px-2 md:px-0">
      <div
        onClick={() => setIsRevealed(true)}
        className={`
          relative w-full aspect-[4/3] rounded-2xl cursor-pointer transition-all duration-1000 transform border-4 shadow-xl md:shadow-2xl
          ${
            isRevealed
              ? "bg-[#FFFBF0] border-yellow-400 rotate-y-0 border-double"
              : "bg-red-700 border-red-900 hover:scale-105 hover:-rotate-1"
          }
        `}
      >
        {!isRevealed ? (
          // WRAPPED GIFT STATE
          <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-[12px]">
            {/* Wrapping Paper Pattern (CSS Radial) */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #fff 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            ></div>

            {/* Ribbon - Vertical */}
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-12 md:w-16 bg-green-700 shadow-sm border-l border-r border-green-600/30"></div>

            {/* Ribbon - Horizontal */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-12 md:h-16 bg-green-700 shadow-sm border-t border-b border-green-600/30"></div>

            {/* Center Knot/Badge */}
            <div className="relative z-10 bg-yellow-400 p-3 md:p-4 rounded-full shadow-lg border-4 border-yellow-300 animate-pulse">
              <Gift className="text-red-700 w-8 h-8 md:w-10 md:h-10" />
            </div>

            <div className="relative z-10 mt-6 md:mt-8 bg-red-900/80 px-4 py-1 rounded-full backdrop-blur-sm shadow-sm">
              <p className="text-white font-bold tracking-widest text-[10px] md:text-sm uppercase">
                Toca para abrir
              </p>
            </div>
          </div>
        ) : (
          // REVEALED CARD STATE
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 md:p-6 text-center animate-in fade-in zoom-in duration-700">
            {/* Corner Decorations */}
            <div className="absolute top-2 left-2 text-red-500 opacity-20">
              <Snowflake className="w-4 h-4 md:w-6 md:h-6" />
            </div>
            <div className="absolute top-2 right-2 text-red-500 opacity-20">
              <Snowflake className="w-4 h-4 md:w-6 md:h-6" />
            </div>
            <div className="absolute bottom-2 left-2 text-red-500 opacity-20">
              <Snowflake className="w-4 h-4 md:w-6 md:h-6" />
            </div>
            <div className="absolute bottom-2 right-2 text-red-500 opacity-20">
              <Snowflake className="w-4 h-4 md:w-6 md:h-6" />
            </div>

            <p className="text-green-700 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mb-2 md:mb-4 bg-green-50 px-3 py-1 rounded-full">
              Tu Misión Secreta
            </p>

            <div className="space-y-1 md:space-y-2 w-full px-2">
              <span className="text-slate-400 text-xs md:text-sm font-serif italic">
                Le regalarás a...
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-red-700 font-serif drop-shadow-sm break-words leading-tight">
                {receiverName}
              </h2>
            </div>

            <div className="mt-4 md:mt-6 flex justify-center items-center gap-2 text-yellow-500">
              <Star size={14} className="md:w-4 md:h-4" fill="currentColor" />
              <Star size={14} className="md:w-4 md:h-4" fill="currentColor" />
              <Star size={14} className="md:w-4 md:h-4" fill="currentColor" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

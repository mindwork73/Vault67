import React, { useEffect, useState } from 'react';
import { useVaultStore } from '../../store/useVaultStore';
import { Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';

const KONAMI_SEQUENCE = [
  'ArrowUp', 'ArrowUp',
  'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight',
  'ArrowLeft', 'ArrowRight',
  'b', 'a'
];

export const VaultBoyEasterEgg: React.FC = () => {
  const { konamiModalOpen, closeKonamiModal, triggerKonamiBonus } = useVaultStore();
  const [keyIndex, setKeyIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const requiredKey = KONAMI_SEQUENCE[keyIndex];
      const pressedKey = e.key.toLowerCase() === 'b' ? 'b' : e.key.toLowerCase() === 'a' ? 'a' : e.key;

      if (pressedKey === requiredKey) {
        const nextIndex = keyIndex + 1;
        if (nextIndex === KONAMI_SEQUENCE.length) {
          // Konami code complete!
          triggerKonamiBonus();
          setKeyIndex(0);
          try {
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.6 },
              colors: ['#15FF0E', '#FFD100', '#0033A0', '#FFFFFF']
            });
          } catch {
            // ignore
          }
        } else {
          setKeyIndex(nextIndex);
        }
      } else {
        // Reset sequence unless it matches the first key
        setKeyIndex(e.key === 'ArrowUp' ? 1 : 0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyIndex, triggerKonamiBonus]);

  if (!konamiModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg border-4 border-[#15FF0E] bg-[#0D1117] p-6 text-center shadow-[0_0_50px_rgba(21,255,14,0.4)]">
        {/* Corner decors */}
        <div className="absolute top-1 left-1 w-3 h-3 bg-[#15FF0E]" />
        <div className="absolute top-1 right-1 w-3 h-3 bg-[#15FF0E]" />
        <div className="absolute bottom-1 left-1 w-3 h-3 bg-[#15FF0E]" />
        <div className="absolute bottom-1 right-1 w-3 h-3 bg-[#15FF0E]" />

        <button
          onClick={closeKonamiModal}
          className="absolute top-3 right-3 text-[#15FF0E] hover:bg-[#15FF0E] hover:text-[#0D1117] p-1 transition-colors"
          title="Закрыть [ESC]"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="inline-flex items-center gap-2 border border-[#15FF0E] px-3 py-1 text-xs uppercase tracking-widest text-[#15FF0E] mb-4">
          <Sparkles className="w-4 h-4 animate-spin" />
          <span>ROBCO CHEAT-CODE DETECTED: KONAMI PROTOCOL</span>
        </div>

        {/* Vault Boy Animated Pixel / SVG Art */}
        <div className="my-4 flex justify-center">
          <div className="relative w-44 h-44 border-2 border-[#15FF0E] bg-black/60 p-2 flex items-center justify-center overflow-hidden">
            <svg
              viewBox="0 0 100 100"
              className="w-36 h-36 drop-shadow-[0_0_12px_#15FF0E] animate-bounce"
              fill="none"
              stroke="#15FF0E"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Vault Boy Blond Hair Tuft */}
              <path d="M 35 30 Q 38 18 52 18 Q 66 18 68 28 Q 74 20 80 32 Q 78 40 74 42" fill="#15FF0E" fillOpacity="0.2" />
              {/* Head Circle */}
              <circle cx="50" cy="38" r="18" fill="#0D1117" />
              {/* Winking eye & smiling face */}
              <circle cx="43" cy="36" r="2.5" fill="#15FF0E" />
              <path d="M 53 36 Q 58 33 60 37" />
              <path d="M 43 45 Q 50 51 57 45" />
              {/* Smile cheeks */}
              <path d="M 40 44 Q 41 47 43 45" />
              <path d="M 57 45 Q 59 47 60 44" />
              {/* Jumpsuit collar */}
              <path d="M 38 56 L 50 63 L 62 56" />
              <path d="M 50 63 L 50 82" />
              {/* Body */}
              <path d="M 36 56 L 28 85 L 72 85 L 64 56" fill="#15FF0E" fillOpacity="0.1" />
              {/* Vault 67 label */}
              <text x="50" y="76" textAnchor="middle" fill="#15FF0E" fontSize="9" fontWeight="bold" fontFamily="monospace">67</text>
              {/* Thumbs up arm! */}
              <path d="M 64 58 L 78 52 L 80 44" strokeWidth="3" />
              {/* Hand thumb up */}
              <path d="M 80 44 C 80 38, 86 38, 85 45 L 85 53 L 78 54 Z" fill="#15FF0E" fillOpacity="0.4" strokeWidth="2.5" />
              {/* Left hand on hip */}
              <path d="M 36 58 L 22 66 L 28 75" strokeWidth="3" />
            </svg>
            <div className="absolute bottom-1 right-2 text-[10px] text-[#15FF0E] font-mono tracking-tighter">
              VAULT-BOY-APPROVES.EXE
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-black tracking-wider text-[#15FF0E] pipboy-glow mb-2">
          УБЕЖИЩЕ 67 ОДОБРЯЕТ!
        </h2>
        
        <p className="text-sm text-[#15FF0E]/90 mb-4 leading-relaxed font-mono">
          Вы ввели секретный код инженеров RobCo Industries!<br />
          Смотритель начислил на ваш Pip-Boy <strong className="text-white underline decoration-[#15FF0E] decoration-2">+500 КРЫШЕК (CAPS)</strong>.
        </p>

        <div className="bg-[#15FF0E]/10 border border-[#15FF0E] p-3 mb-5 text-xs text-[#15FF0E] flex items-center justify-between">
          <span>НОВЫЙ БАЛАНС ЖИТЕЛЯ:</span>
          <span className="text-base font-bold tracking-widest">{useVaultStore.getState().caps} CAPS</span>
        </div>

        <button
          onClick={closeKonamiModal}
          className="pipboy-btn w-full py-2.5 px-4 bg-[#15FF0E] text-[#0D1117] font-bold text-sm tracking-widest"
        >
          [ПРИНЯТЬ ЛУТ И ПРОДОЛЖИТЬ]
        </button>
      </div>
    </div>
  );
};

import React, { useRef, useEffect, useState } from 'react';
import { RotateCw, Box, Eye, Layers, ZoomIn, X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { useVaultStore } from '../../store/useVaultStore';
import { soundManager } from '../../utils/sound';

interface ModelViewer3DProps {
  productImage: string;
  productImages?: string[];
  productTitle: string;
}

export const ModelViewer3D: React.FC<ModelViewer3DProps> = ({ 
  productImage, 
  productImages = [], 
  productTitle 
}) => {
  const { theme } = useVaultStore();
  const isPreWar = theme === 'pre-war';

  // По умолчанию сначала открывается ФОТО, а не 3D голограмма
  const [mode, setMode] = useState<'photo' | 'hologram3d'>('photo');

  // Список всех фото товара (до 10 шт)
  const allImages = React.useMemo(() => {
    const list = productImages && productImages.length > 0 
      ? productImages 
      : [productImage];
    // Убираем дубликаты и берем до 10 фото
    return Array.from(new Set([productImage, ...list])).slice(0, 10);
  }, [productImage, productImages]);

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // 3D холст
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotX, setRotX] = useState(25);
  const [rotY, setRotY] = useState(45);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // 3D Canvas rendering loop
  useEffect(() => {
    if (mode !== 'hologram3d') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let localRotY = rotY;

    // 3D vertices for wireframe object
    const size = 90;
    const vertices: [number, number, number][] = [
      [-size, -size, -size],
      [size, -size, -size],
      [size, size, -size],
      [-size, size, -size],
      [-size, -size, size],
      [size, -size, size],
      [size, size, size],
      [-size, size, size],
      [0, -size * 1.3, 0],
      [0, size * 1.3, 0],
    ];

    const edges: [number, number][] = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
      [8, 0], [8, 1], [8, 4], [8, 5],
      [9, 2], [9, 3], [9, 6], [9, 7],
    ];

    const render = () => {
      if (!isDragging) {
        localRotY += 0.6;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const radX = (rotX * Math.PI) / 180;
      const radY = (localRotY * Math.PI) / 180;

      const projected = vertices.map(([x, y, z]) => {
        const x1 = x * Math.cos(radY) + z * Math.sin(radY);
        const z1 = -x * Math.sin(radY) + z * Math.cos(radY);

        const y2 = y * Math.cos(radX) - z1 * Math.sin(radX);
        const z2 = y * Math.sin(radX) + z1 * Math.cos(radX);

        const distance = 350;
        const scale = distance / (distance + z2);
        const projX = canvas.width / 2 + x1 * scale;
        const projY = canvas.height / 2 + y2 * scale;

        return { x: projX, y: projY, z: z2 };
      });

      // Фоновая сетка
      ctx.strokeStyle = isPreWar ? 'rgba(0, 51, 160, 0.15)' : 'rgba(21, 255, 14, 0.12)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let j = 0; j < canvas.height; j += 30) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
        ctx.stroke();
      }

      // Линии проволочной модели
      ctx.strokeStyle = isPreWar ? '#0033A0' : '#15FF0E';
      ctx.lineWidth = 2;
      ctx.shadowColor = isPreWar ? '#0033A0' : '#15FF0E';
      ctx.shadowBlur = 8;

      edges.forEach(([p1, p2]) => {
        const v1 = projected[p1];
        const v2 = projected[p2];
        ctx.beginPath();
        ctx.moveTo(v1.x, v1.y);
        ctx.lineTo(v2.x, v2.y);
        ctx.stroke();
      });

      // Вершины
      ctx.fillStyle = isPreWar ? '#FFD100' : '#15FF0E';
      projected.forEach((v) => {
        ctx.beginPath();
        ctx.arc(v.x, v.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Круг прицела
      ctx.strokeStyle = isPreWar ? 'rgba(0, 51, 160, 0.4)' : 'rgba(21, 255, 14, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 80, 0, Math.PI * 2);
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [mode, rotX, rotY, isDragging, isPreWar]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    setRotY((prev) => prev + deltaX * 0.8);
    setRotX((prev) => Math.max(-80, Math.min(80, prev - deltaY * 0.8)));
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      setIsDragging(true);
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length === 0) return;
    const deltaX = e.touches[0].clientX - dragStartRef.current.x;
    const deltaY = e.touches[0].clientY - dragStartRef.current.y;
    setRotY((prev) => prev + deltaX * 0.9);
    setRotX((prev) => Math.max(-80, Math.min(80, prev - deltaY * 0.9)));
    dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const currentDisplayImg = allImages[activeImgIndex] || productImage;

  return (
    <div className="space-y-3 font-mono">
      {/* Главный блок просмотра */}
      <div className={`relative border-2 overflow-hidden flex flex-col ${
        isPreWar ? 'border-[#0033A0] bg-white' : 'border-[#15FF0E] bg-black/80'
      }`}>
        {/* Верхняя статусная панель */}
        <div className={`px-3 py-1.5 border-b text-[11px] font-mono flex items-center justify-between ${
          isPreWar ? 'border-[#0033A0] bg-[#0033A0] text-white' : 'border-[#15FF0E] bg-[#15FF0E]/10 text-[#15FF0E]'
        }`}>
          <div className="flex items-center gap-2 font-bold tracking-wider">
            {mode === 'photo' ? (
              <>
                <ImageIcon className="w-3.5 h-3.5" />
                <span>ГАЛЕРЕЯ ТОВАРА [{activeImgIndex + 1}/{allImages.length}]</span>
              </>
            ) : (
              <>
                <Box className="w-3.5 h-3.5" />
                <span>3D ГОЛОГРАММА // ПРОВОЛОЧНАЯ СЕТКА</span>
              </>
            )}
          </div>
          
          {/* Переключатели режимов (Фото по умолчанию / 3D) */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                soundManager.playTab();
                setMode('photo');
              }}
              className={`px-2.5 py-0.5 text-[10px] font-bold uppercase transition-colors ${
                mode === 'photo'
                  ? isPreWar ? 'bg-[#FFD100] text-[#0033A0]' : 'bg-[#15FF0E] text-[#0D1117]'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              [ФОТО]
            </button>

            <button
              onClick={() => {
                soundManager.playTab();
                setMode('hologram3d');
              }}
              className={`px-2.5 py-0.5 text-[10px] font-bold uppercase transition-colors ${
                mode === 'hologram3d'
                  ? isPreWar ? 'bg-[#FFD100] text-[#0033A0]' : 'bg-[#15FF0E] text-[#0D1117]'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              [3D ГОЛОГРАММА]
            </button>
          </div>
        </div>

        {/* Область отображения: ФОТО (КЛИКАБЕЛЬНОЕ) или 3D */}
        <div className="relative h-80 sm:h-96 flex items-center justify-center select-none overflow-hidden bg-black/40">
          {mode === 'photo' ? (
            <div 
              onClick={() => {
                soundManager.playClick();
                setIsLightboxOpen(true);
              }}
              className="relative w-full h-full p-4 flex items-center justify-center cursor-zoom-in group"
              title="Нажмите для увеличения фото в полном размере"
            >
              <img
                src={currentDisplayImg}
                alt={productTitle}
                className={`max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-105 ${
                  isPreWar ? '' : 'pipboy-image-filter'
                }`}
              />

              {/* Индикатор увеличения в правом нижнем углу */}
              <div className={`absolute bottom-3 right-3 px-2 py-1 text-[10px] font-bold uppercase flex items-center gap-1 border opacity-90 group-hover:opacity-100 ${
                isPreWar ? 'border-[#0033A0] bg-white text-[#0033A0]' : 'border-[#15FF0E] bg-black/80 text-[#15FF0E]'
              }`}>
                <ZoomIn className="w-3.5 h-3.5" />
                <span>УВЕЛИЧИТЬ ФОТО</span>
              </div>
            </div>
          ) : (
            <div
              className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
            >
              <canvas
                ref={canvasRef}
                width={480}
                height={380}
                className="max-w-full max-h-full"
              />
              <div className={`absolute bottom-2 left-3 text-[10px] pointer-events-none ${
                isPreWar ? 'text-[#0033A0]/70' : 'text-[#15FF0E]/70'
              }`}>
                ROT: X={Math.round(rotX)}° Y={Math.round(rotY)}° | WIREFRAME
              </div>
              <div className={`absolute bottom-2 right-3 text-[10px] pointer-events-none ${
                isPreWar ? 'text-[#0033A0]/70' : 'text-[#15FF0E]/70'
              }`}>
                [ПЕРЕТАЩИТЕ ДЛЯ ВРАЩЕНИЯ]
              </div>
            </div>
          )}
        </div>

        {/* Нижняя информационная полоса */}
        <div className={`px-3 py-1.5 border-t text-[10px] flex items-center justify-between ${
          isPreWar ? 'border-[#0033A0]/30 text-[#0033A0]' : 'border-[#15FF0E]/30 text-[#15FF0E]/80'
        }`}>
          <span>ФОТОГРАФИЯ {activeImgIndex + 1} ИЗ {allImages.length}</span>
          {mode === 'hologram3d' && (
            <button
              onClick={() => {
                soundManager.playClick();
                setRotX(25);
                setRotY(45);
              }}
              className="hover:underline flex items-center gap-1 font-bold"
            >
              <RotateCw className="w-3 h-3" />
              <span>СБРОСИТЬ ОСИ</span>
            </button>
          )}
        </div>
      </div>

      {/* ЛЕНТА МИНИАТЮР (ДО 10 ФОТОГРАФИЙ) */}
      {allImages.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => {
                soundManager.playClick();
                setActiveImgIndex(idx);
                setMode('photo');
              }}
              className={`relative shrink-0 w-16 h-16 border-2 transition-all overflow-hidden ${
                activeImgIndex === idx && mode === 'photo'
                  ? isPreWar ? 'border-[#FFD100] ring-2 ring-[#0033A0]' : 'border-[#15FF0E] ring-2 ring-[#15FF0E]'
                  : 'border-current/40 opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt=""
                className={`w-full h-full object-cover ${isPreWar ? '' : 'pipboy-image-filter'}`}
              />
              <span className="absolute bottom-0 right-0 bg-black/80 px-1 text-[8px] font-bold text-white">
                {idx + 1}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ПОЛНОЭКРАННЫЙ ЛАЙТБОКС (LIGHTBOX ZOOM) ДЛЯ КЛИКАБЕЛЬНОГО ФОТО */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 animate-in fade-in">
          <div className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center">
            {/* Панель управления лайтбоксом */}
            <div className="w-full flex items-center justify-between text-[#15FF0E] font-mono text-xs mb-3 border-b border-[#15FF0E]/40 pb-2">
              <span className="font-bold">
                {productTitle} // ФОТО [{activeImgIndex + 1}/{allImages.length}]
              </span>

              <button
                onClick={() => setIsLightboxOpen(false)}
                className="p-1 hover:bg-[#15FF0E] hover:text-black border border-[#15FF0E] transition-colors"
                title="Закрыть [ESC]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Большое фото с навигацией влево/вправо */}
            <div className="relative w-full flex items-center justify-center min-h-[60vh]">
              {allImages.length > 1 && (
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setActiveImgIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
                  }}
                  className="absolute left-2 z-10 p-2 bg-black/80 border-2 border-[#15FF0E] text-[#15FF0E] hover:bg-[#15FF0E] hover:text-black transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              <img
                src={currentDisplayImg}
                alt={productTitle}
                className="max-h-[75vh] max-w-full object-contain border-2 border-[#15FF0E]"
              />

              {allImages.length > 1 && (
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setActiveImgIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
                  }}
                  className="absolute right-2 z-10 p-2 bg-black/80 border-2 border-[#15FF0E] text-[#15FF0E] hover:bg-[#15FF0E] hover:text-black transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Миниатюры внизу лайтбокса */}
            {allImages.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto max-w-full pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      soundManager.playClick();
                      setActiveImgIndex(idx);
                    }}
                    className={`w-12 h-12 border-2 shrink-0 overflow-hidden ${
                      activeImgIndex === idx ? 'border-[#15FF0E] ring-2 ring-white' : 'border-white/30 opacity-60'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

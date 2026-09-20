import React, { useRef, useState, useEffect } from "react";
import {
  NailShape,
  NailDesign,
  NailModelPart,
  FlatDesignItem,
  SurfaceEffectItem,
  Decoration3DItem,
  BackgroundItem,
  FinishItem,
  Transform2D,
} from "../types/nail";
import { getNailShapeInfo } from "../utils/nailShapes";
import {
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  Trash2,
  Copy,
  Maximize2,
  Crosshair,
  Shield,
  Layers,
  Box,
  Grid,
} from "lucide-react";

interface Canvas2DProps {
  nailDesign: NailDesign;
  nailPart: NailModelPart;
  targetShape: NailShape;
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
  onUpdateFlatItemTransform: (itemId: string, transform: Transform2D) => void;
  onUpdate3DAnchor: (itemId: string, u: number, v: number) => void;
  onUpdateSurfaceMask: (itemId: string, x: number, y: number, width: number, height: number) => void;
  onDuplicateItem: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onMirrorItem: (itemId: string) => void;
  showSafeArea: boolean;
}

export const Canvas2D: React.FC<Canvas2DProps> = ({
  nailDesign,
  nailPart,
  targetShape,
  selectedItemId,
  onSelectItem,
  onUpdateFlatItemTransform,
  onUpdate3DAnchor,
  onUpdateSurfaceMask,
  onDuplicateItem,
  onDeleteItem,
  onMirrorItem,
  showSafeArea,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<"move" | "rotate" | "scale" | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [initialTransform, setInitialTransform] = useState<Transform2D | null>(null);

  // Canvas display dimensions
  const CANVAS_WIDTH = 340;
  const CANVAS_HEIGHT = 480;

  // Derive visual silhouette path for nail shape
  // UV 0,0 is top-left, 1,1 is bottom-right.
  // Nail root is at bottom (y=1), tip is at top (y=0) or vice versa.
  // Standard nail top: y=0, nail base/cuticle: y=1.
  const shapeInfo = getNailShapeInfo(targetShape);

  // Derive visual silhouette path for nail shape
  const getSilhouettePath = () => shapeInfo.canvasPath;

  // Safe area path (insets approx 8%)
  const getSafeAreaPath = () => shapeInfo.safeAreaPath;

  // Find currently selected item across all steps
  let selectedItem: any = null;
  let selectedItemCategory: "flat" | "3d" | "surface" | null = null;

  for (const step of nailDesign.steps) {
    if (!step.visible || step.skipped) continue;
    for (const item of step.items) {
      if (item.id === selectedItemId) {
        selectedItem = item;
        if (step.type === "flat-design") selectedItemCategory = "flat";
        else if (step.type === "decoration-3d") selectedItemCategory = "3d";
        else if (step.type === "surface-effect") selectedItemCategory = "surface";
        break;
      }
    }
  }

  // Convert UV coordinate (0~1) to Canvas pixel coordinate
  const uvToPixel = (u: number, v: number) => ({
    x: u * CANVAS_WIDTH,
    y: v * CANVAS_HEIGHT,
  });

  // Convert Canvas pixel to UV (0~1)
  const pixelToUV = (px: number, py: number) => ({
    u: Math.max(0, Math.min(1, px / CANVAS_WIDTH)),
    v: Math.max(0, Math.min(1, py / CANVAS_HEIGHT)),
  });

  // Handle pointer down on element
  const handleItemPointerDown = (
    e: React.PointerEvent,
    itemId: string,
    mode: "move" | "rotate" | "scale"
  ) => {
    e.stopPropagation();
    onSelectItem(itemId);
    setIsDragging(true);
    setDragType(mode);
    setDragStartPos({ x: e.clientX, y: e.clientY });

    if (selectedItem?.transform) {
      setInitialTransform({ ...selectedItem.transform });
    }
  };

  // Pointer move for dragging / scaling / rotating
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStartPos || !selectedItem) return;

    const dx = e.clientX - dragStartPos.x;
    const dy = e.clientY - dragStartPos.y;

    const uvDx = dx / (CANVAS_WIDTH * zoom);
    const uvDy = dy / (CANVAS_HEIGHT * zoom);

    if (selectedItemCategory === "flat" && initialTransform) {
      if (dragType === "move") {
        const nextX = Math.max(0.05, Math.min(0.95, initialTransform.x + uvDx));
        const nextY = Math.max(0.05, Math.min(0.95, initialTransform.y + uvDy));
        onUpdateFlatItemTransform(selectedItem.id, {
          ...initialTransform,
          x: Number(nextX.toFixed(3)),
          y: Number(nextY.toFixed(3)),
        });
      } else if (dragType === "scale") {
        const scaleFactor = 1 + (dx - dy) / 120;
        const newW = Math.max(0.04, Math.min(0.8, initialTransform.width * scaleFactor));
        const newH = Math.max(0.04, Math.min(0.8, initialTransform.height * scaleFactor));
        onUpdateFlatItemTransform(selectedItem.id, {
          ...initialTransform,
          width: Number(newW.toFixed(3)),
          height: Number(newH.toFixed(3)),
        });
      } else if (dragType === "rotate") {
        const centerPx = uvToPixel(initialTransform.x, initialTransform.y);
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const itemScreenX = rect.left + centerPx.x * zoom;
          const itemScreenY = rect.top + centerPx.y * zoom;
          const angleRad = Math.atan2(e.clientY - itemScreenY, e.clientX - itemScreenX);
          const angleDeg = (angleRad * 180) / Math.PI;
          onUpdateFlatItemTransform(selectedItem.id, {
            ...initialTransform,
            rotation: Math.round((angleDeg + 90 + 360) % 360),
          });
        }
      }
    } else if (selectedItemCategory === "3d") {
      // 3D Anchor drag
      const currentU = (selectedItem as Decoration3DItem).anchor.u;
      const currentV = (selectedItem as Decoration3DItem).anchor.v;
      const nextU = Math.max(0.08, Math.min(0.92, currentU + uvDx));
      const nextV = Math.max(0.08, Math.min(0.92, currentV + uvDy));
      onUpdate3DAnchor(selectedItem.id, Number(nextU.toFixed(3)), Number(nextV.toFixed(3)));
      setDragStartPos({ x: e.clientX, y: e.clientY });
    } else if (selectedItemCategory === "surface") {
      const mask = (selectedItem as SurfaceEffectItem).mask;
      const curX = mask.x ?? 0.5;
      const curY = mask.y ?? 0.5;
      const curW = mask.width ?? 0.6;
      const curH = mask.height ?? 0.3;
      const nextX = Math.max(0.1, Math.min(0.9, curX + uvDx));
      const nextY = Math.max(0.1, Math.min(0.9, curY + uvDy));
      onUpdateSurfaceMask(selectedItem.id, Number(nextX.toFixed(3)), Number(nextY.toFixed(3)), curW, curH);
      setDragStartPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setDragType(null);
    setDragStartPos(null);
  };

  // Keyboard shortcuts (Delete, Duplicate, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedItemId) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        onDeleteItem(selectedItemId);
      } else if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        onDuplicateItem(selectedItemId);
      } else if (e.key === "Escape") {
        onSelectItem(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedItemId, onDeleteItem, onDuplicateItem, onSelectItem]);

  // Extract background and finish values
  const bgStep = nailDesign.steps.find((s) => s.type === "background" && s.visible && !s.skipped);
  const bgItem = bgStep?.items[0] as BackgroundItem | undefined;

  const finishStep = nailDesign.steps.find((s) => s.type === "finish" && s.visible && !s.skipped);
  const finishItem = finishStep?.items[0] as FinishItem | undefined;
  const glossiness = finishItem?.glossiness ?? 80;

  return (
    <div
      className="flex-1 flex flex-col bg-[#252525] overflow-hidden relative select-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={() => onSelectItem(null)}
    >
      {/* 2D Canvas Top Toolbar / Status Bar */}
      <div className="h-8 bg-[#303030] border-b border-[#4A4A4A] px-3 flex items-center justify-between text-[11px] text-[#A8A8A8]">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-[#E5E5E5] font-mono">
            <Crosshair className="w-3.5 h-3.5 text-[#A8A8A8]" />
            <span>2D 画布 (UV 0.0 ~ 1.0)</span>
          </div>
          <span className="text-[#4A4A4A]">|</span>
          <span>
            尺寸: {nailPart.width} × {nailPart.length} mm
          </span>
          <span className="text-[#4A4A4A]">|</span>
          <span className="text-[#A8A8A8]">
            甲型: {shapeInfo.name} ({shapeInfo.enName})
          </span>
        </div>

        {/* Zoom & Quick Actions */}
        <div className="flex items-center space-x-2">
          {/* Transparency Grid Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowGrid((g) => !g);
            }}
            className={`px-2 py-0.5 border rounded text-[10px] flex items-center space-x-1 transition-colors ${
              showGrid
                ? "bg-[#373737] border-[#5E7EB8] text-[#E5E5E5]"
                : "bg-[#202020] border-[#4A4A4A] text-[#A8A8A8] hover:text-[#E5E5E5]"
            }`}
            title="切换透明网格 (默认关闭以提供中性纯净工作区)"
          >
            <Grid className="w-3 h-3" />
            <span>透明网格: {showGrid ? "开" : "关"}</span>
          </button>

          <span className="text-[#4A4A4A]">|</span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setZoom((z) => Math.max(0.6, z - 0.1));
            }}
            className="px-2 py-0.5 bg-[#202020] hover:bg-[#373737] text-[#E5E5E5] border border-[#4A4A4A] rounded text-[10px] transition-colors"
          >
            -
          </button>
          <span className="font-mono text-[10px] text-[#E5E5E5] w-9 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setZoom((z) => Math.min(1.8, z + 0.1));
            }}
            className="px-2 py-0.5 bg-[#202020] hover:bg-[#373737] text-[#E5E5E5] border border-[#4A4A4A] rounded text-[10px] transition-colors"
          >
            +
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setZoom(1);
            }}
            className="px-2 py-0.5 bg-[#202020] hover:bg-[#373737] text-[#A8A8A8] hover:text-[#E5E5E5] border border-[#4A4A4A] rounded text-[10px] transition-colors"
          >
            复位
          </button>
        </div>
      </div>

      {/* Main Canvas Work Area - Neutral Deep Gray Center */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center p-8 overflow-auto relative"
        style={{
          backgroundColor: "#252525",
          ...(showGrid
            ? {
                backgroundImage: `
                  linear-gradient(45deg, #2E2E2E 25%, transparent 25%), 
                  linear-gradient(-45deg, #2E2E2E 25%, transparent 25%), 
                  linear-gradient(45deg, transparent 75%, #2E2E2E 75%), 
                  linear-gradient(-45deg, transparent 75%, #2E2E2E 75%)
                `,
                backgroundSize: "16px 16px",
                backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
              }
            : {}),
        }}
      >
        {/* Scaled Canvas Container */}
        <div
          className="relative transition-transform duration-75 shadow-xl rounded-xs border border-[#4A4A4A] bg-[#1C1C1C]"
          style={{
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            transform: `scale(${zoom})`,
            transformOrigin: "center center",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* SVG Canvas for High-Precision Rendering of Layers & Silhouette */}
          <svg
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
            className="w-full h-full overflow-visible"
          >
            <defs>
              {/* Clip path defined by nail silhouette */}
              <clipPath id="nail-silhouette-clip">
                <path d={getSilhouettePath()} />
              </clipPath>

              {/* Background gradient if applied */}
              <linearGradient id="bg-linear-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2c2c30" />
                <stop offset="50%" stopColor={bgItem?.color || "#18181a"} />
                <stop offset="100%" stopColor="#0d0d0f" />
              </linearGradient>

              {/* Cat-eye reflection gradient */}
              <linearGradient id="cat-eye-grad" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="45%" stopColor="#ffffff" stopOpacity="0.0" />
                <stop offset="50%" stopColor="#e2e8f0" stopOpacity="0.6" />
                <stop offset="55%" stopColor="#ffffff" stopOpacity="0.0" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>

              {/* Surface Ombre radial mask */}
              <radialGradient id="ombre-mask-grad" cx="50%" cy="30%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="70%" stopColor="#ffffff" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
              </radialGradient>
            </defs>

            {/* Base Nail Silhouette Fill (clipped) */}
            <g clipPath="url(#nail-silhouette-clip)">
              {/* Layer 1: Background Step */}
              {bgItem && (
                <rect
                  x="0"
                  y="0"
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  fill={
                    bgItem.kind === "gradient"
                      ? "url(#bg-linear-grad)"
                      : bgItem.color || "#242426"
                  }
                  opacity={bgItem.opacity}
                />
              )}

              {/* Cat-eye streak if full-cat-eye */}
              {bgItem?.kind === "full-cat-eye" && (
                <rect
                  x="0"
                  y="0"
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  fill="url(#cat-eye-grad)"
                />
              )}

              {/* Fine glitter texture overlay if full-glitter */}
              {bgItem?.kind === "full-glitter" && (
                <g opacity="0.45">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <circle
                      key={i}
                      cx={((i * 37) % 300) + 20}
                      cy={((i * 47) % 400) + 40}
                      r={(i % 3) + 0.8}
                      fill="#ffffff"
                      opacity={(i % 5) * 0.15 + 0.3}
                    />
                  ))}
                </g>
              )}

              {/* Layer 2: Flat Design Elements */}
              {nailDesign.steps
                .filter((s) => s.type === "flat-design" && s.visible && !s.skipped)
                .flatMap((s) => s.items as FlatDesignItem[])
                .map((item) => {
                  const center = uvToPixel(item.transform.x, item.transform.y);
                  const w = item.transform.width * CANVAS_WIDTH;
                  const h = item.transform.height * CANVAS_HEIGHT;

                  return (
                    <g
                      key={item.id}
                      transform={`translate(${center.x}, ${center.y}) rotate(${item.transform.rotation}) scale(${item.transform.scaleX || 1}, ${item.transform.scaleY || 1})`}
                      opacity={item.opacity}
                    >
                      {item.kind === "shape" && (
                        <>
                          {item.shapeType === "star" && (
                            <path
                              d="M 0 -20 L 5 -5 L 20 0 L 5 5 L 0 20 L -5 5 L -20 0 L -5 -5 Z"
                              fill={item.color || "#fff"}
                              transform={`scale(${w / 40})`}
                            />
                          )}
                          {item.shapeType === "moon" && (
                            <path
                              d="M0 -20 C 12 -18, 20 -8, 18 5 C 16 15, 6 22, -6 20 C 4 18, 8 12, 6 5 C 4 -2, -2 -14, 0 -20 Z"
                              fill={item.color || "#fff"}
                              transform={`scale(${w / 40})`}
                            />
                          )}
                          {item.shapeType === "circle" && (
                            <circle r={w / 2} fill={item.color || "#fff"} />
                          )}
                          {item.shapeType === "rect" && (
                            <rect
                              x={-w / 2}
                              y={-h / 2}
                              width={w}
                              height={h}
                              fill={item.color || "#fff"}
                              rx="2"
                            />
                          )}
                          {item.shapeType === "heart" && (
                            <path
                              d="M0 8 L-1 -1 C-5 -5 -12 -5 -12 2 C-12 7 -4 14 0 18 C4 14 12 7 12 2 C12 -5 5 -5 1 -1 Z"
                              fill={item.color || "#fff"}
                              transform={`scale(${w / 24}) translate(0, -5)`}
                            />
                          )}
                          {item.shapeType === "line" && (
                            <line
                              x1={-w / 2}
                              y1="0"
                              x2={w / 2}
                              y2="0"
                              stroke={item.color || "#fff"}
                              strokeWidth={3}
                            />
                          )}
                        </>
                      )}

                      {item.kind === "sticker" && item.svgPath && (
                        <g transform={`translate(${-w / 2}, ${-h / 2}) scale(${w / 24})`}>
                          <path d={item.svgPath} fill={item.color || "#fff"} />
                        </g>
                      )}

                      {item.kind === "image" && (
                        <rect
                          x={-w / 2}
                          y={-h / 2}
                          width={w}
                          height={h}
                          fill="#444"
                          stroke="#fff"
                          strokeWidth="1"
                        />
                      )}
                    </g>
                  );
                })}

              {/* Layer 3: Surface Effect Elements (Ombre, Mirror, Powder) */}
              {nailDesign.steps
                .filter((s) => s.type === "surface-effect" && s.visible && !s.skipped)
                .flatMap((s) => s.items as SurfaceEffectItem[])
                .map((effect) => {
                  const mx = (effect.mask.x ?? 0.5) * CANVAS_WIDTH;
                  const my = (effect.mask.y ?? 0.3) * CANVAS_HEIGHT;
                  const mw = (effect.mask.width ?? 0.6) * CANVAS_WIDTH;
                  const mh = (effect.mask.height ?? 0.35) * CANVAS_HEIGHT;

                  return (
                    <g key={effect.id} opacity={effect.opacity}>
                      {effect.kind === "ombre" && (
                        <ellipse
                          cx={mx}
                          cy={my}
                          rx={mw / 2}
                          ry={mh / 2}
                          fill="url(#ombre-mask-grad)"
                        />
                      )}
                      {effect.kind === "mirror-powder" && (
                        <rect
                          x={mx - mw / 2}
                          y={my - mh / 2}
                          width={mw}
                          height={mh}
                          fill="#d4d4d8"
                          opacity="0.8"
                          rx={effect.mask.feather * 2}
                        />
                      )}
                      {effect.kind === "local-cat-eye" && (
                        <ellipse
                          cx={mx}
                          cy={my}
                          rx={mw / 2}
                          ry={mh / 3}
                          fill="url(#cat-eye-grad)"
                          transform={`rotate(30, ${mx}, ${my})`}
                        />
                      )}
                      {effect.kind === "sugar" && (
                        <rect
                          x={mx - mw / 2}
                          y={my - mh / 2}
                          width={mw}
                          height={mh}
                          fill="#e4e4e7"
                          opacity="0.6"
                          stroke="#ffffff"
                          strokeDasharray="2 2"
                        />
                      )}
                      {effect.kind === "local-glitter" && (
                        <g transform={`translate(${mx}, ${my})`}>
                          {Array.from({ length: 15 }).map((_, gi) => (
                            <circle
                              key={gi}
                              cx={((gi * 17) % mw) - mw / 2}
                              cy={((gi * 23) % mh) - mh / 2}
                              r={1.5}
                              fill="#fff"
                            />
                          ))}
                        </g>
                      )}
                    </g>
                  );
                })}

              {/* Layer 4: 3D Decoration 2D Projections */}
              {nailDesign.steps
                .filter((s) => s.type === "decoration-3d" && s.visible && !s.skipped)
                .flatMap((s) => s.items as Decoration3DItem[])
                .map((dec) => {
                  const pt = uvToPixel(dec.anchor.u, dec.anchor.v);
                  const isSelected = dec.id === selectedItemId;

                  return (
                    <g
                      key={dec.id}
                      transform={`translate(${pt.x}, ${pt.y}) rotate(${dec.transform.rotation}) scale(${dec.transform.scale})`}
                    >
                      {/* Realistic 2D Footprint of 3D Charm */}
                      <circle
                        r="14"
                        fill="#2a2a2e"
                        stroke="#ffffff"
                        strokeWidth={isSelected ? "2" : "1"}
                        opacity="0.9"
                      />
                      <path
                        d="M -6 -2 L 0 -8 L 6 -2 L 0 6 Z"
                        fill="#ffffff"
                        opacity="0.8"
                      />
                      {/* Height badge */}
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        fontSize="7"
                        fill="#fff"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {dec.transform.height}mm
                      </text>
                    </g>
                  );
                })}

              {/* Layer 5: Finish Layer Sheen */}
              <g opacity={glossiness > 50 ? 0.35 : 0.08} pointerEvents="none">
                <path
                  d="M 60 70 Q 150 40 280 80 Q 240 160 210 320"
                  stroke="#ffffff"
                  strokeWidth="12"
                  strokeLinecap="round"
                  fill="none"
                  filter="blur(4px)"
                />
              </g>
            </g>

            {/* Outlines: Nail silhouette border */}
            <path
              d={getSilhouettePath()}
              fill="none"
              stroke="#888888"
              strokeWidth="1.5"
            />

            {/* Outlines: Safe Area low-brightness dashed guide */}
            {showSafeArea && (
              <g pointerEvents="none">
                <path
                  d={getSafeAreaPath()}
                  fill="none"
                  stroke="#5E7EB8"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.45"
                />
              </g>
            )}
          </svg>

          {/* Interactive Transform Handles Overlay for Selected Item */}
          {selectedItem && (
            <div className="absolute inset-0 pointer-events-none">
              {selectedItemCategory === "flat" && (
                (() => {
                  const t = selectedItem.transform as Transform2D;
                  const pos = uvToPixel(t.x, t.y);
                  const w = t.width * CANVAS_WIDTH;
                  const h = t.height * CANVAS_HEIGHT;

                  return (
                    <div
                      className="absolute pointer-events-auto border border-[#5E7EB8]"
                      style={{
                        left: pos.x - w / 2,
                        top: pos.y - h / 2,
                        width: w,
                        height: h,
                        transform: `rotate(${t.rotation}deg)`,
                      }}
                      onPointerDown={(e) => handleItemPointerDown(e, selectedItem.id, "move")}
                    >
                      {/* Center Anchor */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#5E7EB8] rounded-full pointer-events-none" />

                      {/* Scale Corner Handle */}
                      <div
                        className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-[#E5E5E5] border border-[#202020] cursor-nwse-resize rounded-xs"
                        onPointerDown={(e) => handleItemPointerDown(e, selectedItem.id, "scale")}
                        title="拖动缩放"
                      />

                      {/* Rotation Handle */}
                      <div
                        className="absolute -top-5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#E5E5E5] border border-[#202020] rounded-full cursor-grab flex items-center justify-center"
                        onPointerDown={(e) => handleItemPointerDown(e, selectedItem.id, "rotate")}
                        title="拖动旋转"
                      >
                        <RotateCw className="w-2 h-2 text-[#202020]" />
                      </div>
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-[1px] h-2.5 bg-[#5E7EB8]" />
                    </div>
                  );
                })()
              )}

              {selectedItemCategory === "3d" && (
                (() => {
                  const dec = selectedItem as Decoration3DItem;
                  const pt = uvToPixel(dec.anchor.u, dec.anchor.v);

                  return (
                    <div
                      className="absolute pointer-events-auto w-7 h-7 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#5E7EB8] flex items-center justify-center cursor-move bg-[#5E7EB8]/20"
                      style={{ left: pt.x, top: pt.y }}
                      onPointerDown={(e) => handleItemPointerDown(e, selectedItem.id, "move")}
                      title="拖动调整 3D 饰品在指甲曲面的锚点 (u, v)"
                    >
                      <Crosshair className="w-3.5 h-3.5 text-[#E5E5E5]" />
                    </div>
                  );
                })()
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2D Canvas Bottom Floating HUD & Context Tools */}
      <div className="h-9 bg-[#303030] border-t border-[#4A4A4A] px-3 flex items-center justify-between text-xs text-[#A8A8A8]">
        {/* Selected element details */}
        {selectedItem ? (
          <div className="flex items-center space-x-3">
            <span className="text-[#E5E5E5] font-medium text-[11px]">
              选中: {selectedItem.name || selectedItem.kind || "设计元素"}
            </span>

            {selectedItemCategory === "flat" && (
              <span className="font-mono text-[11px] text-[#A8A8A8]">
                UV: ({selectedItem.transform.x}, {selectedItem.transform.y}) | 旋转: {selectedItem.transform.rotation}° | 尺寸: {Math.round(selectedItem.transform.width * 100)}%
              </span>
            )}

            {selectedItemCategory === "3d" && (
              <span className="font-mono text-[11px] text-[#A8A8A8]">
                U: {selectedItem.anchor.u} | V: {selectedItem.anchor.v} | 厚度: {selectedItem.transform.height}mm
              </span>
            )}
          </div>
        ) : (
          <div className="text-[#888888] text-[11px]">
            点击画布上的元素进行选择，支持拖拽定位、角标缩放、顶部圆点旋转
          </div>
        )}

        {/* Action icons for selected item */}
        {selectedItem && (
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => onMirrorItem(selectedItem.id)}
              className="px-2 py-0.5 bg-[#373737] hover:bg-[#404040] text-[#E5E5E5] border border-[#4A4A4A] rounded text-[11px] flex items-center space-x-1 transition-colors"
              title="水平镜像翻转 (左右对称)"
            >
              <FlipHorizontal className="w-3 h-3 text-[#A8A8A8]" />
              <span>水平镜像</span>
            </button>
            <button
              type="button"
              onClick={() => onDuplicateItem(selectedItem.id)}
              className="px-2 py-0.5 bg-[#373737] hover:bg-[#404040] text-[#E5E5E5] border border-[#4A4A4A] rounded text-[11px] flex items-center space-x-1 transition-colors"
              title="复制副本 (Ctrl+D)"
            >
              <Copy className="w-3 h-3 text-[#A8A8A8]" />
              <span>复制</span>
            </button>
            <button
              type="button"
              onClick={() => onDeleteItem(selectedItem.id)}
              className="px-2 py-0.5 bg-[#373737] hover:bg-[#482828] text-[#E06C75] border border-[#4A4A4A] rounded text-[11px] flex items-center space-x-1 transition-colors"
              title="删除元素 (Delete)"
            >
              <Trash2 className="w-3 h-3 text-[#E06C75]" />
              <span>删除</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

import React from "react";
import {
  NailShape,
  NailDesign,
  NailModelPart,
  NailSlot,
  BackgroundItem,
  FlatDesignItem,
  Decoration3DItem,
} from "../types/nail";
import { NAIL_SLOTS } from "../utils/nailDefaults";
import { getNailShapeInfo } from "../utils/nailShapes";
import {
  FlipHorizontal,
  Copy,
  Layers,
} from "lucide-react";

interface TenNailsOverviewProps {
  nails: NailDesign[];
  parts: NailModelPart[];
  targetShape: NailShape;
  activeNailId: string | null;
  onSelectNail: (slot: NailSlot) => void;
  onMirrorLeftToRight: () => void;
  onApplyCurrentToAll: () => void;
}

export const TenNailsOverview: React.FC<TenNailsOverviewProps> = ({
  nails,
  parts,
  targetShape,
  activeNailId,
  onSelectNail,
  onMirrorLeftToRight,
  onApplyCurrentToAll,
}) => {
  const leftSlots = NAIL_SLOTS.filter((s) => s.hand === "left");
  const rightSlots = NAIL_SLOTS.filter((s) => s.hand === "right");

  const renderMiniNailCard = (slotMeta: typeof NAIL_SLOTS[0]) => {
    const nail = nails.find((n) => n.slot === slotMeta.slot);
    const part = parts.find((p) => p.slot === slotMeta.slot);
    const isActive = nail?.id === activeNailId;

    const bgStep = nail?.steps.find((s) => s.type === "background" && s.visible && !s.skipped);
    const bgItem = bgStep?.items[0] as BackgroundItem | undefined;

    const flatItems = nail?.steps
      .filter((s) => s.type === "flat-design" && s.visible && !s.skipped)
      .flatMap((s) => s.items as FlatDesignItem[]) || [];

    const decor3DItems = nail?.steps
      .filter((s) => s.type === "decoration-3d" && s.visible && !s.skipped)
      .flatMap((s) => s.items as Decoration3DItem[]) || [];

    const totalSteps = nail?.steps.length || 0;

    return (
      <div
        key={slotMeta.slot}
        onClick={() => onSelectNail(slotMeta.slot)}
        className={`p-3 rounded border cursor-pointer transition-all flex flex-col items-center relative ${
          isActive
            ? "bg-[#373737] border-[#5E7EB8] text-[#E5E5E5] shadow-sm"
            : "bg-[#282828] border-[#4A4A4A] text-[#A8A8A8] hover:border-[#666666] hover:bg-[#323232]"
        }`}
      >
        {/* Active Marker */}
        {isActive && (
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#5E7EB8]" />
        )}

        {/* Slot Name */}
        <div className="text-xs font-medium text-[#E5E5E5] mb-0.5">{slotMeta.shortName}</div>
        <div className="text-[10px] text-[#A8A8A8] mb-2">{slotMeta.name}</div>

        {/* Scaled Mini Silhouette Swatch */}
        <div className="w-16 h-28 bg-[#202020] rounded border border-[#4A4A4A] flex items-center justify-center relative overflow-hidden mb-2 shadow-inner">
          <svg
            width="50"
            height="80"
            viewBox="0 0 50 80"
            className="overflow-visible"
          >
            <defs>
              <clipPath id={`mini-clip-${slotMeta.slot}`}>
                <path d={getNailShapeInfo(targetShape).miniPath} />
              </clipPath>
            </defs>

            {/* Clipped Fill */}
            <g clipPath={`url(#mini-clip-${slotMeta.slot})`}>
              <rect
                x="0"
                y="0"
                width="50"
                height="80"
                fill={bgItem?.color || "#2A2A2A"}
              />

              {/* Mini Flat Items */}
              {flatItems.map((item, idx) => (
                <circle
                  key={item.id || idx}
                  cx={item.transform.x * 50}
                  cy={item.transform.y * 80}
                  r="3.5"
                  fill={item.color || "#FFFFFF"}
                  opacity={item.opacity ?? 0.85}
                />
              ))}

              {/* Mini 3D Decor Items */}
              {decor3DItems.map((dec, idx) => (
                <rect
                  key={dec.id || idx}
                  x={dec.anchor.u * 50 - 3}
                  y={dec.anchor.v * 80 - 3}
                  width="6"
                  height="6"
                  rx="1"
                  fill="#CCCCCC"
                  stroke="#202020"
                  strokeWidth="0.8"
                />
              ))}
            </g>

            {/* Silhouette Outline */}
            <path
              d={getNailShapeInfo(targetShape).miniPath}
              fill="none"
              stroke="#666"
              strokeWidth="1.2"
            />
          </svg>
        </div>

        {/* Dimensions & Elements Badge */}
        <div className="text-[10px] text-[#888888] font-mono">
          {part?.width} × {part?.length} mm
        </div>
        <div className="mt-0.5 text-[10px] text-[#A8A8A8]">
          {flatItems.length + decor3DItems.length} 个元素 / {totalSteps} 步
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 bg-[#252525] overflow-y-auto p-5 select-none flex flex-col space-y-4">
      {/* Overview Top Action Bar */}
      <div className="bg-[#303030] border border-[#4A4A4A] rounded p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium text-[#E5E5E5] flex items-center space-x-2">
            <Layers className="w-4 h-4 text-[#A8A8A8]" />
            <span>十指全景展示与对称排布</span>
          </h2>
          <p className="text-xs text-[#A8A8A8] mt-0.5">
            点击任意指甲快速切换至单指编辑，支持左右手五指独立配置与跨指镜像同步。
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onMirrorLeftToRight}
            className="px-3 py-1.5 bg-[#373737] hover:bg-[#404040] border border-[#4A4A4A] text-[#E5E5E5] rounded text-xs flex items-center space-x-1.5 transition-colors"
            title="将左手五指设计镜像复制至右手五指 (UV 横向翻转)"
          >
            <FlipHorizontal className="w-3.5 h-3.5 text-[#A8A8A8]" />
            <span>左手镜像至右手</span>
          </button>
          <button
            type="button"
            onClick={onApplyCurrentToAll}
            className="px-3 py-1.5 bg-[#5E7EB8] hover:bg-[#6E8EC8] text-white font-medium rounded text-xs flex items-center space-x-1.5 transition-colors"
            title="将当前选中的指甲设计复制至全部十指"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>当前指应用至十指</span>
          </button>
        </div>
      </div>

      {/* Left Hand Matrix */}
      <div className="bg-[#303030] border border-[#4A4A4A] rounded p-3.5">
        <div className="flex items-center justify-between pb-1.5 mb-2.5 border-b border-[#4A4A4A]">
          <div className="text-xs font-medium text-[#E5E5E5]">左手五指设计 (Left Hand)</div>
          <div className="text-[10px] text-[#888888] font-mono">L-Thumb · L-Index · L-Middle · L-Ring · L-Pinky</div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {leftSlots.map(renderMiniNailCard)}
        </div>
      </div>

      {/* Right Hand Matrix */}
      <div className="bg-[#303030] border border-[#4A4A4A] rounded p-3.5">
        <div className="flex items-center justify-between pb-1.5 mb-2.5 border-b border-[#4A4A4A]">
          <div className="text-xs font-medium text-[#E5E5E5]">右手五指设计 (Right Hand)</div>
          <div className="text-[10px] text-[#888888] font-mono">R-Thumb · R-Index · R-Middle · R-Ring · R-Pinky</div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {rightSlots.map(renderMiniNailCard)}
        </div>
      </div>
    </div>
  );
};

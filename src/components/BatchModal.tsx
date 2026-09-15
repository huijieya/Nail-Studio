import React, { useState } from "react";
import { NailSlot, NailDesign } from "../types/nail";
import { NAIL_SLOTS } from "../utils/nailDefaults";
import {
  X,
  Sparkles,
  Copy,
  CheckSquare,
  Square,
} from "lucide-react";

interface BatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeNailSlot: NailSlot;
  nails: NailDesign[];
  onExecuteCopy: (sourceSlot: NailSlot, targetSlots: NailSlot[], mirror: boolean) => void;
  onBatchToggleVisibility: (targetSlots: NailSlot[], visible: boolean) => void;
  onBatchToggleSkip: (targetSlots: NailSlot[], skipped: boolean) => void;
}

export const BatchModal: React.FC<BatchModalProps> = ({
  isOpen,
  onClose,
  activeNailSlot,
  nails,
  onExecuteCopy,
  onBatchToggleVisibility,
  onBatchToggleSkip,
}) => {
  const [selectedSlots, setSelectedSlots] = useState<NailSlot[]>([]);
  const [mirrorUv, setMirrorUv] = useState(true);

  if (!isOpen) return null;

  const toggleSlot = (slot: NailSlot) => {
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const selectAll = () => {
    setSelectedSlots(NAIL_SLOTS.map((s) => s.slot).filter((s) => s !== activeNailSlot));
  };

  const selectLeftHand = () => {
    setSelectedSlots(
      NAIL_SLOTS.filter((s) => s.hand === "left" && s.slot !== activeNailSlot).map((s) => s.slot)
    );
  };

  const selectRightHand = () => {
    setSelectedSlots(
      NAIL_SLOTS.filter((s) => s.hand === "right" && s.slot !== activeNailSlot).map((s) => s.slot)
    );
  };

  const activeMeta = NAIL_SLOTS.find((s) => s.slot === activeNailSlot);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
      <div className="bg-[#303030] border border-[#4A4A4A] rounded-xs max-w-lg w-full shadow-2xl overflow-hidden text-xs text-[#E5E5E5]">
        {/* Header */}
        <div className="px-4 py-2.5 bg-[#2B2B2B] border-b border-[#4A4A4A] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#A8A8A8]" />
            <h3 className="font-semibold text-[#E5E5E5] text-sm">多指批量操作与跨指镜像</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#A8A8A8] hover:text-[#E5E5E5] p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3.5">
          {/* Source Finger Notice */}
          <div className="p-2 bg-[#202020] border border-[#4A4A4A] rounded flex items-center justify-between">
            <span className="text-[#A8A8A8]">当前源手指 (Source):</span>
            <span className="font-medium text-[#E5E5E5]">
              {activeMeta?.name} ({activeMeta?.slot})
            </span>
          </div>

          {/* Quick Target Selectors */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-[#A8A8A8]">
              <span>目标手指选择 (Target Nails):</span>
              <div className="space-x-1.5">
                <button
                  type="button"
                  onClick={selectLeftHand}
                  className="px-2 py-0.5 bg-[#373737] hover:bg-[#404040] border border-[#4A4A4A] text-[#E5E5E5] rounded text-[10px]"
                >
                  左手五指
                </button>
                <button
                  type="button"
                  onClick={selectRightHand}
                  className="px-2 py-0.5 bg-[#373737] hover:bg-[#404040] border border-[#4A4A4A] text-[#E5E5E5] rounded text-[10px]"
                >
                  右手五指
                </button>
                <button
                  type="button"
                  onClick={selectAll}
                  className="px-2 py-0.5 bg-[#373737] hover:bg-[#404040] border border-[#4A4A4A] text-[#E5E5E5] rounded text-[10px]"
                >
                  全选
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSlots([])}
                  className="px-2 py-0.5 bg-[#373737] hover:bg-[#404040] border border-[#4A4A4A] text-[#888888] rounded text-[10px]"
                >
                  清空
                </button>
              </div>
            </div>

            {/* Slots Grid */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {/* Left Hand */}
              <div className="p-2 bg-[#202020] rounded border border-[#4A4A4A] space-y-1">
                <div className="text-[10px] font-medium text-[#A8A8A8] pb-1 border-b border-[#373737]">左手</div>
                {NAIL_SLOTS.filter((s) => s.hand === "left").map((slot) => {
                  const isSource = slot.slot === activeNailSlot;
                  const isChecked = selectedSlots.includes(slot.slot);

                  return (
                    <div
                      key={slot.slot}
                      onClick={() => !isSource && toggleSlot(slot.slot)}
                      className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer ${
                        isSource
                          ? "opacity-50 cursor-not-allowed bg-transparent"
                          : isChecked
                          ? "bg-[#373737] text-[#E5E5E5] border border-[#5E7EB8]"
                          : "hover:bg-[#2B2B2B] text-[#A8A8A8]"
                      }`}
                    >
                      <span>{slot.name}</span>
                      {isSource ? (
                        <span className="text-[10px] text-[#888888]">[源指]</span>
                      ) : isChecked ? (
                        <CheckSquare className="w-3.5 h-3.5 text-[#5E7EB8]" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-[#666666]" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Right Hand */}
              <div className="p-2 bg-[#202020] rounded border border-[#4A4A4A] space-y-1">
                <div className="text-[10px] font-medium text-[#A8A8A8] pb-1 border-b border-[#373737]">右手</div>
                {NAIL_SLOTS.filter((s) => s.hand === "right").map((slot) => {
                  const isSource = slot.slot === activeNailSlot;
                  const isChecked = selectedSlots.includes(slot.slot);

                  return (
                    <div
                      key={slot.slot}
                      onClick={() => !isSource && toggleSlot(slot.slot)}
                      className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer ${
                        isSource
                          ? "opacity-50 cursor-not-allowed bg-transparent"
                          : isChecked
                          ? "bg-[#373737] text-[#E5E5E5] border border-[#5E7EB8]"
                          : "hover:bg-[#2B2B2B] text-[#A8A8A8]"
                      }`}
                    >
                      <span>{slot.name}</span>
                      {isSource ? (
                        <span className="text-[10px] text-[#888888]">[源指]</span>
                      ) : isChecked ? (
                        <CheckSquare className="w-3.5 h-3.5 text-[#5E7EB8]" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-[#666666]" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mirror Option */}
          <div className="flex items-center space-x-2 pt-2 border-t border-[#4A4A4A]">
            <input
              type="checkbox"
              id="mirror-uv-chk"
              checked={mirrorUv}
              onChange={(e) => setMirrorUv(e.target.checked)}
              className="accent-[#5E7EB8]"
            />
            <label htmlFor="mirror-uv-chk" className="text-[#E5E5E5] text-xs cursor-pointer">
              启用左右对称镜像 (自动翻转 UV 横向坐标 u' = 1 - u，并反转角度)
            </label>
          </div>

          <div className="text-[10px] text-[#888888] leading-relaxed">
            * 规则：批量操作执行时，每根指甲生成独立的数据副本，不建立后续联动关系。
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 bg-[#2B2B2B] border-t border-[#4A4A4A] flex items-center justify-between">
          <div className="space-x-1.5">
            <button
              type="button"
              disabled={selectedSlots.length === 0}
              onClick={() => {
                onBatchToggleVisibility(selectedSlots, true);
                onClose();
              }}
              className="px-2 py-1 bg-[#373737] hover:bg-[#404040] border border-[#4A4A4A] text-[#E5E5E5] rounded text-[10px] disabled:opacity-40"
            >
              批量显示
            </button>
            <button
              type="button"
              disabled={selectedSlots.length === 0}
              onClick={() => {
                onBatchToggleSkip(selectedSlots, true);
                onClose();
              }}
              className="px-2 py-1 bg-[#373737] hover:bg-[#404040] border border-[#4A4A4A] text-[#E5E5E5] rounded text-[10px] disabled:opacity-40"
            >
              批量跳过
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-[#373737] hover:bg-[#404040] border border-[#4A4A4A] text-[#A8A8A8] hover:text-[#E5E5E5] rounded"
            >
              取消
            </button>
            <button
              type="button"
              disabled={selectedSlots.length === 0}
              onClick={() => {
                onExecuteCopy(activeNailSlot, selectedSlots, mirrorUv);
                onClose();
              }}
              className={`px-4 py-1.5 rounded font-medium flex items-center space-x-1.5 ${
                selectedSlots.length > 0
                  ? "bg-[#5E7EB8] hover:bg-[#6E8EC8] text-white"
                  : "bg-[#373737] text-[#666666] cursor-not-allowed border border-[#4A4A4A]"
              }`}
            >
              <Copy className="w-3.5 h-3.5" />
              <span>应用复制 ({selectedSlots.length} 指)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

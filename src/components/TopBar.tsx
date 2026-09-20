import React from "react";
import {
  NailShape,
  SelectionRangeMode,
} from "../types/nail";
import { getNailShapeInfo } from "../utils/nailShapes";
import {
  Layers,
  Lock,
  Undo2,
  Redo2,
  Save,
  Download,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface TopBarProps {
  designName: string;
  onDesignNameChange: (name: string) => void;
  sourceModelName: string;
  targetShape: NailShape;
  lockedAt: string;
  viewMode: "2d" | "3d" | "ten-nails";
  onViewModeChange: (mode: "2d" | "3d" | "ten-nails") => void;
  selectionMode: SelectionRangeMode;
  onSelectionModeChange: (mode: SelectionRangeMode) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onOpenSaveTemplate: () => void;
  onOpenExport: () => void;
  onReturnToPrep: () => void;
  onOpenBatchModal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  designName,
  onDesignNameChange,
  sourceModelName,
  targetShape,
  viewMode,
  onViewModeChange,
  selectionMode,
  onSelectionModeChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenSaveTemplate,
  onOpenExport,
  onReturnToPrep,
  onOpenBatchModal,
}) => {
  return (
    <header className="h-11 bg-[#303030] border-b border-[#4A4A4A] px-3 flex items-center justify-between text-xs select-none z-20">
      {/* Left Section: PS Logo, File Name, Readonly Model Badge */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5 font-bold text-[#E5E5E5] tracking-wider">
          <div className="w-5 h-5 bg-[#4A72B2] text-white flex items-center justify-center text-[11px] font-black rounded-xs shadow-xs">
            PS
          </div>
          <span className="hidden md:inline font-mono text-[11px] tracking-normal text-[#A8A8A8]">NAIL STUDIO</span>
        </div>

        <div className="h-4 w-[1px] bg-[#4A4A4A]" />

        {/* Editable Design Name Input */}
        <div className="flex items-center space-x-1">
          <input
            type="text"
            value={designName}
            onChange={(e) => onDesignNameChange(e.target.value)}
            className="bg-[#202020] hover:bg-[#282828] focus:bg-[#1A1A1A] text-[#E5E5E5] px-2 py-0.5 rounded-xs border border-[#4A4A4A] focus:border-[#5E7EB8] focus:outline-none text-xs font-mono w-40 md:w-52 transition-colors"
            title="点击修改设计名称"
          />
        </div>

        {/* Read-only Model and Locked Shape Badge */}
        <div className="hidden lg:flex items-center space-x-1.5 px-2 py-0.5 bg-[#202020] border border-[#4A4A4A] rounded text-[11px] text-[#A8A8A8]">
          <Lock className="w-3 h-3 text-[#A8A8A8]" />
          <span className="text-[#E5E5E5]">
            {sourceModelName.length > 14 ? `${sourceModelName.slice(0, 14)}...` : sourceModelName}
          </span>
          <span className="text-[#4A4A4A]">/</span>
          <span className="text-[#E5E5E5] font-medium">
            {getNailShapeInfo(targetShape).name} ({getNailShapeInfo(targetShape).enName})
          </span>
          <span className="text-[10px] text-[#5E7EB8] font-mono">已锁定</span>
        </div>
      </div>

      {/* Center Section: Selection Range & View Switcher */}
      <div className="flex items-center space-x-2">
        {/* Selection Range Picker */}
        <div className="flex items-center bg-[#202020] p-0.5 rounded border border-[#4A4A4A]">
          <span className="text-[10px] text-[#888888] px-1.5 hidden xl:inline">范围:</span>
          <button
            type="button"
            onClick={() => onSelectionModeChange("single")}
            className={`px-2 py-0.5 rounded-xs text-[11px] transition-colors ${
              selectionMode === "single" ? "bg-[#373737] text-[#E5E5E5] font-medium" : "text-[#A8A8A8] hover:text-[#E5E5E5]"
            }`}
          >
            单指
          </button>
          <button
            type="button"
            onClick={() => onSelectionModeChange("left-five")}
            className={`px-2 py-0.5 rounded-xs text-[11px] transition-colors ${
              selectionMode === "left-five" ? "bg-[#373737] text-[#E5E5E5] font-medium" : "text-[#A8A8A8] hover:text-[#E5E5E5]"
            }`}
          >
            左手五指
          </button>
          <button
            type="button"
            onClick={() => onSelectionModeChange("right-five")}
            className={`px-2 py-0.5 rounded-xs text-[11px] transition-colors ${
              selectionMode === "right-five" ? "bg-[#373737] text-[#E5E5E5] font-medium" : "text-[#A8A8A8] hover:text-[#E5E5E5]"
            }`}
          >
            右手五指
          </button>
          <button
            type="button"
            onClick={() => onSelectionModeChange("all-ten")}
            className={`px-2 py-0.5 rounded-xs text-[11px] transition-colors ${
              selectionMode === "all-ten" ? "bg-[#373737] text-[#E5E5E5] font-medium" : "text-[#A8A8A8] hover:text-[#E5E5E5]"
            }`}
          >
            十指
          </button>
          <button
            type="button"
            onClick={onOpenBatchModal}
            className="px-2 py-0.5 rounded-xs text-[11px] text-[#A8A8A8] hover:text-[#E5E5E5] hover:bg-[#303030] transition-colors flex items-center space-x-1"
            title="多指批量操作 (镜像/复制/批量应用)"
          >
            <Sparkles className="w-3 h-3 text-[#5E7EB8]" />
            <span>批量操作</span>
          </button>
        </div>

        <div className="h-4 w-[1px] bg-[#4A4A4A]" />

        {/* View Switch Tabs */}
        <div className="flex items-center bg-[#202020] p-0.5 rounded border border-[#4A4A4A]">
          <button
            type="button"
            onClick={() => onViewModeChange("2d")}
            className={`px-2.5 py-0.5 rounded-xs text-[11px] font-medium transition-colors ${
              viewMode === "2d" ? "bg-[#373737] text-[#E5E5E5] shadow-xs" : "text-[#A8A8A8] hover:text-[#E5E5E5]"
            }`}
          >
            2D 画布
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("3d")}
            className={`px-2.5 py-0.5 rounded-xs text-[11px] font-medium transition-colors ${
              viewMode === "3d" ? "bg-[#373737] text-[#E5E5E5] shadow-xs" : "text-[#A8A8A8] hover:text-[#E5E5E5]"
            }`}
          >
            3D 视角
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("ten-nails")}
            className={`px-2.5 py-0.5 rounded-xs text-[11px] font-medium transition-colors ${
              viewMode === "ten-nails" ? "bg-[#373737] text-[#E5E5E5] shadow-xs" : "text-[#A8A8A8] hover:text-[#E5E5E5]"
            }`}
          >
            十指全景
          </button>
        </div>
      </div>

      {/* Right Section: Undo/Redo, Templates, Export, Re-prep */}
      <div className="flex items-center space-x-2">
        {/* Undo / Redo */}
        <div className="flex items-center space-x-0.5">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1 rounded transition-colors ${
              canUndo ? "hover:bg-[#373737] text-[#E5E5E5]" : "text-[#555555] cursor-not-allowed"
            }`}
            title="撤销 (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1 rounded transition-colors ${
              canRedo ? "hover:bg-[#373737] text-[#E5E5E5]" : "text-[#555555] cursor-not-allowed"
            }`}
            title="重做 (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-4 w-[1px] bg-[#4A4A4A]" />

        {/* Save Template Button */}
        <button
          type="button"
          onClick={onOpenSaveTemplate}
          className="px-2.5 py-1 bg-[#373737] hover:bg-[#404040] border border-[#4A4A4A] text-[#E5E5E5] rounded text-[11px] flex items-center space-x-1.5 transition-colors"
          title="保存或加载十指组合模板"
        >
          <Save className="w-3 h-3 text-[#A8A8A8]" />
          <span className="hidden sm:inline">模板</span>
        </button>

        {/* Export Design Button */}
        <button
          type="button"
          onClick={onOpenExport}
          className="px-2.5 py-1 bg-[#4A72B2] hover:bg-[#5A82C2] text-white rounded text-[11px] font-medium flex items-center space-x-1.5 transition-colors shadow-xs"
          title="导出工业级设计数据 (JSON / 生产清单)"
        >
          <Download className="w-3 h-3 text-white" />
          <span>导出设计</span>
        </button>

        {/* Return to model prep */}
        <button
          type="button"
          onClick={onReturnToPrep}
          className="p-1 text-[#A8A8A8] hover:text-[#E5E5E5] hover:bg-[#373737] rounded transition-colors"
          title="返回模型准备 (重新选择甲型/STL)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};

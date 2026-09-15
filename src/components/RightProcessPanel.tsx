import React, { useState, useEffect } from "react";
import {
  ProcessStep,
  ProcessStepType,
  DesignItem,
  FlatDesignItem,
  SurfaceEffectItem,
  Decoration3DItem,
  BackgroundItem,
  FinishItem,
  PROCESS_ORDER,
  PROCESS_STEP_TITLES,
} from "../types/nail";
import {
  Eye,
  EyeOff,
  Copy,
  Trash2,
  ChevronDown,
  ChevronRight,
  Layers,
  Sliders,
  Plus,
  Box,
  Circle,
  Square,
  Sparkles,
  Droplet,
  Paintbrush,
} from "lucide-react";

interface RightProcessPanelProps {
  steps: ProcessStep[];
  activeStepId: string | null;
  onSelectStep: (stepId: string) => void;
  selectedItemId: string | null;
  onSelectItem: (itemId: string | null) => void;
  onToggleStepVisibility: (stepId: string) => void;
  onToggleStepSkip: (stepId: string) => void;
  onDuplicateStep: (stepId: string) => void;
  onDeleteStep: (stepId: string) => void;
  onAddStep: (type: ProcessStepType) => void;
  onUpdateStepProperty: (stepId: string, updates: Partial<ProcessStep>) => void;
  onUpdateItemProperty: (itemId: string, updates: Partial<DesignItem>) => void;
}

export const RightProcessPanel: React.FC<RightProcessPanelProps> = ({
  steps,
  activeStepId,
  onSelectStep,
  selectedItemId,
  onSelectItem,
  onToggleStepVisibility,
  onToggleStepSkip,
  onDuplicateStep,
  onDeleteStep,
  onAddStep,
  onUpdateStepProperty,
  onUpdateItemProperty,
}) => {
  const [activeTab, setActiveTab] = useState<"steps" | "properties">("steps");

  // Find active step and determine its category
  const activeStep = steps.find((s) => s.id === activeStepId) || steps[0];
  const activeCategory = activeStep?.type || "background";

  // Category expansion state: default only expand current active category
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    background: true,
    "flat-design": false,
    "surface-effect": false,
    "decoration-3d": false,
    finish: false,
  });

  // When active category changes, ensure it is expanded
  useEffect(() => {
    if (activeCategory) {
      setExpandedCategories((prev) => ({
        ...prev,
        [activeCategory]: true,
      }));
    }
  }, [activeCategory]);

  const toggleCategoryExpand = (cat: string) => {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  let activeItem: DesignItem | null = null;
  let activeItemStep: ProcessStep | null = null;

  for (const s of steps) {
    for (const it of s.items) {
      if (it.id === selectedItemId) {
        activeItem = it;
        activeItemStep = s;
        break;
      }
    }
  }

  // 5 standard process categories
  const categories: ProcessStepType[] = [
    "background",
    "flat-design",
    "surface-effect",
    "decoration-3d",
    "finish",
  ];

  // Helper to render mini thumbnail / icon for a step
  const renderStepThumbnail = (step: ProcessStep) => {
    switch (step.type) {
      case "background": {
        const bgItem = step.items[0] as BackgroundItem | undefined;
        const color = bgItem?.color || "#252525";
        return (
          <span
            className="w-3.5 h-3.5 rounded-xs border border-[#4A4A4A] shrink-0"
            style={{ backgroundColor: color }}
            title={`底色: ${color}`}
          />
        );
      }
      case "flat-design":
        return <Paintbrush className="w-3.5 h-3.5 text-[#A8A8A8] shrink-0" />;
      case "surface-effect":
        return <Sparkles className="w-3.5 h-3.5 text-[#A8A8A8] shrink-0" />;
      case "decoration-3d":
        return <Box className="w-3.5 h-3.5 text-[#A8A8A8] shrink-0" />;
      case "finish":
        return <Droplet className="w-3.5 h-3.5 text-[#A8A8A8] shrink-0" />;
      default:
        return <Circle className="w-3.5 h-3.5 text-[#A8A8A8] shrink-0" />;
    }
  };

  return (
    <aside className="w-80 bg-[#303030] border-l border-[#4A4A4A] flex flex-col select-none text-xs h-[calc(100vh-44px)]">
      {/* Top Dock Tab Bar */}
      <div className="h-8 bg-[#303030] border-b border-[#4A4A4A] px-2 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setActiveTab("steps")}
            className={`px-2.5 py-1 text-xs font-medium transition-colors flex items-center space-x-1.5 ${
              activeTab === "steps"
                ? "bg-[#373737] text-[#E5E5E5] border-b-2 border-[#5E7EB8]"
                : "text-[#A8A8A8] hover:text-[#E5E5E5]"
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>制作步骤</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("properties")}
            className={`px-2.5 py-1 text-xs font-medium transition-colors flex items-center space-x-1.5 ${
              activeTab === "properties"
                ? "bg-[#373737] text-[#E5E5E5] border-b-2 border-[#5E7EB8]"
                : "text-[#A8A8A8] hover:text-[#E5E5E5]"
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span>属性参数</span>
          </button>
        </div>

        <div className="text-[10px] text-[#888888] font-mono">
          顺序固定 (1~5)
        </div>
      </div>

      {/* Main Panel Body */}
      <div className="flex-1 overflow-y-auto p-2">
        {activeTab === "steps" ? (
          /* ================= PROCESS STEPS DOCK ================= */
          <div className="space-y-1.5">
            {categories.map((catType) => {
              const catSteps = steps.filter((s) => s.type === catType);
              const isExpanded = !!expandedCategories[catType];
              const allowMultiple =
                catType === "flat-design" ||
                catType === "surface-effect" ||
                catType === "decoration-3d";

              // Check if any step has warning or unsupported
              const hasWarning = catSteps.some(
                (s) => s.supportStatus?.status === "warning"
              );
              const hasUnsupported = catSteps.some(
                (s) => s.supportStatus?.status === "unsupported"
              );

              return (
                <div
                  key={catType}
                  className="bg-[#2B2B2B] border border-[#4A4A4A] rounded-xs overflow-hidden"
                >
                  {/* Category Header Row */}
                  <div
                    onClick={() => toggleCategoryExpand(catType)}
                    className="h-7 px-2 bg-[#333333] hover:bg-[#3A3A3A] flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-1.5">
                      {isExpanded ? (
                        <ChevronDown className="w-3 h-3 text-[#A8A8A8]" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-[#A8A8A8]" />
                      )}
                      <span className="font-medium text-[#E5E5E5] text-[11px]">
                        {PROCESS_ORDER[catType]}. {PROCESS_STEP_TITLES[catType]}
                      </span>
                      <span className="text-[10px] text-[#888888] font-mono">
                        ({catSteps.length})
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Category Status Dot */}
                      {hasUnsupported ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" title="包含不支持工艺" />
                      ) : hasWarning ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="包含警告工艺" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="工艺就绪" />
                      )}

                      {/* Add Step Button */}
                      {allowMultiple && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddStep(catType);
                          }}
                          className="p-0.5 hover:bg-[#4A4A4A] text-[#A8A8A8] hover:text-[#E5E5E5] rounded transition-colors"
                          title={`添加${PROCESS_STEP_TITLES[catType]}`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded: Compact Step Rows */}
                  {isExpanded && (
                    <div className="divide-y divide-[#3D3D3D]">
                      {catSteps.length === 0 ? (
                        <div className="text-[10px] text-[#888888] text-center py-2 bg-[#282828]">
                          暂无步骤，点击右侧【+】添加
                        </div>
                      ) : (
                        catSteps.map((step, idx) => {
                          const isSelected = step.id === activeStepId;
                          const support = step.supportStatus;

                          return (
                            <div
                              key={step.id}
                              onClick={() => {
                                onSelectStep(step.id);
                                if (step.items.length > 0) {
                                  onSelectItem(step.items[0].id);
                                }
                              }}
                              className={`h-7 px-2 flex items-center justify-between cursor-pointer transition-colors ${
                                isSelected
                                  ? "bg-[#3D3D3D] text-[#E5E5E5] border-l-2 border-l-[#5E7EB8]"
                                  : "bg-[#282828] hover:bg-[#323232] text-[#A8A8A8] border-l-2 border-l-transparent"
                              }`}
                            >
                              {/* Left: Index, Icon, Name */}
                              <div className="flex items-center space-x-1.5 overflow-hidden flex-1 mr-1">
                                <span className="text-[10px] font-mono text-[#888888] shrink-0">
                                  #{idx + 1}
                                </span>
                                {renderStepThumbnail(step)}
                                <span
                                  className={`text-[11px] truncate ${
                                    isSelected ? "text-[#E5E5E5] font-medium" : "text-[#A8A8A8]"
                                  } ${step.skipped ? "line-through opacity-50" : ""}`}
                                >
                                  {step.name}
                                </span>
                              </div>

                              {/* Right: Actions (Visibility, Skip, Duplicate, Delete) */}
                              <div className="flex items-center space-x-1 shrink-0">
                                {/* Visibility */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleStepVisibility(step.id);
                                  }}
                                  className={`p-0.5 rounded transition-colors ${
                                    step.visible ? "text-[#A8A8A8] hover:text-[#E5E5E5]" : "text-[#555555]"
                                  }`}
                                  title={step.visible ? "隐藏" : "显示"}
                                >
                                  {step.visible ? (
                                    <Eye className="w-3 h-3" />
                                  ) : (
                                    <EyeOff className="w-3 h-3" />
                                  )}
                                </button>

                                {/* Skip */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleStepSkip(step.id);
                                  }}
                                  className={`text-[10px] px-1 py-0.2 rounded transition-colors ${
                                    step.skipped
                                      ? "bg-amber-900/60 text-amber-300"
                                      : "text-[#888888] hover:text-[#E5E5E5]"
                                  }`}
                                  title="跳过此工艺"
                                >
                                  {step.skipped ? "已跳过" : "跳过"}
                                </button>

                                {/* Duplicate */}
                                {allowMultiple && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDuplicateStep(step.id);
                                    }}
                                    className="p-0.5 hover:bg-[#4A4A4A] text-[#888888] hover:text-[#E5E5E5] rounded transition-colors"
                                    title="复制"
                                  >
                                    <Copy className="w-2.5 h-2.5" />
                                  </button>
                                )}

                                {/* Delete */}
                                {allowMultiple && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDeleteStep(step.id);
                                    }}
                                    className="p-0.5 hover:bg-[#482828] text-[#888888] hover:text-[#E06C75] rounded transition-colors"
                                    title="删除"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* ================= PROPERTIES INSPECTOR DOCK ================= */
          <div className="space-y-3">
            {/* Context Header */}
            <div className="pb-1.5 border-b border-[#4A4A4A]">
              <div className="text-[10px] text-[#888888] uppercase font-mono">属性参数</div>
              <div className="text-xs font-medium text-[#E5E5E5] mt-0.5 truncate">
                {activeItem
                  ? `元素: ${(activeItem as any).name || ('kind' in activeItem ? (activeItem as any).kind : (activeItem as any).assetId) || "未命名"}`
                  : `步骤: ${activeStep?.name || "未选"}`}
              </div>
            </div>

            {/* Step Level Properties */}
            <div className="bg-[#373737] p-2.5 rounded border border-[#4A4A4A] space-y-2.5">
              <div className="text-[11px] font-medium text-[#E5E5E5]">步骤参数</div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#A8A8A8]">步骤名称</label>
                <input
                  type="text"
                  value={activeStep?.name || ""}
                  onChange={(e) =>
                    activeStep && onUpdateStepProperty(activeStep.id, { name: e.target.value })
                  }
                  className="w-full bg-[#202020] border border-[#4A4A4A] rounded px-2 py-1 text-[#E5E5E5] text-xs focus:border-[#5E7EB8] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#A8A8A8]">材料型号说明</label>
                <input
                  type="text"
                  value={activeStep?.material?.name || ""}
                  onChange={(e) =>
                    activeStep &&
                    onUpdateStepProperty(activeStep.id, {
                      material: { ...activeStep.material, name: e.target.value },
                    })
                  }
                  className="w-full bg-[#202020] border border-[#4A4A4A] rounded px-2 py-1 text-[#E5E5E5] text-xs focus:border-[#5E7EB8] focus:outline-none"
                />
              </div>

              {/* Device Support Status */}
              {activeStep?.supportStatus && (
                <div className="p-2 bg-[#202020] rounded border border-[#4A4A4A] space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[#A8A8A8]">工艺设备可行性:</span>
                    <span
                      className={`font-semibold ${
                        activeStep.supportStatus.status === "supported"
                          ? "text-emerald-400"
                          : activeStep.supportStatus.status === "warning"
                          ? "text-amber-400"
                          : "text-red-400"
                      }`}
                    >
                      {activeStep.supportStatus.status === "supported"
                        ? "支持"
                        : activeStep.supportStatus.status === "warning"
                        ? "警告"
                        : "不支持"}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#888888] leading-tight">
                    {activeStep.supportStatus.reasons.join("；")}
                  </div>
                </div>
              )}
            </div>

            {/* Element Level Properties (if an item is selected) */}
            {activeItem && (
              <div className="bg-[#373737] p-2.5 rounded border border-[#4A4A4A] space-y-2.5">
                <div className="text-[11px] font-medium text-[#E5E5E5]">空间位置与形态</div>

                {/* Flat Design Properties */}
                {(activeItemStep?.type === "flat-design" || (activeItem as any).transform) && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-[#A8A8A8]">UV X</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          value={(activeItem as FlatDesignItem).transform.x}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            const curT = (activeItem as FlatDesignItem).transform;
                            onUpdateItemProperty(activeItem!.id, {
                              transform: { ...curT, x: val },
                            } as any);
                          }}
                          className="w-full bg-[#202020] border border-[#4A4A4A] rounded px-2 py-1 text-[#E5E5E5] text-xs font-mono focus:border-[#5E7EB8] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#A8A8A8]">UV Y</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          value={(activeItem as FlatDesignItem).transform.y}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            const curT = (activeItem as FlatDesignItem).transform;
                            onUpdateItemProperty(activeItem!.id, {
                              transform: { ...curT, y: val },
                            } as any);
                          }}
                          className="w-full bg-[#202020] border border-[#4A4A4A] rounded px-2 py-1 text-[#E5E5E5] text-xs font-mono focus:border-[#5E7EB8] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-[#A8A8A8]">旋转角度 (°)</label>
                        <input
                          type="number"
                          step="5"
                          min="0"
                          max="360"
                          value={(activeItem as FlatDesignItem).transform.rotation}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            const curT = (activeItem as FlatDesignItem).transform;
                            onUpdateItemProperty(activeItem!.id, {
                              transform: { ...curT, rotation: val },
                            } as any);
                          }}
                          className="w-full bg-[#202020] border border-[#4A4A4A] rounded px-2 py-1 text-[#E5E5E5] text-xs font-mono focus:border-[#5E7EB8] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#A8A8A8]">不透明度 (%)</label>
                        <input
                          type="number"
                          step="5"
                          min="0"
                          max="100"
                          value={Math.round(((activeItem as FlatDesignItem).opacity ?? 1) * 100)}
                          onChange={(e) => {
                            const val = (parseInt(e.target.value) || 100) / 100;
                            onUpdateItemProperty(activeItem!.id, { opacity: val } as any);
                          }}
                          className="w-full bg-[#202020] border border-[#4A4A4A] rounded px-2 py-1 text-[#E5E5E5] text-xs font-mono focus:border-[#5E7EB8] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Color Swatch */}
                    <div>
                      <label className="text-[10px] text-[#A8A8A8] block mb-1">颜色拾取</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={(activeItem as FlatDesignItem).color || "#ffffff"}
                          onChange={(e) =>
                            onUpdateItemProperty(activeItem!.id, { color: e.target.value } as any)
                          }
                          className="w-7 h-7 rounded border border-[#4A4A4A] bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={(activeItem as FlatDesignItem).color || "#ffffff"}
                          onChange={(e) =>
                            onUpdateItemProperty(activeItem!.id, { color: e.target.value } as any)
                          }
                          className="flex-1 bg-[#202020] border border-[#4A4A4A] rounded px-2 py-1 text-[#E5E5E5] text-xs font-mono focus:border-[#5E7EB8] focus:outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* 3D Decoration Properties */}
                {activeItemStep?.type === "decoration-3d" && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-[#A8A8A8]">厚度高度 (mm)</label>
                        <input
                          type="number"
                          step="0.2"
                          min="0.5"
                          max="6.0"
                          value={(activeItem as Decoration3DItem).transform.height}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            const curT = (activeItem as Decoration3DItem).transform;
                            onUpdateItemProperty(activeItem!.id, {
                              transform: { ...curT, height: val },
                            } as any);
                          }}
                          className="w-full bg-[#202020] border border-[#4A4A4A] rounded px-2 py-1 text-[#E5E5E5] text-xs font-mono focus:border-[#5E7EB8] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#A8A8A8]">缩放倍率</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.4"
                          max="2.5"
                          value={(activeItem as Decoration3DItem).transform.scale}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            const curT = (activeItem as Decoration3DItem).transform;
                            onUpdateItemProperty(activeItem!.id, {
                              transform: { ...curT, scale: val },
                            } as any);
                          }}
                          className="w-full bg-[#202020] border border-[#4A4A4A] rounded px-2 py-1 text-[#E5E5E5] text-xs font-mono focus:border-[#5E7EB8] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="text-[10px] text-[#888888] bg-[#202020] p-2 rounded border border-[#4A4A4A]">
                      饰品已锁定曲面法向贴合，在 2D 画布中拖动锚点定位。
                    </div>
                  </>
                )}

                {/* Surface Effect Mask Properties */}
                {activeItemStep?.type === "surface-effect" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] text-[#A8A8A8]">
                        遮罩羽化: {(activeItem as SurfaceEffectItem).mask.feather}px
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        value={(activeItem as SurfaceEffectItem).mask.feather}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          const curM = (activeItem as SurfaceEffectItem).mask;
                          onUpdateItemProperty(activeItem!.id, {
                            mask: { ...curM, feather: val },
                          } as any);
                        }}
                        className="w-full accent-[#5E7EB8]"
                      />
                    </div>

                    <div className="flex items-center space-x-2 pt-1">
                      <input
                        type="checkbox"
                        id="invert-mask-chk"
                        checked={(activeItem as SurfaceEffectItem).mask.invert}
                        onChange={(e) => {
                          const curM = (activeItem as SurfaceEffectItem).mask;
                          onUpdateItemProperty(activeItem!.id, {
                            mask: { ...curM, invert: e.target.checked },
                          } as any);
                        }}
                        className="accent-[#5E7EB8]"
                      />
                      <label htmlFor="invert-mask-chk" className="text-xs text-[#E5E5E5]">
                        反向遮罩
                      </label>
                    </div>
                  </>
                )}

                {/* Finish Layer Properties */}
                {activeItemStep?.type === "finish" && (
                  <div className="space-y-2">
                    <label className="text-[10px] text-[#A8A8A8]">
                      表面光泽度: {(activeItem as FinishItem).glossiness}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={(activeItem as FinishItem).glossiness}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        onUpdateItemProperty(activeItem!.id, { glossiness: val } as any);
                      }}
                      className="w-full accent-[#5E7EB8]"
                    />
                    <div className="flex justify-between text-[10px] text-[#888888]">
                      <span>0% 雾面哑光</span>
                      <span>50% 半哑</span>
                      <span>100% 镜面晶亮</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

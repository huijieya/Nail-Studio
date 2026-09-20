import React from "react";
import {
  ProcessStepType,
  BackgroundItem,
  FlatDesignItem,
  SurfaceEffectItem,
  Decoration3DItem,
  FinishItem,
  Asset,
} from "../types/nail";
import { PRESET_ASSETS } from "../utils/nailDefaults";
import {
  MousePointer2,
  Move,
  Shield,
  Square,
  Circle,
  Star,
  Heart,
  Moon,
  Minus,
  Plus,
  Box,
  FileImage,
  Sparkles,
  Droplets,
  Layers,
  Check,
} from "lucide-react";

interface LeftToolbarProps {
  currentStepType: ProcessStepType;
  onAddFlatItem: (item: Partial<FlatDesignItem>) => void;
  onAdd3DItem: (asset: Asset) => void;
  onAddSurfaceItem: (kind: SurfaceEffectItem["kind"]) => void;
  onUpdateBackground: (kind: BackgroundItem["kind"], color?: string) => void;
  onUpdateFinish: (glossiness: number) => void;
  activeTool: string;
  onSelectTool: (tool: string) => void;
  showSafeArea: boolean;
  onToggleSafeArea: () => void;
}

export const LeftToolbar: React.FC<LeftToolbarProps> = ({
  currentStepType,
  onAddFlatItem,
  onAdd3DItem,
  onAddSurfaceItem,
  onUpdateBackground,
  onUpdateFinish,
  activeTool,
  onSelectTool,
  showSafeArea,
  onToggleSafeArea,
}) => {
  const flatAssets = PRESET_ASSETS.filter((a) => a.type === "svg");
  const modelAssets = PRESET_ASSETS.filter((a) => a.type === "model-3d");

  // Step type name mapping
  const stepTypeLabels: Record<ProcessStepType, string> = {
    background: "背景底色",
    "flat-design": "平面印花",
    "surface-effect": "表面效果",
    "decoration-3d": "3D 饰品",
    finish: "表面封层",
  };

  // Preset quick colors for background
  const quickColors = [
    { name: "极简纯黑", color: "#1A1A1A" },
    { name: "中性深灰", color: "#373737" },
    { name: "冷调浅灰", color: "#9E9E9E" },
    { name: "柔和米白", color: "#E8E2D9" },
    { name: "极淡雾青", color: "#C6D3CE" },
    { name: "烟熏灰青", color: "#2E3B36" },
    { name: "深邃墨蓝", color: "#223142" },
    { name: "低调暗紫", color: "#32253B" },
    { name: "冷淡冰透", color: "#D2C2BD" },
    { name: "裸感豆沙", color: "#8E6961" },
    { name: "磁吸青灰", color: "#2B3D38" },
    { name: "纯净雪白", color: "#F5F5F5" },
  ];

  return (
    <aside className="w-60 bg-[#303030] border-l border-[#4A4A4A] flex flex-col select-none text-xs h-[calc(100vh-44px)]">
      {/* Top PS Utility Bar */}
      <div className="h-8 bg-[#303030] border-b border-[#4A4A4A] px-2 flex items-center justify-between text-[#A8A8A8]">
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => onSelectTool("select")}
            className={`p-1 rounded transition-colors ${
              activeTool === "select" ? "bg-[#373737] text-[#E5E5E5]" : "hover:text-[#E5E5E5] hover:bg-[#373737]"
            }`}
            title="选择工具 (V)"
          >
            <MousePointer2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onSelectTool("transform")}
            className={`p-1 rounded transition-colors ${
              activeTool === "transform" ? "bg-[#373737] text-[#E5E5E5]" : "hover:text-[#E5E5E5] hover:bg-[#373737]"
            }`}
            title="自由变换/移动 (T)"
          >
            <Move className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onToggleSafeArea}
            className={`p-1 rounded transition-colors ${
              showSafeArea ? "bg-[#373737] text-[#5E7EB8]" : "hover:text-[#E5E5E5] hover:bg-[#373737]"
            }`}
            title="安全生产边界开关"
          >
            <Shield className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Current Step Type Indicator */}
        <div className="px-1.5 py-0.5 rounded bg-[#202020] border border-[#4A4A4A] text-[10px] text-[#E5E5E5]">
          {stepTypeLabels[currentStepType]}
        </div>
      </div>

      {/* Dynamic Content Panel Depending on Current Step Type */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-3.5">
        {/* 1. BACKGROUND LAYER TOOLS */}
        {currentStepType === "background" && (
          <div className="space-y-3">
            {/* Quick Color Swatches */}
            <div>
              <div className="text-[11px] text-[#A8A8A8] font-medium mb-1.5">快速底色色板</div>
              <div className="grid grid-cols-6 gap-1.5 p-1.5 bg-[#202020] rounded border border-[#4A4A4A]">
                {quickColors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => onUpdateBackground("base-color", c.color)}
                    className="w-6 h-6 rounded-xs border border-[#4A4A4A] hover:border-[#5E7EB8] transition-colors relative group"
                    style={{ backgroundColor: c.color }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Background Style Presets */}
            <div>
              <div className="text-[11px] text-[#A8A8A8] font-medium mb-1.5">工艺材质风格</div>
              <div className="space-y-1">
                {[
                  { id: "base-color", name: "实色纯彩 (Solid Base)", desc: "高遮盖力纯色底胶", color: "#252525" },
                  { id: "sheer-color", name: "透彩果冻 (Sheer Jelly)", desc: "微透光泽纯净质感", color: "#373737" },
                  { id: "gradient", name: "双色晕染 (Gradient)", desc: "由深至浅自然渐变", color: "#4A4A4A" },
                  { id: "full-cat-eye", name: "全甲猫眼 (Cat-Eye)", desc: "磁吸立体微光流动", color: "#2A363B" },
                  { id: "full-glitter", name: "满甲细闪 (Fine Glitter)", desc: "极细晶钻微闪颗粒", color: "#3A3D40" },
                ].map((bg) => (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() => onUpdateBackground(bg.id as BackgroundItem["kind"], bg.color)}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded bg-[#373737] hover:bg-[#404040] border border-[#4A4A4A] text-left transition-colors group"
                    title={bg.desc}
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3.5 h-3.5 rounded-xs border border-[#4A4A4A] shrink-0"
                        style={{ backgroundColor: bg.color }}
                      />
                      <span className="text-[#E5E5E5] text-[11px]">{bg.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. FLAT DESIGN LAYER TOOLS */}
        {currentStepType === "flat-design" && (
          <div className="space-y-3">
            {/* Quick Geometric Shapes */}
            <div>
              <div className="text-[11px] text-[#A8A8A8] font-medium mb-1.5">基础几何形状</div>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { shape: "star", name: "星芒", icon: Star },
                  { shape: "moon", name: "弯月", icon: Moon },
                  { shape: "heart", name: "心形", icon: Heart },
                  { shape: "circle", name: "圆形", icon: Circle },
                  { shape: "rect", name: "矩形", icon: Square },
                  { shape: "line", name: "直线", icon: Minus },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.shape}
                      type="button"
                      onClick={() =>
                        onAddFlatItem({
                          kind: "shape",
                          shapeType: item.shape as FlatDesignItem["shapeType"],
                          color: "#E5E5E5",
                          opacity: 1,
                        })
                      }
                      className="flex items-center justify-center space-x-1 py-1.5 rounded bg-[#373737] hover:bg-[#404040] border border-[#4A4A4A] text-[#E5E5E5] transition-colors"
                      title={`添加${item.name}`}
                    >
                      <Icon className="w-3 h-3 text-[#A8A8A8]" />
                      <span className="text-[10px]">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Vector Stickers - Compact Grid */}
            <div>
              <div className="text-[11px] text-[#A8A8A8] font-medium mb-1.5">矢量素材图案</div>
              <div className="grid grid-cols-4 gap-1.5 p-1.5 bg-[#202020] rounded border border-[#4A4A4A]">
                {flatAssets.map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() =>
                      onAddFlatItem({
                        kind: "sticker",
                        assetId: asset.id,
                        color: "#E5E5E5",
                        svgPath: asset.svgData,
                        opacity: 1,
                      })
                    }
                    className="w-11 h-11 flex items-center justify-center rounded bg-[#373737] hover:bg-[#404040] border border-[#4A4A4A] hover:border-[#5E7EB8] transition-all group"
                    title={`添加素材: ${asset.name}`}
                  >
                    <svg className="w-4 h-4 text-[#E5E5E5]" viewBox="0 0 24 24" fill="currentColor">
                      <path d={asset.svgData} />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Image Upload placeholder */}
            <div>
              <label
                htmlFor="flat-img-upload"
                className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded bg-[#373737] hover:bg-[#404040] border border-dashed border-[#4A4A4A] text-[#A8A8A8] hover:text-[#E5E5E5] cursor-pointer transition-colors text-[11px]"
                title="导入自定义 PNG/JPG 图案"
              >
                <FileImage className="w-3.5 h-3.5" />
                <span>导入外部图案</span>
                <input
                  id="flat-img-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    onAddFlatItem({
                      kind: "image",
                      assetId: `custom-img-${Date.now()}`,
                      opacity: 0.95,
                    });
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* 3. SURFACE EFFECT LAYER TOOLS */}
        {currentStepType === "surface-effect" && (
          <div className="space-y-2">
            <div className="text-[11px] text-[#A8A8A8] font-medium mb-1">工艺特殊效果</div>
            {[
              { kind: "ombre", name: "法式指尖渐变", tag: "渐变" },
              { kind: "mirror-powder", name: "镜面金属粉", tag: "电镀" },
              { kind: "local-cat-eye", name: "局部磁吸猫眼", tag: "微光" },
              { kind: "sugar", name: "磨砂砂糖晶粒", tag: "微立体" },
              { kind: "local-glitter", name: "局部亮片散粉", tag: "细闪" },
            ].map((effect) => (
              <button
                key={effect.kind}
                type="button"
                onClick={() => onAddSurfaceItem(effect.kind as SurfaceEffectItem["kind"])}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded bg-[#373737] hover:bg-[#404040] border border-[#4A4A4A] text-left transition-colors"
                title={`添加 ${effect.name} 工艺`}
              >
                <span className="text-[#E5E5E5] text-[11px]">{effect.name}</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-[#202020] text-[#A8A8A8] border border-[#4A4A4A]">
                  {effect.tag}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* 4. DECORATION 3D LAYER TOOLS */}
        {currentStepType === "decoration-3d" && (
          <div className="space-y-3">
            <div>
              <div className="text-[11px] text-[#A8A8A8] font-medium mb-1.5">3D 饰品库</div>
              <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-[#202020] rounded border border-[#4A4A4A]">
                {modelAssets.map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => onAdd3DItem(asset)}
                    className="h-14 flex flex-col items-center justify-center p-1 rounded bg-[#373737] hover:bg-[#404040] border border-[#4A4A4A] hover:border-[#5E7EB8] transition-all text-center"
                    title={`添加 ${asset.name} (可调节 UV 锚点)`}
                  >
                    <Box className="w-3.5 h-3.5 text-[#A8A8A8] mb-1" />
                    <span className="text-[10px] text-[#E5E5E5] truncate w-full px-0.5">
                      {asset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="px-2 py-1.5 bg-[#202020] rounded border border-[#4A4A4A] text-[10px] text-[#888888] space-y-0.5">
              <div>• 2D 画布拖动调整 (u, v) 锚点</div>
              <div>• 3D 视角查看立体贴合高度</div>
            </div>
          </div>
        )}

        {/* 5. FINISH LAYER TOOLS */}
        {currentStepType === "finish" && (
          <div className="space-y-2">
            <div className="text-[11px] text-[#A8A8A8] font-medium mb-1">封层光泽调控</div>
            {[
              { gloss: 95, name: "高光钢化封层", desc: "镜面高光 (95%)" },
              { gloss: 60, name: "自然半哑封层", desc: "柔和缎面 (60%)" },
              { gloss: 10, name: "高级雾面哑光", desc: "极简磨砂 (10%)" },
            ].map((f) => (
              <button
                key={f.gloss}
                type="button"
                onClick={() => onUpdateFinish(f.gloss)}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded bg-[#373737] hover:bg-[#404040] border border-[#4A4A4A] text-left transition-colors"
                title={`应用 ${f.name}`}
              >
                <div>
                  <div className="text-[#E5E5E5] text-[11px] font-medium">{f.name}</div>
                  <div className="text-[10px] text-[#A8A8A8]">{f.desc}</div>
                </div>
                <div className="text-[10px] font-mono text-[#E5E5E5]">{f.gloss}%</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className="h-7 bg-[#252525] border-t border-[#4A4A4A] px-2.5 text-[10px] text-[#888888] flex items-center justify-between">
        <span>UV 0.0 ~ 1.0</span>
        <span className="font-mono text-[#A8A8A8]">工序 1-5</span>
      </div>
    </aside>
  );
};

import React, { useState } from "react";
import {
  NailShape,
  SourceModelAsset,
  EditableModelAsset,
  DesignModelReference,
} from "../types/nail";
import {
  BUILTIN_SOURCE_MODELS,
  NAIL_SLOTS,
} from "../utils/nailDefaults";
import { NAIL_SHAPES } from "../utils/nailShapes";
import {
  NailModelConverterService,
  parseSTLHeader,
  validateConvertedModel,
  ModelValidationReport,
} from "../utils/stlConverter";
import {
  Layers,
  FileCode,
  Upload,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Box,
  Sliders,
  Check,
} from "lucide-react";

interface ModelPrepViewProps {
  onConfirmAndLock: (
    sourceModel: SourceModelAsset,
    editableModel: EditableModelAsset,
    ref: DesignModelReference
  ) => void;
}

export const ModelPrepView: React.FC<ModelPrepViewProps> = ({ onConfirmAndLock }) => {
  const [sourceModels, setSourceModels] = useState<SourceModelAsset[]>(BUILTIN_SOURCE_MODELS);
  const [selectedSourceId, setSelectedSourceId] = useState<string>(BUILTIN_SOURCE_MODELS[0].id);
  const [selectedShape, setSelectedShape] = useState<NailShape>("squoval");

  // Conversion state
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [conversionMessage, setConversionMessage] = useState("");
  const [convertedModel, setConvertedModel] = useState<EditableModelAsset | null>(null);
  const [validationReport, setValidationReport] = useState<ModelValidationReport | null>(null);

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const buffer = ev.target?.result as ArrayBuffer;
      if (!buffer) return;

      const header = parseSTLHeader(buffer);
      const newSource: SourceModelAsset = {
        id: `custom-${Date.now()}`,
        name: file.name.replace(/\.stl$/i, ""),
        format: "stl",
        fileUrl: URL.createObjectURL(file),
        sourceType: "uploaded",
        importStatus: "ready",
        trianglesCount: header.triangleCount || 48000,
        uploadedAt: new Date().toISOString(),
      };

      setSourceModels((prev) => [newSource, ...prev]);
      setSelectedSourceId(newSource.id);
      setConvertedModel(null);
      setValidationReport(null);
    };
    reader.readAsArrayBuffer(file);
  };

  // Run Conversion
  const handleStartConversion = async () => {
    const source = sourceModels.find((m) => m.id === selectedSourceId);
    if (!source) return;

    setIsConverting(true);
    setConversionProgress(10);
    setConversionMessage("正在读取并解析 STL 点云与三角面拓扑...");

    try {
      const { editableModel } = await NailModelConverterService.executeConversion(
        source,
        selectedShape,
        (update) => {
          setConversionProgress(update.progress);
          setConversionMessage(update.message);
        }
      );

      const report = validateConvertedModel(editableModel.parts);
      setConvertedModel(editableModel);
      setValidationReport(report);
    } catch (err) {
      console.error(err);
      setConversionMessage("转换失败，请检查 STL 文件完整度。");
    } finally {
      setIsConverting(false);
    }
  };

  // Final Lock & Proceed to Editor
  const handleFinalConfirm = () => {
    const source = sourceModels.find((m) => m.id === selectedSourceId);
    if (!source || !convertedModel) return;

    const ref: DesignModelReference = {
      sourceModelId: source.id,
      editableModelId: convertedModel.id,
      targetShape: convertedModel.targetShape,
      lockedAt: new Date().toISOString(),
    };

    onConfirmAndLock(source, convertedModel, ref);
  };

  return (
    <div className="min-h-screen bg-[#252525] text-[#E5E5E5] flex flex-col font-sans select-none">
      {/* Top Header */}
      <header className="h-10 bg-[#303030] border-b border-[#4A4A4A] px-4 flex items-center justify-between text-xs tracking-wide">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-[#E5E5E5]" />
          <span className="font-semibold text-[#E5E5E5]">NAIL STUDIO PS</span>
          <span className="text-[#4A4A4A]">|</span>
          <span className="text-[#A8A8A8]">美甲模型准备与甲型转换工作流 (Step 1 / 2)</span>
        </div>
        <div className="flex items-center space-x-4 text-[#888888] text-[11px]">
          <span>单向流规范：选择模型 → 选择甲型 → 执行转换 → 锁定甲型进入编辑器</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Model & Shape Selection */}
        <section className="lg:col-span-5 flex flex-col space-y-5">
          {/* 1. Source Model Section */}
          <div className="bg-[#303030] border border-[#4A4A4A] rounded-xs p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#4A4A4A]">
              <div className="flex items-center space-x-2">
                <Box className="w-4 h-4 text-[#E5E5E5]" />
                <h2 className="text-sm font-semibold tracking-wide text-[#E5E5E5]">1. 选择或导入原始 STL 模型</h2>
              </div>
              <label
                htmlFor="stl-upload"
                className="cursor-pointer inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs bg-[#373737] hover:bg-[#404040] border border-[#4A4A4A] rounded text-[#E5E5E5] transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-[#A8A8A8]" />
                <span>导入外部 STL</span>
                <input
                  id="stl-upload"
                  type="file"
                  accept=".stl"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="space-y-2">
              {sourceModels.map((model) => {
                const isSelected = model.id === selectedSourceId;
                return (
                  <div
                    key={model.id}
                    onClick={() => {
                      setSelectedSourceId(model.id);
                      setConvertedModel(null);
                      setValidationReport(null);
                    }}
                    className={`p-3 rounded border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#373737] border-[#5E7EB8] text-[#E5E5E5] shadow-xs"
                        : "bg-[#202020] border-[#4A4A4A] text-[#A8A8A8] hover:border-[#666666]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <FileCode className={`w-4 h-4 ${isSelected ? "text-[#E5E5E5]" : "text-[#888888]"}`} />
                        <span className="text-xs font-medium text-[#E5E5E5]">{model.name}</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#252525] text-[#A8A8A8] border border-[#4A4A4A]">
                        {model.sourceType === "builtin" ? "内置资产" : "用户上传"}
                      </span>
                    </div>
                    <div className="mt-2 text-[11px] text-[#888888] flex items-center justify-between">
                      <span>面数: {model.trianglesCount ? `${(model.trianglesCount / 1000).toFixed(1)}k 面` : "45k 面"}</span>
                      <span>十指独立部件: 包含 (左右手各5指)</span>
                      <span className="text-[#5E7EB8] font-mono text-[10px]">有效 STL</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-2.5 text-[11px] text-[#888888]">
              * 规则：第一版默认提供十指甲模型，编辑器只使用转换后的目标模型，不直接修改原始 STL。
            </p>
          </div>

          {/* 2. Target Shape Selection */}
          <div className="bg-[#303030] border border-[#4A4A4A] rounded-xs p-4 shadow-xs">
            <div className="flex items-center space-x-2 pb-3 mb-3 border-b border-[#4A4A4A]">
              <Sliders className="w-4 h-4 text-[#E5E5E5]" />
              <h2 className="text-sm font-semibold tracking-wide text-[#E5E5E5]">2. 选择目标甲型 (NailShape)</h2>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {NAIL_SHAPES.map((shape) => {
                const isSelected =
                  selectedShape === shape.id ||
                  (selectedShape === "squoval" && shape.id === "coffin");
                return (
                  <div
                    key={shape.id}
                    onClick={() => {
                      setSelectedShape(shape.id);
                      setConvertedModel(null);
                      setValidationReport(null);
                    }}
                    className={`p-3 rounded border cursor-pointer flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? "bg-[#333D4D] border-[#5E7EB8] text-[#E5E5E5] shadow-xs"
                        : "bg-[#202020] border-[#4A4A4A] text-[#A8A8A8] hover:border-[#666666]"
                    }`}
                  >
                    {/* Visual Silhouette SVG */}
                    <div className="w-14 h-22 mb-2 flex items-center justify-center bg-[#252525] rounded border border-[#4A4A4A] p-1">
                      <svg viewBox="0 0 100 380" className="w-full h-full">
                        <path
                          d={shape.iconD}
                          fill={isSelected ? "#E5E5E5" : "#555555"}
                          fillOpacity={isSelected ? "0.95" : "0.55"}
                          stroke="#888888"
                          strokeWidth="3"
                        />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-[#E5E5E5]">
                      {shape.name}
                    </span>
                    <span className="text-[9px] text-[#5E7EB8] font-mono mt-0.5">
                      {shape.enName} · {shape.tag}
                    </span>
                    <span className="text-[10px] text-[#888888] mt-1 text-center line-clamp-2">
                      {shape.description}
                    </span>
                    {isSelected && (
                      <div className="mt-1.5 flex items-center text-[10px] text-[#5E7EB8]">
                        <Check className="w-3 h-3 mr-1" /> 已选定
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Start Conversion Action */}
            <div className="mt-4 pt-3 border-t border-[#4A4A4A]">
              <button
                type="button"
                onClick={handleStartConversion}
                disabled={isConverting}
                className={`w-full py-2 px-4 text-xs font-medium rounded flex items-center justify-center space-x-2 transition-all ${
                  isConverting
                    ? "bg-[#373737] text-[#888888] cursor-not-allowed"
                    : "bg-[#5E7EB8] hover:bg-[#6E8EC8] text-white font-medium shadow-xs"
                }`}
              >
                {isConverting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>正在执行模型转换 ({conversionProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-3.5 h-3.5 text-white" />
                    <span>执行模型转换 (独立算法服务)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Right Column: Conversion Process, Part Map & Verification */}
        <section className="lg:col-span-7 flex flex-col space-y-5">
          {/* Conversion Task Status Panel */}
          <div className="bg-[#303030] border border-[#4A4A4A] rounded-xs p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#4A4A4A]">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-[#E5E5E5]" />
                <h2 className="text-sm font-semibold tracking-wide text-[#E5E5E5]">
                  3. 转换状态与十指部件装配映射
                </h2>
              </div>
              <span className="text-[11px] font-mono text-[#A8A8A8]">
                {convertedModel ? "转换成功 · 就绪" : isConverting ? "处理中" : "等待发起"}
              </span>
            </div>

            {/* Progress Bar */}
            {isConverting && (
              <div className="mb-4 bg-[#202020] p-3 rounded border border-[#4A4A4A]">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#E5E5E5] font-mono">{conversionMessage}</span>
                  <span className="text-[#E5E5E5] font-bold">{conversionProgress}%</span>
                </div>
                <div className="w-full bg-[#373737] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#5E7EB8] h-full transition-all duration-200"
                    style={{ width: `${conversionProgress}%` }}
                  />
                </div>
              </div>
            )}

            {!convertedModel && !isConverting && (
              <div className="p-8 text-center text-[#888888] text-xs border border-dashed border-[#4A4A4A] rounded bg-[#202020]">
                请先在左侧选择目标甲型并点击【执行模型转换】，算法将完成十指点云重构、UV归一化与安全区生成。
              </div>
            )}

            {/* Converted 10-Finger Matrix Preview */}
            {convertedModel && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-[#E5E5E5]">十指独立部件信息 ({convertedModel.parts.length} 部件)</span>
                    <span className="text-[11px] text-[#A8A8A8]">
                      甲型: {convertedModel.targetShape === "squoval" ? "方圆型" : "椭圆型"} | UV 方案: {convertedModel.uvProfileId}
                    </span>
                  </div>

                  {/* Left Hand & Right Hand Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Left Hand */}
                    <div className="bg-[#202020] p-3 rounded border border-[#4A4A4A]">
                      <div className="text-[11px] font-bold text-[#E5E5E5] mb-2 flex items-center justify-between border-b border-[#373737] pb-1">
                        <span>左手部件 (Left Hand)</span>
                        <span className="text-[10px] text-[#888888]">L-Thumb ~ L-Pinky</span>
                      </div>
                      <div className="space-y-1.5">
                        {convertedModel.parts
                          .filter((p) => p.slot.startsWith("left-"))
                          .map((part) => {
                            const meta = NAIL_SLOTS.find((s) => s.slot === part.slot);
                            return (
                              <div
                                key={part.id}
                                className="flex items-center justify-between text-[11px] py-1 px-2 bg-[#373737] rounded border border-[#4A4A4A]"
                              >
                                <div className="flex items-center space-x-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#5E7EB8]" />
                                  <span className="text-[#E5E5E5] font-medium">{meta?.shortName}</span>
                                  <span className="text-[10px] text-[#888888] font-mono">{part.meshName}</span>
                                </div>
                                <span className="text-[#A8A8A8] font-mono text-[10px]">
                                  {part.width} × {part.length} mm
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {/* Right Hand */}
                    <div className="bg-[#202020] p-3 rounded border border-[#4A4A4A]">
                      <div className="text-[11px] font-bold text-[#E5E5E5] mb-2 flex items-center justify-between border-b border-[#373737] pb-1">
                        <span>右手部件 (Right Hand)</span>
                        <span className="text-[10px] text-[#888888]">R-Thumb ~ R-Pinky</span>
                      </div>
                      <div className="space-y-1.5">
                        {convertedModel.parts
                          .filter((p) => p.slot.startsWith("right-"))
                          .map((part) => {
                            const meta = NAIL_SLOTS.find((s) => s.slot === part.slot);
                            return (
                              <div
                                key={part.id}
                                className="flex items-center justify-between text-[11px] py-1 px-2 bg-[#373737] rounded border border-[#4A4A4A]"
                              >
                                <div className="flex items-center space-x-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#5E7EB8]" />
                                  <span className="text-[#E5E5E5] font-medium">{meta?.shortName}</span>
                                  <span className="text-[10px] text-[#888888] font-mono">{part.meshName}</span>
                                </div>
                                <span className="text-[#A8A8A8] font-mono text-[10px]">
                                  {part.width} × {part.length} mm
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Validation Checklist */}
                {validationReport && (
                  <div className="bg-[#202020] p-3 rounded border border-[#4A4A4A]">
                    <div className="text-xs font-semibold text-[#E5E5E5] mb-2 flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>模型生产合规性与有效性校验 (Checklist)</span>
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        {validationReport.isValid ? "全部通过 · 可进入编辑器" : "未通过"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      {validationReport.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start space-x-2 p-2 bg-[#373737] rounded border border-[#4A4A4A]"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <div className="text-[#E5E5E5] font-medium">{item.title}</div>
                            <div className="text-[10px] text-[#A8A8A8] leading-tight mt-0.5">{item.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Confirm & Lock Button */}
          <div className="bg-[#303030] border border-[#4A4A4A] rounded-xs p-4 flex items-center justify-between shadow-xs">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-[#E5E5E5] flex items-center space-x-2">
                <span>锁定甲型与部件模型</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-[#202020] text-[#A8A8A8] rounded border border-[#4A4A4A]">规则约束</span>
              </div>
              <p className="text-[11px] text-[#888888]">
                确认后进入美甲编辑器，甲型和模型将永久锁定不可更换。若需更换甲型，需返回此处重新创建设计。
              </p>
            </div>

            <button
              type="button"
              disabled={!convertedModel || !validationReport?.isValid}
              onClick={handleFinalConfirm}
              className={`px-5 py-2 text-xs rounded flex items-center space-x-2 transition-all font-medium ${
                convertedModel && validationReport?.isValid
                  ? "bg-[#5E7EB8] hover:bg-[#6E8EC8] text-white shadow-md cursor-pointer"
                  : "bg-[#252525] text-[#666666] cursor-not-allowed border border-[#4A4A4A]"
              }`}
            >
              <span>确认模型并锁定甲型</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

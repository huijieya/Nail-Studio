import React, { useState } from "react";
import { DesignDocument } from "../types/nail";
import { X, Download, Copy, Check, FileCode } from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DesignDocument;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, document }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"json" | "bom">("json");

  if (!isOpen) return null;

  const jsonString = JSON.stringify(document, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = `${document.name.replace(/\s+/g, "_")}.ndd.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Compute BOM (Bill of Materials)
  let totalStepsCount = 0;
  let totalStickersCount = 0;
  let total3DCharmsCount = 0;

  document.nails.forEach((nail) => {
    totalStepsCount += nail.steps.length;
    nail.steps.forEach((step) => {
      if (step.type === "flat-design") totalStickersCount += step.items.length;
      if (step.type === "decoration-3d") total3DCharmsCount += step.items.length;
    });
  });

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
      <div className="bg-[#303030] border border-[#4A4A4A] rounded-xs max-w-2xl w-full shadow-2xl overflow-hidden text-xs text-[#E5E5E5] flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-4 py-2.5 bg-[#2B2B2B] border-b border-[#4A4A4A] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileCode className="w-4 h-4 text-[#A8A8A8]" />
            <h3 className="font-semibold text-[#E5E5E5] text-sm">导出工业级美甲设计文档 (DesignDocument)</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#A8A8A8] hover:text-[#E5E5E5] p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Header */}
        <div className="bg-[#2B2B2B] border-b border-[#4A4A4A] px-4 pt-2 flex space-x-4">
          <button
            type="button"
            onClick={() => setActiveTab("json")}
            className={`pb-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "json"
                ? "border-[#5E7EB8] text-[#E5E5E5]"
                : "border-transparent text-[#A8A8A8] hover:text-[#E5E5E5]"
            }`}
          >
            JSON 标准数据规范
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("bom")}
            className={`pb-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "bom"
                ? "border-[#5E7EB8] text-[#E5E5E5]"
                : "border-transparent text-[#A8A8A8] hover:text-[#E5E5E5]"
            }`}
          >
            十指生产工艺统计 (BOM)
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "json" ? (
            <div className="relative">
              <pre className="bg-[#202020] p-3.5 rounded border border-[#4A4A4A] font-mono text-[11px] text-[#E5E5E5] leading-relaxed overflow-x-auto max-h-[460px]">
                {jsonString}
              </pre>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary Metrics */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 bg-[#202020] rounded border border-[#4A4A4A]">
                  <div className="text-[10px] text-[#A8A8A8]">指甲总数</div>
                  <div className="text-base font-semibold text-[#E5E5E5] mt-0.5">10 指</div>
                </div>
                <div className="p-3 bg-[#202020] rounded border border-[#4A4A4A]">
                  <div className="text-[10px] text-[#A8A8A8]">工艺步骤总计</div>
                  <div className="text-base font-semibold text-[#E5E5E5] mt-0.5">{totalStepsCount} 道</div>
                </div>
                <div className="p-3 bg-[#202020] rounded border border-[#4A4A4A]">
                  <div className="text-[10px] text-[#A8A8A8]">平面矢量/贴纸</div>
                  <div className="text-base font-semibold text-[#E5E5E5] mt-0.5">{totalStickersCount} 处</div>
                </div>
                <div className="p-3 bg-[#202020] rounded border border-[#4A4A4A]">
                  <div className="text-[10px] text-[#A8A8A8]">立体 3D 饰品</div>
                  <div className="text-base font-semibold text-[#E5E5E5] mt-0.5">{total3DCharmsCount} 件</div>
                </div>
              </div>

              {/* Model & Locked Reference */}
              <div className="p-3 bg-[#202020] rounded border border-[#4A4A4A] space-y-1.5 font-mono text-[11px]">
                <div className="text-[#E5E5E5] font-semibold mb-1">设计锁定元数据：</div>
                <div className="text-[#A8A8A8]">源模型 ID: {document.model.sourceModelId}</div>
                <div className="text-[#A8A8A8]">转换目标可编辑模型 ID: {document.model.editableModelId}</div>
                <div className="text-[#A8A8A8]">锁定甲型: {document.model.targetShape.toUpperCase()}</div>
                <div className="text-[#A8A8A8]">锁定确认时间戳: {document.model.lockedAt}</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-[#2B2B2B] border-t border-[#4A4A4A] flex items-center justify-between">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 bg-[#373737] hover:bg-[#404040] text-[#E5E5E5] border border-[#4A4A4A] rounded flex items-center space-x-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#A8A8A8]" />}
            <span>{copied ? "已复制 JSON" : "复制 JSON"}</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-[#373737] hover:bg-[#404040] text-[#A8A8A8] hover:text-[#E5E5E5] rounded transition-colors"
            >
              关闭
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-1.5 bg-[#5E7EB8] hover:bg-[#6E8EC8] text-white font-medium rounded flex items-center space-x-1.5 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下载 .ndd.json 文件</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

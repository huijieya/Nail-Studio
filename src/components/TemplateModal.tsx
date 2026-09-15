import React, { useState } from "react";
import { NailTemplate, NailDesign, NailShape } from "../types/nail";
import { PRESET_TEMPLATES } from "../utils/nailDefaults";
import { X, Save, FolderOpen } from "lucide-react";

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentShape: NailShape;
  currentSourceModelId: string;
  currentNails: NailDesign[];
  onLoadTemplate: (template: NailTemplate) => void;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  currentShape,
  currentSourceModelId,
  currentNails,
  onLoadTemplate,
}) => {
  const [templates, setTemplates] = useState<NailTemplate[]>(PRESET_TEMPLATES);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateDesc, setNewTemplateDesc] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(PRESET_TEMPLATES[0].id);

  if (!isOpen) return null;

  const handleSaveCurrentAsTemplate = () => {
    if (!newTemplateName.trim()) return;

    const newTpl: NailTemplate = {
      id: `tpl-custom-${Date.now()}`,
      name: newTemplateName.trim(),
      description: newTemplateDesc.trim() || "用户自定义保存的十指美甲设计组合模板",
      targetShape: currentShape,
      sourceModelId: currentSourceModelId,
      nails: JSON.parse(JSON.stringify(currentNails)),
      createdAt: new Date().toLocaleDateString(),
    };

    setTemplates((prev) => [newTpl, ...prev]);
    setSelectedTemplateId(newTpl.id);
    setNewTemplateName("");
    setNewTemplateDesc("");
  };

  const handleApplySelected = () => {
    const tpl = templates.find((t) => t.id === selectedTemplateId);
    if (!tpl) return;
    onLoadTemplate(tpl);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
      <div className="bg-[#303030] border border-[#4A4A4A] rounded-xs max-w-xl w-full shadow-2xl overflow-hidden text-xs text-[#E5E5E5]">
        {/* Header */}
        <div className="px-4 py-2.5 bg-[#2B2B2B] border-b border-[#4A4A4A] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FolderOpen className="w-4 h-4 text-[#A8A8A8]" />
            <h3 className="font-semibold text-[#E5E5E5] text-sm">十指组合模板库 (Nail Templates)</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#A8A8A8] hover:text-[#E5E5E5] p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3.5">
          {/* Save current design section */}
          <div className="p-3 bg-[#202020] border border-[#4A4A4A] rounded space-y-2">
            <div className="text-[#E5E5E5] font-medium flex items-center space-x-1.5">
              <Save className="w-3.5 h-3.5 text-[#A8A8A8]" />
              <span>保存当前十指设计为新模板</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="模板名称 (如: 极简几何方圆)"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                className="bg-[#2B2B2B] border border-[#4A4A4A] rounded px-2.5 py-1.5 text-[#E5E5E5] text-xs focus:border-[#5E7EB8] focus:outline-none placeholder-[#888888]"
              />
              <input
                type="text"
                placeholder="简要工艺备注 (可选)"
                value={newTemplateDesc}
                onChange={(e) => setNewTemplateDesc(e.target.value)}
                className="bg-[#2B2B2B] border border-[#4A4A4A] rounded px-2.5 py-1.5 text-[#E5E5E5] text-xs focus:border-[#5E7EB8] focus:outline-none placeholder-[#888888]"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                disabled={!newTemplateName.trim()}
                onClick={handleSaveCurrentAsTemplate}
                className="px-3 py-1 bg-[#373737] hover:bg-[#404040] text-[#E5E5E5] border border-[#4A4A4A] font-medium rounded text-[11px] disabled:opacity-40 transition-colors shadow-xs"
              >
                保存为模板
              </button>
            </div>
          </div>

          {/* Template List */}
          <div>
            <div className="text-xs text-[#A8A8A8] font-medium mb-1.5">可用模板列表</div>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {templates.map((tpl) => {
                const isSelected = tpl.id === selectedTemplateId;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`p-2.5 rounded border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#373737] border-[#5E7EB8] text-[#E5E5E5] shadow-xs"
                        : "bg-[#202020] border-[#4A4A4A] text-[#A8A8A8] hover:border-[#666666]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-[#E5E5E5] text-xs">{tpl.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2B2B2B] text-[#A8A8A8] border border-[#4A4A4A]">
                          {tpl.targetShape === "squoval" ? "方圆型" : "椭圆型"}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#888888] font-mono">{tpl.createdAt}</span>
                    </div>
                    <div className="text-[11px] text-[#888888] mt-1">{tpl.description}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-[#2B2B2B] border-t border-[#4A4A4A] flex items-center justify-between">
          <span className="text-[10px] text-[#888888]">
            载入模板将替换当前画布十指设计内容
          </span>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-[#373737] hover:bg-[#404040] text-[#A8A8A8] hover:text-[#E5E5E5] rounded transition-colors"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleApplySelected}
              className="px-4 py-1.5 bg-[#5E7EB8] hover:bg-[#6E8EC8] text-white font-medium rounded transition-colors shadow-xs"
            >
              应用选定模板
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from "react";
import {
  NailShape,
  NailSlot,
  SourceModelAsset,
  EditableModelAsset,
  DesignModelReference,
  DesignDocument,
  NailDesign,
  ProcessStep,
  ProcessStepType,
  DesignItem,
  FlatDesignItem,
  SurfaceEffectItem,
  Decoration3DItem,
  BackgroundItem,
  FinishItem,
  Asset,
  SelectionRangeMode,
  Transform2D,
  NailTemplate,
} from "./types/nail";
import {
  BUILTIN_SOURCE_MODELS,
  NAIL_SLOTS,
  generateEditableModel,
  createInitialDesignDocument,
  sortStepsByProcessOrder,
} from "./utils/nailDefaults";
import { evaluateStepSupportStatus } from "./utils/deviceValidator";
import { ModelPrepView } from "./components/ModelPrepView";
import { TopBar } from "./components/TopBar";
import { LeftToolbar } from "./components/LeftToolbar";
import { Canvas2D } from "./components/Canvas2D";
import { Viewport3D } from "./components/Viewport3D";
import { TenNailsOverview } from "./components/TenNailsOverview";
import { RightProcessPanel } from "./components/RightProcessPanel";
import { BatchModal } from "./components/BatchModal";
import { TemplateModal } from "./components/TemplateModal";
import { ExportModal } from "./components/ExportModal";

export default function App() {
  // Page Flow State: "model-prep" -> "editor"
  const [currentScreen, setCurrentScreen] = useState<"model-prep" | "editor">("model-prep");

  // Model & Shape locked state
  const [sourceModel, setSourceModel] = useState<SourceModelAsset>(BUILTIN_SOURCE_MODELS[0]);
  const [editableModel, setEditableModel] = useState<EditableModelAsset>(() =>
    generateEditableModel(BUILTIN_SOURCE_MODELS[0].id, "squoval")
  );

  // Design Document State
  const [document, setDocument] = useState<DesignDocument>(() =>
    createInitialDesignDocument(BUILTIN_SOURCE_MODELS[0].id, editableModel, "未命名美甲设计-01")
  );

  // Undo / Redo History Stacks
  const [history, setHistory] = useState<DesignDocument[]>([]);
  const [future, setFuture] = useState<DesignDocument[]>([]);

  // Editor Navigation & Selection State
  const [activeNailSlot, setActiveNailSlot] = useState<NailSlot>("left-thumb");
  const [selectionMode, setSelectionMode] = useState<SelectionRangeMode>("single");
  const [viewMode, setViewMode] = useState<"2d" | "3d" | "ten-nails">("2d");
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<string>("select");
  const [showSafeArea, setShowSafeArea] = useState<boolean>(true);

  // Modals
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Get current active nail design & model part
  const currentNail =
    document.nails.find((n) => n.slot === activeNailSlot) || document.nails[0];
  const currentPart =
    editableModel.parts.find((p) => p.slot === activeNailSlot) || editableModel.parts[0];

  // Set default active step when nail changes
  useEffect(() => {
    if (currentNail && (!activeStepId || !currentNail.steps.some((s) => s.id === activeStepId))) {
      setActiveStepId(currentNail.steps[0]?.id || null);
    }
  }, [currentNail, activeStepId]);

  // Push new document state with Undo history tracking
  const updateDocumentWithHistory = useCallback(
    (updater: (prev: DesignDocument) => DesignDocument) => {
      setDocument((prev) => {
        setHistory((h) => [...h.slice(-20), prev]);
        setFuture([]);
        const next = updater(prev);
        return {
          ...next,
          updatedAt: new Date().toISOString(),
        };
      });
    },
    []
  );

  // Undo / Redo Handlers
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setFuture((f) => [document, ...f]);
    setDocument(prev);
  }, [history, document]);

  const handleRedo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((f) => f.slice(1));
    setHistory((h) => [...h, document]);
    setDocument(next);
  }, [future, document]);

  // Screen 1: Model Prep confirmation callback
  const handleConfirmModelAndShape = (
    src: SourceModelAsset,
    edit: EditableModelAsset,
    ref: DesignModelReference
  ) => {
    setSourceModel(src);
    setEditableModel(edit);

    const initialDoc = createInitialDesignDocument(src.id, edit, "未命名美甲设计-01");
    setDocument(initialDoc);
    setHistory([]);
    setFuture([]);
    setCurrentScreen("editor");
    setActiveNailSlot("left-thumb");
    setViewMode("2d");
  };

  // Switch back to model preparation flow
  const handleReturnToPrep = () => {
    const ok = window.confirm(
      "提示：返回模型准备页面将重新选择甲型并创建新的设计，当前未保存的修改将被重置。确定返回吗？"
    );
    if (ok) {
      setCurrentScreen("model-prep");
    }
  };

  // Determine affected nail slots based on selectionMode
  const getTargetNailSlots = useCallback((): NailSlot[] => {
    if (selectionMode === "left-five") {
      return NAIL_SLOTS.filter((s) => s.hand === "left").map((s) => s.slot);
    }
    if (selectionMode === "right-five") {
      return NAIL_SLOTS.filter((s) => s.hand === "right").map((s) => s.slot);
    }
    if (selectionMode === "all-ten") {
      return NAIL_SLOTS.map((s) => s.slot);
    }
    return [activeNailSlot];
  }, [selectionMode, activeNailSlot]);

  // Helper to re-evaluate support status on all steps of a nail
  const updateNailStepsWithValidation = (steps: ProcessStep[]): ProcessStep[] => {
    return steps.map((s) => ({
      ...s,
      supportStatus: evaluateStepSupportStatus(s, steps),
    }));
  };

  // Active step object
  const currentStep =
    currentNail?.steps.find((s) => s.id === activeStepId) || currentNail?.steps[0];
  const currentStepType: ProcessStepType = currentStep?.type || "background";

  // 1. Tool action: Add Flat Item (Sticker / Shape / Image)
  const handleAddFlatItem = (itemPartial: Partial<FlatDesignItem>) => {
    const targets = getTargetNailSlots();

    updateDocumentWithHistory((prev) => {
      const updatedNails = prev.nails.map((nail) => {
        if (!targets.includes(nail.slot)) return nail;

        // Find or create flat-design step
        let steps = [...nail.steps];
        let flatStep = steps.find((s) => s.type === "flat-design");

        const newItem: FlatDesignItem = {
          id: `flat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          kind: itemPartial.kind || "shape",
          shapeType: itemPartial.shapeType || "star",
          assetId: itemPartial.assetId,
          svgPath: itemPartial.svgPath,
          color: itemPartial.color || "#ffffff",
          transform: {
            x: 0.5,
            y: 0.4,
            width: 0.28,
            height: 0.24,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
          },
          opacity: itemPartial.opacity ?? 1,
        };

        if (flatStep) {
          flatStep = {
            ...flatStep,
            items: [...flatStep.items, newItem],
          };
          steps = steps.map((s) => (s.id === flatStep!.id ? flatStep! : s));
        } else {
          const newStep: ProcessStep = {
            id: `step-flat-${Date.now()}-${nail.slot}`,
            type: "flat-design",
            name: "平面艺术印花",
            visible: true,
            skipped: false,
            createdOrder: 2,
            items: [newItem],
            material: { name: "微喷墨水/冷烫金" },
          };
          steps = sortStepsByProcessOrder([...steps, newStep]);
        }

        steps = updateNailStepsWithValidation(steps);
        return { ...nail, steps };
      });

      return { ...prev, nails: updatedNails };
    });
  };

  // 2. Tool action: Add 3D Charm
  const handleAdd3DItem = (asset: Asset) => {
    const targets = getTargetNailSlots();

    updateDocumentWithHistory((prev) => {
      const updatedNails = prev.nails.map((nail) => {
        if (!targets.includes(nail.slot)) return nail;

        let steps = [...nail.steps];
        let decorStep = steps.find((s) => s.type === "decoration-3d");

        const newItem: Decoration3DItem = {
          id: `3d-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          assetId: asset.id,
          anchor: {
            u: 0.5,
            v: 0.5,
            normalOffset: 0.05,
          },
          transform: {
            rotation: 0,
            scale: 1.0,
            height: 2.2,
          },
          material: { name: "金属镀银 / 珍珠" },
        };

        if (decorStep) {
          decorStep = {
            ...decorStep,
            items: [...decorStep.items, newItem],
          };
          steps = steps.map((s) => (s.id === decorStep!.id ? decorStep! : s));
        } else {
          const newStep: ProcessStep = {
            id: `step-3d-${Date.now()}-${nail.slot}`,
            type: "decoration-3d",
            name: "立体微浮雕饰品",
            visible: true,
            skipped: false,
            createdOrder: 4,
            items: [newItem],
            material: { name: "UV 点胶粘合" },
          };
          steps = sortStepsByProcessOrder([...steps, newStep]);
        }

        steps = updateNailStepsWithValidation(steps);
        return { ...nail, steps };
      });

      return { ...prev, nails: updatedNails };
    });
  };

  // 3. Tool action: Add Surface Effect Item
  const handleAddSurfaceItem = (kind: SurfaceEffectItem["kind"]) => {
    const targets = getTargetNailSlots();

    updateDocumentWithHistory((prev) => {
      const updatedNails = prev.nails.map((nail) => {
        if (!targets.includes(nail.slot)) return nail;

        let steps = [...nail.steps];
        let surfStep = steps.find((s) => s.type === "surface-effect");

        const newItem: SurfaceEffectItem = {
          id: `surf-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          kind,
          opacity: 0.9,
          mask: {
            type: "ellipse",
            x: 0.5,
            y: 0.3,
            width: 0.65,
            height: 0.4,
            feather: 8,
            invert: false,
          },
          params: { effectColor: "#ffffff", intensity: 1.0 },
          material: { name: "表面磁吸/魔镜粉" },
        };

        if (surfStep) {
          surfStep = {
            ...surfStep,
            items: [...surfStep.items, newItem],
          };
          steps = steps.map((s) => (s.id === surfStep!.id ? surfStep! : s));
        } else {
          const newStep: ProcessStep = {
            id: `step-surf-${Date.now()}-${nail.slot}`,
            type: "surface-effect",
            name: "局部特效粉层",
            visible: true,
            skipped: false,
            createdOrder: 3,
            items: [newItem],
            material: { name: "金属微光粉" },
          };
          steps = sortStepsByProcessOrder([...steps, newStep]);
        }

        steps = updateNailStepsWithValidation(steps);
        return { ...nail, steps };
      });

      return { ...prev, nails: updatedNails };
    });
  };

  // 4. Update Background
  const handleUpdateBackground = (kind: BackgroundItem["kind"], color = "#222224") => {
    const targets = getTargetNailSlots();

    updateDocumentWithHistory((prev) => {
      const updatedNails = prev.nails.map((nail) => {
        if (!targets.includes(nail.slot)) return nail;

        const steps = nail.steps.map((s) => {
          if (s.type !== "background") return s;
          const updatedItem: BackgroundItem = {
            ...(s.items[0] as BackgroundItem),
            kind,
            color,
          };
          return { ...s, items: [updatedItem] };
        });

        return { ...nail, steps: updateNailStepsWithValidation(steps) };
      });

      return { ...prev, nails: updatedNails };
    });
  };

  // 5. Update Finish Layer
  const handleUpdateFinish = (glossiness: number) => {
    const targets = getTargetNailSlots();

    updateDocumentWithHistory((prev) => {
      const updatedNails = prev.nails.map((nail) => {
        if (!targets.includes(nail.slot)) return nail;

        const steps = nail.steps.map((s) => {
          if (s.type !== "finish") return s;
          const updatedItem: FinishItem = {
            ...(s.items[0] as FinishItem),
            glossiness,
          };
          return { ...s, items: [updatedItem] };
        });

        return { ...nail, steps: updateNailStepsWithValidation(steps) };
      });

      return { ...prev, nails: updatedNails };
    });
  };

  // 6. Update Flat Item Transform (Drag/Rotate/Scale in 2D)
  const handleUpdateFlatTransform = (itemId: string, transform: Transform2D) => {
    updateDocumentWithHistory((prev) => {
      const updatedNails = prev.nails.map((nail) => {
        if (nail.slot !== activeNailSlot) return nail;

        const steps = nail.steps.map((s) => {
          if (s.type !== "flat-design") return s;
          const items = s.items.map((it) => (it.id === itemId ? { ...it, transform } : it));
          return { ...s, items };
        });

        return { ...nail, steps: updateNailStepsWithValidation(steps) };
      });

      return { ...prev, nails: updatedNails };
    });
  };

  // 7. Update 3D Anchor (u, v in 2D)
  const handleUpdate3DAnchor = (itemId: string, u: number, v: number) => {
    updateDocumentWithHistory((prev) => {
      const updatedNails = prev.nails.map((nail) => {
        if (nail.slot !== activeNailSlot) return nail;

        const steps = nail.steps.map((s) => {
          if (s.type !== "decoration-3d") return s;
          const items = s.items.map((it) => {
            if (it.id === itemId) {
              const curAnchor = (it as Decoration3DItem).anchor;
              return { ...it, anchor: { ...curAnchor, u, v } };
            }
            return it;
          });
          return { ...s, items };
        });

        return { ...nail, steps: updateNailStepsWithValidation(steps) };
      });

      return { ...prev, nails: updatedNails };
    });
  };

  // 8. Update Surface Mask
  const handleUpdateSurfaceMask = (
    itemId: string,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    updateDocumentWithHistory((prev) => {
      const updatedNails = prev.nails.map((nail) => {
        if (nail.slot !== activeNailSlot) return nail;

        const steps = nail.steps.map((s) => {
          if (s.type !== "surface-effect") return s;
          const items = s.items.map((it) => {
            if (it.id === itemId) {
              const curMask = (it as SurfaceEffectItem).mask;
              return { ...it, mask: { ...curMask, x, y, width, height } };
            }
            return it;
          });
          return { ...s, items };
        });

        return { ...nail, steps: updateNailStepsWithValidation(steps) };
      });

      return { ...prev, nails: updatedNails };
    });
  };

  // 9. Duplicate Item
  const handleDuplicateItem = (itemId: string) => {
    updateDocumentWithHistory((prev) => {
      const updatedNails = prev.nails.map((nail) => {
        if (nail.slot !== activeNailSlot) return nail;

        const steps = nail.steps.map((s) => {
          const itemIdx = s.items.findIndex((it) => it.id === itemId);
          if (itemIdx === -1) return s;

          const item = s.items[itemIdx];
          const cloned = JSON.parse(JSON.stringify(item));
          cloned.id = `${cloned.id}-dup-${Date.now()}`;

          // Offset slightly
          if (cloned.transform) {
            cloned.transform.x = Math.min(0.9, cloned.transform.x + 0.05);
            cloned.transform.y = Math.min(0.9, cloned.transform.y + 0.05);
          } else if (cloned.anchor) {
            cloned.anchor.u = Math.min(0.9, cloned.anchor.u + 0.05);
            cloned.anchor.v = Math.min(0.9, cloned.anchor.v + 0.05);
          }

          return { ...s, items: [...s.items, cloned] };
        });

        return { ...nail, steps: updateNailStepsWithValidation(steps) };
      });

      return { ...prev, nails: updatedNails };
    });
  };

  // 10. Delete Item
  const handleDeleteItem = (itemId: string) => {
    setSelectedItemId(null);
    updateDocumentWithHistory((prev) => {
      const updatedNails = prev.nails.map((nail) => {
        if (nail.slot !== activeNailSlot) return nail;

        const steps = nail.steps.map((s) => ({
          ...s,
          items: s.items.filter((it) => it.id !== itemId),
        }));

        return { ...nail, steps: updateNailStepsWithValidation(steps) };
      });

      return { ...prev, nails: updatedNails };
    });
  };

  // 11. Mirror Item (Flip H)
  const handleMirrorItem = (itemId: string) => {
    updateDocumentWithHistory((prev) => {
      const updatedNails = prev.nails.map((nail) => {
        if (nail.slot !== activeNailSlot) return nail;

        const steps = nail.steps.map((s) => {
          const items = s.items.map((it) => {
            if (it.id !== itemId) return it;
            if ((it as any).transform) {
              const curT = (it as FlatDesignItem).transform;
              return {
                ...it,
                transform: {
                  ...curT,
                  x: Number((1 - curT.x).toFixed(3)),
                  rotation: (360 - curT.rotation) % 360,
                },
              };
            }
            if ((it as any).anchor) {
              const curA = (it as Decoration3DItem).anchor;
              return {
                ...it,
                anchor: { ...curA, u: Number((1 - curA.u).toFixed(3)) },
              };
            }
            return it;
          });
          return { ...s, items };
        });

        return { ...nail, steps: updateNailStepsWithValidation(steps) };
      });

      return { ...prev, nails: updatedNails };
    });
  };

  // Step Management in Right Panel
  const handleToggleStepVisibility = (stepId: string) => {
    updateDocumentWithHistory((prev) => {
      const updatedNails = prev.nails.map((nail) => {
        if (nail.slot !== activeNailSlot) return nail;
        const steps = nail.steps.map((s) => (s.id === stepId ? { ...s, visible: !s.visible } : s));
        return { ...nail, steps: updateNailStepsWithValidation(steps) };
      });
      return { ...prev, nails: updatedNails };
    });
  };

  const handleToggleStepSkip = (stepId: string) => {
    updateDocumentWithHistory((prev) => {
      const updatedNails = prev.nails.map((nail) => {
        if (nail.slot !== activeNailSlot) return nail;
        const steps = nail.steps.map((s) => (s.id === stepId ? { ...s, skipped: !s.skipped } : s));
        return { ...nail, steps: updateNailStepsWithValidation(steps) };
      });
      return { ...prev, nails: updatedNails };
    });
  };

  const handleDuplicateStep = (stepId: string) => {
    updateDocumentWithHistory((prev) => {
      const updatedNails = prev.nails.map((nail) => {
        if (nail.slot !== activeNailSlot) return nail;
        const step = nail.steps.find((s) => s.id === stepId);
        if (!step) return nail;

        const cloned = JSON.parse(JSON.stringify(step));
        cloned.id = `step-${Date.now()}`;
        cloned.name = `${cloned.name} (副本)`;
        cloned.createdOrder = (cloned.createdOrder || 1) + 1;

        const steps = sortStepsByProcessOrder([...nail.steps, cloned]);
        return { ...nail, steps: updateNailStepsWithValidation(steps) };
      });
      return { ...prev, nails: updatedNails };
    });
  };

  const handleDeleteStep = (stepId: string) => {
    updateDocumentWithHistory((prev) => {
      const updatedNails = prev.nails.map((nail) => {
        if (nail.slot !== activeNailSlot) return nail;
        const steps = nail.steps.filter((s) => s.id !== stepId);
        return { ...nail, steps: updateNailStepsWithValidation(steps) };
      });
      return { ...prev, nails: updatedNails };
    });
  };

  const handleAddStep = (type: ProcessStepType) => {
    updateDocumentWithHistory((prev) => {
      const updatedNails = prev.nails.map((nail) => {
        if (nail.slot !== activeNailSlot) return nail;

        const newStep: ProcessStep = {
          id: `step-${type}-${Date.now()}`,
          type,
          name: `新增${type === "flat-design" ? "平面设计" : type === "surface-effect" ? "表面特效" : "3D装饰"}`,
          visible: true,
          skipped: false,
          createdOrder: nail.steps.filter((s) => s.type === type).length + 1,
          items: [],
        };

        const steps = sortStepsByProcessOrder([...nail.steps, newStep]);
        return { ...nail, steps: updateNailStepsWithValidation(steps) };
      });
      return { ...prev, nails: updatedNails };
    });
  };

  const handleUpdateStepProperty = (stepId: string, updates: Partial<ProcessStep>) => {
    updateDocumentWithHistory((prev) => {
      const updatedNails = prev.nails.map((nail) => {
        if (nail.slot !== activeNailSlot) return nail;
        const steps = nail.steps.map((s) => (s.id === stepId ? { ...s, ...updates } : s));
        return { ...nail, steps: updateNailStepsWithValidation(steps) };
      });
      return { ...prev, nails: updatedNails };
    });
  };

  const handleUpdateItemProperty = (itemId: string, updates: Partial<DesignItem>) => {
    updateDocumentWithHistory((prev) => {
      const updatedNails = prev.nails.map((nail) => {
        if (nail.slot !== activeNailSlot) return nail;

        const steps = nail.steps.map((s) => {
          const items = s.items.map((it) => (it.id === itemId ? ({ ...it, ...updates } as DesignItem) : it));
          return { ...s, items };
        });

        return { ...nail, steps: updateNailStepsWithValidation(steps) };
      });

      return { ...prev, nails: updatedNails };
    });
  };

  // Batch Operations Execution (from BatchModal or TenNailsOverview)
  const handleExecuteBatchCopy = (sourceSlot: NailSlot, targetSlots: NailSlot[], mirror: boolean) => {
    const srcNail = document.nails.find((n) => n.slot === sourceSlot);
    if (!srcNail) return;

    updateDocumentWithHistory((prev) => {
      const updatedNails = prev.nails.map((nail) => {
        if (!targetSlots.includes(nail.slot)) return nail;

        // Clone steps deeply
        const clonedSteps: ProcessStep[] = JSON.parse(JSON.stringify(srcNail.steps)).map(
          (step: ProcessStep) => {
            step.id = `step-batch-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
            step.items = step.items.map((item: any) => {
              item.id = `item-batch-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

              // Mirror if requested
              if (mirror) {
                if (item.transform) {
                  item.transform.x = Number((1 - item.transform.x).toFixed(3));
                  item.transform.rotation = (360 - item.transform.rotation) % 360;
                }
                if (item.anchor) {
                  item.anchor.u = Number((1 - item.anchor.u).toFixed(3));
                }
                if (item.mask && item.mask.x !== undefined) {
                  item.mask.x = Number((1 - item.mask.x).toFixed(3));
                }
              }
              return item;
            });
            return step;
          }
        );

        return {
          ...nail,
          steps: updateNailStepsWithValidation(clonedSteps),
        };
      });

      return { ...prev, nails: updatedNails };
    });
  };

  const handleBatchToggleVisibility = (targetSlots: NailSlot[], visible: boolean) => {
    updateDocumentWithHistory((prev) => {
      const updatedNails = prev.nails.map((nail) => {
        if (!targetSlots.includes(nail.slot)) return nail;
        const steps = nail.steps.map((s) => ({ ...s, visible }));
        return { ...nail, steps: updateNailStepsWithValidation(steps) };
      });
      return { ...prev, nails: updatedNails };
    });
  };

  const handleBatchToggleSkip = (targetSlots: NailSlot[], skipped: boolean) => {
    updateDocumentWithHistory((prev) => {
      const updatedNails = prev.nails.map((nail) => {
        if (!targetSlots.includes(nail.slot)) return nail;
        const steps = nail.steps.map((s) => ({ ...s, skipped }));
        return { ...nail, steps: updateNailStepsWithValidation(steps) };
      });
      return { ...prev, nails: updatedNails };
    });
  };

  // Quick mirror from Left Hand to Right Hand
  const handleMirrorLeftToRight = () => {
    const leftSlots = NAIL_SLOTS.filter((s) => s.hand === "left");

    updateDocumentWithHistory((prev) => {
      const updatedNails = [...prev.nails];

      leftSlots.forEach((lSlot) => {
        const correspondingRightSlot = lSlot.slot.replace("left-", "right-") as NailSlot;
        const lNail = prev.nails.find((n) => n.slot === lSlot.slot);
        const rIndex = updatedNails.findIndex((n) => n.slot === correspondingRightSlot);

        if (lNail && rIndex !== -1) {
          const clonedSteps: ProcessStep[] = JSON.parse(JSON.stringify(lNail.steps)).map(
            (step: ProcessStep) => {
              step.id = `step-mirrored-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
              step.items = step.items.map((item: any) => {
                item.id = `item-mirrored-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
                if (item.transform) {
                  item.transform.x = Number((1 - item.transform.x).toFixed(3));
                  item.transform.rotation = (360 - item.transform.rotation) % 360;
                }
                if (item.anchor) {
                  item.anchor.u = Number((1 - item.anchor.u).toFixed(3));
                }
                if (item.mask && item.mask.x !== undefined) {
                  item.mask.x = Number((1 - item.mask.x).toFixed(3));
                }
                return item;
              });
              return step;
            }
          );

          updatedNails[rIndex] = {
            ...updatedNails[rIndex],
            steps: updateNailStepsWithValidation(clonedSteps),
          };
        }
      });

      return { ...prev, nails: updatedNails };
    });
  };

  // Quick apply current nail design to all 10 fingers
  const handleApplyCurrentToAll = () => {
    const targets = NAIL_SLOTS.filter((s) => s.slot !== activeNailSlot).map((s) => s.slot);
    handleExecuteBatchCopy(activeNailSlot, targets, false);
  };

  // Load Template
  const handleLoadTemplate = (tpl: NailTemplate) => {
    updateDocumentWithHistory((prev) => {
      let newNails = [...prev.nails];
      if (tpl.nails && tpl.nails.length > 0) {
        newNails = tpl.nails;
      }
      return {
        ...prev,
        name: `${tpl.name}`,
        nails: newNails,
      };
    });
  };

  // -------------------------------------------------------------
  // Render Screen 1: Model Preparation Workflow
  // -------------------------------------------------------------
  if (currentScreen === "model-prep") {
    return <ModelPrepView onConfirmAndLock={handleConfirmModelAndShape} />;
  }

  // -------------------------------------------------------------
  // Render Screen 2: Main Nail Studio PS Editor
  // -------------------------------------------------------------
  return (
    <div className="w-full h-screen bg-[#252525] text-[#E5E5E5] font-sans flex flex-col overflow-hidden select-none">
      {/* Top PS Title & Menu Bar */}
      <TopBar
        designName={document.name}
        onDesignNameChange={(name) => updateDocumentWithHistory((p) => ({ ...p, name }))}
        sourceModelName={sourceModel.name}
        targetShape={editableModel.targetShape}
        lockedAt={document.model.lockedAt}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectionMode={selectionMode}
        onSelectionModeChange={setSelectionMode}
        canUndo={history.length > 0}
        canRedo={future.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onOpenSaveTemplate={() => setIsTemplateModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        onReturnToPrep={handleReturnToPrep}
        onOpenBatchModal={() => setIsBatchModalOpen(true)}
      />

      {/* Main Workspace (3 Columns: Left: Process Steps, Center: Canvas, Right: Step Options & Properties) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Fixed Industrial Process Steps Panel */}
        <RightProcessPanel
          steps={currentNail.steps}
          activeStepId={activeStepId}
          onSelectStep={setActiveStepId}
          selectedItemId={selectedItemId}
          onSelectItem={setSelectedItemId}
          onToggleStepVisibility={handleToggleStepVisibility}
          onToggleStepSkip={handleToggleStepSkip}
          onDuplicateStep={handleDuplicateStep}
          onDeleteStep={handleDeleteStep}
          onAddStep={handleAddStep}
          onUpdateStepProperty={handleUpdateStepProperty}
          onUpdateItemProperty={handleUpdateItemProperty}
        />

        {/* Center: 2D Canvas / 3D View / Ten Nails Overview */}
        <main className="flex-1 flex flex-col bg-[#202020] overflow-hidden relative">
          {viewMode === "2d" && (
            <Canvas2D
              nailDesign={currentNail}
              nailPart={currentPart}
              targetShape={editableModel.targetShape}
              selectedItemId={selectedItemId}
              onSelectItem={setSelectedItemId}
              onUpdateFlatItemTransform={handleUpdateFlatTransform}
              onUpdate3DAnchor={handleUpdate3DAnchor}
              onUpdateSurfaceMask={handleUpdateSurfaceMask}
              onDuplicateItem={handleDuplicateItem}
              onDeleteItem={handleDeleteItem}
              onMirrorItem={handleMirrorItem}
              showSafeArea={showSafeArea}
            />
          )}

          {viewMode === "3d" && (
            <Viewport3D
              nailDesign={currentNail}
              nailPart={currentPart}
              targetShape={editableModel.targetShape}
            />
          )}

          {viewMode === "ten-nails" && (
            <TenNailsOverview
              nails={document.nails}
              parts={editableModel.parts}
              targetShape={editableModel.targetShape}
              activeNailId={currentNail.id}
              onSelectNail={(slot) => {
                setActiveNailSlot(slot);
                setViewMode("2d");
              }}
              onMirrorLeftToRight={handleMirrorLeftToRight}
              onApplyCurrentToAll={handleApplyCurrentToAll}
            />
          )}
        </main>

        {/* Right: Step Options & Properties / Tools Palette */}
        <LeftToolbar
          currentStepType={currentStepType}
          onAddFlatItem={handleAddFlatItem}
          onAdd3DItem={handleAdd3DItem}
          onAddSurfaceItem={handleAddSurfaceItem}
          onUpdateBackground={handleUpdateBackground}
          onUpdateFinish={handleUpdateFinish}
          activeTool={activeTool}
          onSelectTool={setActiveTool}
          showSafeArea={showSafeArea}
          onToggleSafeArea={() => setShowSafeArea((v) => !v)}
        />
      </div>

      {/* Modals */}
      <BatchModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        activeNailSlot={activeNailSlot}
        nails={document.nails}
        onExecuteCopy={handleExecuteBatchCopy}
        onBatchToggleVisibility={handleBatchToggleVisibility}
        onBatchToggleSkip={handleBatchToggleSkip}
      />

      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        currentShape={editableModel.targetShape}
        currentSourceModelId={sourceModel.id}
        currentNails={document.nails}
        onLoadTemplate={handleLoadTemplate}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        document={document}
      />
    </div>
  );
}

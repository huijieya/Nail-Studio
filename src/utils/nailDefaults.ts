import {
  NailSlot,
  NailShape,
  NailModelPart,
  EditableModelAsset,
  SourceModelAsset,
  DesignDocument,
  NailDesign,
  ProcessStep,
  Asset,
  NailTemplate,
  PROCESS_ORDER,
} from "../types/nail";

export interface SlotMeta {
  slot: NailSlot;
  hand: "left" | "right";
  finger: "thumb" | "index" | "middle" | "ring" | "pinky";
  name: string;
  shortName: string;
  defaultWidth: number; // mm
  defaultLength: number; // mm
}

export const NAIL_SLOTS: SlotMeta[] = [
  { slot: "left-thumb", hand: "left", finger: "thumb", name: "左手大拇指", shortName: "左拇", defaultWidth: 15.0, defaultLength: 22.0 },
  { slot: "left-index", hand: "left", finger: "index", name: "左手食指", shortName: "左食", defaultWidth: 12.0, defaultLength: 19.5 },
  { slot: "left-middle", hand: "left", finger: "middle", name: "左手中指", shortName: "左中", defaultWidth: 12.8, defaultLength: 20.5 },
  { slot: "left-ring", hand: "left", finger: "ring", name: "左手无名指", shortName: "左无", defaultWidth: 11.5, defaultLength: 19.0 },
  { slot: "left-pinky", hand: "left", finger: "pinky", name: "左手小拇指", shortName: "左小", defaultWidth: 9.5, defaultLength: 16.0 },

  { slot: "right-thumb", hand: "right", finger: "thumb", name: "右手大拇指", shortName: "右拇", defaultWidth: 15.0, defaultLength: 22.0 },
  { slot: "right-index", hand: "right", finger: "index", name: "右手食指", shortName: "右食", defaultWidth: 12.0, defaultLength: 19.5 },
  { slot: "right-middle", hand: "right", finger: "middle", name: "右手中指", shortName: "右中", defaultWidth: 12.8, defaultLength: 20.5 },
  { slot: "right-ring", hand: "right", finger: "ring", name: "右手无名指", shortName: "右无", defaultWidth: 11.5, defaultLength: 19.0 },
  { slot: "right-pinky", hand: "right", finger: "pinky", name: "右手小拇指", shortName: "右小", defaultWidth: 9.5, defaultLength: 16.0 },
];

export const BUILTIN_SOURCE_MODELS: SourceModelAsset[] = [
  {
    id: "src-stl-default-standard",
    name: "标准亚洲成人十指甲 STL (高精度点云重构)",
    format: "stl",
    sourceType: "builtin",
    fileUrl: "/assets/models/standard_ten_nails.stl",
    importStatus: "ready",
    fileSize: 4280000,
    trianglesCount: 48620,
    uploadedAt: "2026-03-01 10:00",
  },
  {
    id: "src-stl-salon-extended",
    name: "沙龙本甲加固型十指 STL (中宽基准模型)",
    format: "stl",
    sourceType: "builtin",
    fileUrl: "/assets/models/salon_extended.stl",
    importStatus: "ready",
    fileSize: 3840000,
    trianglesCount: 42100,
    uploadedAt: "2026-03-02 14:30",
  },
];

export function generateEditableModel(
  sourceModelId: string,
  targetShape: NailShape
): EditableModelAsset {
  const parts: NailModelPart[] = NAIL_SLOTS.map((slotMeta) => {
    let lengthMultiplier = 1.0;
    if (targetShape === "coffin") lengthMultiplier = 1.06;
    else if (targetShape === "oval") lengthMultiplier = 1.05;
    else if (targetShape === "almond") lengthMultiplier = 1.08;
    else if (targetShape === "stiletto") lengthMultiplier = 1.15;

    return {
      id: `part-${targetShape}-${slotMeta.slot}`,
      sourcePartId: `stl-mesh-${slotMeta.slot}`,
      slot: slotMeta.slot,
      meshName: `NailMesh_${slotMeta.slot}`,
      width: slotMeta.defaultWidth,
      length: Number((slotMeta.defaultLength * lengthMultiplier).toFixed(1)),
      safeArea: {
        insetLeft: 0.08,
        insetRight: 0.08,
        insetTop: 0.06,
        insetBottom: 0.07,
      },
    };
  });

  return {
    id: `editable-${sourceModelId}-${targetShape}`,
    sourceModelId,
    targetShape,
    fileUrl: `/assets/converted/${sourceModelId}_${targetShape}.bin`,
    uvProfileId: `uv-ortho-profile-v1`,
    parts,
    conversionVersion: "1.2.0-geom",
    status: "ready",
  };
}

export const PRESET_ASSETS: Asset[] = [
  // 2D Flat Design - minimalist black/white PS vector stamps
  {
    id: "asset-star-cross",
    type: "svg",
    name: "四芒星光 (Star Sparkle)",
    category: "贴纸/图形",
    url: "",
    svgData: "M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5Z",
  },
  {
    id: "asset-french-curve",
    type: "svg",
    name: "简约极细法式弧线 (French Line)",
    category: "贴纸/图形",
    url: "",
    svgData: "M2 18 C 7 12, 17 12, 22 18",
  },
  {
    id: "asset-crescent-moon",
    type: "svg",
    name: "玄月 (Crescent Moon)",
    category: "贴纸/图形",
    url: "",
    svgData: "M14 3 C 8 4, 4 9, 5 15 C 6 20, 11 23, 17 21 C 12 19, 10 14, 12 9 C 13 6, 15 4, 14 3 Z",
  },
  {
    id: "asset-geo-line",
    type: "svg",
    name: "双向分割直线 (Dual Vector)",
    category: "贴纸/图形",
    url: "",
    svgData: "M12 2 L12 22 M2 12 L22 12",
  },
  {
    id: "asset-heart-flat",
    type: "svg",
    name: "极简心形 (Minimal Heart)",
    category: "贴纸/图形",
    url: "",
    svgData: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
  },
  {
    id: "asset-checker-motif",
    type: "svg",
    name: "棋盘格纹 (Checker Tile)",
    category: "贴纸/图形",
    url: "",
    svgData: "M2 2h9v9H2z M13 2h9v9H13z M2 13h9v9H2z M13 13h9v9H13z",
  },

  // 3D Decorations
  {
    id: "3d-heart",
    type: "model-3d",
    name: "立体爱心 (3D Heart Charm)",
    category: "3D素材库",
    url: "",
    geometryType: "heart",
  },
  {
    id: "3d-bow",
    type: "model-3d",
    name: "立体蝴蝶结 (3D Ribbon Bow)",
    category: "3D素材库",
    url: "",
    geometryType: "bow",
  },
  {
    id: "3d-butterfly",
    type: "model-3d",
    name: "微浮雕蝴蝶 (3D Butterfly)",
    category: "3D素材库",
    url: "",
    geometryType: "butterfly",
  },
  {
    id: "3d-rose",
    type: "model-3d",
    name: "雕花玫瑰 (3D Camellia Rose)",
    category: "3D素材库",
    url: "",
    geometryType: "rose",
  },
  {
    id: "3d-pearl",
    type: "model-3d",
    name: "半球珍珠 (Half Pearl)",
    category: "3D素材库",
    url: "",
    geometryType: "pearl",
  },
  {
    id: "3d-stud",
    type: "model-3d",
    name: "金银金属铆钉 (Metal Stud)",
    category: "3D素材库",
    url: "",
    geometryType: "stud",
  },
];

export function createInitialNailDesign(
  slot: NailSlot,
  modelPartId: string
): NailDesign {
  // Initial default process steps: Background and Finish
  const bgStep: ProcessStep = {
    id: `step-bg-${slot}`,
    type: "background",
    name: "基础底色",
    visible: true,
    skipped: false,
    createdOrder: 1,
    material: {
      name: "透黑/透白乳白色浆",
      color: "#1c1c1e",
      opacity: 0.9,
    },
    supportStatus: {
      status: "supported",
      reasons: ["基础胶层厚度符合规范 (0.05mm)"],
      checkedRevision: 1,
    },
    items: [
      {
        id: `bg-item-${slot}`,
        kind: "sheer-color",
        color: "#28282b",
        opacity: 0.85,
        params: {},
      },
    ],
  };

  const finishStep: ProcessStep = {
    id: `step-finish-${slot}`,
    type: "finish",
    name: "钢化耐磨封层",
    visible: true,
    skipped: false,
    createdOrder: 1,
    material: {
      name: "免洗高光封层胶",
      roughness: 0.05,
      metallic: 0.1,
      opacity: 1.0,
    },
    supportStatus: {
      status: "supported",
      reasons: ["光固化固化时间预估 60s"],
      checkedRevision: 1,
    },
    items: [
      {
        id: `finish-item-${slot}`,
        kind: "top-coat",
        opacity: 1.0,
        glossiness: 90,
      },
    ],
  };

  return {
    id: `nail-${slot}`,
    slot,
    modelPartId,
    enabled: true,
    steps: [bgStep, finishStep],
  };
}

export function createInitialDesignDocument(
  sourceModelId: string,
  editableModel: EditableModelAsset,
  name = "未命名美甲设计-01"
): DesignDocument {
  const nails: NailDesign[] = editableModel.parts.map((part) =>
    createInitialNailDesign(part.slot, part.id)
  );

  return {
    id: `doc-${Date.now()}`,
    version: 1,
    name,
    model: {
      sourceModelId,
      editableModelId: editableModel.id,
      targetShape: editableModel.targetShape,
      lockedAt: new Date().toISOString(),
    },
    nails,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function sortStepsByProcessOrder(steps: ProcessStep[]): ProcessStep[] {
  return [...steps].sort((a, b) => {
    const orderA = PROCESS_ORDER[a.type];
    const orderB = PROCESS_ORDER[b.type];
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return a.createdOrder - b.createdOrder;
  });
}

export const PRESET_TEMPLATES: NailTemplate[] = [
  {
    id: "tpl-mono-french",
    name: "极简黑白线条·法式方圆",
    description: "经典黑白色彩，极细法式反弧线搭配拇指微芒星，清冷工业风",
    targetShape: "squoval",
    sourceModelId: "src-stl-default-standard",
    createdAt: "2026-03-01",
    nails: [], // Will be hydrated when selected
  },
  {
    id: "tpl-pearl-camellia",
    name: "立体珍珠山茶花·优雅椭圆",
    description: "无名指点缀微浮雕玫瑰，食指半球珍珠，哑光透黑底色",
    targetShape: "oval",
    sourceModelId: "src-stl-default-standard",
    createdAt: "2026-03-02",
    nails: [],
  },
  {
    id: "tpl-mirror-chrome",
    name: "银灰镜面粉微光·方圆十指",
    description: "全指遮罩局部镜面渐变，大拇指与中指双向几何点缀",
    targetShape: "squoval",
    sourceModelId: "src-stl-default-standard",
    createdAt: "2026-03-03",
    nails: [],
  },
];

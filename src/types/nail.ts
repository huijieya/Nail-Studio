export type NailShape = "squoval" | "oval";

export type NailSlot =
  | "left-thumb"
  | "left-index"
  | "left-middle"
  | "left-ring"
  | "left-pinky"
  | "right-thumb"
  | "right-index"
  | "right-middle"
  | "right-ring"
  | "right-pinky";

export interface SafeArea {
  insetLeft: number; // percentage 0-1
  insetRight: number;
  insetTop: number;
  insetBottom: number;
}

export interface NailModelPart {
  id: string;
  sourcePartId?: string;
  slot: NailSlot;
  meshName: string;
  width: number; // mm
  length: number; // mm
  safeArea: SafeArea;
}

export interface SourceModelAsset {
  id: string;
  name: string;
  format: "stl";
  sourceType: "builtin" | "uploaded";
  fileUrl: string;
  importStatus: "ready" | "invalid";
  errorMessage?: string;
  fileSize?: number;
  trianglesCount?: number;
  uploadedAt?: string;
}

export interface ModelConversionTask {
  id: string;
  sourceModelId: string;
  targetShape: NailShape;
  status: "pending" | "processing" | "success" | "failed";
  progress: number; // 0-100
  currentStepDescription?: string;
  resultModelId?: string;
  errorMessage?: string;
}

export interface EditableModelAsset {
  id: string;
  sourceModelId: string;
  targetShape: NailShape;
  fileUrl: string;
  uvProfileId: string;
  parts: NailModelPart[];
  conversionVersion: string;
  status: "processing" | "ready" | "failed";
  errorMessage?: string;
}

export interface DesignModelReference {
  sourceModelId: string;
  editableModelId: string;
  targetShape: NailShape;
  lockedAt: string;
}

export type ProcessStepType =
  | "background"
  | "flat-design"
  | "surface-effect"
  | "decoration-3d"
  | "finish";

export const PROCESS_ORDER: Record<ProcessStepType, number> = {
  background: 1,
  "flat-design": 2,
  "surface-effect": 3,
  "decoration-3d": 4,
  finish: 5,
};

export const PROCESS_STEP_TITLES: Record<ProcessStepType, string> = {
  background: "背景层",
  "flat-design": "平面设计层",
  "surface-effect": "表面效果层",
  "decoration-3d": "立体装饰层",
  finish: "表面完成层",
};

export interface MaterialConfig {
  name?: string;
  color?: string;
  roughness?: number;
  metallic?: number;
  opacity?: number;
  intensity?: number;
}

export interface SupportStatus {
  status: "supported" | "unsupported" | "warning" | "unknown";
  reasons: string[];
  deviceProfileId?: string;
  ruleVersion?: string;
  checkedRevision: number;
}

export interface Transform2D {
  x: number; // UV 0-1 center
  y: number; // UV 0-1 center
  width: number; // UV scale 0-1
  height: number; // UV scale 0-1
  rotation: number; // degrees 0-360
  scaleX: number;
  scaleY: number;
}

export interface SurfaceAnchor {
  u: number;
  v: number;
  normalOffset: number;
  faceIndex?: number;
  barycentric?: [number, number, number];
}

export interface Transform3D {
  rotation: number; // degrees
  scale: number;
  height: number; // mm
  tilt?: number; // degrees
}

export interface MaskDefinition {
  type: "ellipse" | "rectangle" | "polygon" | "path";
  points?: Array<{ x: number; y: number }>;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  feather: number;
  invert: boolean;
}

export interface BackgroundItem {
  id: string;
  kind: "base-color" | "sheer-color" | "gradient" | "full-cat-eye" | "full-glitter";
  color?: string;
  opacity: number;
  params: {
    gradientAngle?: number;
    gradientStopColor?: string;
    catEyeAngle?: number;
    catEyeWidth?: number;
    glitterDensity?: number;
    [key: string]: unknown;
  };
}

export interface FlatDesignItem {
  id: string;
  kind: "sticker" | "image" | "shape";
  assetId?: string;
  shapeType?: "star" | "moon" | "circle" | "rect" | "heart" | "line" | "cross";
  color?: string;
  svgPath?: string;
  transform: Transform2D;
  opacity: number;
  blendMode?: string;
}

export interface SurfaceEffectItem {
  id: string;
  kind: "ombre" | "mirror-powder" | "local-cat-eye" | "sugar" | "local-glitter";
  mask: MaskDefinition;
  opacity: number;
  params: {
    effectColor?: string;
    secondaryColor?: string;
    intensity?: number;
    roughness?: number;
    catEyeAngle?: number;
    grainSize?: number;
    [key: string]: unknown;
  };
  material?: MaterialConfig;
}

export interface Decoration3DItem {
  id: string;
  assetId: string;
  anchor: SurfaceAnchor;
  transform: Transform3D;
  material?: MaterialConfig;
}

export interface FinishItem {
  id: string;
  kind: "top-coat";
  opacity: number;
  glossiness: number; // 0 (matte) to 100 (high gloss)
}

export type DesignItem =
  | BackgroundItem
  | FlatDesignItem
  | SurfaceEffectItem
  | Decoration3DItem
  | FinishItem;

export interface ProcessStep {
  id: string;
  type: ProcessStepType;
  name: string;
  visible: boolean;
  skipped: boolean;
  items: DesignItem[];
  material?: MaterialConfig;
  supportStatus?: SupportStatus;
  createdOrder: number;
}

export interface NailDesign {
  id: string;
  slot: NailSlot;
  modelPartId: string;
  enabled: boolean;
  steps: ProcessStep[];
}

export interface DesignDocument {
  id: string;
  version: number;
  name: string;
  model: DesignModelReference;
  nails: NailDesign[];
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  type: "image" | "svg" | "model-3d";
  name: string;
  category: string;
  url: string;
  thumbnailUrl?: string;
  svgData?: string;
  geometryType?: "heart" | "bow" | "butterfly" | "rose" | "pearl" | "stud";
}

export interface EditorState {
  activeNailId: string | null;
  selectedNailIds: string[];
  activeStepId: string | null;
  selectedItemIds: string[];
  viewMode: "2d" | "3d" | "ten-nails";
  zoom: number;
  cameraPreset: "front" | "side" | "top" | "custom";
  expandedStepIds: string[];
  currentTool?: string;
}

export interface NailTemplate {
  id: string;
  name: string;
  description: string;
  targetShape: NailShape;
  sourceModelId: string;
  nails: NailDesign[];
  createdAt: string;
}

export type SelectionRangeMode =
  | "single"
  | "left-five"
  | "right-five"
  | "all-ten"
  | "custom";

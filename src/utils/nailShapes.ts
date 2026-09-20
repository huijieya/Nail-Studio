import { NailShape } from "../types/nail";

export interface NailShapeInfo {
  id: NailShape;
  name: string;
  enName: string;
  alias: string;
  tag: string;
  description: string;
  maskSvg: string;
  iconD: string;
  canvasPath: string;
  safeAreaPath: string;
  miniPath: string;
  defaultLengthMultiplier: number;
}

export const NAIL_SHAPES: NailShapeInfo[] = [
  {
    id: "coffin",
    name: "梯型 / 芭蕾型",
    enName: "Coffin",
    alias: "Ballerina",
    tag: "经典平切",
    description: "甲端方平利落，两侧优雅内收，现代摩登修饰指形",
    maskSvg: "/assets/masks/mask_coffin.svg",
    // 0 0 100 380 SVG path from user provided mask
    iconD:
      "M 22 30 C 22 14, 78 14, 78 30 L 68 356 C 67 362, 63 365, 56 365 L 44 365 C 37 365, 33 362, 32 356 Z",
    // Canvas2D path (340x480, y=440 is cuticle, y=28 is tip)
    canvasPath: `M 45 440 
      C 45 465, 295 465, 295 440 
      L 236 42 
      C 232 34, 224 28, 212 28 
      L 128 28 
      C 116 28, 108 34, 104 42 
      Z`,
    safeAreaPath: `M 65 420 
      C 65 440, 275 440, 275 420 
      L 222 55 
      C 220 48, 214 45, 204 45 
      L 136 45 
      C 126 45, 120 48, 118 55 
      Z`,
    miniPath:
      "M 8 74 C 8 76, 42 76, 42 74 L 35 12 C 34 8, 31 6, 28 6 L 22 6 C 19 6, 16 8, 15 12 Z",
    defaultLengthMultiplier: 1.06,
  },
  {
    id: "oval",
    name: "椭圆型",
    enName: "Oval",
    alias: "Classic",
    tag: "圆润修长",
    description: "指尖圆弧柔和自然，修饰手型线条，优雅经典百搭",
    maskSvg: "/assets/masks/mask_oval.svg",
    iconD:
      "M 22 30 C 22 14, 78 14, 78 30 C 82 110, 80 230, 68 310 C 60 360, 40 360, 32 310 C 20 230, 18 110, 22 30 Z",
    canvasPath: `M 50 440 
      C 50 465, 290 465, 290 440 
      C 290 320, 285 180, 255 90 
      C 225 25, 115 25, 85 90 
      C 55 180, 50 320, 50 440 
      Z`,
    safeAreaPath: `M 70 420 
      C 70 440, 270 440, 270 420 
      C 270 310, 265 180, 240 100 
      C 215 45, 125 45, 100 100 
      C 75 180, 70 310, 70 420 
      Z`,
    miniPath:
      "M 8 74 C 8 76, 42 76, 42 74 C 42 50, 44 26, 38 12 C 34 4, 16 4, 12 12 C 6 26, 8 50, 8 74 Z",
    defaultLengthMultiplier: 1.05,
  },
  {
    id: "almond",
    name: "杏仁型",
    enName: "Almond",
    alias: "Elegant",
    tag: "柔和微尖",
    description: "两侧向指尖聚拢收窄，尖端温润微圆，视觉显瘦显长",
    maskSvg: "/assets/masks/mask_almond.svg",
    iconD:
      "M 22 30 C 22 14, 78 14, 78 30 C 78 120, 72 240, 58 335 C 55 355, 45 355, 42 335 C 28 240, 22 120, 22 30 Z",
    canvasPath: `M 50 440 
      C 50 465, 290 465, 290 440 
      C 285 300, 260 170, 210 75 
      C 190 40, 180 28, 170 28 
      C 160 28, 150 40, 130 75 
      C 80 170, 55 300, 50 440 
      Z`,
    safeAreaPath: `M 70 420 
      C 70 440, 270 440, 270 420 
      C 265 295, 242 175, 198 90 
      C 182 60, 175 48, 170 48 
      C 165 48, 158 60, 142 90 
      C 98 175, 75 295, 70 420 
      Z`,
    miniPath:
      "M 8 74 C 8 76, 42 76, 42 74 C 40 48, 36 24, 28 10 C 26 6, 24 6, 22 10 C 14 24, 10 48, 8 74 Z",
    defaultLengthMultiplier: 1.08,
  },
  {
    id: "stiletto",
    name: "尖形 / 细高跟型",
    enName: "Stiletto",
    alias: "Avant-Garde",
    tag: "锋芒吸睛",
    description: "极致收缩锋利甲峰，戏剧感强烈，个性前卫张扬",
    maskSvg: "/assets/masks/mask_stiletto.svg",
    iconD:
      "M 22 30 C 22 14, 78 14, 78 30 C 78 130, 68 250, 52 366 C 51 372, 49 372, 48 366 C 32 250, 22 130, 22 30 Z",
    canvasPath: `M 50 440 
      C 50 465, 290 465, 290 440 
      C 280 290, 240 160, 178 30 
      C 174 22, 166 22, 162 30 
      C 100 160, 60 290, 50 440 
      Z`,
    safeAreaPath: `M 70 420 
      C 70 440, 270 440, 270 420 
      C 260 285, 224 165, 174 52 
      C 172 46, 168 46, 166 52 
      C 116 165, 80 285, 70 420 
      Z`,
    miniPath:
      "M 8 74 C 8 76, 42 76, 42 74 C 38 48, 32 24, 26 8 C 25.5 6, 24.5 6, 24 8 C 18 24, 12 48, 8 74 Z",
    defaultLengthMultiplier: 1.15,
  },
];

export function getNailShapeInfo(shape: NailShape | string): NailShapeInfo {
  const normalized = shape === "squoval" ? "coffin" : shape;
  const found = NAIL_SHAPES.find((s) => s.id === normalized);
  return found || NAIL_SHAPES[0];
}

export function getNailWidthFactor(shape: NailShape | string, v: number): number {
  if (shape === "stiletto") {
    if (v < 0.65) {
      return 0.18 + (v / 0.65) * 0.77;
    }
    return 0.95 - ((v - 0.65) / 0.35) * 0.10;
  }
  if (shape === "almond") {
    if (v < 0.5) {
      return 0.45 + (v / 0.5) * 0.50;
    }
    return 0.95 - ((v - 0.5) / 0.5) * 0.12;
  }
  if (shape === "coffin" || shape === "squoval") {
    if (v < 0.2) {
      return 0.72 + (v / 0.2) * 0.20;
    }
    if (v > 0.85) {
      return 0.88 + ((1 - v) / 0.15) * 0.12;
    }
    return 0.92 + v * 0.05;
  }
  // Default oval
  if (v < 0.5) {
    return 0.65 + (v / 0.5) * 0.35;
  }
  return 0.95 - ((v - 0.5) / 0.5) * 0.15;
}

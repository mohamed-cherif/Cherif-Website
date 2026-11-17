import generated from "./models.generated.json";

export type PartRole = "structure" | "detail" | "actuator" | "mechanism" | "reference";

export interface ModelPart {
  name: string;
  role: PartRole;
  center: number[];
  size: number[];
  /** hinge: rotates `open` degrees about `axis` through `at` when the view opens */
  pivot?: { at: number[]; axis: number[]; open: number };
  /** slider: moves `mm` along `axis` when the view opens */
  slide?: { axis: number[]; mm: number };
  note?: string;
}

export interface ModelMeta {
  src: string;
  bytes: number;
  triangles: number;
  min: number[];
  max: number[];
  /** a ready-made GLB shown with its own materials instead of role colours */
  raw?: boolean;
  parts: ModelPart[];
}

/** How the viewer should show a model at a given moment. */
export interface ModelView {
  /** 0 = assembled, 1 = fully exploded */
  explode?: number;
  /** 0 = closed, 1 = open, for parts with a hinge */
  open?: number;
  /** part names to keep solid; everything else fades back */
  highlight?: string[];
  /** show the faded reference model (for example the drone the part mounts to) */
  ghost?: boolean;
  /** camera azimuth and elevation in degrees, zoom 1 = fit */
  az?: number;
  el?: number;
  zoom?: number;
}

const models = generated as unknown as Record<string, ModelMeta>;

export function getModel(id: string): ModelMeta {
  const model = models[id];
  if (!model) throw new Error(`Unknown model "${id}". Run: node scripts/build-models.mjs`);
  return model;
}

export function modelSize(id: string): string {
  const m = getModel(id);
  const dims = m.max.map((v, i) => v - m.min[i]);
  // small parts (PCBs) keep one decimal
  const small = Math.max(...dims) < 40;
  return dims.map((d) => (small ? Math.round(d * 10) / 10 : Math.round(d))).join(" × ") + " mm";
}

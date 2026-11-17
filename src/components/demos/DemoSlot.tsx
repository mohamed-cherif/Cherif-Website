"use client";

import dynamic from "next/dynamic";
import type { DemoKey } from "@/data/projects";

const placeholder = () => (
  <div className="panel ticks blueprint-grid h-[420px] flex items-center justify-center">
    <span className="label">Loading simulation</span>
  </div>
);

// Each demo is its own chunk, loaded only on the page that uses it.
const DEMOS: Record<DemoKey, React.ComponentType> = {
  "ik-arm": dynamic(() => import("./IKArmDemo"), { ssr: false, loading: placeholder }),
  "wifi-sensing": dynamic(() => import("./WifiSensingDemo"), { ssr: false, loading: placeholder }),
  "phone-robot": dynamic(() => import("./PhoneRobotDemo"), { ssr: false, loading: placeholder }),
};

export function DemoSlot({ name }: { name: DemoKey }) {
  const Demo = DEMOS[name];
  return <Demo />;
}

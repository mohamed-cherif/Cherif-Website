// Source CAD → web models. Each model becomes public/models/<id>.glb with one
// named node per part, plus an entry in src/data/models.generated.json.
//
// up: which source axis points up ("z", "y", "-y"). Output is always Y-up.
// role: drives colour in the viewer (structure | mechanism | actuator | detail | reference).
// simplify: target ratio for heavy reference meshes.
// pivot: hinge axis in SOURCE coordinates { axis, at:[x,y,z], open: degrees } for animated parts.

// The CAD lives beside this site, in the folder that holds "The Cherif Website".
const P = new URL("../../..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1").replace(/\/$/, "");
const RF = `${P}/Rainforest Engineering`;
const FS = `${P}/THE FINAL LIGHT SWITCH`;
const claw = (v, name) =>
  `${RF}/Mavic Pro (real size) + Claw Chassis${v === 1 ? "" : " " + v}/Mavic Pro (real size) + Claw Chassis - ${name}.stl`;

const JAW_A = { axis: "z", at: [14.0, 82.8, 0], open: -55 };
const JAW_B = { axis: "z", at: [-14.0, 82.8, 0], open: 55 };

export const models = [
  {
    id: "claw-v3",
    up: "-y",
    parts: [
      { name: "Cradle + dock + legs", file: claw(3, "Chassis cradle (with dock)"), role: "structure" },
      { name: "Clamp arch (rear)", file: claw(3, "Clamp arch 1 (rear)"), role: "detail" },
      { name: "Clamp arch (front)", file: claw(3, "Clamp arch 2 (front)"), role: "detail" },
      { name: "Claw body", file: claw(3, "Claw body"), role: "actuator" },
      { name: "Front cap", file: claw(2, "Claw front cap"), role: "actuator" },
      { name: "Jaw A (servo side)", file: claw(3, "Jaw A (servo side)"), role: "mechanism", pivot: JAW_A },
      { name: "Jaw B", file: claw(2, "Jaw B"), role: "mechanism", pivot: JAW_B },
    ],
  },
  {
    id: "claw-v2",
    up: "-y",
    parts: [
      { name: "Cradle + dock + legs", file: claw(2, "Chassis cradle (with dock)"), role: "structure" },
      { name: "Clamp arch (rear)", file: claw(2, "Clamp arch 1 (rear)"), role: "detail" },
      { name: "Clamp arch (front)", file: claw(2, "Clamp arch 2 (front)"), role: "detail" },
      { name: "Claw body", file: claw(2, "Claw body"), role: "actuator" },
      { name: "Front cap", file: claw(2, "Claw front cap"), role: "actuator" },
      { name: "Jaw A (servo side)", file: claw(2, "Jaw A (servo side)"), role: "mechanism", pivot: JAW_A },
      { name: "Jaw B", file: claw(2, "Jaw B"), role: "mechanism", pivot: JAW_B },
    ],
  },
  {
    id: "claw-v1",
    up: "-y",
    parts: [
      { name: "Chassis cradle", file: claw(1, "Chassis cradle"), role: "structure" },
      { name: "Claw dock", file: claw(1, "Claw dock (stays on chassis)"), role: "detail" },
      { name: "Clamp arch (rear)", file: claw(1, "Clamp arch 1 (rear)"), role: "detail" },
      { name: "Clamp arch (front)", file: claw(1, "Clamp arch 2 (front)"), role: "detail" },
      { name: "Landing leg (front left)", file: claw(1, "Landing leg (front left)"), role: "structure" },
      { name: "Landing leg (front right)", file: claw(1, "Landing leg (front right)"), role: "structure" },
      { name: "Landing leg (rear left)", file: claw(1, "Landing leg (rear left)"), role: "structure" },
      { name: "Landing leg (rear right)", file: claw(1, "Landing leg (rear right)"), role: "structure" },
      { name: "Claw body", file: claw(1, "Claw body"), role: "actuator" },
      { name: "Front plate", file: claw(1, "Claw front plate"), role: "actuator" },
      { name: "Jaw A (servo side)", file: claw(1, "Jaw A (servo side)"), role: "mechanism", pivot: JAW_A },
      { name: "Jaw B", file: claw(1, "Jaw B"), role: "mechanism", pivot: JAW_B },
    ],
  },
  {
    // Third-party reference geometry of the drone, merged and decimated.
    id: "mavic-reference",
    up: "-y",
    merge: "DJI Mavic Pro (reference model)",
    dir: `${RF}/DJI_MAVIC_PRO_1`,
    role: "reference",
    simplify: 0.08,
  },

  // ── Remote light switch: rack-and-pinion iterations (Onshape exports, Z-up)
  {
    id: "switch-v01",
    up: "z",
    parts: [
      { name: "Back plate", file: `${P}/Light Switch 0.1/Part Studio 1 - Part 1.stl`, role: "structure" },
      { name: "Rack (28 teeth)", file: `${P}/Light Switch 0.1/Part Studio 1 - Rack (28 teeth).stl`, role: "mechanism" },
    ],
  },
  {
    id: "switch-v02",
    up: "z",
    parts: [
      { name: "Frame", file: `${P}/Light Switch 0.2/Part Studio 1 - Part 1.stl`, role: "structure" },
      { name: "Rack (34 teeth)", file: `${P}/Light Switch 0.2/Part Studio 1 - Rack (34 teeth).stl`, role: "mechanism" },
    ],
  },
  {
    id: "switch-v03",
    up: "z",
    parts: [
      { name: "Frame", file: `${P}/Light Switch 0.3/Part Studio 1 - Part 1.stl`, role: "structure" },
      { name: "Rack (34 teeth)", file: `${P}/Light Switch 0.3/Part Studio 1 - Rack (34 teeth).stl`, role: "mechanism" },
    ],
  },
  {
    id: "switch-v04",
    up: "z",
    parts: [
      { name: "Frame", file: `${P}/Light Switch 0.4/Part Studio 1/Part Studio 1 - Part 1.stl`, role: "structure" },
      { name: "Rack (40 teeth)", file: `${P}/Light Switch 0.4/Part Studio 1/Part Studio 1 - Rack (40 teeth).stl`, role: "mechanism" },
    ],
  },
  {
    // The export leaves servo, pinion and adapter unplaced. Their poses below
    // come from the geometry: the servo body fits the frame pocket
    // (y -34.6..-14.6, z -46.8..-6.3) and the 30-tooth module-1 pinion then
    // sits with its pitch circle on the rack's pitch line.
    id: "switch-final",
    up: "z",
    parts: [
      { name: "Frame", file: `${FS}/Assembly 1 - Part 1.stl`, role: "structure" },
      {
        name: "Rack + yoke (40 teeth)",
        file: `${FS}/Assembly 1 - Rack (40 teeth).stl`,
        role: "mechanism",
        slide: { axis: [0, 0, 1], mm: 12 },
      },
      {
        name: "MG995 servo",
        file: `${FS}/Assembly 1 - MG995 v3__MG995 v3.stl`,
        role: "actuator",
        place: (x, y, z) => [y - 60.1, -z - 34.6, -x - 6.3],
      },
      {
        name: "Pinion (30 teeth)",
        file: `${FS}/Assembly 1 - Part 1 (1).stl`,
        role: "mechanism",
        place: (x, y, z) => [z - 270.95, x - 24.5, y + 35 - 16.3],
        pivot: { axis: "z", at: [0, -35, 270.95], open: 45.8 },
      },
      {
        name: "Spline adapter",
        file: `${FS}/Assembly 1 - Part 1 (2).stl`,
        role: "detail",
        place: (x, y, z) => [y - 8.7, z - 24.5, x - 16.3],
      },
    ],
  },

  // ── do_robotics chassis iterations (Fusion exports, Z-up)
  { id: "dorobotics-v1", up: "z", parts: [{ name: "Chassis v1", file: `${P}/do_robotics/Chassis-v1.stl`, role: "structure" }] },
  { id: "dorobotics-v2", up: "y", parts: [{ name: "Chassis v2", file: `${P}/do_robotics/RobotChassis (fixing).stl`, role: "structure" }] },
  { id: "dorobotics-final", up: "z", parts: [{ name: "Final print set", file: `${P}/do_robotics/THE FINAL DO ROBOTICS.stl`, role: "structure" }] },

  // ── Blood-loss monitor: silicone cup molds
  { id: "cup-mold", up: "z", parts: [{ name: "Cup mold", file: `${P}/EGR101/Cup Mold.stl`, role: "structure" }] },
  { id: "cup-mold-1", up: "z", parts: [{ name: "Cup mold 1", file: `${P}/EGR101/Cup Mold1.stl`, role: "mechanism" }] },
  { id: "cup-mold-2", up: "z", parts: [{ name: "Cup mold 2", file: `${P}/EGR101/Cup Mold2.stl`, role: "detail" }] },

  // ── Be With Me desk robot: USB-C remodel print plate
  { id: "bewithme-plate", up: "z", parts: [{ name: "USB-C remodel, print plate", file: `${P}/ForNouna/Nouna-robot-control/be-with-me/AlbertMicro-USBC/AlbertMicro-USBC.stl`, role: "structure" }] },

  // ── Flix drone: frame with resized motor holders, and the fit-test coupon
  { id: "flix-frame", up: "z", parts: [{ name: "Frame, 8.8 mm motor holders", file: `${P}/Flix Drone/flix-frame-1.1-holders-8.8mm.stl`, role: "structure" }] },
  { id: "flix-fit-test", up: "z", parts: [{ name: "Holder fit test, 8.7 to 9.0 mm", file: `${P}/Flix Drone/fit-test/holder-fit-all-4.stl`, role: "mechanism" }] },

  // ── SafeWalk: KiCad board exports, already GLB with component colours
  { id: "safewalk-cuff", glb: `${P}/SafeWalk/hardware/out/safewalk-cuff.glb`, name: "Cuff PCB v0.2" },
  { id: "safewalk-tag", glb: `${P}/SafeWalk/hardware/out/safewalk-tag.glb`, name: "Tag PCB v0.1" },
];

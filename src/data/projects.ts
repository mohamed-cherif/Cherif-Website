import type { ModelView } from "./models";

/* ── Types ─────────────────────────────────────────────────────────────── */

interface MediaBase {
  src: string;
  caption?: string;
  width?: number;
  height?: number;
  fit?: "cover" | "contain";
  /** span two columns in the gallery */
  wide?: boolean;
}
export interface ImageMedia extends MediaBase {
  kind: "image";
  alt: string;
}
export interface VideoMedia extends MediaBase {
  kind: "video"; // silent looping MP4 (H.264)
  poster: string;
}
export type Media = ImageMedia | VideoMedia;

/** Interactive CAD on the breakdown stage. `model` is an id from models.generated.json. */
export interface ModelStage {
  kind: "model";
  model: string;
  reference?: string;
  view?: ModelView;
  title?: string;
}
export type Stage = ModelStage | Media;

/** One beat of the scroll breakdown: a heading, a sentence or two, and what the stage shows. */
export interface Step {
  title: string;
  text: string;
  stage: Stage;
  facts?: [string, string][];
}

/** One row of a photo-and-clip story: media on one side, a short note on the other. */
export interface StoryItem {
  title: string;
  text: string;
  media: Media;
  facts?: [string, string][];
}

/** The main video of a project, shown with player controls. */
export interface LeadFilm {
  video: VideoMedia;
  title?: string;
  points?: string[];
}

/** Interactive demos, implemented in src/components/demos. */
export type DemoKey = "ik-arm" | "wifi-sensing" | "phone-robot";

export interface Iteration {
  label: string;
  date?: string;
  note: string;
  model?: string;
  image?: string;
  view?: ModelView;
  final?: boolean;
}
export interface IterationSet {
  /** section heading; defaults to "Iterations" */
  title?: string;
  reference?: string;
  items: Iteration[];
}

export interface DiagramNode {
  id: string;
  label: string;
  sub?: string;
  col: number;
  row: number;
  kind?: "mcu";
}
export interface DiagramLink {
  from: string;
  to: string;
  label?: string;
  kind?: "signal" | "power" | "radio" | "mech";
  /** nudge a line sideways when two share a path */
  shift?: number;
}
export interface Diagram {
  title: string;
  caption?: string;
  nodes: DiagramNode[];
  links: DiagramLink[];
}

export type ProjectKind = "hardware" | "software";

export interface Project {
  id: string; // also the URL slug: /projects/<id>
  title: string;
  shortTitle?: string; // cards, skills "used in", prev/next links
  tagline: string; // one line
  kind: ProjectKind;
  date: string;
  badge?: string; // small flag on the card
  card: { poster: string; video?: string; contain?: boolean };
  facts: [string, string][]; // title-block strip under the heading
  lead?: LeadFilm; // main video, with controls
  demo?: { key: DemoKey; title: string; note?: string }; // interactive simulation
  steps?: Step[]; // pinned 3D breakdown: only for projects with CAD
  story?: StoryItem[]; // photo-and-clip projects
  iterations?: IterationSet;
  diagrams?: Diagram[];
  gallery?: Media[];
  details?: { heading: string; items: string[] }[]; // collapsed "technical details"
  tech: string[];
  awards?: string[];
  credits?: string[];
  liveUrl?: string;
  pdfUrl?: string;
  priority: number;
}

/* ── Helpers ───────────────────────────────────────────────────────────── */

const img = (src: string, alt: string, width: number, height: number, caption?: string, extra: Partial<ImageMedia> = {}): ImageMedia => ({
  kind: "image",
  src,
  alt,
  width,
  height,
  caption,
  ...extra,
});

/** `base` without extension: base.mp4 plus its poster base.jpg */
const clip = (base: string, width: number, height: number, caption?: string, extra: Partial<VideoMedia> = {}): VideoMedia => ({
  kind: "video",
  src: `${base}.mp4`,
  poster: `${base}.jpg`,
  width,
  height,
  caption,
  ...extra,
});

const CLAW = "/media/drone-claw";
const RESCUE = "/media/calhacks-rescue";
const SWITCH = "/media/remote-light-switch";
const DOR = "/media/do-robotics";
const ARM = "/media/so100-arm";
const IMPAQ = "/media/impaq";
const BLOOD = "/media/blood-loss-monitor";
const FLIX = "/media/flix-drone";
const SAFE = "/media/safewalk";
const BWM = "/media/be-with-me";
const FOCUS = "/media/mustfocus";
const MATH = "/media/math-kinematics";
const PSY = "/media/psybot";
const OLD = "/images/projects";

const JAWS = ["Jaw A (servo side)", "Jaw B"];

/* ── Projects ──────────────────────────────────────────────────────────── */

export const projects: Project[] = [
  {
    id: "drone-claw",
    title: "Drone Claw",
    tagline: "A radio-triggered claw that clamps under a DJI Mavic Pro and carries a payload.",
    kind: "hardware",
    date: "Sep – Nov 2026",
    card: { poster: `${CLAW}/card.jpg`, video: `${CLAW}/card.mp4` },
    facts: [
      ["For", "Rainforest Engineering dung drone"],
      ["Role", "Solo: CAD, print, wiring, firmware"],
      ["Control", "2 × Feather M0, LoRa 915 MHz"],
      ["Actuator", "MG995 servo"],
      ["Power", "3.7 V LiPo + step-up"],
    ],
    lead: {
      video: clip(`${CLAW}/demo-full`, 464, 832, "The full pickup: land, grab, fly, release"),
      title: "One pickup, start to finish",
      points: [
        "Land on the pile with the jaws open.",
        "Flip the switch on the remote: the jaws close.",
        "Lift off and fly to the tray.",
        "Flip it back: the payload drops.",
      ],
    },
    steps: [
      {
        title: "Clamps onto a stock Mavic",
        text: "A printed cradle sits under the drone's belly. Two arches reach over the body and hold it there.",
        stage: { kind: "model", model: "claw-v3", reference: "mavic-reference", title: "Claw v3", view: { ghost: true, zoom: 0.4, az: 52, el: 16 } },
      },
      {
        title: "One print carries everything",
        text: "Cradle, claw dock and four landing legs are a single part. The legs lift the claw clear of the ground.",
        stage: { kind: "model", model: "claw-v3", reference: "mavic-reference", view: { ghost: true, highlight: ["Cradle + dock + legs"], az: 40, el: 22 } },
        facts: [["Envelope", "182 × 128 × 216 mm"]],
      },
      {
        title: "Clamshell jaws",
        text: "Two ribbed jaws swing open 55° on parallel hinges. Gear teeth on both keep them in step.",
        stage: { kind: "model", model: "claw-v3", reference: "mavic-reference", view: { ghost: true, highlight: JAWS, open: 1, az: 8, el: -14, zoom: 1.25 } },
        facts: [["Travel", "55° per jaw"]],
      },
      {
        title: "One servo, both jaws",
        text: "An MG995 in the claw body drives jaw A. Jaw B follows through the gear mesh.",
        stage: { kind: "model", model: "claw-v3", reference: "mavic-reference", view: { highlight: ["Claw body", "Front cap", ...JAWS], open: 0.5, az: 150, el: 6, zoom: 1.2, ghost: true } },
      },
      {
        title: "Seven printed parts",
        text: "Cradle, two arches, claw body, cap and two jaws. Everything else is fasteners.",
        stage: { kind: "model", model: "claw-v3", reference: "mavic-reference", view: { ghost: true, explode: 1, az: 42, el: 16, zoom: 0.82 } },
      },
      {
        title: "Receiver on board",
        text: "A Feather M0 LoRa with a servo driver listens for the remote. A step-up converter feeds the servo from a single 3.7 V cell.",
        stage: img(`${CLAW}/photo-rear-electronics.jpg`, "Rear of the drone: Feather board with servo driver, step-up converter and the black servo on the orange printed frame", 1928, 2560),
      },
    ],
    iterations: {
      reference: "mavic-reference",
      items: [
        { label: "V1", date: "Sep 18", note: "Separate cradle, dock and four bolt-on legs. 12 printed parts. First flights.", model: "claw-v1", view: { ghost: true, zoom: 0.62, az: 38, el: 14 } },
        { label: "V2", date: "Oct 7", note: "Cradle, dock and legs merged into one print. Clamp arches widened from 85 to 94 mm. Front plate becomes a full cap.", model: "claw-v2", view: { ghost: true, zoom: 0.62, az: 38, el: 14 } },
        { label: "V3", date: "Oct 8", note: "Arches reach further around the body, servo-side jaw reworked. 7 parts.", model: "claw-v3", view: { ghost: true, zoom: 0.62, az: 38, el: 14, open: 0.6 }, final: true },
      ],
    },
    diagrams: [
      {
        title: "Remote and receiver",
        caption: "Both boards run from single 3.7 V LiPo cells. The remote sends one character per switch change; the receiver maps it to a servo pulse.",
        nodes: [
          { id: "sw", label: "Toggle switch", sub: "Pin 6, pull-up", col: 0, row: 0 },
          { id: "tx", label: "Feather M0 LoRa", sub: "Remote", col: 1, row: 0, kind: "mcu" },
          { id: "rx", label: "Feather M0 LoRa", sub: "On the drone", col: 2, row: 0, kind: "mcu" },
          { id: "drv", label: "Servo driver", sub: "PCA9685, ch 7", col: 3, row: 0 },
          { id: "servo", label: "MG995 servo", sub: "1000–1500 µs", col: 4, row: 0 },
          { id: "jaws", label: "Jaws", sub: "Geared pair", col: 5, row: 0 },
          { id: "b1", label: "LiPo 3.7 V", col: 1, row: 1 },
          { id: "b2", label: "LiPo 3.7 V", col: 2, row: 1 },
          { id: "boost", label: "Step-up converter", sub: "Servo rail", col: 3, row: 1 },
        ],
        links: [
          { from: "sw", to: "tx", label: "on / off" },
          { from: "tx", to: "rx", label: "915 MHz", kind: "radio" },
          { from: "rx", to: "drv", label: "I2C" },
          { from: "drv", to: "servo", label: "PWM 50 Hz" },
          { from: "servo", to: "jaws", label: "horn", kind: "mech" },
          { from: "b1", to: "tx", kind: "power" },
          { from: "b2", to: "rx", kind: "power" },
          { from: "b2", to: "boost", label: "3.7 V", kind: "power" },
          { from: "boost", to: "drv", label: "V+", kind: "power" },
        ],
      },
    ],
    gallery: [
      img(`${CLAW}/photo-side-view.jpg`, "Side view of the Mavic Pro standing on the orange printed legs with the claw underneath", 2560, 1928, "V1 on the drone: bolt-on legs, claw underneath", { wide: true }),
      img(`${CLAW}/photo-front-jaws-gears.jpg`, "Front view of the claw showing the two jaws and their gear teeth", 2560, 1928, "Jaws and gear mesh from the front"),
      clip(`${CLAW}/demo-v1-flight`, 540, 960, "V1 first flights"),
      clip(`${CLAW}/clip-grab-from-pile`, 464, 832, "Grab: jaws close on the pile"),
      clip(`${CLAW}/clip-drop-into-tray`, 464, 832, "Release into the tray"),
      clip(`${CLAW}/clip-jaws-open-descent`, 464, 832, "Descending onto the pile with jaws open"),
      clip(`${CLAW}/clip-v1-takeoff-flyby`, 540, 960, "V1 first flights: takeoff and pass"),
      clip(`${CLAW}/clip-v1-hover-and-land`, 540, 960, "V1 landing on the printed legs"),
      img(`${CLAW}/photo-electronics-detail.jpg`, "Close-up of the Feather board, servo driver and step-up converter", 1900, 1000, "Feather, servo driver, step-up converter", { wide: true }),
      img(`${CLAW}/render-open.png`, "CAD render of the claw open under the drone", 744, 460, "CAD: open 55°"),
      img(`${CLAW}/render-closed.png`, "CAD render of the claw closed under the drone", 744, 460, "CAD: closed"),
    ],
    details: [
      {
        heading: "Mechanical",
        items: [
          "Designed in Onshape around a full-size Mavic Pro model. A FeatureScript generates the parametric frame (140 × 86 mm default, M3 clearance holes) with a rotor keep-out check.",
          "Fit gauges for the arch and lower U were printed first, so clamp fit was tuned on small coupons instead of full prints.",
          "V1 used four separate legs and a detachable dock; V2 merged them into the cradle to cut fasteners and part count from 12 to 7.",
        ],
      },
      {
        heading: "Electronics and firmware",
        items: [
          "Two Adafruit Feather M0 boards with RFM95 LoRa radios, RadioHead RH_RF95 at 915.0 MHz, 23 dBm transmit power.",
          "Remote: switch on pin 6 with internal pull-up and 50 ms debounce. Sends \"l\" to close and \"0\" to open.",
          "Receiver: PCA9685 servo driver over I2C, channel 7 at 50 Hz. 1500 µs open, 1000 µs closed. Opens on boot.",
          "The servo runs from a step-up converter off the same 3.7 V cell as the Feather.",
        ],
      },
    ],
    tech: ["Onshape", "FDM printing", "Feather M0", "LoRa", "MG995", "C++"],
    credits: ["The grey drone in the 3D views is a third-party reference model of the DJI Mavic Pro, used only for fit."],
    priority: 0,
  },

  {
    id: "calhacks-rescue",
    title: "WiFi Search and Rescue Robots",
    shortTitle: "WiFi Search & Rescue",
    tagline: "WiFi signals find a person in the room. A robot drives to them.",
    kind: "hardware",
    date: "Oct 2026",
    card: { poster: `${RESCUE}/card.jpg`, video: `${RESCUE}/card.mp4` },
    facts: [
      ["Event", "CalHacks 13.0"],
      ["Sensing", "WiFi CSI, 4 × ESP32-C5"],
      ["Robot", "3-wheel omni, Raspberry Pi 4"],
      ["Detection", "98–99% on a labelled recording"],
      ["Position", "±0.5–1 m"],
    ],
    lead: {
      video: clip(`${RESCUE}/demo-full`, 1920, 1080, "The demo: the robot finds and follows a person, then plans around an obstacle"),
      title: "No camera looks at people. The robot gets a position from WiFi alone and drives there.",
    },
    demo: {
      key: "wifi-sensing",
      title: "Try it: move the person",
      note: "Links that pass near the person get disturbed. Stacking them gives a heatmap, the heatmap gives a position, and the robot plans a path to it.",
    },
    story: [
      {
        title: "Four boards, one sensing field",
        text: "ESP32-C5 boards at the corners measure how a body disturbs the WiFi between them: about 47 CSI frames a second across 57 subcarriers.",
        media: img(`${RESCUE}/still-demo-wide.jpg`, "Wide shot of the demo area with the operator laptop in front and the robot on the floor", 1920, 1080),
        facts: [["Link", "ESP-NOW, 2.4 GHz ch 6"]],
      },
      {
        title: "From signal to position",
        text: "The laptop turns the links into a tomography heatmap and tracks the result with a Kalman filter. An overhead camera tracks only the robot.",
        media: clip(`${RESCUE}/clip-demo-operator`, 1920, 1080, "Operator view on the laptop while a person walks with the robot trailing"),
      },
      {
        title: "Plans around walls",
        text: "A* on a 5 cm grid with 13 cm clearance. The map on the left is the planner's own view of the same run.",
        media: clip(`${RESCUE}/clip-path-planning-split`, 1616, 1080, "Split screen: terminal map beside the robot driving around an obstacle"),
      },
      {
        title: "Target reached",
        text: "Sentry, dispatch, verify, found, return: one state machine runs the whole mission.",
        media: clip(`${RESCUE}/clip-path-planning-terminal`, 1920, 1824, "Terminal map of the robot routing around a wall to its target"),
      },
      {
        title: "The robot",
        text: "Three omni wheels under a shell, with a colour-dot top for the overhead tracker. A Raspberry Pi 4 took over the motors after the first controller died mid-hackathon.",
        media: img(`${RESCUE}/still-robot-bare-chassis.jpg`, "The robot without its shell", 608, 760),
      },
    ],
    diagrams: [
      {
        title: "Data path",
        nodes: [
          { id: "nodes", label: "4 × ESP32-C5", sub: "CSI nodes", col: 0, row: 0 },
          { id: "gw", label: "Gateway board", sub: "On USB", col: 1, row: 0 },
          { id: "srv", label: "Laptop server", sub: "Heatmap + Kalman", col: 2, row: 0, kind: "mcu" },
          { id: "pi", label: "Raspberry Pi 4", sub: "On the robot", col: 3, row: 0 },
          { id: "mot", label: "3 omni wheels", sub: "Motor driver", col: 4, row: 0 },
          { id: "cam", label: "Overhead camera", sub: "Robot pose only", col: 2, row: 1 },
        ],
        links: [
          { from: "nodes", to: "gw", label: "ESP-NOW", kind: "radio" },
          { from: "gw", to: "srv", label: "USB" },
          { from: "srv", to: "pi", label: "UDP 4210", kind: "radio" },
          { from: "pi", to: "mot", label: "GPIO PWM" },
          { from: "cam", to: "srv", label: "pose" },
        ],
      },
    ],
    gallery: [
      img(`${RESCUE}/still-robot-closeup.jpg`, "Close-up of the robot's black shell and colour-dot top", 392, 396, "Shell with colour-dot tracking pattern"),
      img(`${RESCUE}/still-operator-view.jpg`, "Operator view: overhead camera with zone border and WiFi estimate circle", 624, 390, "Operator view: zone and WiFi estimate"),
      img(`${RESCUE}/fig-tradeoff.png`, "Charts of wall loss and range resolution against frequency", 1474, 1672, "Follow-up study: why 20 MHz WiFi caps accuracy near 0.5 m", { fit: "contain" }),
      img(`${RESCUE}/fig-rubble-frequency.png`, "Charts of breathing-signal strength through concrete against frequency", 1474, 1760, "Follow-up study: best radar band through rubble", { fit: "contain" }),
    ],
    details: [
      {
        heading: "How it works",
        items: [
          "Board firmware in C on ESP-IDF; a Python server computes a per-link motion detector, a radio-tomography heatmap and a Kalman track, served to a 2D dashboard and a 3D view.",
          "Robot pipeline: OpenCV colour-pattern tracking, floor homography, A* planning, a mission state machine with a follow mode, and a UDP motor driver with a 300 ms dead-man stop.",
          "Measured on a labelled recording: 98–99% detection of a person moving inside the area, 1–4% false alarms with nobody near.",
        ],
      },
      {
        heading: "Limits",
        items: [
          "Position is good to roughly half a metre to a metre. Our write-up after the event shows the limit is the 20 MHz bandwidth, not the algorithm, and points to 60 GHz radar as the next step.",
        ],
      },
    ],
    tech: ["ESP32-C5", "WiFi CSI", "Raspberry Pi", "Python", "OpenCV", "A*"],
    credits: ["Team project built at CalHacks 13.0. The board firmware builds on DSP code from the open-source RuView project."],
    priority: 1,
  },

  {
    id: "so100-arm",
    title: "SO-100 Robotic Arm: Agent and Vision Pick-and-Place",
    shortTitle: "SO-100 Robotic Arm",
    tagline: "A robot arm that picks objects up two ways: a Claude agent over MCP, and my own vision pipeline.",
    kind: "hardware",
    date: "Aug – Sep 2026",
    card: { poster: `${ARM}/card.jpg`, video: `${ARM}/card.mp4` },
    facts: [
      ["Role", "Self-directed"],
      ["Agent", "Claude over MCP, zero-shot"],
      ["Vision", "YOLOE-seg + ArUco servoing"],
      ["Kinematics", "Closed-form IK, 300 sim trials"],
    ],
    lead: {
      video: clip(`${ARM}/clip-cube-drop-closeup`, 1600, 900, "The gripper holds a foam cube over a paper cup and drops it in"),
      title: "A Claude agent sees the scene and moves the gripper through an MCP tool. No task-specific training.",
    },
    story: [
      {
        title: "Moves in millimetres",
        text: "The agent asks for gripper moves in mm. Camera calibration and an IK loop turn each one into joint commands.",
        media: img(`${OLD}/so100-cube-demo.gif`, "The arm lowers the cube into the cup and lets go", 510, 340),
      },
      {
        title: "The second way: pure vision",
        text: "YOLOE-seg finds the pens. An ArUco tag on the gripper closes the loop and servos it onto the target.",
        media: img(`${ARM}/photo-detector-window-closeup.jpg`, "Detector window: two pens outlined with confidence scores and orientation lines", 1076, 938),
        facts: [["Detections", "0.85 and 0.80 confidence"]],
      },
      {
        title: "Test bench",
        text: "Detector window, terminal and arm side by side while tuning the pipeline.",
        media: img(`${OLD}/so100-arm-vision.jpeg`, "Laptop running the detector window next to the arm, pens and cup", 1205, 1600),
      },
    ],
    diagrams: [
      {
        title: "Agent control loop",
        nodes: [
          { id: "cam", label: "Camera", sub: "Calibrated", col: 0, row: 0 },
          { id: "agent", label: "Claude agent", sub: "Target estimate", col: 1, row: 0, kind: "mcu" },
          { id: "tool", label: "MCP move tool", sub: "mm moves", col: 2, row: 0 },
          { id: "ik", label: "IK control loop", sub: "Joint commands", col: 3, row: 0 },
          { id: "arm", label: "SO-100 arm", sub: "Servo bus", col: 4, row: 0 },
        ],
        links: [
          { from: "cam", to: "agent", label: "image" },
          { from: "agent", to: "tool", label: "moves" },
          { from: "tool", to: "ik" },
          { from: "ik", to: "arm", label: "angles" },
        ],
      },
    ],
    gallery: [
      clip(`${ARM}/clip-cube-drop-into-cup`, 1080, 1920, "Full scene: arm, cup and the agent's terminal"),
      img(`${OLD}/so100-vision-detector.jpeg`, "Debug view with both pens detected", 965, 725, "Debug view: centre point and orientation per pen"),
    ],
    details: [
      {
        heading: "Kinematics",
        items: [
          "Derived the arm's rotation matrices and homogeneous transforms from first principles.",
          "Closed-form planar IK that uses the arm's parallel joint geometry: once the base is set, shoulder, elbow and wrist move in one plane.",
          "Verified against forward kinematics over 300 simulated round-trip trials with near-zero residual. Simulation only, not tested on hardware.",
        ],
      },
      {
        heading: "Two control approaches",
        items: [
          "Agent: Claude estimates the target from the camera image; calibration maps it into the workspace; an MCP tool takes gripper moves in millimetres. Repeated cube-into-cup success with no task-specific training.",
          "Vision: YOLOE-seg segments the objects, an ArUco marker gives the gripper position in the same image, and visual servoing drives the gripper onto the pen.",
        ],
      },
    ],
    tech: ["Claude + MCP", "YOLOE-seg", "OpenCV / ArUco", "Inverse Kinematics", "LeRobot", "PyTorch", "Python"],
    priority: 2,
  },

  {
    id: "remote-light-switch",
    title: "Remote Light Switch",
    tagline: "Flips an ordinary wall switch from my phone with a servo and a printed rack and pinion.",
    kind: "hardware",
    date: "Sep 2026",
    card: { poster: `${SWITCH}/card.jpg`, video: `${SWITCH}/card.mp4` },
    facts: [
      ["Role", "Solo"],
      ["Controller", "ESP32 web server"],
      ["Actuator", "MG995 servo"],
      ["Drive", "30T pinion on a 40T rack"],
      ["Iterations", "5 in 4 days"],
    ],
    lead: {
      video: clip(`${SWITCH}/clip-phone-tap-lights-off-and-on`, 720, 1280, "A thumb taps the phone page; the mechanism flips the switch off and on"),
      title: "Tap, and the room goes dark",
      points: [
        "The ESP32 serves a two-button page over Wi-Fi.",
        "A tap sends one HTTP request.",
        "The servo drives the rack and the yoke flips both toggles.",
        "No app, no rewiring.",
      ],
    },
    steps: [
      {
        title: "Mounts on the plate's own screws",
        text: "The frame goes over the existing switch plate. Mains wiring is never touched.",
        stage: { kind: "model", model: "switch-final", title: "Final assembly", view: { az: -32, el: 14 } },
        facts: [["Frame", "92 × 133 × 39 mm"]],
      },
      {
        title: "A yoke for both toggles",
        text: "An H-shaped yoke on the rack captures both switches and pushes them together.",
        stage: { kind: "model", model: "switch-final", view: { highlight: ["Rack + yoke (40 teeth)"], open: 1, az: -20, el: 10 } },
      },
      {
        title: "Rotation into a straight push",
        text: "The servo turns a 30-tooth pinion. The rack turns that into vertical travel.",
        stage: { kind: "model", model: "switch-final", view: { highlight: ["Pinion (30 teeth)", "MG995 servo", "Spline adapter", "Rack + yoke (40 teeth)"], open: 0.5, az: -62, el: 8, zoom: 1.15 } },
        facts: [["Module", "1 mm, 15 mm pitch radius"]],
      },
      {
        title: "Five parts",
        text: "Frame, rack, pinion and a splined adapter that grips the MG995's 25-tooth output shaft.",
        stage: { kind: "model", model: "switch-final", view: { explode: 1, az: -40, el: 16, zoom: 0.8 } },
      },
      {
        title: "On the wall",
        text: "Printed in orange, installed over a double toggle plate.",
        stage: img(`${SWITCH}/photo-servo-rack-and-pinion-on-wall-switch.jpg`, "The printed mechanism mounted over a double wall switch, servo on the left", 1928, 2560),
      },
    ],
    iterations: {
      items: [
        { label: "0.1", date: "Sep 7", note: "Flat back plate and a 28-tooth rack with the H yoke. Proves the yoke fits the toggles.", model: "switch-v01", view: { az: -30, el: 14 } },
        { label: "0.2", date: "Sep 7", note: "Adds a servo bracket to the frame. Rack grows to 34 teeth for more travel.", model: "switch-v02", view: { az: -30, el: 14 } },
        { label: "0.3", date: "Sep 8", note: "Frame revision, same 34-tooth rack.", model: "switch-v03", view: { az: -30, el: 14 } },
        { label: "0.4", date: "Sep 8", note: "Rack lengthened to 40 teeth. Custom splined pinion for the MG995 shaft.", model: "switch-v04", view: { az: -30, el: 14 } },
        { label: "Final", date: "Sep 10", note: "Enclosed servo pocket, larger frame, full assembly with servo, pinion and adapter.", model: "switch-final", view: { az: -32, el: 14, open: 0.6 }, final: true },
      ],
    },
    diagrams: [
      {
        title: "Control path",
        nodes: [
          { id: "phone", label: "Phone browser", sub: "Lights on / off", col: 0, row: 0 },
          { id: "esp", label: "ESP32", sub: "Web server :80", col: 1, row: 0, kind: "mcu" },
          { id: "servo", label: "MG995 servo", sub: "GPIO 18, 50 Hz", col: 2, row: 0 },
          { id: "rack", label: "Rack + yoke", sub: "30T on 40T", col: 3, row: 0 },
          { id: "sw", label: "Wall switch", sub: "Double toggle", col: 4, row: 0 },
        ],
        links: [
          { from: "phone", to: "esp", label: "Wi-Fi", kind: "radio" },
          { from: "esp", to: "servo", label: "PWM" },
          { from: "servo", to: "rack", label: "pinion", kind: "mech" },
          { from: "rack", to: "sw", label: "push", kind: "mech" },
        ],
      },
    ],
    gallery: [img(`${OLD}/light-switch-demo.gif`, "Lights off then on from the phone", 340, 604, "Lights off, lights on")],
    details: [
      {
        heading: "Firmware",
        items: [
          "The ESP32 joins Wi-Fi and serves one page, \"Wireless MG995 Control\", with two buttons.",
          "GET /0 and GET /180 drive the servo to one end for 500 ms, then back to 90°.",
          "Servo on GPIO 18 at 50 Hz with 500–2400 µs pulses (ESP32Servo).",
        ],
      },
      {
        heading: "Mechanism",
        items: [
          "Designed in Onshape and printed on an FDM printer.",
          "Rack length went 28 → 34 → 40 teeth across the iterations.",
        ],
      },
    ],
    tech: ["ESP32", "Onshape", "FDM printing", "MG995", "Rack & pinion", "Wi-Fi"],
    priority: 3,
  },

  {
    id: "do-robotics",
    title: "do_robotics",
    tagline: "A phone becomes the robot's brain: on-device vision drives an ESP32 chassis I designed around it.",
    kind: "hardware",
    date: "Feb – May 2026",
    card: { poster: `${DOR}/card.jpg`, video: `${DOR}/card.mp4` },
    facts: [
      ["Role", "Solo: app, chassis, firmware"],
      ["Brain", "Phone, TFLite on-device"],
      ["Robot", "ESP32, 2 motors, battery"],
      ["Link", "BLE / USB serial, 5-byte protocol"],
    ],
    lead: {
      video: clip(`${DOR}/demo-full`, 1920, 1080, "The robot follows a bottle around the floor"),
      title: "The phone runs the detector and steers. The robot is only an ESP32, two motors and a battery.",
    },
    demo: {
      key: "phone-robot",
      title: "Try it: move the bottle",
      note: "What the phone sees becomes two motor values, and each value travels to the ESP32 as a five-byte frame.",
    },
    story: [
      {
        title: "The phone rides upright",
        text: "Camera forward, screen back. Vision, compass, microphone and IMU all come from the phone.",
        media: img(`${DOR}/photo-phone-robot-facing-bottle.jpg`, "The robot with a phone mounted upright, facing a bottle", 1600, 1204),
      },
      {
        title: "Five bytes per command",
        text: "Header, command, pin, value, checksum. The firmware only drives outputs and stops everything if the heartbeat goes quiet for 2 s.",
        media: img(`${DOR}/photo-phone-robot-rear-wiring.jpg`, "Rear of the robot showing the ESP32 and wiring", 1204, 1600),
        facts: [["Frame", "[0xAA][CMD][PIN][VALUE][CK]"]],
      },
      {
        title: "Tracks across the floor",
        text: "Detection takes roughly 40–50 ms a frame on a Pixel 9.",
        media: clip(`${DOR}/clip-follows-bottle-across-floor`, 1440, 810, "The robot follows a bottle as it is moved across the floor"),
      },
    ],
    iterations: {
      items: [
        { label: "V1", date: "Mar 6", note: "Single flat body, 154 × 173 mm, 4 mm plate.", model: "dorobotics-v1", view: { az: 35, el: 30 } },
        { label: "V2", date: "Mar 28", note: "Longer 210 mm deck with an upright for the phone.", model: "dorobotics-v2", view: { az: 35, el: 28 } },
        { label: "Final", date: "Mar 30", note: "Full print set: deck with upright, two sliders and eight small plates.", model: "dorobotics-final", view: { az: 35, el: 28 }, final: true },
      ],
    },
    diagrams: [
      {
        title: "Phone as controller",
        nodes: [
          { id: "phone", label: "Phone", sub: "Camera + TFLite", col: 0, row: 0, kind: "mcu" },
          { id: "esp", label: "ESP32", sub: "Output driver", col: 1, row: 0 },
          { id: "drv", label: "Motor driver", col: 2, row: 0 },
          { id: "mot", label: "2 × DC motor", col: 3, row: 0 },
          { id: "bat", label: "Battery", col: 2, row: 1 },
        ],
        links: [
          { from: "phone", to: "esp", label: "BLE / USB", kind: "radio" },
          { from: "esp", to: "drv", label: "PWM" },
          { from: "drv", to: "mot", kind: "power" },
          { from: "bat", to: "drv", kind: "power" },
        ],
      },
    ],
    gallery: [
      img("/media/chassis-maker/render-chassis-assembly-iso.png", "Render of a generated robot chassis with phone, wheels and boards", 1400, 1000, "Chassis Maker: my web tool that generates a printable phone-robot chassis", { wide: true, fit: "contain" }),
    ],
    details: [
      {
        heading: "App",
        items: [
          "Flutter app for Android. Block-based visual scripting plus a small Python-like interpreter for behaviours.",
          "EfficientDet-Lite0 object detection in TFLite, 80 classes, on-device.",
          "Speech-to-text voice commands and five built-in tutorial projects.",
        ],
      },
      {
        heading: "Firmware",
        items: [
          "ESP32 firmware exposes pins over BLE (Nordic UART), Wi-Fi TCP and USB serial at 115200 baud.",
          "Commands: digital write, analog write, pin mode, servo write, stop all, heartbeat. Checksum is the byte sum mod 256.",
          "Ports for Arduino Uno, Mega and Raspberry Pi Pico 2 W.",
        ],
      },
    ],
    tech: ["Flutter", "ESP32", "TFLite", "Fusion 360", "FDM printing", "BLE", "Dart"],
    priority: 4,
  },

  {
    id: "blood-loss-monitor",
    title: "Blood Loss Monitoring Device for PAS Surgery",
    shortTitle: "Blood Loss Monitor",
    tagline: "Collects, vacuums and weighs blood loss in real time during placenta accreta surgery.",
    kind: "hardware",
    date: "Aug – Dec 2025",
    badge: "Design Expo",
    card: { poster: `${BLOOD}/photo-prototype-scale-with-suction-canister.jpg` },
    facts: [
      ["Course", "Duke EGR 101, team of 4"],
      ["With", "Duke Health OBGYN"],
      ["Accuracy", "Within 5 mL, 250–1000 mL"],
      ["Alert", "Every 250 mL"],
      ["Status", "Validated prototype"],
    ],
    story: [
      {
        title: "A gap in the operating room",
        text: "In PAS surgery, blood leaving through the vagina goes unmeasured. This device collects it and weighs it live.",
        media: img(`${BLOOD}/photo-prototype-scale-with-suction-canister.jpg`, "The prototype: suction canister on the load-cell scale with its display", 2560, 2490),
      },
      {
        title: "Three parts",
        text: "A silicone cup collects. A pump and vacuum line move the fluid. An Arduino scale weighs the canister.",
        media: img(`${BLOOD}/poster-crop-design-solution-three-components.jpg`, "Poster panel showing the three components of the design", 2560, 1963),
      },
      {
        title: "Weight becomes volume",
        text: "A load cell under the canister feeds an Arduino. An LCD shows the running total and a buzzer sounds at each 250 mL.",
        media: img(`${BLOOD}/poster-crop-scale-load-cell-holder-labelled.jpg`, "Labelled view of the scale, load cell and canister holder", 2360, 1330),
      },
      {
        title: "Tested against the criteria",
        text: "Under simulated surgical conditions it passed every design criterion, within 5 mL across 250–1000 mL.",
        media: img(`${BLOOD}/poster-crop-design-criteria-testing-table.jpg`, "Table of design criteria and test results", 2560, 1494),
        facts: [["Error", "< 0.7% relative"]],
      },
    ],
    iterations: {
      title: "3D: the cup molds",
      items: [
        { label: "Cup mold", note: "Printed mold for casting the silicone collection cup. 85 × 113 × 89 mm.", model: "cup-mold", view: { az: 40, el: 24 } },
        { label: "Mold part 1", note: "48 × 48 × 70 mm.", model: "cup-mold-1", view: { az: 40, el: 24 } },
        { label: "Mold part 2", note: "56 × 56 × 70 mm.", model: "cup-mold-2", view: { az: 40, el: 24 } },
      ],
    },
    diagrams: [
      {
        title: "Measurement chain",
        nodes: [
          { id: "cup", label: "Silicone cup", sub: "Collection", col: 0, row: 0 },
          { id: "pump", label: "Pump + vacuum", sub: "Medical tubing", col: 1, row: 0 },
          { id: "can", label: "Canister", sub: "On the scale", col: 2, row: 0 },
          { id: "cell", label: "Load cell", col: 2, row: 1 },
          { id: "ard", label: "Arduino", sub: "Weight to volume", col: 3, row: 1, kind: "mcu" },
          { id: "lcd", label: "LCD + buzzer", sub: "Alert per 250 mL", col: 4, row: 1 },
        ],
        links: [
          { from: "cup", to: "pump", label: "fluid", kind: "mech" },
          { from: "pump", to: "can", label: "fluid", kind: "mech" },
          { from: "can", to: "cell", label: "weight", kind: "mech" },
          { from: "cell", to: "ard", label: "signal" },
          { from: "ard", to: "lcd" },
        ],
      },
    ],
    gallery: [
      img(`${BLOOD}/poster-crop-final-solution-labelled.jpg`, "Labelled photo of the final solution", 2360, 1900, "Final solution, labelled", { wide: true }),
      img(`${BLOOD}/poster-crop-modified-menstrual-cups.jpg`, "Modified menstrual cups used as collection adapters", 1970, 1340, "Cup adapters"),
      img(`${BLOOD}/poster-crop-pump-and-vacuum-attachments.jpg`, "Pump and vacuum attachments", 1970, 1830, "Pump and vacuum attachments"),
      img(`${BLOOD}/poster-full.jpg`, "The full project poster", 3000, 3000, "Design Expo poster", { fit: "contain" }),
    ],
    details: [
      {
        heading: "My part",
        items: [
          "Designed the fluid-collection cup and pumping mechanism in Onshape; silicone-molded the cup as an adapter that fits standard medical tubing.",
          "Designed and 3D-printed the canister holder and an adjustable pump attachment.",
          "Wired the Arduino load-cell scale with LCD and audible alerts at 0.25 L intervals.",
        ],
      },
      {
        heading: "Validation",
        items: [
          "Validated to within 5 mL absolute error (< 0.7% relative) across 250–1000 mL.",
          "Reviewed and approved by a Duke Hospital clinician, who advised the team to pursue clinical certification.",
          "Presented at the Duke Pratt Design Expo 2025. It is a validated prototype and has not been used clinically.",
        ],
      },
    ],
    tech: ["Onshape", "Silicone molding", "Arduino", "Load cell", "FDM printing"],
    awards: ["Duke Pratt Design Expo 2025"],
    priority: 5,
  },

  {
    id: "impaq",
    title: "ImpaQ",
    tagline: "A mouthguard that measures head impacts and sends risk estimates to a phone.",
    kind: "hardware",
    date: "Jan 2026",
    card: { poster: `${IMPAQ}/photo-mouthguard-electronics-closeup-in-hand.jpg` },
    facts: [
      ["Board", "Seeed XIAO ESP32-C3"],
      ["Sensor", "3-axis accelerometer"],
      ["Link", "Bluetooth LE"],
      ["App", "Flutter, live g-force chart"],
    ],
    story: [
      {
        title: "Electronics inside a mouthguard",
        text: "A XIAO board and an accelerometer breakout, hand-sealed into a mouthguard shell.",
        media: img(`${IMPAQ}/photo-mouthguard-electronics-closeup-in-hand.jpg`, "A hand holding the mouthguard with the XIAO board and sensor sealed inside", 2560, 1928),
      },
      {
        title: "Breadboard first",
        text: "The sensing electronics started on a breadboard: XIAO board, sensor breakout, jumper wires.",
        media: img(`${IMPAQ}/photo-breadboard-xiao-esp32c3-and-sensor-breakout.jpg`, "Breadboard with the XIAO ESP32-C3 and the sensor breakout", 1928, 2560),
      },
      {
        title: "The Bluetooth that would not connect",
        text: "With a multimeter I traced dropouts to the onboard regulator starving the radio, and replaced it with one sized for the load.",
        media: img(`${IMPAQ}/photo-mouthguard-wiring-and-9v-battery-top-view.jpg`, "Top view of the mouthguard wired to a 9 V battery on the bench", 1928, 2560),
      },
      {
        title: "From g-force to risk",
        text: "Each packet carries x, y, z and magnitude. The app separates jaw movement from real impacts and scores the risk.",
        media: img(`${IMPAQ}/photo-mouthguard-held-over-bench.jpg`, "The finished mouthguard held over the electronics bench", 1928, 2560),
        facts: [
          ["Packet", "16 bytes: 4 floats"],
          ["Tiers", "3 g, 5 g, 10 g"],
        ],
      },
    ],
    diagrams: [
      {
        title: "Signal path",
        nodes: [
          { id: "acc", label: "Accelerometer", sub: "x, y, z", col: 0, row: 0 },
          { id: "mcu", label: "XIAO ESP32-C3", sub: "In the mouthguard", col: 1, row: 0, kind: "mcu" },
          { id: "app", label: "Flutter app", sub: "Chart + risk score", col: 2, row: 0 },
          { id: "bat", label: "Battery", col: 0, row: 1 },
          { id: "reg", label: "Regulator", sub: "Resized for BLE", col: 1, row: 1 },
        ],
        links: [
          { from: "acc", to: "mcu", label: "g" },
          { from: "mcu", to: "app", label: "BLE notify", kind: "radio" },
          { from: "bat", to: "reg", kind: "power" },
          { from: "reg", to: "mcu", kind: "power" },
        ],
      },
    ],
    gallery: [
      img(`${IMPAQ}/photo-mouthguard-connected-to-9v-battery.jpg`, "The mouthguard connected to a 9 V battery", 2560, 1928, "Powered from a 9 V battery during tests"),
    ],
    details: [
      {
        heading: "What I built",
        items: [
          "Wearable impact sensor (ESP32, accelerometer) with a Flutter app for real-time TBI-risk monitoring.",
          "Hand-fabricated silicone enclosure for the electronics in a lab setting.",
          "Signal processing to tell regular jaw activity from dangerous head impacts.",
          "Diagnosed a Bluetooth failure on the Seeed Studio board: isolated insufficient power from the onboard regulator with a multimeter and replaced it with one sized for the Bluetooth module.",
        ],
      },
      {
        heading: "App logic",
        items: [
          "Impact tiers at 3 g, 5 g and 10 g, with cumulative alerts as counts build up.",
          "Concussion-risk estimate from a logistic curve centred on 95 g, after published mild-TBI risk work.",
        ],
      },
    ],
    tech: ["ESP32", "C++", "Flutter", "BLE", "Seeed Studio", "Accelerometer", "Bench debugging"],
    priority: 6,
  },

  {
    id: "flix-drone",
    title: "Flix Drone",
    tagline: "A palm-size ESP32 quadcopter built from the open-source Flix design, with my own frame fit work.",
    kind: "hardware",
    date: "Oct 2026 – now",
    badge: "In progress",
    card: { poster: `${FLIX}/card.jpg`, video: `${FLIX}/card.mp4` },
    facts: [
      ["Design", "Flix by Oleg Kalachev"],
      ["Brain", "ESP32 Mini"],
      ["IMU", "GY-91 over SPI"],
      ["Motors", "4 × 8520 brushed"],
      ["Power", "1S LiPo"],
    ],
    lead: {
      video: clip(`${FLIX}/clip-flix-takeoff`, 720, 800, "The small quadcopter lifts off the carpet"),
      title: "First hop",
      points: ["Same schematic and parts as the open-source Flix.", "Built, flashed and flown from a phone."],
    },
    iterations: {
      title: "3D: my frame work",
      items: [
        { label: "Frame", note: "Flix 1.1 frame with the motor-holder bores resized to fit my motors. 96 × 96 × 18 mm.", model: "flix-frame", view: { az: 35, el: 32 } },
        { label: "Fit coupon", note: "Four holders from 8.7 to 9.0 mm in 0.1 mm steps: print once, pick the bore that fits.", model: "flix-fit-test", view: { az: 50, el: 26 } },
      ],
    },
    story: [
      {
        title: "Next: camera position hold",
        text: "An overhead camera and AprilTags to hold position and click-to-fly. Running in simulation so far, not yet on the real drone.",
        media: clip(`${FLIX}/sim-clip-position-hold`, 1280, 720, "Simulation: takeoff and three clicked setpoints"),
      },
    ],
    diagrams: [
      {
        title: "Flight electronics (Flix design)",
        nodes: [
          { id: "imu", label: "GY-91 IMU", sub: "Gyro + accel", col: 0, row: 0 },
          { id: "esp", label: "ESP32 Mini", sub: "Flight controller", col: 1, row: 0, kind: "mcu" },
          { id: "fet", label: "4 × MOSFET", sub: "100N03A", col: 2, row: 0 },
          { id: "mot", label: "4 × 8520 motor", sub: "Brushed", col: 3, row: 0 },
          { id: "bat", label: "1S LiPo", col: 1, row: 1 },
          { id: "gcs", label: "Phone / laptop", sub: "MAVLink", col: 0, row: 1 },
        ],
        links: [
          { from: "imu", to: "esp", label: "SPI" },
          { from: "esp", to: "fet", label: "PWM" },
          { from: "fet", to: "mot", kind: "power" },
          { from: "bat", to: "esp", kind: "power" },
          { from: "gcs", to: "esp", label: "Wi-Fi", kind: "radio" },
        ],
      },
    ],
    gallery: [clip(`${FLIX}/sim-clip-gust-recovery`, 1280, 720, "Simulation: gust, recovery, landing", { wide: true })],
    details: [
      {
        heading: "What is mine",
        items: [
          "Assembly and bring-up: board health check and an SPI test sketch for the GY-91 on the Flix wiring.",
          "Frame variants with 8.8, 9.6 and 10.6 mm motor-holder bores, plus a four-bore fit-test coupon.",
          "A position-hold controller (PID, simulator, calibration) that sends setpoints to stock Flix firmware over Wi-Fi. Simulation only.",
        ],
      },
    ],
    tech: ["ESP32", "IMU", "PID", "FDM printing", "Python", "AprilTag"],
    credits: ["Flix is an open-source drone by Oleg Kalachev (github.com/okalachev/flix). Airframe, schematic and firmware are his design."],
    liveUrl: "https://github.com/okalachev/flix",
    priority: 7,
  },

  {
    id: "be-with-me",
    title: "Be With Me",
    tagline: "A four-legged desk robot with OLED eyes that you can drive from anywhere through the web.",
    kind: "hardware",
    date: "Oct 2026",
    card: { poster: `${BWM}/photo-quadruped-robot-held-in-hand.jpg` },
    facts: [
      ["Board", "Seeed XIAO ESP32-C3"],
      ["Legs", "4 micro servos"],
      ["Face", "128 × 64 OLED eyes"],
      ["Control", "Web board over WebSocket"],
    ],
    story: [
      {
        title: "Small enough to hold",
        text: "Four servos, one per leg, and a pair of animated eyes. The laptop behind it shows the control board with a live 3D twin.",
        media: img(`${BWM}/photo-quadruped-robot-held-in-hand.jpg`, "A hand holding the small orange quadruped robot, its eyes lit, with the web control page on a laptop behind", 1928, 2560),
      },
    ],
    iterations: {
      title: "3D: USB-C remodel",
      items: [
        { label: "Print plate", note: "Chassis, legs and shell rebuilt in SolidWorks around the XIAO board and its USB-C port. 116 × 121 mm plate.", model: "bewithme-plate", view: { az: 35, el: 38 } },
      ],
    },
    diagrams: [
      {
        title: "Remote control path",
        nodes: [
          { id: "web", label: "Web control board", sub: "3D twin, EN / FR", col: 0, row: 0 },
          { id: "relay", label: "Node relay", sub: "WebSocket", col: 1, row: 0 },
          { id: "esp", label: "XIAO ESP32-C3", sub: "Gaits, ~30 moves", col: 2, row: 0, kind: "mcu" },
          { id: "legs", label: "4 × servo", sub: "One per leg", col: 3, row: 0 },
          { id: "oled", label: "OLED", sub: "Eyes", col: 2, row: 1 },
        ],
        links: [
          { from: "web", to: "relay", label: "internet", kind: "radio" },
          { from: "relay", to: "esp", label: "Wi-Fi", kind: "radio" },
          { from: "esp", to: "legs", label: "PWM" },
          { from: "esp", to: "oled", label: "I2C" },
        ],
      },
    ],
    details: [
      {
        heading: "What I built",
        items: [
          "ESP32 firmware with tuned walking gaits and about 30 moves, plus a servo calibration sketch.",
          "A Node WebSocket relay so the robot can be driven from another network, and a web control board with a live 3D model, camera relay and an English / French switch.",
          "A USB-C variant of the body in SolidWorks: chassis, leg and shell.",
        ],
      },
    ],
    tech: ["ESP32-C3", "Servos", "SolidWorks", "WebSocket", "Node.js", "FDM printing"],
    credits: ["The body is based on the open-source AlbertMicro quadruped by thinking0things."],
    priority: 8,
  },

  {
    id: "safewalk",
    title: "SafeWalk",
    tagline: "A 32 × 20 mm wearable SOS board with cellular, GNSS and on-device keyword spotting.",
    kind: "hardware",
    date: "Oct 2026",
    badge: "PCB design",
    card: { poster: `${SAFE}/card.jpg`, video: `${SAFE}/card.mp4` },
    facts: [
      ["Board", "32 × 20 mm, 4 layers"],
      ["Parts", "73, double-sided"],
      ["Radio", "BLE + LTE-M / NB-IoT + GNSS"],
      ["Tools", "tscircuit, KiCad, Freerouting"],
      ["Status", "Design, not fabricated"],
    ],
    steps: [
      {
        title: "A whole SOS device on a wrist cuff",
        text: "Processor, cellular modem, GNSS, microphone, accelerometer, buzzer and charger on one 32 × 20 mm board.",
        stage: { kind: "model", model: "safewalk-cuff", title: "Cuff PCB v0.2", view: { az: 30, el: 38 } },
      },
      {
        title: "Two radios, three antennas",
        text: "An nRF54 handles Bluetooth and keyword spotting. An nRF9151 adds LTE-M, NB-IoT and GNSS, each with its own antenna feed.",
        stage: img(`${SAFE}/render-cuff-board-three-views.png`, "Three rendered views of the cuff PCB labelled 32 by 20 mm", 1216, 713),
      },
      {
        title: "Schematic",
        text: "Power comes through an nPM1300 PMIC from a small LiPo, with USB on pogo pads and ESD protection.",
        stage: img(`${SAFE}/diagram-cuff-schematic.png`, "Schematic of the cuff board", 2400, 1200),
      },
      {
        title: "Routing",
        text: "Routed in KiCad with Freerouting. Six DRC errors and sixteen connections are still open.",
        stage: img(`${SAFE}/diagram-cuff-pcb-routed-top.png`, "Top copper layer of the routed cuff PCB", 900, 563),
      },
    ],
    iterations: {
      items: [
        { label: "V0.1 Tag", note: "18 × 18 mm Bluetooth tag. SOS goes through the phone. Fully routed with gerbers.", model: "safewalk-tag", view: { az: 30, el: 38 } },
        { label: "V0.2 Cuff", note: "Standalone: adds cellular, GNSS, eSIM, microphone and a larger battery on a 32 × 20 mm 4-layer board.", model: "safewalk-cuff", view: { az: 30, el: 38 }, final: true },
      ],
    },
    gallery: [
      img(`${SAFE}/diagram-cuff-pcb-routed-bottom.png`, "Bottom copper layer of the cuff PCB", 900, 563, "Cuff, bottom copper"),
      img(`${SAFE}/render-tag-board-three-views.png`, "Three rendered views of the tag PCB", 1043, 987, "V0.1 tag, with LiPo underneath", { fit: "contain" }),
      img(`${SAFE}/diagram-tag-pcb-copper-layers.png`, "Front and back copper of the tag PCB", 1200, 628, "V0.1 tag copper, front and back", { wide: true }),
      img(`${SAFE}/diagram-tag-schematic.png`, "Schematic of the tag board", 2400, 1200, "V0.1 tag schematic", { wide: true }),
    ],
    details: [
      {
        heading: "Cuff bill of materials",
        items: [
          "nRF54LM20B SoC with Axon NPU for on-device keyword spotting; nRF9151 SiP for LTE-M, NB-IoT, satellite NB-NTN and GNSS, with an MFF2 eSIM.",
          "nPM1300 PMIC, T5838 MEMS microphone, LIS2DW12 accelerometer, BGA524 GNSS LNA.",
          "Chip antennas for GNSS and Bluetooth, U.FL for LTE. Buzzer, RGB LED, button, haptic pads. About 300 mAh LiPo.",
        ],
      },
      {
        heading: "Honest status",
        items: ["This is a design exercise. The cuff has not been fabricated and is not yet clean: 6 DRC errors and 16 unrouted connections remain."],
      },
    ],
    tech: ["KiCad", "tscircuit", "nRF54", "nRF9151", "PCB design", "RF layout"],
    priority: 9,
  },

  {
    id: "oil-detecting-uuv",
    title: "Oil-Detecting UUV",
    tagline: "A prototype underwater vehicle that spots oil spills and steers toward them.",
    kind: "hardware",
    date: "Jun 2023",
    card: { poster: `${OLD}/Submarine.jpeg` },
    facts: [
      ["My part", "Vision and steering"],
      ["Vision", "YOLO on a Raspberry Pi"],
      ["Control", "Closed-loop steering"],
    ],
    details: [
      {
        heading: "What I built",
        items: [
          "A computer-vision pipeline (YOLO on a Raspberry Pi) for real-time oil-spill detection from the onboard camera.",
          "Closed-loop steering that navigates the vehicle toward detected spills.",
        ],
      },
    ],
    tech: ["Raspberry Pi", "Python", "YOLO", "Closed-loop control"],
    priority: 10,
  },

  {
    id: "cache-miss-fsm",
    title: "Cache-Miss Tracker FSM",
    tagline: "A SystemVerilog state machine that tracks outstanding cache misses, with self-checking testbenches.",
    kind: "hardware",
    date: "Sep 2026",
    card: { poster: `${OLD}/fsm-diagram.png`, contain: true },
    facts: [
      ["Language", "SystemVerilog"],
      ["Design", "6-state Moore FSM"],
      ["Checks", "13/13 and 14/14 passing"],
      ["Simulator", "Icarus Verilog"],
    ],
    story: [
      {
        title: "Six states",
        text: "IDLE, req_sent, got_ack, got_data, both_received, DONE. Outputs depend only on the state.",
        media: img(`${OLD}/fsm-diagram.png`, "State diagram of the six-state Moore FSM with req and valid outputs", 936, 652),
      },
      {
        title: "Where it sits",
        text: "Between the CPU and memory, following the request and data handshakes of each miss.",
        media: img(`${OLD}/cache-sys.png`, "Block diagram of CPU, cache and memory with handshake signals", 954, 954),
      },
    ],
    details: [
      {
        heading: "Design and verification",
        items: [
          "Extended the single FSM into a multi-entry tracker array with per-entry tag comparators.",
          "Verified both designs with self-checking testbenches in Icarus Verilog: 13/13 and 14/14 checks passing.",
        ],
      },
    ],
    tech: ["SystemVerilog", "Icarus Verilog", "Digital Logic", "RTL Simulation"],
    priority: 11,
  },

  {
    id: "psybot",
    title: "Psybot",
    tagline: "A Chrome extension that reads browsing sentiment in real time to track mental health trends.",
    kind: "software",
    date: "Dec 2022 – Nov 2025",
    badge: "Gold medal",
    card: { poster: `${PSY}/poster-crop-dashboard-statistics.jpg`, contain: true },
    facts: [
      ["Model", "FastText classifier"],
      ["Front end", "Chrome extension + dashboard"],
      ["Awards", "Milan gold, APA award"],
    ],
    story: [
      {
        title: "A dashboard of how you have been",
        text: "Browsing sessions are scored and plotted over time.",
        media: img(`${PSY}/poster-crop-dashboard-statistics.jpg`, "Psybot dashboard with statistics charts", 765, 700),
      },
      {
        title: "Extension to backend to model",
        text: "The extension sends page text to a Python backend. A FastText classifier scores sentiment and topic.",
        media: img(`${PSY}/poster-crop-system-process-flowchart.jpg`, "Flowchart of the Psybot system process", 895, 675),
      },
      {
        title: "Results",
        text: "User plots and model accuracy from the project poster.",
        media: img(`${PSY}/poster-crop-results-user-plots.jpg`, "Result plots for users", 1283, 970),
      },
    ],
    gallery: [
      img(`${PSY}/poster-crop-landing-page.jpg`, "Psybot landing page", 787, 390, "Landing page", { wide: true }),
      img(`${PSY}/poster-crop-model-accuracy-confusion-matrix.jpg`, "Model accuracy and confusion matrix", 830, 315, "Model accuracy", { wide: true }),
      img(`${PSY}/poster-full.jpg`, "The full Psybot poster", 3000, 2000, "Competition poster", { wide: true, fit: "contain" }),
    ],
    details: [
      {
        heading: "What I built",
        items: [
          "A Chrome extension that reads browsing content and sends it to a Python NLP backend.",
          "A FastText classifier trained on psychological and sentiment datasets to score sessions.",
          "A web dashboard that shows mental-health trends over time.",
        ],
      },
    ],
    tech: ["JavaScript", "Python", "FastText", "NLP", "Chrome Extension"],
    awards: [
      "Gold Medal, I Giovani e le Scienze 2024 (Milano, Italy)",
      "American Psychological Association Award 2024",
      "Gold Medal & Grand Award 2nd Place, I-FEST² 2022",
    ],
    liveUrl: "https://psybot.vercel.app/",
    priority: 12,
  },

  {
    id: "mustfocus",
    title: "MustFocus",
    tagline: "Webcam eye tracking that flags attention patterns in children. A screening aid, not a diagnosis.",
    kind: "software",
    date: "Aug 2023",
    badge: "2nd place",
    card: { poster: `${FOCUS}/card.jpg`, video: `${FOCUS}/card.mp4` },
    facts: [
      ["Event", "AI4Health Hackathon"],
      ["Input", "Standard webcam"],
      ["Stack", "Python, OpenCV"],
      ["With", "Mohamed Ali Maatoug"],
    ],
    story: [
      {
        title: "Calibrate with nine dots",
        text: "The webcam learns where the pupils sit for each point on screen.",
        media: clip(`${FOCUS}/clip-calibration-no-face`, 1504, 846, "Calibration dots on screen"),
      },
      {
        title: "A game that holds attention",
        text: "A Flappy-Bird-style game runs while gaze is recorded.",
        media: clip(`${FOCUS}/clip-flappy-game`, 1632, 918, "The Flappy-Bird-style attention game"),
      },
      {
        title: "Where the eyes went",
        text: "Gaze points become a scatter plot and a heatmap, compared against reference patterns.",
        media: clip(`${FOCUS}/clip-gaze-scatter-and-heatmap`, 1280, 720, "Gaze scatter plot and heatmap"),
      },
    ],
    gallery: [
      img(`${FOCUS}/page-7.jpg`, "Slide with focus plots", 2400, 1350, "Focus plots", { wide: true }),
      img(`${FOCUS}/page-5.jpg`, "Slide showing the game start screen", 2400, 1350, "Game start"),
    ],
    details: [
      {
        heading: "What we built",
        items: [
          "Eye-tracking pipeline in Python with OpenCV, extracting gaze and pupil data in real time.",
          "Focus heatmaps and attention scatter plots, compared against ADHD and non-ADHD activity baselines to flag possible concerns.",
          "2nd place at the AI4Health Hackathon hosted by MUST University, organised by Hackathon Tunisia.",
        ],
      },
    ],
    tech: ["Python", "OpenCV", "Eye Tracking", "Computer Vision"],
    awards: ["2nd Place, AI4Health Hackathon"],
    priority: 13,
  },

  {
    id: "wildguard",
    title: "WildGuard",
    tagline: "Early wildfire detection for Tunisia: YOLO on Raspberry Pis, located by triangulation.",
    kind: "software",
    date: "Oct 2021 – Apr 2022",
    badge: "Gold medal",
    card: { poster: `${OLD}/wildguard-dubai.png` },
    facts: [
      ["Vision", "YOLO on Raspberry Pi"],
      ["Accuracy", "About 83% detection"],
      ["Locating", "Multi-camera triangulation"],
      ["Awards", "I-FEST² gold, Expo Science Asia"],
    ],
    gallery: [
      img(`${OLD}/wildguard-dubai.png`, "Gold medal at Expo Science Asia in Dubai", 592, 592, "Expo Science Asia, Dubai 2022"),
      img("/media/wildguard/photo-certificate-ifest-gold-medal-2021.jpg", "I-FEST² gold medal certificate", 1154, 808, "I-FEST² gold medal, 2021"),
    ],
    details: [
      {
        heading: "What I built",
        items: [
          "A real-time CV pipeline (YOLO on a Raspberry Pi) fused with environmental sensor data and a Python / Pandas time-series pipeline that predicts wildfire risk.",
          "A triangulation system using multiple Raspberry Pis to locate fires.",
          "About 83% detection accuracy across lighting conditions and distances.",
        ],
      },
    ],
    tech: ["YOLO", "Raspberry Pi", "Python", "Pandas", "Computer Vision"],
    awards: ["Gold Medal, I-FEST² 2021", "Represented Tunisia, Expo Science Asia, Dubai 2022"],
    priority: 14,
  },

  {
    id: "math-kinematics",
    title: "Deriving forward and inverse kinematics for a 2-DOF robotic arm",
    shortTitle: "2-DOF Kinematics (IB Math IA)",
    tagline: "A 20-page derivation of how a two-link arm reaches a point, and how to solve it backwards.",
    kind: "software",
    date: "2024",
    card: { poster: `${MATH}/diagram-fig4-inverse-kinematics-geometry.png`, contain: true },
    facts: [
      ["Type", "IB Math investigation"],
      ["Length", "20 pages"],
      ["Topic", "Forward and inverse kinematics"],
    ],
    demo: {
      key: "ik-arm",
      title: "Try it: drag the target",
      note: "The same closed-form solution as the paper, solved live. L1 = 2 and L2 = 1 are the paper's values.",
    },
    story: [
      {
        title: "Two links, two angles",
        text: "The model: a planar arm with two joints.",
        media: img(`${MATH}/diagram-fig1-two-link-arm-model.png`, "Figure 1: two-link arm model", 2314, 2400),
      },
      {
        title: "Forward: angles to position",
        text: "Given both joint angles, where is the tip?",
        media: img(`${MATH}/diagram-fig2-forward-kinematics.png`, "Figure 2: forward kinematics", 2300, 2400),
      },
      {
        title: "Inverse: position to angles",
        text: "Given a target, which angles reach it? The geometry gives a closed form.",
        media: img(`${MATH}/diagram-fig4-inverse-kinematics-geometry.png`, "Figure 4: geometry of the inverse kinematics solution", 2238, 2400),
      },
      {
        title: "Following a path",
        text: "Solving the inverse problem point by point makes the arm trace a curve.",
        media: img(`${MATH}/diagram-fig5-following-the-path.png`, "Figure 5: the arm following a path", 2300, 2400),
      },
    ],
    gallery: [img(`${MATH}/diagram-animation-snapshots.png`, "Snapshots of the arm animation along a path", 2400, 524, "Animation snapshots", { wide: true, fit: "contain" })],
    tech: ["Mathematics", "Kinematics", "LaTeX", "IB Diploma"],
    pdfUrl: "/Math-Investigation-Mohamed-Cherif-Braham.pdf",
    priority: 15,
  },
];

export const orderedProjects: Project[] = [...projects].sort((a, b) => a.priority - b.priority);

export function getProject(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

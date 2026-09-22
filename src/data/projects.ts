export interface ProjectDemo {
  src: string; // animated GIF, served unoptimized
  caption: string;
  width: number;
  height: number;
}

export interface ProjectVideo {
  src: string; // MP4 (H.264), played with controls
  poster: string;
  caption: string;
  width: number;
  height: number;
}

export interface ProjectSection {
  heading: string;
  body?: string;
  bullets?: string[];
}

export interface Project {
  id: string; // also the URL slug: /projects/<id>
  title: string;
  shortTitle?: string; // for compact lists (skills "used in", prev/next links)
  tagline: string;
  description: string;
  bullets: string[];
  images: string[];
  cover?: string; // card image when it shouldn't be images[0]
  captions?: Record<string, string>; // keyed by image path
  demos?: ProjectDemo[];
  videos?: ProjectVideo[];
  sections?: ProjectSection[]; // deeper write-up shown on the project page
  tech: string[];
  awards?: string[];
  liveUrl?: string;
  pdfUrl?: string;
  date: string;
  priority: number;
}

export const projects: Project[] = [
  {
    id: "so100-arm",
    title: "SO-100 Robotic Arm: Agent and Vision Pick-and-Place",
    shortTitle: "SO-100 Robotic Arm",
    tagline:
      "A physical robot arm that picks objects up and drops them into a cup, controlled two ways: a Claude agent over MCP for the cube, and my own YOLOE + ArUco vision pipeline for the pen.",
    description:
      "A self-directed project on the SO-100 robotic arm. I started with the math, deriving the arm's kinematics from first principles and writing my own inverse-kinematics solver. Then I built two different ways for the physical arm to find an object, pick it up, and place it in a cup. The first hands perception and decision-making to a Claude agent that drives the arm through the Model Context Protocol (MCP). The second is a dedicated vision pipeline that detects the object and servos the gripper onto it.",
    bullets: [
      "Zero-shot pick-and-place on the physical arm: a Claude agent over MCP repeatedly picked up the cube and dropped it in the cup, with no task-specific training.",
      "A separate vision pipeline (YOLOE-seg detection + ArUco visual servoing) picks up the pen and places it in the cup.",
      "Closed-form inverse-kinematics solver verified against forward kinematics over 300 simulated round trips (simulation-only).",
    ],
    sections: [
      {
        heading: "Kinematics from first principles",
        bullets: [
          "Derived the arm's rotation matrices and homogeneous transforms from first principles.",
          "Implemented a closed-form planar inverse-kinematics solver that exploits the arm's parallel joint geometry: once the base rotation is set, the shoulder, elbow, and wrist joints move in a single plane.",
          "Verified the solver against forward kinematics over 300 simulated round-trip trials, with near-zero residual error. This solver is simulation-only and has not been tested on hardware.",
        ],
      },
      {
        heading: "Approach 1: Claude agent over MCP (the cube)",
        body:
          "I connected a Claude agent to the physical arm through MCP, so the agent can see the scene and command the arm as a tool.",
        bullets: [
          "The agent estimates where the target is from the camera image, and camera calibration maps that estimate into the arm's workspace.",
          "The agent moves the arm through an MCP tool that takes gripper moves in millimetres (up, forward, and so on). An IK control loop turns each move into joint commands.",
          "Zero-shot: no task-specific training. The arm repeatedly picked up the cube and dropped it into the cup.",
        ],
      },
      {
        heading: "Approach 2: Vision pipeline (the pen)",
        body:
          "As an alternative to agent-based control, I built a dedicated perception and control pipeline.",
        bullets: [
          "YOLOE-seg detects and segments the objects in the camera image. Each pen is marked with a confidence score, a center point, and an orientation line.",
          "An ArUco marker on the gripper gives its position in the same image, and visual servoing drives the gripper onto the pen.",
          "The arm uses this pipeline to pick up the pen and place it in the cup.",
        ],
      },
    ],
    cover: "/images/projects/so100-cube.jpeg",
    images: [
      "/images/projects/so100-arm-vision.jpeg",
      "/images/projects/so100-vision-detector.jpeg",
    ],
    captions: {
      "/images/projects/so100-arm-vision.jpeg":
        "Testing the vision pipeline on my laptop: the test_detector window shows the live camera view of the gripper, the pens, and the cup.",
      "/images/projects/so100-vision-detector.jpeg":
        "Vision pipeline debug view: both pens detected (0.85 and 0.80 confidence), each with a center point and orientation line. The ArUco marker on the gripper gives the servoing loop the gripper's position.",
    },
    demos: [
      {
        src: "/images/projects/so100-cube-demo.gif",
        caption: "Claude agent over MCP: the arm lowers the cube into the cup and lets go.",
        width: 510,
        height: 340,
      },
    ],
    tech: [
      "Claude + MCP",
      "YOLOE-seg",
      "OpenCV / ArUco",
      "Inverse Kinematics",
      "LeRobot",
      "PyTorch",
      "Python",
      "Camera Calibration",
      "Visual Servoing",
    ],
    date: "Aug 2026 – Sep 2026",
    priority: 0,
  },
  {
    id: "math-kinematics",
    title: "Deriving forward and inverse kinematics for a 2-DOF robotic arm",
    shortTitle: "2-DOF Kinematics (IB Math IA)",
    tagline: "A 20-page investigation exploring mathematical modeling of a 2-DOF robotic arm.",
    description:
      "My 20-page derivation paper that I wrote as part of the International Baccalaureate Diploma Programme. The paper dives deep into a mathematical topic of my choosing, applying rigorous analysis, modeling, and proof to produce an original piece of academic work.",
    bullets: [
      "Conducted original mathematical research for the IB Diploma Programme",
      "Applied rigorous proof, analysis, and modeling techniques",
      "Produced a 20-page academic paper graded by IB examiners",
    ],
    images: ["/images/projects/kinematiks.png"],
    tech: ["Mathematics", "Research", "LaTeX", "IB Diploma"],
    pdfUrl: "/Math-Investigation-Mohamed-Cherif-Braham.pdf",
    date: "2024",
    priority: 1,
  },
  {
    id: "cache-miss-fsm",
    title: "Cache-Miss Tracker FSM",
    tagline: "Digital design in SystemVerilog: a Moore FSM that tracks outstanding cache misses.",
    description:
      "Optional coursework in digital design. I designed a finite state machine in SystemVerilog that tracks outstanding cache misses, then extended it into a multi-entry tracker array and verified both designs with self-checking testbenches.",
    bullets: [
      "Designed a 6-state Moore FSM tracking outstanding cache misses, then extended it to a multi-entry tracker array with per-entry tag comparators.",
      "Verified both with self-checking testbenches in Icarus Verilog (13/13 and 14/14 checks passing).",
    ],
    images: ["/images/projects/fsm-diagram.png", "/images/projects/cache-sys.png"],
    captions: {
      "/images/projects/fsm-diagram.png":
        "State diagram of the 6-state Moore FSM (IDLE, req_sent, got_ack, got_data, both_received, DONE), with the req and valid outputs of each state.",
      "/images/projects/cache-sys.png":
        "Where it sits: the cache between the CPU and memory, with the cpu_req / data_valid and mem_req / mem_valid / mem_data handshake signals.",
    },
    tech: ["SystemVerilog", "Icarus Verilog", "Digital Logic", "RTL Simulation"],
    date: "Sep 2026",
    priority: 6,
  },
  {
    id: "do-robotics",
    title: "do_robotics",
    tagline: "A phone-as-robot-controller platform: a Flutter app that turns your phone into the brain of a robot.",
    description:
      "I built do_robotics to make robot control and programming accessible to learners and hobbyists. The app connects to ESP32-based robots over Bluetooth or USB Serial and lets users drive them, program them visually, and even have them autonomously react to the world using computer vision and voice commands.",
    bullets: [
      "Designed a custom chassis in Fusion 360 around the phone, motor, and battery geometry; 3D-printed and assembled the build.",
      "Achieved real-time visual tracking and following of a physical target (a bottle) on a minimal platform: ESP32, battery, and 2 motors only, no onboard compute.",
      "Ran all vision/ML on-device via edge ML (TFLite) on a smartphone (Redmi Note 11), sending commands to the ESP32 over Bluetooth/USB-serial via a custom 5-byte protocol.",
      "Built a block-based visual scripting interface in the companion app for behavior programming, where users chain logic, action, and sensor blocks.",
      "Integrated TFLite object detection for person-following and an AI guard mode with real-time camera tracking.",
      "Added speech-to-text voice commands to drive robot actions hands-free.",
      "Shipped 5 built-in tutorial projects (Clap-On Light, Person-Following Robot, AI Guard, and more).",
    ],
    images: [
      "/images/projects/do-robotics-1.jpeg",
      "/images/projects/do-robotics-2.jpeg",
    ],
    tech: ["Flutter", "ESP32", "TFLite", "Fusion 360", "3D Printing", "Bluetooth", "Computer Vision", "Dart"],
    date: "Feb 2026 – May 2026",
    priority: 5,
  },
  {
    id: "remote-light-switch",
    title: "Remote Light Switch",
    tagline:
      "A retrofit that flips an ordinary wall switch from my phone: an ESP32 web page drives a servo and a 3D-printed rack and pinion I designed in Onshape.",
    description:
      "I built a remote control for a standard wall light switch that doesn't touch the electrical wiring. A 3D-printed mechanism mounts over the existing switch plate, and a servo moves it to flip the switches. An ESP32 serves a small control page over Wi-Fi, so I can turn the lights on or off from my phone's browser.",
    bullets: [
      "Flips a standard double wall switch from a phone browser, with no rewiring.",
      "Rack-and-pinion mount designed in Onshape and 3D-printed.",
      "ESP32 web server drives an MG995 servo over Wi-Fi.",
    ],
    sections: [
      {
        heading: "The mechanism",
        body:
          "A toggle switch needs a straight up-and-down push, but a servo only rotates. I designed a rack and pinion in Onshape to convert one into the other.",
        bullets: [
          "The servo turns a pinion gear, which drives a vertical rack up and down.",
          "An H-shaped yoke on the rack captures both toggles on the plate, so one servo move flips both switches together.",
          "The frame screws onto the wall plate's existing screws, so installing it doesn't involve touching the mains wiring.",
          "Actuated by an MG995, a metal-gear hobby servo with enough torque to push the toggles.",
        ],
      },
      {
        heading: "Electronics and control",
        bullets: [
          "An ESP32 joins the Wi-Fi network and hosts a small control page, \"Wireless MG995 Control\", with Lights on and Lights off buttons.",
          "Each button sends a request to the ESP32, which drives the servo to the position that flips the switches on or off.",
          "No app to install: it works from the phone's web browser.",
        ],
      },
    ],
    images: ["/images/projects/light-switch.jpeg"],
    captions: {
      "/images/projects/light-switch.jpeg":
        "The mount over a double toggle switch plate. The MG995 servo (left) turns the pinion, which drives the vertical rack and its yoke.",
    },
    demos: [
      {
        src: "/images/projects/light-switch-demo.gif",
        caption: "Tapping Lights off, then Lights on: the servo flips the switches and the room goes dark, then lights back up.",
        width: 340,
        height: 604,
      },
    ],
    tech: ["ESP32", "Onshape", "3D Printing (FDM)", "Servo Control", "Rack & Pinion", "Wi-Fi Web Server"],
    date: "Sep 2026",
    priority: 4,
  },
  {
    id: "impaq",
    title: "ImpaQ",
    tagline: "A smart mouthguard that monitors impact and predicts TBI risk in real time.",
    description:
      "I built ImpaQ to address the silent danger of head impacts in contact sports. The device embeds an ESP32-based impact sensor inside a custom mouthguard shell. A companion Flutter app receives data wirelessly and shows real-time impact metrics and traumatic brain injury (TBI) risk predictions.",
    bullets: [
      "Built a wearable impact sensor (ESP32, accelerometer) interfaced with a Flutter app for real-time TBI-risk monitoring (C++, Flutter).",
      "Embedded the electronics in a silicone mouthguard shell, designing and hand-fabricating the enclosure in a lab setting.",
      "Implemented signal processing to distinguish regular jaw activity from dangerous head impacts.",
      "Diagnosed a Bluetooth communication failure on a Seeed Studio board: used a multimeter to isolate insufficient power delivery from the onboard voltage regulator, then replaced it with one properly sized for the Bluetooth module, restoring reliable wireless communication.",
    ],
    images: [
      "/images/projects/impaq-3.jpeg",
      "/images/projects/impaq-5.jpeg",
      "/images/projects/impaq-4.jpeg",
    ],
    captions: {
      "/images/projects/impaq-4.jpeg": "Bench testing the finished mouthguard.",
      "/images/projects/impaq-5.jpeg": "Breadboard prototype of the sensing electronics.",
    },
    tech: ["ESP32", "C++", "Flutter", "BLE", "Seeed Studio", "Accelerometer", "Signal Processing", "Bench Debugging"],
    date: "Jan 2026",
    priority: 3,
  },
  {
    id: "blood-loss-monitor",
    title: "Blood Loss Monitoring Device for PAS Surgery",
    shortTitle: "Blood Loss Monitor",
    tagline: "A validated prototype for measuring vaginal blood loss in placenta accreta spectrum surgery.",
    description:
      "As part of Duke's Pratt School of Engineering Design, I built a prototype to address a gap in placenta accreta spectrum (PAS) surgery: no reliable method existed to collect and measure blood leaving the uterus through the vagina. The device collects, vacuums, and weighs blood in real time, with an alert at every 250 mL threshold.",
    bullets: [
      "Designed the fluid-collection cup and pumping mechanism in Onshape; silicone-molded the cup as a menstrual-cup adapter that fits standard medical tubing, and assembled the prototype and harness.",
      "Designed and 3D-printed a canister holder and adjustable pump attachment.",
      "Wired an Arduino-powered load cell with an LCD display and audible alerts at 0.25 L intervals.",
      "Tested under simulated surgical conditions and passed all performance criteria; validated to within 5 mL absolute error (<0.7% relative error) across a tested range of 250–1000 mL.",
      "Prototype reviewed and approved by a Duke Hospital clinician, who advised the team to pursue clinical certification.",
      "Presented at the Duke Pratt Design Expo 2025, in collaboration with Duke Health OBGYN.",
    ],
    images: [
      "/images/projects/placenta.jpeg",
      "/images/projects/placenta-poster.jpeg",
    ],
    captions: {
      "/images/projects/placenta-poster.jpeg":
        "The project poster: the problem, the three-part design (modified menstrual cup, pump and vacuum attachments, Arduino scale with load cell), and the design-criteria test results.",
    },
    tech: ["CAD", "Onshape", "Arduino", "Load Cell", "Silicone Molding", "3D Printing", "Embedded Systems"],
    awards: ["Duke Pratt Design Expo 2025"],
    date: "Aug 2025 – Dec 2025",
    priority: 2,
  },
  {
    id: "wildguard",
    title: "WildGuard",
    tagline: "An AI-powered early wildfire detection and prediction system for Tunisia.",
    description:
      "I built WildGuard to tackle the increasing wildfire crisis in Tunisia. The system runs YOLO-based computer vision on a Raspberry Pi to detect fire and smoke in real time and locate it using triangulation, combined with a Pandas-powered data pipeline that models risk based on environmental factors. I represented Tunisia with this project at Expo Science Asia in Dubai.",
    bullets: [
      "Built a real-time CV/ML pipeline (YOLO on a Raspberry Pi) fused with environmental sensor data and a Python/Pandas time-series pipeline that predicts wildfire risk.",
      "Implemented a triangulation system using multiple Raspberry Pis to locate fires.",
      "Achieved ~83% detection accuracy across varying lighting conditions and distances.",
      "Won a gold medal at the I-FEST² competition in 2021.",
      "Represented Tunisia with this project at Expo Science Asia in Dubai (2022).",
    ],
    images: [
      "/images/projects/wildguard-dubai.png",
    ],
    tech: ["YOLO", "Raspberry Pi", "Python", "Pandas", "Computer Vision", "ML"],
    awards: ["Gold Medal, I-FEST² 2021", "Represented Tunisia, Expo Science Asia, Dubai 2022"],
    date: "Oct 2021 – Apr 2022",
    priority: 11,
  },
  {
    id: "psybot",
    title: "Psybot",
    tagline: "A Chrome extension and web app that monitors mental health through real-time browsing behavior.",
    description:
      "I built Psybot because I believed your browsing habits say a lot about how you're feeling. The app uses FastText NLP to classify the sentiment and content of pages visited in real time, building a mental health profile over time. It won a Gold Medal at I Giovani e le Scienze in Milan and an award from the American Psychological Association.",
    bullets: [
      "Built a Chrome extension that silently reads browsing content and sends it to a Python NLP backend",
      "Trained a FastText classifier on psychological and sentiment datasets to score browsing sessions",
      "Developed a web dashboard (psybot.vercel.app) that visualizes mental health trends over time",
      "Recognized by the American Psychological Association for achievement in psychological research",
    ],
    images: [
      "/images/projects/psybot-poster.png",
    ],
    tech: ["JavaScript", "Python", "FastText", "NLP", "Chrome Extension", "ML"],
    awards: [
      "Gold Medal, I Giovani e le Scienze 2024 (Milano, Italy)",
      "American Psychological Association Award 2024",
      "Gold Medal & Grand Award 2nd Place, I-FEST² 2022",
    ],
    liveUrl: "https://psybot.vercel.app/",
    date: "Dec 2022 – Nov 2025",
    priority: 7,
  },
  {
    id: "mustfocus",
    title: "MustFocus",
    tagline: "A low-cost eye-tracking screening aid that flags attention patterns associated with ADHD in children.",
    description:
      "I built MustFocus with Mohamed Ali Maatoug at the AI4Health Hackathon to explore how a standard webcam could make attention screening cheaper and easier to access. It tracks eye movements and gaze patterns and flags attention patterns associated with ADHD in children. It is a screening aid, not a diagnostic.",
    bullets: [
      "A low-cost eye-tracking tool that flags attention patterns associated with ADHD in children, built as a screening aid rather than a diagnostic.",
      "Built the computer vision and eye-tracking pipeline in Python with OpenCV, extracting gaze and pupil data in real time.",
      "Generated focus heatmaps and attention scatter plots.",
      "Compared user patterns against ADHD and non-ADHD activity baselines to flag possible attention concerns.",
      "Used a Flappy Bird-style interactive game to measure attention and impulse control.",
      "2nd place at the AI4Health Hackathon hosted by MUST University, organized by Hackathon Tunisia. Built with Mohamed Ali Maatoug.",
    ],
    images: ["/images/projects/mustfocus.png", "/images/projects/mustfocus2.png"],
    videos: [
      {
        src: "/images/projects/mustfocus-demo.mp4",
        poster: "/images/projects/mustfocus-demo-poster.jpeg",
        caption:
          "Demo: webcam eye-tracking calibration, a round of the Flappy Bird-style attention game, then the recorded gaze points plotted as a scatter plot and a heatmap.",
        width: 1280,
        height: 720,
      },
    ],
    tech: ["Python", "Computer Vision", "Eye Tracking", "OpenCV", "ML"],
    awards: ["2nd Place, AI4Health Hackathon"],
    date: "Aug 2023",
    priority: 10,
  },
  {
    id: "oil-detecting-uuv",
    title: "Oil-Detecting UUV",
    tagline: "A prototype autonomous underwater vehicle that detects oil spills and steers toward them.",
    description:
      "I developed the steering system and vision pipeline for a prototype unmanned underwater vehicle (UUV) built for autonomous spill response. The system uses YOLO to detect oil spills from the onboard camera and closed-loop steering control to navigate toward them.",
    bullets: [
      "Built a computer-vision pipeline (YOLO on a Raspberry Pi) for real-time oil-spill detection from the vehicle's onboard camera.",
      "Paired detection with closed-loop steering control to autonomously navigate toward spill locations.",
    ],
    images: ["/images/projects/Submarine.jpeg"],
    tech: ["Raspberry Pi", "Python", "YOLO", "Closed-Loop Control", "Computer Vision"],
    date: "Jun 2023",
    priority: 9,
  },
];

export const orderedProjects: Project[] = [...projects].sort((a, b) => a.priority - b.priority);

export function getProject(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  bullets: string[];
  images: string[];
  tech: string[];
  awards?: string[];
  liveUrl?: string;
  pdfUrl?: string;
  date: string;
  priority: number;
}

export const projects: Project[] = [
  {
    id: "Math Kinematics",
    title: "Deriving forward and inverse kinematics for a 2-DOF robotic arm",
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
    priority: 0,
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
    images: [],
    tech: ["SystemVerilog", "Icarus Verilog", "Digital Logic", "RTL Simulation"],
    date: "Sep 2026",
    priority: 3,
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
      "/images/projects/impaq-worn.jpeg",
      "/images/projects/impaq-1.jpeg",
      "/images/projects/impaq-2.jpeg",
      "/images/projects/impaq-3.jpeg",
    ],
    tech: ["ESP32", "C++", "Flutter", "BLE", "Seeed Studio", "Hardware"],
    date: "Jan 2026",
    priority: 2,
  },
  {
    id: "placenta",
    title: "Blood Loss Monitoring Device for PAS Surgery",
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
    ],
    tech: ["CAD", "Onshape", "Arduino", "Load Cell", "Silicone Molding", "Embedded Systems"],
    awards: ["Duke Pratt Design Expo 2025"],
    date: "Aug 2025 – Dec 2025",
    priority: 1,
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
    priority: 9,
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
    priority: 5,
  },
  {
    id: "demeter",
    title: "DEMETER",
    tagline: "Livestock disease detection: an online platform that helps farmers catch animal diseases with computer vision.",
    description:
      "DEMETER is an online platform for farmers that detects animal diseases using computer vision. I built it as part of a larger effort to modernize agricultural practices.",
    bullets: [
      "Built the first prototype around diseases with visible symptoms, using computer vision to detect lumpy skin disease in cows.",
      "Extended it to analyze animal activity so possible diseases get caught before they spread, using pose estimation and monitoring the frequency of certain behaviors.",
      "Won a gold medal and was selected among the top 10 projects at the I-FEST² competition 2023.",
    ],
    images: [],
    tech: ["Computer Vision", "Pose Estimation"],
    awards: ["Gold Medal & Top-10, I-FEST² 2023"],
    date: "Feb 2023 – Feb 2024",
    priority: 6,
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
    tech: ["Python", "Computer Vision", "Eye Tracking", "OpenCV", "ML"],
    awards: ["2nd Place, AI4Health Hackathon"],
    date: "Aug 2023",
    priority: 8,
  },
  {
    id: "submarine",
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
    priority: 7,
  },
];

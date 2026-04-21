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
    pdfUrl: "/Math-IA-Mohamed-Cherif-Braham.pdf",
    date: "2024",
    priority: 0,
  },
  {
    id: "do-robotics",
    title: "do_robotics",
    tagline: "A Flutter app that turns your phone into a controller for AI-powered robots.",
    description:
      "I built do_robotics to make robot control and programming accessible to learners and hobbyists. The app connects to ESP32-based robots over Bluetooth or USB Serial and lets users drive them, program them visually, and even have them autonomously react to the world using computer vision and voice commands.",
    bullets: [
      "Controls robots via Bluetooth (ESP32) or USB Serial using a clean 5-byte packet protocol",
      "Built a Scratch-style visual block editor — users chain logic, action, and sensor blocks to script behavior",
      "Integrated TFLite object detection for person-following and AI guard mode with real-time camera tracking",
      "Added speech-to-text voice commands to drive robot actions hands-free",
      "Shipped 5 built-in tutorial projects (Clap-On Light, Person-Following Robot, AI Guard, and more)",
    ],
    images: [
      "/images/projects/do-robotics-1.jpeg",
      "/images/projects/do-robotics-2.jpeg",
    ],
    tech: ["Flutter", "ESP32", "Bluetooth", "TFLite", "Computer Vision", "Dart"],
    date: "2024 – Present",
    priority: 4,
  },
  {
    id: "impaq",
    title: "ImpaQ",
    tagline: "A smart mouthguard that monitors impact and predicts TBI risk in real time.",
    description:
      "I built ImpaQ to address the silent danger of head impacts in contact sports. The device embeds an ESP32-based impact sensor inside a custom mouthguard shell. A companion Flutter app receives data wirelessly and shows real-time impact metrics and traumatic brain injury (TBI) risk predictions.",
    bullets: [
      "Embedded ESP32 and accelerometer into a silicone mouthguard shell for wearable impact sensing",
      "Designed and hand-fabricated the mouthguard enclosure in a lab setting",
      "Built a Flutter companion app for real-time TBI risk monitoring over BLE",
      "Implemented signal processing to distinguish regular jaw activity from dangerous head impacts",
    ],
    images: [
      "/images/projects/impaq-worn.jpeg",
      "/images/projects/impaq-1.jpeg",
      "/images/projects/impaq-2.jpeg",
      "/images/projects/impaq-3.jpeg",
    ],
    tech: ["ESP32", "C++", "Flutter", "BLE", "Signal Processing", "Hardware"],
    date: "Jan 2026",
    priority: 2,
  },
  {
    id: "placenta",
    title: "Blood Loss Monitor — PAS Surgery",
    tagline: "A surgical device that collects and measures vaginal blood loss during cesarean hysterectomy.",
    description:
      "As part of Duke's Pratt School of Engineering Design, I built a device to solve a critical gap in placenta accreta spectrum (PAS) surgery: no reliable method existed to collect and measure blood leaving the uterus through the vagina. The device collects, vacuums, and weighs blood in real time, alerting surgical staff at every 250 mL threshold.",
    bullets: [
      "Silicone-molded a menstrual-cup adapter that fits standard medical tubing for blood collection",
      "Designed and 3D-printed a canister holder and adjustable pump attachment using CAD",
      "Wired an Arduino-powered load cell with an LCD display and audible alerts at 0.25 L intervals",
      "Validated against simulated surgical conditions; passed all performance criteria",
      "Presented at the Duke Pratt Design Expo 2025 in collaboration with Duke Health OBGYN",
    ],
    images: [
      "/images/projects/placenta.jpeg",
    ],
    tech: ["CAD", "SolidWorks", "Arduino", "Load Cell", "Silicone Molding", "Embedded Systems"],
    awards: ["Duke Pratt Design Expo 2025"],
    date: "Aug 2025 – Dec 2025",
    priority: 1,
  },
  {
    id: "wildguard",
    title: "WildGuard",
    tagline: "An AI-powered early wildfire detection and prediction system for Tunisia.",
    description:
      "I built WildGuard to tackle the increasing wildfire crisis in Tunisia. The system runs YOLO-based computer vision on a Raspberry Pi to detect fire and smoke in real time and locate it using triangulation, combined with a Pandas-powered data pipeline that models risk based on environmental factors. I represented Tunisia nationally with this project at Expo Sciences Asia in Dubai.",
    bullets: [
      "Trained and deployed a YOLO computer vision model on Raspberry Pi for real-time smoke and fire detection",
      "Built a Pandas-powered ML pipeline to predict wildfire risk from environmental data",
      "Implemented a triangulation system using multiple Raspberry Pis to locate fires",
      "Represented Tunisia as National Representative at Expo Sciences Asia, Dubai 2022",
    ],
    images: [
      "/images/projects/wildguard-dubai.png",
    ],
    tech: ["YOLO", "Raspberry Pi", "Python", "Pandas", "Computer Vision", "ML"],
    awards: ["Gold Medal — I-FEST² 2021", "National Representative — Expo Sciences Asia, Dubai 2022"],
    date: "Oct 2021 – Dec 2023",
    priority: 7,
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
      "Gold Medal — I Giovani e le Scienze 2024 (Milano, Italy)",
      "APA Research Achievement Award 2024",
      "Gold Medal — I-FEST² 2022",
    ],
    liveUrl: "https://psybot.vercel.app/",
    date: "Dec 2022 – Nov 2025",
    priority: 5,
  },
  {
    id: "mustfocus",
    title: "MustFocus",
    tagline: "An eye-tracking attention monitor that detects ADHD-related focus patterns.",
    description:
      "I built MustFocus at the AI4Health Hackathon to explore how a webcam could replace expensive clinical attention tests. The system tracks eye movements and gaze patterns, generates focus heatmaps, and compares behavior against ADHD and non-ADHD baselines — all from a standard laptop camera.",
    bullets: [
      "Built a real-time eye-tracking pipeline using computer vision to extract gaze and pupil data",
      "Generated focus heatmaps and attention scatter plots to visualize browsing behavior",
      "Compared user patterns against ADHD vs. non-ADHD activity baselines for diagnostic hints",
      "Used a Flappy Bird-style interactive game to measure attention and impulse control",
    ],
    images: ["/images/projects/mustfocus.png", "/images/projects/mustfocus2.png"],
    tech: ["Python", "Computer Vision", "Eye Tracking", "OpenCV", "ML"],
    awards: ["AI4Health Hackathon"],
    date: "2023",
    priority: 6,
  },
  {
    id: "submarine",
    title: "Oil-Extracting Submarine",
    tagline: "A prototype UUV that detects, tracks, and collects oil spills.",
    description:
      "I developed the steering system and vision pipeline for a prototype unmanned underwater vehicle (UUV) designed to autonomously detect and collect surface oil spills. The system uses YOLO for oil plume detection combined with motion control logic for autonomous navigation.",
    bullets: [
      "Developed a YOLO-based oil spill detection pipeline running on Raspberry Pi",
      "Built steering and motion control logic for autonomous UUV navigation toward detected spills",
      "Integrated a collection mechanism triggered by proximity to detected oil patches",
    ],
    images: ["/images/projects/submarine.jpeg"],
    tech: ["Raspberry Pi", "Python", "YOLO", "Motion Control", "Computer Vision"],
    date: "Jun 2023",
    priority: 5,
  },
];

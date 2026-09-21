export interface SkillGroup {
  label: string;
  skills: string[];
  usedIn?: string[]; // project ids that put these skills to work
}

export const skillGroups: SkillGroup[] = [
  {
    label: "Robotics & Control",
    skills: [
      "Forward/Inverse Kinematics",
      "Homogeneous Transforms",
      "Camera Calibration",
      "Visual Servoing (ArUco)",
      "Closed-Loop Control",
      "Servo & Motor Control",
      "LeRobot",
    ],
    usedIn: ["so100-arm", "remote-light-switch", "do-robotics", "oil-detecting-uuv", "math-kinematics"],
  },
  {
    label: "AI/ML & Computer Vision",
    skills: [
      "PyTorch",
      "TensorFlow",
      "TFLite",
      "YOLO/YOLOE",
      "OpenCV",
      "FastText",
      "Pose Estimation",
      "Edge AI / TinyML",
      "LLM Agents (Claude + MCP)",
    ],
    usedIn: ["so100-arm", "do-robotics", "wildguard", "demeter", "mustfocus", "psybot"],
  },
  {
    label: "Hardware & Electronics",
    skills: [
      "Arduino",
      "Raspberry Pi",
      "ESP32",
      "Seeed Studio boards",
      "Embedded Systems",
      "Wireless (Wi-Fi, Bluetooth)",
      "Sensor Integration",
      "PCB Design (KiCad)",
      "Bench Debugging (multimeter)",
      "Digital Logic",
      "RTL Simulation",
      "SystemVerilog",
      "Icarus Verilog",
    ],
    usedIn: ["impaq", "blood-loss-monitor", "remote-light-switch", "do-robotics", "cache-miss-fsm", "wildguard"],
  },
  {
    label: "Mechanical Design & Fabrication",
    skills: [
      "SolidWorks",
      "Fusion 360",
      "Onshape",
      "Mechanism Design",
      "Tolerance & Fit Iteration",
      "3D Printing (FDM)",
      "Waterjet Cutting",
      "Laser Cutting",
      "CNC Cutting",
      "Silicone Molding",
      "BOM Development",
    ],
    usedIn: ["blood-loss-monitor", "remote-light-switch", "do-robotics", "impaq"],
  },
  {
    label: "Programming",
    skills: ["Python", "C/C++", "Java", "JavaScript/TypeScript", "Arduino", "Flutter", "React Native"],
    usedIn: ["so100-arm", "impaq", "do-robotics", "psybot"],
  },
  {
    label: "Tools",
    skills: ["Git", "Linux", "ROS2", "Docker", "Hugging Face", "Pandas", "AI-assisted dev (Claude)"],
  },
  {
    label: "Spoken Languages",
    skills: ["Arabic (Native)", "French (Fluent)", "Italian (Proficient)", "English (Fluent)"],
  },
];

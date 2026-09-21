export interface Experience {
  role: string;
  org: string;
  location: string;
  dates: string;
  bullets: string[];
  type: "research" | "teaching" | "leadership" | "technical";
  projectId?: string; // links to /projects/<id>
}

export const experiences: Experience[] = [
  {
    role: "Undergraduate Research Assistant",
    org: "Duke Biomechanics and Wearable Robotics Lab, Duke University",
    location: "Durham, NC · Faculty mentor: Dr. Krithika Swaminathan",
    dates: "Jul 2026 – Present",
    bullets: [
      "Developing an OpenExo-based ankle exoskeleton for gait rehabilitation; building the mechanical skeleton and integrating sensing and control.",
      "Set the exoskeleton's mechanical requirements including motor torque specifications, then reconciled three overlapping vendor BOMs against them into a single purchasing document.",
      "Selected and validated IMU-based gait-event sensing against published biomechanics literature.",
      "Leading a team of 4 students on the assembly and wiring process of the exoskeleton.",
    ],
    type: "research",
  },
  {
    role: "Makerspace Technician",
    org: "Innovation Co-Lab, Duke University (OIT)",
    location: "Durham, NC",
    dates: "Feb 2026 – Present",
    bullets: [
      "Operating and maintaining 30+ 3D printers, waterjets, and laser cutters across Duke's three Innovation Co-Lab fabrication facilities.",
      "Resolving recurring 3D-printer failures (jammed filament, clogged nozzles, filament changes); teaching 20+ students, faculty, and staff to safely operate the waterjet and laser cutters.",
      "Assisting students and staff with technical design across multiple software suites (SolidWorks, Fusion 360, Illustrator), preparing their files for the lab machinery.",
    ],
    type: "technical",
  },
  {
    role: "Independent Robotics Researcher",
    org: "Robotic Manipulation & Kinematics (SO-100 Robotic Arm)",
    location: "Self-directed",
    dates: "Aug 2026 – Sep 2026",
    bullets: [
      "Derived rotation matrices and homogeneous transforms from first principles; implemented a closed-form planar IK solver exploiting the arm's parallel joint geometry. Verified against forward kinematics over 300 simulated round-trip trials with near-zero residual error; simulation-only, not tested on hardware.",
      "Deployed a zero-shot pick-and-place system on the physical arm: integrated a Claude agent (via MCP) for target estimation with camera calibration and an IK control loop driving arm motion. Achieved repeated success (cube into cup) with no task-specific training.",
      "Separately built a vision pipeline (YOLOE-seg detection + ArUco visual servoing) as an alternative to agent-based control; the arm uses it to pick up a pen and place it in the cup.",
    ],
    type: "research",
    projectId: "so100-arm",
  },
  {
    role: "Research Intern",
    org: "University of Cambridge, Centre for Misfolding Diseases",
    location: "Remote, Yusuf Hamied Department of Chemistry",
    dates: "Jun 2024 – Aug 2024",
    bullets: [
      "Accepted to a remote research position with Professor Vendruscolo's group, working on next-generation RNA sequencing methods for neurodivergence research.",
      "Reviewed 5+ deep-learning publications on RNA-Seq methods to inform methodology selection, and took part in group meetings.",
    ],
    type: "research",
  },
  {
    role: "President, Tech Club",
    org: "UWC Adriatic",
    location: "Duino, Trieste, Italy",
    dates: "Jan 2024 – May 2025",
    bullets: [
      "Led 12 students through end-to-end engineering projects, including a marine monitoring katamaran.",
      "Built a van and room booking system for the school's internal logistics.",
    ],
    type: "leadership",
  },
  {
    role: "AI and Robotics Instructor",
    org: "ATAST Organization",
    location: "Tunisia",
    dates: "Nov 2020 – Aug 2023",
    bullets: [
      "Instructed 15+ middle-school students in Python and Arduino, and 10+ high-school students in computer vision and Raspberry Pi.",
      "Supervised 5 students through engineering-fair projects and coached 2 middle-school VEX Robotics teams through the build process.",
      "Organized 3 tech hackathons.",
    ],
    type: "teaching",
  },
];

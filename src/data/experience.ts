export interface Experience {
  role: string;
  org: string;
  location: string;
  dates: string;
  bullets: string[];
  type: "research" | "teaching" | "leadership" | "technical";
}

export const experiences: Experience[] = [
  {
    role: "Lab Technician",
    org: "Duke Innovation Co-Lab",
    location: "Durham, NC",
    dates: "Jan 2026 – Present",
    bullets: [
      "Assisted students and staff with technical design across multiple software suites (SolidWorks, Fusion 360, Illustrator, etc.), providing hands-on guidance to prepare their files for the lab machinery.",
      "Facilitated hands-on manufacturing by guiding visitors through the setup and operation of 3D printers, laser cutters, CNC routers, and waterjets.",
    ],
    type: "technical",
  },
  {
    role: "Research Intern",
    org: "University of Cambridge — Centre for Misfolding Diseases",
    location: "Remote (Yusuf Hamied Dept. of Chemistry)",
    dates: "Jun 2024 – Aug 2024",
    bullets: [
      "Worked with Professor Vendruscolo on next-generation RNA sequencing data analysis for neurodivergence research",
      "Analyzed 5+ deep-learning publications on RNA-Seq methods to guide methodology selection",
    ],
    type: "research",
  },
  {
    role: "President, Tech Club",
    org: "UWC Adriatic",
    location: "Duino, Trieste, Italy",
    dates: "Jan 2024 – Jan 2025",
    bullets: [
      "Led 12 students through end-to-end engineering projects including a marine monitoring Katamaran",
      "Built a van and room booking system for the school's internal logistics",
    ],
    type: "leadership",
  },
  {
    role: "AI & Robotics Instructor",
    org: "ATAST Organization",
    location: "Tunisia",
    dates: "Nov 2020 – Aug 2023",
    bullets: [
      "Instructed 15+ middle school students in Python and Arduino; 10+ high school students in computer vision and Raspberry Pi",
      "Supervised 5 students for engineering fair projects and organized 3 tech hackathons",
    ],
    type: "teaching",
  },
];

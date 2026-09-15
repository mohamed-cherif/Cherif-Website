export interface Award {
  title: string;
  issuer: string;
  year: string;
  image: string;
  project?: string;
  description: string;
  category: "win" | "honor" | "scholarship";
}

export const awards: Award[] = [
  {
    title: "Duke University International Scholar",
    issuer: "Duke University",
    year: "",
    image: "",
    description: "Duke University International Scholar.",
    category: "scholarship",
  },
  {
    title: "Davis United World College Scholar",
    issuer: "Davis UWC Scholars Program",
    year: "",
    image: "",
    description: "Davis United World College Scholar.",
    category: "scholarship",
  },
  {
    title: "1st Place, Claude Builders Club Hackathon",
    issuer: "Duke University",
    year: "2026",
    image: "",
    description: "First place and $300 in prizes at Duke University's Claude Builders Club hackathon. April 2026.",
    category: "win",
  },
  {
    title: "Duke Pratt Design Expo",
    issuer: "Pratt School of Engineering, Duke University",
    year: "2025",
    image: "",
    project: "Blood Loss Monitoring Device for PAS Surgery",
    description: "Presented the blood loss monitoring device at the Duke Pratt Design Expo 2025.",
    category: "honor",
  },
  {
    title: "Gold Medal, I Giovani e le Scienze",
    issuer: "Milano, Italy",
    year: "2024",
    image: "/images/awards/milano.png",
    project: "Psybot",
    description: "Gold Medal in the Computer Science category at one of Italy's most prestigious youth science fairs.",
    category: "win",
  },
  {
    title: "American Psychological Association Award",
    issuer: "American Psychological Association",
    year: "2024",
    image: "/images/awards/APA.png",
    project: "Psybot",
    description: "Awarded by the APA for outstanding research bridging psychology and computer science through Psybot.",
    category: "win",
  },
  {
    title: "Gold Medal & Top-10, I-FEST²",
    issuer: "International Festival of Science & Technology, Tunisia",
    year: "2023",
    image: "",
    project: "DEMETER",
    description: "Gold Medal for DEMETER, selected among the top 10 projects at I-FEST² 2023.",
    category: "win",
  },
  {
    title: "Bronze Medal, GENIUS Olympiad",
    issuer: "Rochester Institute of Technology, NY",
    year: "2023",
    image: "/images/awards/genius-bronze.jpg",
    description: "Distinguished Achievement award at the international high school project fair on environment at RIT.",
    category: "win",
  },
  {
    title: "Rise Finalist",
    issuer: "Top 500 globally",
    year: "2023",
    image: "",
    description: "Finalist in Rise, top 500 globally.",
    category: "honor",
  },
  {
    title: "2nd Place, AI4Health Hackathon",
    issuer: "MUST University, Tunisia",
    year: "2023",
    image: "",
    project: "MustFocus",
    description: "Second place and 500 TND in prizes at the AI4Health Hackathon, for MustFocus, an eye-tracking attention screening aid.",
    category: "win",
  },
  {
    title: "Represented Tunisia, Expo Science Asia",
    issuer: "Dubai, UAE",
    year: "2022",
    image: "/images/awards/dubai-wildguard.png",
    project: "WildGuard",
    description: "Represented Tunisia at Expo Science Asia in Dubai with WildGuard.",
    category: "honor",
  },
  {
    title: "Gold Medal & Grand Award 2nd Place, I-FEST²",
    issuer: "International Festival of Science & Technology, Tunisia",
    year: "2022",
    image: "/images/awards/goldmedal-psybot.png",
    project: "Psybot",
    description: "Gold Medal and Grand Award 2nd Place for Psybot at I-FEST², June 2022.",
    category: "win",
  },
  {
    title: "Gold Medal, I-FEST²",
    issuer: "International Festival of Science & Technology, Tunisia",
    year: "2021",
    image: "/images/awards/goldmedal-wildguard.png",
    project: "WildGuard",
    description: "Gold Medal for WildGuard at the International Festival of Science and Technology.",
    category: "win",
  },
];

export const awardCount = (category: Award["category"]) =>
  awards.filter((a) => a.category === category).length;

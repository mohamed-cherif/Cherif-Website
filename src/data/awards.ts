export interface Award {
  title: string;
  issuer: string;
  year: string;
  image: string;
  project?: string;
  description: string;
}

export const awards: Award[] = [
  {
    title: "1st Place — Claude Builders Club Hackathon",
    issuer: "Duke University",
    year: "2026",
    image: "",
    description: "First place and $300 in prizes at Duke University's Claude Builders Club hackathon. April 2026.",
  },
  {
    title: "2nd Place — AI4Health Hackathon",
    issuer: "Must University, Tunisia",
    year: "2023",
    image: "",
    project: "MustFocus",
    description: "Second place and 500 TND in prizes at the AI4Health Hackathon, for MustFocus — an eye-tracking attention monitor.",
  },
  {
    title: "Gold Medal — I Giovani e le Scienze",
    issuer: "Milano, Italy",
    year: "2024",
    image: "/images/awards/milano.png",
    project: "Psybot",
    description: "Gold Medal in the Computer Science category at one of Italy's most prestigious youth science fairs.",
  },
  {
    title: "APA Research Achievement Award",
    issuer: "American Psychological Association",
    year: "2024",
    image: "/images/awards/apa.png",
    project: "Psybot",
    description: "Awarded by the APA for outstanding research bridging psychology and computer science through Psybot.",
  },
  {
    title: "National Representative — Expo Sciences Asia",
    issuer: "Dubai, UAE",
    year: "2022",
    image: "/images/awards/dubai-wildguard.png",
    project: "WildGuard",
    description: "Selected to represent Tunisia nationally at the international science fair in Dubai.",
  },
  {
    title: "Gold Medal — I-FEST²",
    issuer: "International Festival of Science & Technology, Tunisia",
    year: "2022",
    image: "/images/awards/goldmedal-psybot.png",
    project: "Psybot",
    description: "Gold Medal at the International Festival of Science and Technology in Tunisia.",
  },
  {
    title: "Gold Medal — I-FEST²",
    issuer: "International Festival of Science & Technology, Tunisia",
    year: "2021",
    image: "/images/awards/goldmedal-wildguard.png",
    project: "WildGuard",
    description: "Gold Medal for WildGuard at the International Festival of Science and Technology.",
  },
  {
    title: "Bronze Medal — GENIUS Olympiad",
    issuer: "Rochester Institute of Technology, NY",
    year: "2023",
    image: "/images/awards/genius-bronze.jpg",
    description: "Distinguished Achievement award at the international high school project fair on environment at RIT.",
  },
];

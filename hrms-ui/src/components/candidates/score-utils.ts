/* ── Skill Colors ── */
const SKILL_COLORS: Record<string, string> = {
  python: "bg-sky-50 text-sky-700 border-sky-200",
  java: "bg-orange-50 text-orange-700 border-orange-200",
  react: "bg-cyan-50 text-cyan-700 border-cyan-200",
  "node.js": "bg-green-50 text-green-700 border-green-200",
  javascript: "bg-yellow-50 text-yellow-700 border-yellow-200",
  typescript: "bg-blue-50 text-blue-700 border-blue-200",
  sql: "bg-indigo-50 text-indigo-700 border-indigo-200",
  aws: "bg-amber-50 text-amber-700 border-amber-200",
  docker: "bg-blue-50 text-blue-700 border-blue-200",
  "machine learning": "bg-purple-50 text-purple-700 border-purple-200",
  html: "bg-rose-50 text-rose-700 border-rose-200",
  css: "bg-pink-50 text-pink-700 border-pink-200",
  figma: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  django: "bg-emerald-50 text-emerald-700 border-emerald-200",
  golang: "bg-teal-50 text-teal-700 border-teal-200",
};

export const getSkillColor = (s: string) =>
  SKILL_COLORS[s.toLowerCase()] || "bg-gray-50 text-gray-600 border-gray-200";

/* ── Score helpers ── */
export const getScoreGradient = (s: number) =>
  s >= 70 ? "from-emerald-500 to-green-400" : s >= 45 ? "from-amber-500 to-yellow-400" : "from-rose-500 to-red-400";

export const getScoreBg = (s: number) =>
  s >= 70 ? "bg-emerald-50" : s >= 45 ? "bg-amber-50" : "bg-rose-50";

export const getScoreText = (s: number) =>
  s >= 70 ? "text-emerald-700" : s >= 45 ? "text-amber-700" : "text-rose-700";

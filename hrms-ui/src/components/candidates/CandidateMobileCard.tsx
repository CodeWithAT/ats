import { Mail, GraduationCap, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RankBadge } from "./RankBadge";
import { getSkillColor, getScoreText } from "./score-utils";
import type { Candidate } from "./types";

export function CandidateMobileCard({ candidate }: { candidate: Candidate }) {
  const score = candidate.matchScore ?? candidate.match_score ?? 0;
  const skills = candidate.skills || [];

  return (
    <div className="flex flex-col p-4 bg-white border border-gray-200 rounded-xl shadow-sm gap-3 w-full">
      <div className="flex items-start gap-3">
        <RankBadge rank={candidate.rank ?? 0} />
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-[15px] text-gray-900 block truncate">
            {candidate.name === "Not Found" ? candidate.filename : candidate.name}
          </span>
          <div className="flex items-center gap-1 text-[12px] text-gray-500 mt-0.5">
            <Mail size={11} />
            <span className="truncate">{candidate.email}</span>
          </div>
        </div>
        <span className={`text-[14px] font-bold tabular-nums ${getScoreText(score)}`}>
          {score}%
        </span>
      </div>

      <div className="flex items-center gap-4 text-[12px]">
        {candidate.education && candidate.education !== "Not Found" && (
          <div className="flex items-center gap-1 text-indigo-700">
            <GraduationCap size={12} className="text-indigo-400" />
            <span className="truncate max-w-[140px]">{candidate.education}</span>
          </div>
        )}
        <div className="flex items-center gap-1 text-gray-600">
          <Briefcase size={12} className="text-amber-500" />
          <span>{candidate.experience || "Fresher"}</span>
        </div>
      </div>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {skills.slice(0, 5).map((s) => (
            <span
              key={s}
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${getSkillColor(s)}`}
            >
              {s}
            </span>
          ))}
          {skills.length > 5 && (
            <span className="text-[10px] text-gray-400">+{skills.length - 5}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <Badge
          variant="outline"
          className={`text-[10px] h-5 px-2 rounded-full font-medium shadow-none ${
            candidate.status === "Processed"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-red-50 text-red-600 border-red-200"
          }`}
        >
          {candidate.status}
        </Badge>
      </div>
    </div>
  );
}

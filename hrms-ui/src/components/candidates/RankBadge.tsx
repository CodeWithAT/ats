import { Trophy } from "lucide-react";

export function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-sm">
        <Trophy size={14} className="text-white" />
      </div>
    );
  if (rank <= 3)
    return (
      <div
        className={`w-7 h-7 rounded-full bg-gradient-to-br ${
          rank === 2 ? "from-gray-300 to-gray-400" : "from-amber-600 to-amber-700"
        } flex items-center justify-center shadow-sm`}
      >
        <span className="text-[11px] font-bold text-white">{rank}</span>
      </div>
    );
  return (
    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
      <span className="text-[11px] font-semibold text-gray-500">{rank}</span>
    </div>
  );
}

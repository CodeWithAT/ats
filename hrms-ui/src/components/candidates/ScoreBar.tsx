import { getScoreBg, getScoreGradient, getScoreText } from "./score-utils";

export function ScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-3 min-w-[140px]">
      <div className={`relative w-20 h-2 rounded-full overflow-hidden ${getScoreBg(score)}`}>
        <div
          className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${getScoreGradient(score)} transition-all duration-700 ease-out`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
      <span className={`text-[13px] font-semibold tabular-nums ${getScoreText(score)}`}>
        {score}%
      </span>
    </div>
  );
}

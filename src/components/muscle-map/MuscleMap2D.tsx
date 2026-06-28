import { useMemo, useState } from "react";
import { colorForMuscle, recoveryGradients, recoveryLevel } from "./muscleColor";
import { muscleGroups, muscleLabels, musclePaths, muscleViewBoxes } from "./musclePaths";
import type { BodySide, MuscleMapModel, MuscleMapRecoveryScores, MusclePathData, MusclePathId } from "./muscleTypes";
import type { CSSProperties } from "react";

type MuscleMap2DProps = {
  selectedMuscle?: string;
  recoveryScores: MuscleMapRecoveryScores;
  onMuscleClick: (muscleId: MusclePathId) => void;
  showLabels?: boolean;
  model?: MuscleMapModel;
};

const cosmeticParts = new Set<MusclePathId>(["hair", "head"]);
const neutralParts = new Set<MusclePathId>(["hair", "head", "hands", "feet", "ankles", "knees", "neck"]);

function pathList(part: MusclePathData) {
  return [
    ...part.common.map((path) => ({ path, side: "both" as const })),
    ...part.left.map((path) => ({ path, side: "left" as const })),
    ...part.right.map((path) => ({ path, side: "right" as const }))
  ];
}

function displayFill(part: MusclePathData, recoveryScores: MuscleMapRecoveryScores, isSelected: boolean, isHovered: boolean) {
  if (part.id === "hair") return "#171717";
  if (part.id === "head") return "#74777d";
  if (neutralParts.has(part.id) && recoveryLevel(recoveryScores[part.id]) === "none") return "#363b43";
  if (isSelected || isHovered) return colorForMuscle(part.id, recoveryScores);
  return colorForMuscle(part.id, recoveryScores);
}

function proportionStyle(partId: MusclePathId): CSSProperties | undefined {
  const tuning: Partial<Record<MusclePathId, [number, number]>> = {
    hair: [0.92, 0.92],
    head: [0.92, 0.92],
    neck: [0.94, 1.05],
    chest: [1.02, 1],
    "upper-chest": [1.02, 1],
    "lower-chest": [1.02, 1],
    abs: [0.97, 1],
    "upper-abs": [0.97, 1],
    "lower-abs": [0.97, 1],
    obliques: [0.96, 1],
    serratus: [0.98, 1],
    deltoids: [1.05, 1],
    "front-deltoid": [1.05, 1],
    "rear-deltoid": [1.05, 1],
    biceps: [1.04, 1],
    triceps: [1.04, 1],
    forearm: [1.04, 1],
    hands: [1.02, 1],
    quadriceps: [1.045, 1.005],
    "inner-quad": [1.035, 1.005],
    "outer-quad": [1.045, 1.005],
    adductors: [1.025, 1],
    "hip-flexors": [1.02, 1],
    gluteal: [1.03, 1],
    hamstring: [1.04, 1.005],
    calves: [1.045, 1.015],
    tibialis: [1.035, 1],
    feet: [1.02, 1]
  };
  const scale = tuning[partId];
  if (!scale) return undefined;
  return {
    transform: `scale(${scale[0]}, ${scale[1]})`,
    transformBox: "fill-box",
    transformOrigin: "center"
  };
}

function BodyFigure({
  side,
  model,
  selectedMuscle,
  hoveredMuscle,
  recoveryScores,
  onHover,
  onMuscleClick,
  showLabels
}: {
  side: BodySide;
  model: MuscleMapModel;
  selectedMuscle?: string;
  hoveredMuscle?: MusclePathId;
  recoveryScores: MuscleMapRecoveryScores;
  onHover: (muscle?: MusclePathId) => void;
  onMuscleClick: (muscleId: MusclePathId) => void;
  showLabels: boolean;
}) {
  const paths = musclePaths[model][side];
  const viewBox = muscleViewBoxes[model][side];

  return (
    <div className="relative min-h-0 overflow-hidden rounded-[18px] border border-white/[0.06] bg-[radial-gradient(circle_at_50%_10%,rgba(57,231,95,0.13),transparent_32%),radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.07),transparent_50%),linear-gradient(180deg,#151922,#0F131A)] p-2.5 shadow-[0_8px_30px_rgba(0,0,0,.35)] sm:p-3">
      <div className="mb-1 text-center text-[9px] font-bold uppercase tracking-[0.32em] text-zinc-500 sm:mb-2 sm:text-[10px]">{side}</div>
      <svg viewBox={viewBox} className="h-[clamp(300px,52dvh,520px)] w-full max-w-full drop-shadow-[0_18px_26px_rgba(0,0,0,0.24)] lg:h-[clamp(380px,54vw,560px)]" role="img" aria-label={`${model} ${side} muscle map`}>
        <defs>
          <radialGradient id={`ambient-${side}`} cx="50%" cy="12%" r="72%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="48%" stopColor="#ffffff" stopOpacity="0.035" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.16" />
          </radialGradient>
          <filter id={`glow-${side}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#ffffff" floodOpacity="0.38" />
          </filter>
          <filter id={`muscleDepth-${side}`} x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1" stdDeviation="0.7" floodColor="#05070a" floodOpacity="0.34" />
          </filter>
          {Object.entries(recoveryGradients).map(([level, gradient]) => (
            <linearGradient key={`${side}-${level}`} id={`recovery-${side}-${level}`} x1="0%" x2="0%" y1="0%" y2="100%">
              <stop offset="0%" stopColor={gradient.top} />
              <stop offset="100%" stopColor={gradient.bottom} />
            </linearGradient>
          ))}
        </defs>

        {paths.map((part) => {
          const isCosmetic = cosmeticParts.has(part.id);
          const isSelected = selectedMuscle === part.id;
          const isHovered = hoveredMuscle === part.id;
          const level = recoveryLevel(recoveryScores[part.id]);
          const fill = isCosmetic || (neutralParts.has(part.id) && level === "none") ? displayFill(part, recoveryScores, isSelected, isHovered) : `url(#recovery-${side}-${level})`;
          const opacity = part.id === "hair" ? 0.9 : part.id === "head" ? 0.95 : level === "none" ? 0.94 : 0.98;

          return (
            <g key={`${side}-${part.id}`} style={proportionStyle(part.id)}>
              <g
                role={isCosmetic ? undefined : "button"}
                tabIndex={isCosmetic ? undefined : 0}
                aria-label={muscleLabels[part.id]}
                className={isCosmetic ? "" : "group cursor-pointer outline-none transition duration-200 ease-out [transform-box:fill-box] [transform-origin:center] hover:scale-[1.02]"}
                onPointerEnter={() => !isCosmetic && onHover(part.id)}
                onPointerLeave={() => !isCosmetic && onHover(undefined)}
                onClick={() => !isCosmetic && onMuscleClick(part.id)}
                onKeyDown={(event) => {
                  if (!isCosmetic && (event.key === "Enter" || event.key === " ")) onMuscleClick(part.id);
                }}
              >
                <title>{muscleLabels[part.id]}</title>
                {pathList(part).map(({ path }, index) => (
                  <path
                    key={`${part.id}-${index}`}
                    d={path}
                    fill={fill}
                    opacity={opacity}
                    stroke={isSelected ? "#ffffff" : isHovered ? "rgba(255,255,255,0.68)" : "rgba(8,12,18,0.46)"}
                    strokeWidth={isSelected ? 2 : isHovered ? 1.35 : 1}
                    vectorEffect="non-scaling-stroke"
                    filter={isSelected ? `url(#glow-${side})` : `url(#muscleDepth-${side})`}
                    className="transition-[fill,opacity,stroke,filter,transform] duration-200 ease-out group-hover:brightness-110"
                  />
                ))}
              </g>
            </g>
          );
        })}
        <rect x={viewBox.split(" ")[0]} y={viewBox.split(" ")[1]} width={viewBox.split(" ")[2]} height={viewBox.split(" ")[3]} fill={`url(#ambient-${side})`} opacity="0.55" pointerEvents="none" />
      </svg>

      {showLabels ? (
        <div className="pointer-events-none absolute bottom-3 left-3 right-3 rounded-[14px] border border-white/[0.06] bg-black/50 px-2 py-1 text-center text-xs text-zinc-300">
          {hoveredMuscle ? muscleLabels[hoveredMuscle] : `${side} view`}
        </div>
      ) : null}
    </div>
  );
}

export function MuscleMap2D({ selectedMuscle, recoveryScores, onMuscleClick, showLabels = false, model = "male" }: MuscleMap2DProps) {
  const [hoveredMuscle, setHoveredMuscle] = useState<MusclePathId>();
  const visibleLegend = useMemo(
    () => [
      ["none", "No data"],
      ["low", "Low"],
      ["medium", "Medium"],
      ["good", "Good"],
      ["high", "High"]
    ] as const,
    []
  );

  return (
    <div className="rounded-[18px] border border-white/[0.06] bg-[linear-gradient(180deg,#151922_0%,#0F131A_100%)] p-2.5 shadow-[0_8px_30px_rgba(0,0,0,.35)] sm:p-3">
      <div className="-mx-2.5 flex touch-pan-x snap-x snap-mandatory gap-2.5 overflow-x-auto overscroll-x-contain px-2.5 pb-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-3 sm:gap-3 sm:px-3 lg:mx-0 lg:grid lg:snap-none lg:grid-cols-2 lg:overflow-visible lg:px-0 lg:pb-0">
        <div className="min-w-full snap-center lg:min-w-0">
          <BodyFigure
            side="front"
            model={model}
            selectedMuscle={selectedMuscle}
            hoveredMuscle={hoveredMuscle}
            recoveryScores={recoveryScores}
            onHover={setHoveredMuscle}
            onMuscleClick={onMuscleClick}
            showLabels={showLabels}
          />
        </div>
        <div className="min-w-full snap-center lg:min-w-0">
          <BodyFigure
            side="back"
            model={model}
            selectedMuscle={selectedMuscle}
            hoveredMuscle={hoveredMuscle}
            recoveryScores={recoveryScores}
            onHover={setHoveredMuscle}
            onMuscleClick={onMuscleClick}
            showLabels={showLabels}
          />
        </div>
      </div>
      <div className="mt-1 flex justify-center gap-1.5 lg:hidden" aria-hidden="true">
        <span className="h-1.5 w-5 rounded-full bg-lime-300/80" />
        <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] text-zinc-400 sm:gap-2 sm:text-[11px]">
        {!selectedMuscle ? <span className="mr-auto self-center text-sm text-zinc-500">Select a muscle to view recovery details</span> : null}
        {visibleLegend.map(([level, label]) => (
          <span key={level} className="inline-flex items-center gap-1.5 rounded bg-white/[0.04] px-1.5 py-1 sm:px-2">
            <span
              className="h-2.5 w-2.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.08)]"
              style={{ background: `linear-gradient(180deg, ${recoveryGradients[level].top}, ${recoveryGradients[level].bottom})` }}
            />
            {label}
          </span>
        ))}
        {hoveredMuscle ? (
          <span className="ml-auto rounded bg-white/[0.06] px-2 py-1 text-zinc-200">
            {muscleLabels[hoveredMuscle]} / {muscleGroups[hoveredMuscle]}
          </span>
        ) : null}
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { ScanSearch } from "lucide-react";
import type { MuscleGroup, MuscleScore } from "../types";

type RecoveryLevel = "none" | "low" | "medium" | "good" | "high";
type MuscleView = "front" | "back";

type MuscleDefinition = {
  id: string;
  label: string;
  group: MuscleGroup;
  scoreIds: string[];
  view: MuscleView;
  paths: string[];
};

type RecoveryInput = RecoveryLevel | number | MuscleScore | undefined;

const recoveryColors: Record<RecoveryLevel, string> = {
  none: "#343a44",
  low: "#ff4d4d",
  medium: "#ff9f43",
  good: "#a3ff3d",
  high: "#39e75f"
};

const groupOrder: MuscleGroup[] = ["Chest", "Back", "Shoulders", "Arms", "Core", "Legs", "Calves"];

const muscles: MuscleDefinition[] = [
  {
    id: "upper-pectoralis",
    label: "Upper Pectoralis",
    group: "Chest",
    scoreIds: ["upper-chest"],
    view: "front",
    paths: [
      "M124 166 C135 145 157 135 180 139 C176 154 164 169 146 178 C136 183 126 178 124 166Z",
      "M236 166 C225 145 203 135 180 139 C184 154 196 169 214 178 C224 183 234 178 236 166Z"
    ]
  },
  {
    id: "middle-pectoralis",
    label: "Middle Pectoralis",
    group: "Chest",
    scoreIds: ["middle-chest"],
    view: "front",
    paths: [
      "M121 177 C139 174 161 174 180 181 L180 222 C157 221 133 209 119 191 C118 186 119 181 121 177Z",
      "M239 177 C221 174 199 174 180 181 L180 222 C203 221 227 209 241 191 C242 186 241 181 239 177Z"
    ]
  },
  {
    id: "lower-pectoralis",
    label: "Lower Pectoralis",
    group: "Chest",
    scoreIds: ["lower-chest"],
    view: "front",
    paths: [
      "M121 197 C137 215 158 227 180 228 L180 245 C151 242 128 230 116 210 C116 205 118 201 121 197Z",
      "M239 197 C223 215 202 227 180 228 L180 245 C209 242 232 230 244 210 C244 205 242 201 239 197Z"
    ]
  },
  {
    id: "front-deltoid",
    label: "Front Deltoid",
    group: "Shoulders",
    scoreIds: ["shoulders"],
    view: "front",
    paths: [
      "M94 165 C106 143 124 132 146 136 C141 158 130 180 109 193 C99 188 93 178 94 165Z",
      "M266 165 C254 143 236 132 214 136 C219 158 230 180 251 193 C261 188 267 178 266 165Z"
    ]
  },
  {
    id: "side-deltoid",
    label: "Side Deltoid",
    group: "Shoulders",
    scoreIds: ["shoulders"],
    view: "front",
    paths: [
      "M78 189 C79 160 96 139 124 135 C123 168 109 198 87 216 C80 210 76 200 78 189Z",
      "M282 189 C281 160 264 139 236 135 C237 168 251 198 273 216 C280 210 284 200 282 189Z"
    ]
  },
  {
    id: "biceps",
    label: "Biceps",
    group: "Arms",
    scoreIds: ["biceps"],
    view: "front",
    paths: [
      "M85 216 C103 203 119 214 119 241 C116 272 105 297 91 310 C77 286 73 236 85 216Z",
      "M275 216 C257 203 241 214 241 241 C244 272 255 297 269 310 C283 286 287 236 275 216Z"
    ]
  },
  {
    id: "forearms",
    label: "Forearms",
    group: "Arms",
    scoreIds: ["forearms"],
    view: "front",
    paths: [
      "M91 314 C106 329 108 373 99 422 C91 450 77 459 67 438 C70 389 76 339 91 314Z",
      "M269 314 C254 329 252 373 261 422 C269 450 283 459 293 438 C290 389 284 339 269 314Z",
      "M446 318 C463 334 464 381 454 431 C444 457 430 451 423 429 C427 382 433 337 446 318Z",
      "M634 318 C617 334 616 381 626 431 C636 457 650 451 657 429 C653 382 647 337 634 318Z"
    ]
  },
  {
    id: "abs",
    label: "Abs",
    group: "Core",
    scoreIds: ["core"],
    view: "front",
    paths: [
      "M158 252 C169 245 177 245 180 254 L180 282 C168 282 159 273 155 260 C155 257 156 254 158 252Z",
      "M202 252 C191 245 183 245 180 254 L180 282 C192 282 201 273 205 260 C205 257 204 254 202 252Z",
      "M154 284 C166 289 174 290 180 286 L180 316 C168 318 157 310 152 296 C151 291 152 287 154 284Z",
      "M206 284 C194 289 186 290 180 286 L180 316 C192 318 203 310 208 296 C209 291 208 287 206 284Z",
      "M157 319 C166 326 174 328 180 322 L180 349 C169 349 160 342 156 331 C155 326 155 322 157 319Z",
      "M203 319 C194 326 186 328 180 322 L180 349 C191 349 200 342 204 331 C205 326 205 322 203 319Z"
    ]
  },
  {
    id: "obliques",
    label: "Obliques",
    group: "Core",
    scoreIds: ["core"],
    view: "front",
    paths: [
      "M121 230 C142 246 153 286 156 350 C137 334 124 304 116 265 C114 249 116 237 121 230Z",
      "M239 230 C218 246 207 286 204 350 C223 334 236 304 244 265 C246 249 244 237 239 230Z"
    ]
  },
  {
    id: "serratus",
    label: "Serratus",
    group: "Core",
    scoreIds: ["core"],
    view: "front",
    paths: [
      "M115 203 C132 209 145 223 152 245 C136 241 122 230 113 213Z",
      "M245 203 C228 209 215 223 208 245 C224 241 238 230 247 213Z"
    ]
  },
  {
    id: "quads",
    label: "Quads",
    group: "Legs",
    scoreIds: ["quads"],
    view: "front",
    paths: [
      "M130 371 C151 346 174 354 179 392 C177 462 160 526 143 552 C119 509 113 411 130 371Z",
      "M230 371 C209 346 186 354 181 392 C183 462 200 526 217 552 C241 509 247 411 230 371Z",
      "M154 372 C168 376 177 398 176 434 C172 481 161 520 149 541 C142 494 142 413 154 372Z",
      "M206 372 C192 376 183 398 184 434 C188 481 199 520 211 541 C218 494 218 413 206 372Z"
    ]
  },
  {
    id: "traps",
    label: "Traps",
    group: "Back",
    scoreIds: ["traps"],
    view: "back",
    paths: [
      "M520 130 C536 149 548 176 556 210 C532 202 512 181 501 151 C506 140 513 133 520 130Z",
      "M560 130 C544 149 532 176 524 210 C548 202 568 181 579 151 C574 140 567 133 560 130Z",
      "M505 197 C526 217 536 253 540 303 C544 253 554 217 575 197 C564 190 552 186 540 186 C528 186 516 190 505 197Z"
    ]
  },
  {
    id: "rear-deltoid",
    label: "Rear Deltoid",
    group: "Shoulders",
    scoreIds: ["shoulders"],
    view: "back",
    paths: [
      "M446 165 C461 140 489 132 510 146 C505 174 489 199 462 211 C450 200 443 183 446 165Z",
      "M634 165 C619 140 591 132 570 146 C575 174 591 199 618 211 C630 200 637 183 634 165Z"
    ]
  },
  {
    id: "triceps",
    label: "Triceps",
    group: "Arms",
    scoreIds: ["triceps"],
    view: "back",
    paths: [
      "M445 215 C464 200 483 211 484 241 C481 277 468 307 452 321 C437 291 434 236 445 215Z",
      "M635 215 C616 200 597 211 596 241 C599 277 612 307 628 321 C643 291 646 236 635 215Z"
    ]
  },
  {
    id: "lats",
    label: "Lats",
    group: "Back",
    scoreIds: ["lats"],
    view: "back",
    paths: [
      "M487 201 C518 222 536 270 535 345 C516 374 494 391 474 395 C475 314 477 245 487 201Z",
      "M593 201 C562 222 544 270 545 345 C564 374 586 391 606 395 C605 314 603 245 593 201Z"
    ]
  },
  {
    id: "rhomboids",
    label: "Rhomboids",
    group: "Back",
    scoreIds: ["rhomboids"],
    view: "back",
    paths: [
      "M506 187 C522 194 535 211 539 237 C517 235 499 221 489 202Z",
      "M574 187 C558 194 545 211 541 237 C563 235 581 221 591 202Z"
    ]
  },
  {
    id: "lower-back",
    label: "Lower Back",
    group: "Back",
    scoreIds: ["lower-back"],
    view: "back",
    paths: [
      "M511 332 C527 321 537 324 540 350 C535 392 521 428 503 445 C494 404 498 363 511 332Z",
      "M569 332 C553 321 543 324 540 350 C545 392 559 428 577 445 C586 404 582 363 569 332Z"
    ]
  },
  {
    id: "glutes",
    label: "Glutes",
    group: "Legs",
    scoreIds: ["glutes"],
    view: "back",
    paths: [
      "M487 394 C514 369 537 383 539 419 C532 452 510 479 483 480 C468 448 470 413 487 394Z",
      "M593 394 C566 369 543 383 541 419 C548 452 570 479 597 480 C612 448 610 413 593 394Z"
    ]
  },
  {
    id: "hamstrings",
    label: "Hamstrings",
    group: "Legs",
    scoreIds: ["hamstrings"],
    view: "back",
    paths: [
      "M497 469 C522 481 535 530 529 588 C520 628 503 649 486 638 C482 568 485 504 497 469Z",
      "M583 469 C558 481 545 530 551 588 C560 628 577 649 594 638 C598 568 595 504 583 469Z",
      "M521 477 C532 501 536 552 528 602 C521 575 516 512 521 477Z",
      "M559 477 C548 501 544 552 552 602 C559 575 564 512 559 477Z"
    ]
  },
  {
    id: "calves",
    label: "Calves",
    group: "Calves",
    scoreIds: ["calves"],
    view: "back",
    paths: [
      "M142 560 C163 587 160 657 141 703 C122 664 122 597 142 560Z",
      "M218 560 C197 587 200 657 219 703 C238 664 238 597 218 560Z",
      "M499 642 C523 667 522 721 501 746 C481 717 479 670 499 642Z",
      "M581 642 C557 667 558 721 579 746 C599 717 601 670 581 642Z"
    ]
  }
];

function recoveryLevel(input: RecoveryInput): RecoveryLevel {
  if (!input) return "none";
  if (typeof input === "string") return input;
  if (typeof input === "number") {
    if (input <= 0) return "none";
    if (input < 35) return "low";
    if (input < 65) return "medium";
    if (input < 85) return "good";
    return "high";
  }
  if (input.finalScore <= 0) return "none";
  if (input.recoveryStatus === "Fatigued") return input.finalScore > 900 ? "low" : "medium";
  if (input.recoveryStatus === "Recovering") return "medium";
  if (input.recoveryStatus === "Almost Ready") return "good";
  return input.finalScore > 1400 ? "high" : "good";
}

function scoreForMuscle(muscle: MuscleDefinition, scores: MuscleScore[]) {
  const matching = scores.filter((score) => muscle.scoreIds.includes(score.muscleId));
  if (matching.length === 0) return undefined;
  const finalScore = matching.reduce((sum, score) => sum + score.finalScore, 0) / matching.length;
  const recoveryStatus: MuscleScore["recoveryStatus"] =
    matching.some((score) => score.recoveryStatus === "Fatigued")
      ? "Fatigued"
      : matching.some((score) => score.recoveryStatus === "Recovering")
        ? "Recovering"
        : matching.some((score) => score.recoveryStatus === "Almost Ready")
          ? "Almost Ready"
          : "Ready";
  return { ...matching[0], groupName: muscle.group, finalScore, recoveryStatus };
}

function groupSummary(group: MuscleGroup, scores: MuscleScore[]) {
  const items = scores.filter((score) => score.groupName === group);
  return {
    group,
    score: items.reduce((total, item) => total + item.finalScore, 0),
    recovery: items.some((item) => item.recoveryStatus === "Fatigued") ? "Fatigued" : items[0]?.recoveryStatus ?? "Ready"
  };
}

function MuscleLayer({
  muscle,
  recovery,
  selected,
  onMuscleClick
}: {
  muscle: MuscleDefinition;
  recovery: RecoveryLevel;
  selected: boolean;
  onMuscleClick: (muscleId: string) => void;
}) {
  const gradientId = `muscle-${muscle.id}-${recovery}`;

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={muscle.label}
      className="group cursor-pointer outline-none"
      onClick={() => onMuscleClick(muscle.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onMuscleClick(muscle.id);
      }}
    >
      <title>{muscle.label}</title>
      {muscle.paths.map((path, index) => (
        <path
          key={`${muscle.id}-${index}`}
          d={path}
          fill={`url(#${gradientId})`}
          stroke={selected ? "#f8fff4" : "rgba(205,220,232,0.28)"}
          strokeWidth={selected ? 1.8 : 0.85}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300 group-hover:brightness-125"
          filter={selected ? "url(#selectedGlow)" : "url(#softInset)"}
        />
      ))}
    </g>
  );
}

function AnatomyFrame({ view, x }: { view: MuscleView; x: number }) {
  const isFront = view === "front";
  const cx = x;
  return (
    <g aria-hidden="true">
      <text x={cx} y="42" textAnchor="middle" className="fill-zinc-300 text-[18px] font-bold uppercase tracking-[0.18em]">
        {isFront ? "Front" : "Back"}
      </text>
      <path d={`M${cx - 18} 66 C${cx - 31} 43 ${cx + 31} 43 ${cx + 18} 66 C${cx + 33} 78 ${cx + 27} 107 ${cx} 114 C${cx - 27} 107 ${cx - 33} 78 ${cx - 18} 66Z`} fill="#202732" filter="url(#bodyShadow)" />
      <path d={`M${cx - 15} 112 C${cx - 20} 129 ${cx - 15} 142 ${cx} 149 C${cx + 15} 142 ${cx + 20} 129 ${cx + 15} 112Z`} fill="#202732" />
      <path
        d={`M${cx - 65} 139 C${cx - 44} 123 ${cx + 44} 123 ${cx + 65} 139 C${cx + 95} 143 ${cx + 116} 165 ${cx + 119} 195 C${cx + 131} 237 ${cx + 126} 322 ${cx + 112} 420 C${cx + 102} 455 ${cx + 84} 463 ${cx + 70} 438 C${cx + 67} 404 ${cx + 70} 355 ${cx + 84} 303 C${cx + 74} 255 ${cx + 68} 220 ${cx + 61} 195 C${cx + 54} 263 ${cx + 50} 326 ${cx + 53} 369 C${cx + 80} 402 ${cx + 84} 447 ${cx + 63} 486 C${cx + 76} 546 ${cx + 78} 637 ${cx + 61} 727 C${cx + 46} 755 ${cx + 22} 754 ${cx + 15} 724 C${cx + 21} 634 ${cx + 20} 545 ${cx} 475 C${cx - 20} 545 ${cx - 21} 634 ${cx - 15} 724 C${cx - 22} 754 ${cx - 46} 755 ${cx - 61} 727 C${cx - 78} 637 ${cx - 76} 546 ${cx - 63} 486 C${cx - 84} 447 ${cx - 80} 402 ${cx - 53} 369 C${cx - 50} 326 ${cx - 54} 263 ${cx - 61} 195 C${cx - 68} 220 ${cx - 74} 255 ${cx - 84} 303 C${cx - 70} 355 ${cx - 67} 404 ${cx - 70} 438 C${cx - 84} 463 ${cx - 102} 455 ${cx - 112} 420 C${cx - 126} 322 ${cx - 131} 237 ${cx - 119} 195 C${cx - 116} 165 ${cx - 95} 143 ${cx - 65} 139Z`}
        fill="url(#bodyBase)"
        stroke="rgba(222,232,242,0.12)"
        strokeWidth="1.2"
        filter="url(#bodyShadow)"
      />
      <path d={`M${cx - 43} 152 C${cx - 22} 143 ${cx + 22} 143 ${cx + 43} 152 C${cx + 51} 207 ${cx + 49} 302 ${cx + 37} 362 C${cx + 23} 383 ${cx - 23} 383 ${cx - 37} 362 C${cx - 49} 302 ${cx - 51} 207 ${cx - 43} 152Z`} fill="rgba(0,0,0,0.12)" />
      <path d={`M${cx} 151 L${cx} 357`} stroke="rgba(226,232,240,0.14)" strokeWidth="1" />
    </g>
  );
}

export function MuscleMap2D({
  view = "front-back",
  selectedMuscle,
  recoveryScores,
  onMuscleClick
}: {
  view?: "front-back";
  selectedMuscle?: string;
  recoveryScores: Record<string, RecoveryInput>;
  onMuscleClick: (muscleId: string) => void;
}) {
  return (
    <svg viewBox="0 0 720 760" className="h-full min-h-[520px] w-full" role="img" aria-label="Interactive front and back muscle recovery map">
      <defs>
        <filter id="bodyShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#000000" floodOpacity="0.42" />
        </filter>
        <filter id="softInset" x="-8%" y="-8%" width="116%" height="116%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#020617" floodOpacity="0.34" />
        </filter>
        <filter id="selectedGlow" x="-24%" y="-24%" width="148%" height="148%">
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#d9ffe6" floodOpacity="0.72" />
        </filter>
        <linearGradient id="bodyBase" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#2a3039" />
          <stop offset="52%" stopColor="#171d25" />
          <stop offset="100%" stopColor="#0d1219" />
        </linearGradient>
        {Object.entries(recoveryColors).map(([level, color]) => (
          <linearGradient key={level} id={`tone-${level}`} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={level === "none" ? 0.92 : 1} />
            <stop offset="58%" stopColor={color} stopOpacity={level === "none" ? 0.72 : 0.86} />
            <stop offset="100%" stopColor="#0b1016" stopOpacity={level === "none" ? 0.35 : 0.2} />
          </linearGradient>
        ))}
        {muscles.map((muscle) => {
          const level = recoveryLevel(recoveryScores[muscle.id]);
          const color = recoveryColors[level];
          return (
            <linearGradient key={muscle.id} id={`muscle-${muscle.id}-${level}`} x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={level === "none" ? 0.98 : 1} />
              <stop offset="56%" stopColor={color} stopOpacity={level === "none" ? 0.9 : 0.86} />
              <stop offset="100%" stopColor="#0b1016" stopOpacity={level === "none" ? 0.36 : 0.18} />
            </linearGradient>
          );
        })}
      </defs>

      <rect x="0" y="0" width="720" height="760" rx="26" fill="url(#sceneBackdrop)" opacity="0" />
      <AnatomyFrame view="front" x={180} />
      <AnatomyFrame view="back" x={540} />

      {muscles.map((muscle) => (
        <MuscleLayer
          key={muscle.id}
          muscle={muscle}
          recovery={recoveryLevel(recoveryScores[muscle.id])}
          selected={selectedMuscle === muscle.id}
          onMuscleClick={onMuscleClick}
        />
      ))}
    </svg>
  );
}

export function MuscleHeatmap({ scores }: { scores: MuscleScore[] }) {
  const [selectedMuscle, setSelectedMuscle] = useState("middle-pectoralis");

  const recoveryScores = useMemo(() => {
    return muscles.reduce<Record<string, MuscleScore | undefined>>((acc, muscle) => {
      acc[muscle.id] = scoreForMuscle(muscle, scores);
      return acc;
    }, {});
  }, [scores]);

  const selected = muscles.find((muscle) => muscle.id === selectedMuscle) ?? muscles[0];
  const selectedScore = scoreForMuscle(selected, scores);
  const selectedRecovery = recoveryLevel(selectedScore);
  const summaries = groupOrder.map((group) => groupSummary(group, scores));

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(520px,1fr)_360px]">
      <div className="h-[640px] overflow-hidden rounded-lg border border-white/10 bg-[radial-gradient(circle_at_50%_12%,rgba(163,255,61,0.12),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.018))] p-3 shadow-2xl shadow-black/30">
        <MuscleMap2D view="front-back" selectedMuscle={selectedMuscle} recoveryScores={recoveryScores} onMuscleClick={setSelectedMuscle} />
      </div>

      <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
        <div className="mb-4 rounded-lg border border-white/10 bg-black/20 p-4">
          <p className="flex items-center gap-2 text-sm text-zinc-400">
            <ScanSearch className="h-4 w-4" />
            Selected muscle
          </p>
          <div className="mt-2 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black">{selected.label}</h2>
              <p className="mt-1 text-sm text-zinc-400">
                {selected.group} / Score {Math.round(selectedScore?.finalScore ?? 0)}
              </p>
            </div>
            <span className="rounded-md px-3 py-1 text-sm font-bold text-iron-950" style={{ backgroundColor: recoveryColors[selectedRecovery] }}>
              {selectedRecovery}
            </span>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2">
          {summaries.map((summary) => (
            <button
              key={summary.group}
              type="button"
              onClick={() => {
                const first = muscles.find((muscle) => muscle.group === summary.group);
                if (first) setSelectedMuscle(first.id);
              }}
              className={`rounded-md px-3 py-2 text-left text-sm transition ${selected.group === summary.group ? "bg-white text-iron-950" : "bg-white/8 text-zinc-200 hover:bg-white/12"}`}
            >
              <span className="block font-bold">{summary.group}</span>
              <span className="text-xs opacity-70">{Math.round(summary.score)}</span>
            </button>
          ))}
        </div>

        <div className="grid gap-2">
          {muscles.map((muscle) => {
            const active = selected.id === muscle.id;
            const level = recoveryLevel(recoveryScores[muscle.id]);
            return (
              <button
                key={muscle.id}
                type="button"
                title={muscle.label}
                onClick={() => setSelectedMuscle(muscle.id)}
                className={`flex min-h-11 items-center justify-between gap-3 rounded-md border px-3 py-2 text-left text-sm transition ${
                  active ? "border-white/40 bg-white/14 text-white shadow-[0_0_18px_rgba(163,255,61,0.16)]" : "border-white/10 bg-white/[0.045] text-zinc-200 hover:bg-white/10"
                }`}
              >
                <span className="font-semibold">{muscle.label}</span>
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: recoveryColors[level] }} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

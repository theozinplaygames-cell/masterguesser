import { useMemo } from "react";
import { MAP_HEIGHT, MAP_WIDTH, shapes, groupEllipse } from "@/lib/geo";

type Props = {
  selected: string | null;
  onSelect: (id: string) => void;
  disabled?: boolean;
  correctId?: string | null;
  wrongId?: string | null;
  highlightIds?: string[];
  ellipseIds?: string[];
  ellipseLabel?: string;
};

export function WorldMap({
  selected,
  onSelect,
  disabled,
  correctId,
  wrongId,
  highlightIds,
  ellipseIds,
  ellipseLabel,
}: Props) {
  const highlight = useMemo(() => new Set(highlightIds ?? []), [highlightIds]);
  const ellipse = useMemo(
    () => (ellipseIds && ellipseIds.length ? groupEllipse(ellipseIds) : null),
    [ellipseIds],
  );

  return (
    <svg
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      className="block h-auto w-full select-none"
      role="img"
      aria-label="Mapa-múndi interativo"
    >
      <rect width={MAP_WIDTH} height={MAP_HEIGHT} className="fill-ocean" />
      <g strokeLinejoin="round" strokeLinecap="round">
        {shapes.map((s) => {
          const state =
            s.id === correctId
              ? "correct"
              : s.id === wrongId
                ? "wrong"
                : s.id === selected
                  ? "selected"
                  : highlight.has(s.id)
                    ? "hint"
                    : "idle";
          return (
            <path
              key={s.id}
              d={s.d}
              vectorEffect="non-scaling-stroke"
              data-state={state}
              className="country"
              onClick={() => !disabled && onSelect(s.id)}
              style={{ cursor: disabled ? "default" : "pointer" }}
            />
          );
        })}
      </g>
      {ellipse && (
        <g className="pointer-events-none">
          <ellipse
            cx={ellipse.cx}
            cy={ellipse.cy}
            rx={ellipse.rx}
            ry={ellipse.ry}
            className="hint-ring"
          />
          {ellipseLabel && (
            <text
              x={ellipse.cx}
              y={Math.max(14, ellipse.cy - ellipse.ry - 8)}
              textAnchor="middle"
              className="hint-label"
            >
              {ellipseLabel}
            </text>
          )}
        </g>
      )}
    </svg>
  );
}

function Lantern({ position }: { position: string }) {
  return (
    <div className={`halloween-lantern halloween-lantern-${position}`}>
      <svg viewBox="0 0 128 116" focusable="false">
        <defs>
          <linearGradient id={`halloween-rind-${position}`} x1="0" y1="0" x2="0.8" y2="1">
            <stop stopColor="#ffbf65" />
            <stop offset="0.48" stopColor="#f88435" />
            <stop offset="1" stopColor="#b84230" />
          </linearGradient>
          <linearGradient id={`halloween-candle-${position}`} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#fff2b3" />
            <stop offset="1" stopColor="#ffb540" />
          </linearGradient>
          <pattern
            id={`halloween-speckles-${position}`}
            width="13"
            height="11"
            patternUnits="userSpaceOnUse"
          >
            <path d="m2 3 1 1m7 4 1-1M5 9h1" stroke="#762936" strokeWidth="0.8" opacity="0.24" />
            <path d="m9 2 1 1M1 8h1" stroke="#ffe0a0" strokeWidth="1" opacity="0.45" />
          </pattern>
        </defs>
        <ellipse cx="65" cy="107" rx="46" ry="6" fill="#24132f" opacity="0.7" />
        <path
          d="M58 29c4-9 1-15 7-23l12 3c-8 6-10 12-10 22"
          fill="#796347"
          stroke="#382038"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M64 30C43 13 16 28 12 52 0 81 22 105 44 102c12 8 29 7 40 1 24 2 40-18 34-44-1-24-28-44-54-29Z"
          fill={`url(#halloween-rind-${position})`}
          stroke="#382038"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path
          d="M43 30c-14 19-17 48-5 67M82 31c15 20 19 44 8 66M59 29c-8 19-8 56-1 73M69 30c8 20 10 53 4 73"
          fill="none"
          stroke="#a64a37"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.65"
        />
        <path
          d="M24 46c3-9 8-14 15-15m-22 30c-2 11 0 20 5 25M85 29c13 4 20 11 24 22"
          fill="none"
          stroke="#ffda8d"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.75"
        />
        <path
          d="M64 30C43 13 16 28 12 52 0 81 22 105 44 102c12 8 29 7 40 1 24 2 40-18 34-44-1-24-28-44-54-29Z"
          fill={`url(#halloween-speckles-${position})`}
        />
        <g
          fill={`url(#halloween-candle-${position})`}
          stroke="#382038"
          strokeWidth="3"
          strokeLinejoin="round"
        >
          <path d="m29 60 13-18 9 20Z" />
          <path d="m77 61 9-19 14 17Z" />
          <path d="m58 68 7-10 6 11Z" />
          <path d="m27 76 16 6 4-7 10 10 10 1 9-9 5 6 20-9c-6 18-20 24-35 24-18 0-31-7-39-22Z" />
        </g>
        <path
          d="m35 59 7-10m42 8 3-8m-44 40 10 4m23-1 10-4"
          fill="none"
          stroke="#fff6cb"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M16 51c-3 13-1 27 5 35"
          fill="none"
          stroke="#efa3d0"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.65"
        />
      </svg>
    </div>
  );
}

const decorations = (
  <div className="halloween-decorations" aria-hidden="true">
    <svg className="halloween-garland" viewBox="0 0 1200 220" focusable="false">
      <defs>
        <g id="halloween-bat" fill="#251329" stroke="#ffb361" strokeWidth="1.5">
          <path d="M-30 0-19-13-10-5-5-13 0-8 5-13 10-5 19-13 30 0 20-2 14 7 6 4 0 12-6 4-14 7-20-2Z" />
        </g>
      </defs>
      <path
        d="M-15 30Q230 200 480 60M720 60Q970 200 1215 30"
        fill="none"
        stroke="#24152d"
        strokeWidth="7"
      />
      <path
        d="M-15 30Q230 200 480 60M720 60Q970 200 1215 30"
        fill="none"
        stroke="#ffc17d"
        strokeWidth="2"
      />
      {[
        { x: 42, y: 66, r: 24 },
        { x: 119, y: 101, r: 16 },
        { x: 202, y: 120, r: 5 },
        { x: 286, y: 120, r: -6 },
        { x: 368, y: 102, r: -18 },
        { x: 447, y: 75, r: -25 },
        { x: 753, y: 75, r: 25 },
        { x: 832, y: 102, r: 18 },
        { x: 914, y: 120, r: 6 },
        { x: 998, y: 120, r: -5 },
        { x: 1081, y: 101, r: -16 },
        { x: 1158, y: 66, r: -24 },
      ].map(({ x, y, r }, i) => (
        <g key={x} transform={`translate(${x} ${y}) rotate(${r})`}>
          <path
            d="M-29 0H29L0 67Z"
            fill={i % 2 ? "#301c3b" : "#f8953e"}
            stroke="#ffcb82"
            strokeWidth="2"
          />
          {i % 2 ? (
            <use href="#halloween-bat" transform="translate(0 23) scale(.65)" />
          ) : (
            <g fill="#301c3b">
              <path d="m-18 23 8-10 5 11Zm23 1 5-11 8 10Z" />
              <path d="M-15 32 0 38 15 32 8 45H-8Z" />
            </g>
          )}
        </g>
      ))}
    </svg>
    <HalloweenPartyTrim variant="section" />
    <div className="halloween-candles halloween-candles-left">
      <i />
      <i />
      <i />
    </div>
    <div className="halloween-candles halloween-candles-right">
      <i />
      <i />
      <i />
    </div>
    <svg className="halloween-floor-ghost" viewBox="0 0 90 110" focusable="false">
      <path
        d="M10 98V40a35 35 0 0 1 70 0v58L65 86 53 101 39 88 24 101Z"
        fill="#f4e3fa"
        stroke="#553464"
        strokeWidth="3"
      />
      <ellipse cx="33" cy="40" rx="5" ry="9" fill="#352040" />
      <ellipse cx="58" cy="40" rx="5" ry="9" fill="#352040" />
      <ellipse cx="46" cy="63" rx="6" ry="8" fill="#352040" />
    </svg>
    <Lantern position="bar" />
    <Lantern position="left" />
    <Lantern position="right" />
  </div>
);

export function HalloweenDecorations() {
  return decorations;
}

// Shared seasonal artwork stays decorative and adds no interaction targets.
export function HalloweenPartyTrim({
  variant = "hero",
}: {
  variant?: "hero" | "section" | "closing";
}) {
  return (
    <div className={`halloween-party-trim halloween-party-trim-${variant}`} aria-hidden="true">
      <svg viewBox="0 0 1200 240" focusable="false">
        <g fill="none" stroke="#d4b3ed" strokeWidth="1.5" opacity=".65">
          <path d="M0 0 180 160M0 0 230 55M0 0 70 220M0 0V230M0 0H240M1200 0 1020 160M1200 0 970 55M1200 0 1130 220M1200 0V230M1200 0H960" />
          <path d="M0 45Q18 37 45 42Q48 22 50 0M0 95Q35 76 90 82Q96 42 100 0M0 150Q55 117 136 123Q145 65 150 0M0 205Q78 163 181 164Q194 88 205 0M1200 45Q1182 37 1155 42Q1152 22 1150 0M1200 95Q1165 76 1110 82Q1104 42 1100 0M1200 150Q1145 117 1064 123Q1055 65 1050 0M1200 205Q1122 163 1019 164Q1006 88 995 0" />
        </g>
        <g fill="#130b23" stroke="#be8ceb" strokeWidth="2">
          <path d="m220 72 24-31 24 21 13-15 10 15 24-21 24 31-29-3-12 18-16-8-16 8-12-18Z" />
          <path d="m859 125 25-30 23 20 12-15 10 15 24-20 25 30-29-3-13 18-16-8-16 8-12-18Z" />
        </g>
        <g transform="translate(1020 85) rotate(12)">
          <path
            d="M0 43V0a27 27 0 0 1 54 0v43l-10-9-8 10-10-9-12 9-6-10Z"
            fill="#f4e3fa"
            stroke="#654082"
            strokeWidth="3"
          />
          <ellipse cx="18" cy="5" rx="4" ry="7" fill="#352040" />
          <ellipse cx="37" cy="5" rx="4" ry="7" fill="#352040" />
          <ellipse cx="28" cy="23" rx="5" ry="7" fill="#352040" />
        </g>
        <g transform="translate(140 150) rotate(-12)">
          <path
            d="M-28 14-9-43 25 10 39 19Q0 35-42 21Z"
            fill="#352044"
            stroke="#b78cdb"
            strokeWidth="3"
          />
          <path d="m-23 5 44-2 6 10-54 3Z" fill="#ff9e48" />
          <path d="M-3 5H8v10H-3Z" fill="none" stroke="#ffe29b" strokeWidth="3" />
        </g>
      </svg>
    </div>
  );
}

import type { ReactNode } from "react";

// Coordinates follow the original 512px cat illustrations, so accessories move
// with each sprite without changing the cat's interaction area or discovery data.
export function HalloweenCostume({ breed, behind = false }: { breed: string; behind?: boolean }) {
  if (behind) {
    if (breed === "bengal")
      return (
        <CostumeFrame behind>
          <g fill="#55285d" stroke="#301436" strokeWidth="7" strokeLinejoin="round">
            <path d="M228 307C165 245 98 207 101 128c42 24 82 22 117 4-4 39 10 67 42 87 28-10 46-29 55-58 48 5 79-9 107-38 18 79-11 140-91 192Z" />
            <path
              d="m228 307-98-145 59 98m142 55 62-155-73 100"
              fill="none"
              stroke="#ad70b1"
              strokeWidth="5"
            />
          </g>
        </CostumeFrame>
      );
    if (breed !== "russian-blue") return null;
    return (
      <svg
        className="halloween-costume halloween-costume-back"
        viewBox="0 0 512 512"
        focusable="false"
        aria-hidden="true"
      >
        <path
          d="M200 218 136 190 145 278 104 392 156 378 181 413 216 394 260 418 325 395 295 254 284 216Z"
          fill="#341542"
          stroke="#3b183f"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        <path
          d="m200 225-44-16 11 69-42 104 37-18 19 30 34-20 40 24 52-16-35-128Z"
          fill="#ad345d"
        />
        <path
          d="m168 279 12 83m17-102 16 116m60-103 17 95"
          fill="none"
          stroke="#e56d82"
          strokeWidth="5"
          opacity=".55"
        />
      </svg>
    );
  }
  if (breed === "minuet")
    return (
      <svg className="halloween-costume" viewBox="0 0 512 512" focusable="false" aria-hidden="true">
        <g transform="rotate(10 295 135)" stroke="#3b183f" strokeWidth="7" strokeLinejoin="round">
          <path d="M208 127 276 4 317 31 300 36 365 136Z" fill="#56306b" />
          <path d="m276 4 4 34-29 74" fill="none" stroke="#9462a6" strokeWidth="5" />
          <path d="m225 97 120 8 14 29-151-8Z" fill="#ff993d" />
          <path d="M175 127q102-29 225 17l-3 19q-132 21-227-19Z" fill="#43234f" />
          <path d="m273 105 29 2-2 26-30-2Z" fill="#ffe09a" strokeWidth="5" />
          <path d="m282 112 12 1-1 12-12-1Z" fill="#54305d" stroke="none" />
        </g>
        <path d="m311 66 3 8 9 2-8 5-1 9-6-7-9 1 5-8-3-8Z" fill="#ffe4a4" />
      </svg>
    );
  if (breed === "norwegian-forest")
    return (
      <svg className="halloween-costume" viewBox="0 0 512 512" focusable="false" aria-hidden="true">
        <g transform="rotate(-9 258 102)" stroke="#3b183f" strokeWidth="6" strokeLinejoin="round">
          <path d="M180 115c-19-20-9-51 22-57 29-28 95-22 111 8 34 4 39 42 12 57Z" fill="#ef8c37" />
          <path
            d="M212 60c-19 18-20 42-10 56m52-65c-11 23-10 43-4 66m37-59c17 19 20 39 13 60"
            fill="none"
            stroke="#bc562f"
            strokeWidth="4"
          />
          <path d="m253 49 5-28 21 3-12 27" fill="#699757" />
          <path d="M184 112q70 16 145 0l-7 21q-76 14-133-4Z" fill="#7d3b33" />
          <g fill="#41203d" stroke="none">
            <path d="m215 84 12-14 10 17Zm58 3 10-15 13 14Z" />
            <path d="m231 96 23 7 23-7-9 16h-27Z" />
          </g>
        </g>
      </svg>
    );
  if (breed === "ragamuffin")
    return (
      <svg className="halloween-costume" viewBox="0 0 512 512" focusable="false" aria-hidden="true">
        <g stroke="#3b183f" strokeWidth="7" strokeLinejoin="round">
          <path d="M179 140q-29-37-15-75 10 31 44 44Z" fill="#e25872" />
          <path d="M286 129q16-44 48-54-17 29-15 59Z" fill="#e25872" />
          <path d="M176 141q64-37 143-4" fill="none" stroke="#70314f" strokeWidth="14" />
          <path d="m198 277 31 17-28 22-9-24-26 10-6-35Z" fill="#9d3159" />
          <path d="m228 294 31-17 8 26-26-9-2 23Z" fill="#d55b77" />
          <circle cx="229" cy="294" r="9" fill="#ffc16a" strokeWidth="4" />
        </g>
      </svg>
    );
  if (breed === "russian-blue")
    return (
      <svg className="halloween-costume" viewBox="0 0 512 512" focusable="false" aria-hidden="true">
        <g stroke="#3b183f" strokeWidth="5" strokeLinejoin="round">
          <path d="m177 216 45 17-7 28-41-32Z" fill="#d94e73" />
          <path d="m222 233 59-26-22 44-32 10Z" fill="#8d2c57" />
          <path d="m219 253 15-3 12 18-14 16-16-17Z" fill="#ffc46a" />
        </g>
        <path
          d="m224 175 5 12 4-15m18-2 5 11 2-15"
          fill="#fff1d4"
          stroke="#4f284b"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    );
  const accessory = extraCostumes[breed];
  return accessory ? <CostumeFrame>{accessory}</CostumeFrame> : null;
}

function CostumeFrame({ children, behind = false }: { children: ReactNode; behind?: boolean }) {
  return (
    <svg
      className={`halloween-costume${behind ? " halloween-costume-back" : ""}`}
      viewBox="0 0 512 512"
      focusable="false"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

// Static accessories are shared across renders. Each uses its own cat's head
// and shoulder coordinates; the DJ intentionally has no entry.
const extraCostumes: Record<string, ReactNode> = {
  munchkin: (
    <g transform="rotate(-13 220 155)" stroke="#3b183f" strokeWidth="7" strokeLinejoin="round">
      <path d="m148 150 66-128 74 134Z" fill="#3c3f83" />
      <path d="m173 108 93 3 16 35-123-1Z" fill="#c193dc" />
      <path d="M112 145q102-23 207 14l-7 21q-105 12-204-15Z" fill="#303366" />
      <g fill="#ffe5a0" stroke="none">
        <path d="m216 49 5 13 14 1-11 9 4 14-12-8-12 8 4-14-11-9 14-1Z" />
        <path d="m240 93 3 7 8 1-6 5 2 8-7-5-6 5 2-8-6-5 8-1Z" />
      </g>
    </g>
  ),
  ragdoll: (
    <g transform="rotate(8 231 126)" stroke="#3b183f" strokeWidth="7" strokeLinejoin="round">
      <path d="m166 117-8-89q65-25 133-3l-5 96Z" fill="#34233e" />
      <path d="m165 89 123 1-1 29-121-2Z" fill="#f09a46" />
      <path d="M128 119q102-22 199 0l-4 23q-103 20-196-1Z" fill="#442a52" />
      <g fill="#fff0cf" stroke="none">
        <circle cx="222" cy="61" r="17" />
        <path d="m210 73 9-8 12 4 3 15h-24Z" />
      </g>
      <g fill="#3b183f" stroke="none">
        <ellipse cx="216" cy="60" rx="4" ry="5" />
        <ellipse cx="228" cy="60" rx="4" ry="5" />
      </g>
    </g>
  ),
  "american-shorthair": (
    <g transform="rotate(-10 270 125)" stroke="#3b183f" strokeWidth="7" strokeLinejoin="round">
      <path d="M151 140 127 77q44 16 70-8 69-72 135-3 27 22 72 4l-27 69Z" fill="#46304f" />
      <path d="m144 96 15 32 205-2 18-32" fill="none" stroke="#e9b75d" strokeWidth="6" />
      <path d="M164 136q98-16 207 0l-10 20-189 2Z" fill="#bf4c59" />
      <path d="m249 101 43-24m-43 0 43 24" fill="none" stroke="#fff0d0" strokeWidth="6" />
      <path d="M254 65a17 17 0 1 1 34 0v14h-10v6h-14v-6h-10Z" fill="#fff0d0" strokeWidth="3" />
      <g fill="#3b183f" stroke="none">
        <circle cx="265" cy="65" r="4" />
        <circle cx="279" cy="65" r="4" />
      </g>
    </g>
  ),
  siberian: (
    <g stroke="#3b183f" strokeWidth="6" strokeLinejoin="round">
      <g transform="rotate(-13 257 118)">
        <path d="M158 105q100-39 201-1l-4 40q-101-24-195 2Z" fill="#9dbc70" />
        <path
          d="m177 118 156-3m-132-10 1 27m33-30 1 25m34-27 1 25m31-22 1 23"
          fill="none"
          stroke="#4d5744"
          strokeWidth="4"
        />
      </g>
      <path d="m126 179-24-2-2 20 25 2m245-48 27-5 3 20-25 5" fill="#b4bdc3" />
      <path d="m97 174-12 2 2 26 14-2m296-59 13-2 5 25-13 3" fill="#8796a4" />
      <path d="m240 274 25-6 20 17-23 18Z" fill="#ffb65b" />
    </g>
  ),
  "british-shorthair": (
    <g transform="rotate(8 243 121)" stroke="#3b183f" strokeWidth="6" strokeLinejoin="round">
      <path
        d="M157 122V75q0-65 81-62 84 2 84 63v48l-22-12-18 16-21-13-20 15-23-14-20 14-18-15Z"
        fill="#f1e4f4"
      />
      <g fill="#483154" stroke="none">
        <ellipse cx="214" cy="65" rx="8" ry="12" />
        <ellipse cx="262" cy="65" rx="8" ry="12" />
        <ellipse cx="238" cy="91" rx="9" ry="11" />
      </g>
      <path d="M157 119q85 16 165 0" fill="none" stroke="#b99fca" strokeWidth="5" />
    </g>
  ),
  "maine-coon": (
    <g stroke="#3b183f" strokeWidth="5" strokeLinejoin="round">
      <path d="M177 226q34 16 79-8l17 103-31 60-51-13-30-77Z" fill="#35233d" />
      <g fill="none" stroke="#f2e4d6" strokeWidth="9" strokeLinecap="round">
        <path d="m214 244 13 97m-44-88 30 7 29-11m-56 28 30 7 28-11m-53 28 28 6 26-10m-52 27 29 7 24-9" />
      </g>
      <path d="m186 228 30 8 37-15" fill="none" stroke="#ffb56b" strokeWidth="7" />
    </g>
  ),
  bengal: (
    <g stroke="#3b183f" strokeWidth="5" strokeLinejoin="round">
      <path d="m288 298 28 16-12 21-10-14-23 2Z" fill="#f69c4b" />
      <path d="m316 314 29-9-3 25-19-7-11 16Z" fill="#da743c" />
      <circle cx="314" cy="319" r="8" fill="#c19be5" />
    </g>
  ),
};

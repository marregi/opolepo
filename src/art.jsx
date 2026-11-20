import React from "react";
export default function Books() {
  return (
    <svg className="books" viewBox="0 0 360 210" aria-hidden="true">
      <defs>
        <pattern id="grid" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="#b6d0ba" opacity=".33" />
        </pattern>
      </defs>
      <rect x="45" y="5" width="278" height="196" fill="url(#grid)" />
      <ellipse
        cx="180"
        cy="183"
        rx="101"
        ry="12"
        fill="#0b2c28"
        opacity=".45"
      />
      <g stroke="#173d35" strokeWidth="2.3" strokeLinejoin="round">
        <path d="m63 140 118-37 103 42-119 43-102-39z" fill="#ed9a75" />
        <path d="m66 136 116-35 98 39-116 42-98-37z" fill="#f4dcb8" />
        <path d="m60 130 120-38 104 42-121 43z" fill="#f3a581" />
        <path d="m60 130 103 47 1 12-101-39q-8-4-3-20z" fill="#d97c58" />
        <path d="m78 117 110-37 91 34-112 43-89-32z" fill="#9cc7a5" />
        <path d="m83 108 107-34 86 34v13l-109 39-84-34z" fill="#f6ebce" />
        <path d="m76 104 111-36 92 37-113 40z" fill="#a7cdb0" />
        <path d="m76 104 90 41 1 15-88-34q-8-6-3-22z" fill="#75a88a" />
        <path d="m63 90 115-43 88 36-115 47-88-32z" fill="#eece99" />
        <path d="m67 81 112-39 84 34v19l-112 41-84-35z" fill="#f8ebcc" />
        <path d="m61 76 115-42 91 37-116 45z" fill="#f4d7a7" />
        <path d="m61 76 90 40v20l-88-36q-9-6-2-24z" fill="#dcb785" />
        <path d="m75 71 90 40" fill="none" />
        <path d="m126 69 38-14 25 10-39 15z" fill="#faf0d7" />
        <path d="m204 96 14-5v24l-8-3-6 8z" fill="#e37e54" />
      </g>
      <g stroke="#bea785" strokeWidth="1.2" fill="none">
        <path d="m156 119 41-15m27-10 35-13m-101 45 38-14m-21 37 92-33m-96 60 101-36" />
      </g>
      <g transform="rotate(28 278 65)" stroke="#243f35" strokeWidth="1.7">
        <path d="M274 14q5-6 11 0v9h-11z" fill="#e49877" />
        <path d="M274 22h11v7h-11z" fill="#e3d9bb" />
        <path d="M274 29h11v70l-5 16-6-16z" fill="#edb06d" />
        <path d="M280 30v68" fill="none" />
        <path d="m274 99 6 16 5-16z" fill="#f8dfae" />
        <path d="m278 110 2 5 2-5" fill="#183f34" />
      </g>
      <g fill="#efce98">
        <path d="m78 28 2 7 7 2-7 2-2 7-2-7-7-2 7-2z" />
        <path d="m305 123 2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />
      </g>
      <g fill="none" stroke="#b6c6a4" strokeWidth="1.5">
        <path d="m41 111 8-3m-5-6 7 1m151-78 4-7m1 11 7-3" />
        <path d="M291 169q22-5 18-21" strokeDasharray="3 4" />
      </g>
    </svg>
  );
}

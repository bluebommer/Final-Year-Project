export default function GeometricGrid() {
  const cols = 9;
  const rows = 6;
  const gx = 70; // grid cell width
  const gy = 58; // grid cell height
  const ox = 30; // x offset
  const oy = 10; // y offset

  // Highlight certain intersections
  const highlighted = [
    [2,1],[4,1],[6,2],[3,3],[5,3],[7,3],[2,4],[4,4],[6,4],[3,2],[5,2],
  ];

  return (
    <svg viewBox="0 0 700 360" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%' }} aria-hidden="true">
      <defs>
        <radialGradient id="coreGlow3" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#00ff88" stopOpacity="0.7" />
          <stop offset="45%"  stopColor="#008844" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#002210" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="node3" cx="35%" cy="35%" r="65%">
          <stop offset="0%"   stopColor="#80ffcc" stopOpacity="1" />
          <stop offset="100%" stopColor="#00a855" stopOpacity="0.3" />
        </radialGradient>
        <filter id="blur3c"><feGaussianBlur stdDeviation="3" /></filter>
        <filter id="blur8c"><feGaussianBlur stdDeviation="8" /></filter>
        <filter id="blur18c"><feGaussianBlur stdDeviation="18" /></filter>
      </defs>

      {/* Green ambient glow */}
      <ellipse cx="360" cy="180" rx="250" ry="200" fill="url(#coreGlow3)" filter="url(#blur18c)" opacity="0.5" />

      {/* Teal/blue secondary */}
      <ellipse cx="580" cy="80" rx="120" ry="100" fill="#004466" filter="url(#blur18c)" opacity="0.35" />

      {/* Grid horizontal lines */}
      {Array.from({ length: rows + 1 }, (_, r) => (
        <line key={`h-${r}`}
          x1={ox} y1={oy + r * gy}
          x2={ox + cols * gx} y2={oy + r * gy}
          stroke="#00cc66" strokeWidth="0.5" strokeOpacity="0.15"
        />
      ))}

      {/* Grid vertical lines */}
      {Array.from({ length: cols + 1 }, (_, c) => (
        <line key={`v-${c}`}
          x1={ox + c * gx} y1={oy}
          x2={ox + c * gx} y2={oy + rows * gy}
          stroke="#00cc66" strokeWidth="0.5" strokeOpacity="0.15"
        />
      ))}

      {/* Diagonal accent lines */}
      {[
        [0,0, 4,6], [2,0, 7,5], [4,0, 9,4],
        [0,2, 5,6], [0,4, 3,6],
      ].map(([x1,y1,x2,y2], i) => (
        <line key={`d-${i}`}
          x1={ox + x1*gx} y1={oy + y1*gy}
          x2={ox + x2*gx} y2={oy + y2*gy}
          stroke="#00ff88" strokeWidth="0.6" strokeOpacity="0.12"
        />
      ))}

      {/* Highlighted grid cells */}
      {[
        [2,1],[4,2],[6,1],[3,3],[5,2],[7,3],[2,4],[6,3],
      ].map(([c,r], i) => (
        <rect key={`cell-${i}`}
          x={ox + c*gx + 1} y={oy + r*gy + 1}
          width={gx - 2} height={gy - 2}
          fill="#00ff88" fillOpacity="0.04"
          stroke="#00cc66" strokeWidth="0.8" strokeOpacity="0.3"
          rx="2"
        />
      ))}

      {/* Glowing intersection nodes */}
      {highlighted.map(([c, r], i) => {
        const nx = ox + c * gx;
        const ny = oy + r * gy;
        return (
          <g key={`hn-${i}`}>
            <circle cx={nx} cy={ny} r="5" fill="#00dd77" filter="url(#blur3c)" opacity="0.5" />
            <circle cx={nx} cy={ny} r="2.5" fill="url(#node3)">
              <animate attributeName="opacity" values="0.5;1;0.5"
                dur={`${1.8 + (i%6)*0.35}s`} repeatCount="indefinite" begin={`${i*0.18}s`} />
            </circle>
          </g>
        );
      })}

      {/* Travelling pulses along grid lines */}
      {[
        { x1: ox,        y1: oy+gy,   x2: ox+cols*gx, y2: oy+gy,   dur:'4s',  begin:'0s'   },
        { x1: ox,        y1: oy+3*gy, x2: ox+cols*gx, y2: oy+3*gy, dur:'5s',  begin:'1s'   },
        { x1: ox+3*gx,   y1: oy,      x2: ox+3*gx,    y2: oy+rows*gy, dur:'3.5s', begin:'0.5s' },
        { x1: ox+6*gx,   y1: oy,      x2: ox+6*gx,    y2: oy+rows*gy, dur:'4.5s', begin:'1.5s' },
      ].map((l, i) => (
        <circle key={`tp-${i}`} r="2.5" fill="#80ffcc" opacity="0.9">
          <animateMotion dur={l.dur} repeatCount="indefinite" begin={l.begin}>
            <mpath href={`#gridpath-${i}`} />
          </animateMotion>
        </circle>
      ))}

      <defs>
        {[
          { x1: ox,      y1: oy+gy,   x2: ox+cols*gx, y2: oy+gy   },
          { x1: ox,      y1: oy+3*gy, x2: ox+cols*gx, y2: oy+3*gy },
          { x1: ox+3*gx, y1: oy,      x2: ox+3*gx,    y2: oy+rows*gy },
          { x1: ox+6*gx, y1: oy,      x2: ox+6*gx,    y2: oy+rows*gy },
        ].map((p, i) => (
          <path key={i} id={`gridpath-${i}`} d={`M ${p.x1} ${p.y1} L ${p.x2} ${p.y2}`} />
        ))}
      </defs>

      {/* Central focal point */}
      <circle cx="360" cy="180" r="50" fill="#00cc66" filter="url(#blur8c)" opacity="0.25" />
      <circle cx="360" cy="180" r="22" fill="#00ff88" filter="url(#blur3c)" opacity="0.5" />
      <circle cx="360" cy="180" r="8" fill="#ffffff" opacity="0.85">
        <animate attributeName="r" values="7;10;7" dur="4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.75;0.95;0.75" dur="4s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}
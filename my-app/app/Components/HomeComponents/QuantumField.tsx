export default function QuantumField() {
  // Particles scattered across the right half
  const particles = [
    { x: 150, y:  50, r: 3 },  { x: 250, y:  90, r: 2 },
    { x: 380, y:  40, r: 4 },  { x: 480, y:  80, r: 2.5 },
    { x: 560, y:  50, r: 3 },  { x: 620, y: 130, r: 2 },
    { x: 590, y: 210, r: 3.5 },{ x: 540, y: 290, r: 2 },
    { x: 440, y: 320, r: 3 },  { x: 320, y: 310, r: 2.5 },
    { x: 200, y: 290, r: 2 },  { x: 120, y: 220, r: 3 },
    { x: 100, y: 140, r: 2 },  { x: 170, y: 170, r: 4 },
    { x: 300, y: 160, r: 2.5 },{ x: 420, y: 180, r: 3 },
    { x: 500, y: 150, r: 2 },  { x: 350, y:  80, r: 2 },
    { x: 260, y: 230, r: 3 },  { x: 460, y: 260, r: 2 },
  ];

  // Orbital rings around a central mass
  const cx = 360; const cy = 175;

  return (
    <svg viewBox="0 0 700 360" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%' }} aria-hidden="true">
      <defs>
        <radialGradient id="coreGlow2" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#c040ff" stopOpacity="0.9" />
          <stop offset="40%"  stopColor="#8010cc" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#300060" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="particle2" cx="35%" cy="35%" r="65%">
          <stop offset="0%"   stopColor="#e090ff" stopOpacity="1" />
          <stop offset="100%" stopColor="#8020c0" stopOpacity="0.3" />
        </radialGradient>
        <filter id="blur8b"><feGaussianBlur stdDeviation="8" /></filter>
        <filter id="blur3b"><feGaussianBlur stdDeviation="3" /></filter>
        <filter id="blur20b"><feGaussianBlur stdDeviation="20" /></filter>
        <filter id="blur5b"><feGaussianBlur stdDeviation="5" /></filter>
      </defs>

      {/* Deep purple ambient */}
      <ellipse cx={cx} cy={cy} rx="220" ry="190" fill="url(#coreGlow2)" filter="url(#blur20b)" opacity="0.55" />

      {/* Teal secondary glow */}
      <ellipse cx="550" cy="260" rx="130" ry="100" fill="#006688" filter="url(#blur20b)" opacity="0.3" />

      {/* Orbital ellipses */}
      {[
        { rx:180, ry:60,  rot:-20, dur:'8s'  },
        { rx:240, ry:90,  rot: 15, dur:'12s' },
        { rx:140, ry:40,  rot: 40, dur:'6s'  },
      ].map((o, i) => (
        <ellipse key={i} cx={cx} cy={cy} rx={o.rx} ry={o.ry}
          fill="none" stroke="#b060ee" strokeWidth="0.5" strokeOpacity="0.2"
          transform={`rotate(${o.rot} ${cx} ${cy})`}
        />
      ))}

      {/* Orbiting dots */}
      {[
        { rx:180, ry:60,  rot:-20, dur:'8s',  color:'#e080ff' },
        { rx:240, ry:90,  rot: 15, dur:'12s', color:'#80d0ff' },
        { rx:140, ry:40,  rot: 40, dur:'6s',  color:'#c060ff' },
      ].map((o, i) => (
        <g key={`od-${i}`} transform={`rotate(${o.rot} ${cx} ${cy})`}>
          <circle r="3.5" fill={o.color} filter="url(#blur3b)" opacity="0.9">
            <animateTransform attributeName="transform" type="rotate"
              from={`0 ${cx} ${cy}`} to={`360 ${cx} ${cy}`}
              dur={o.dur} repeatCount="indefinite" />
          </circle>
        </g>
      ))}

      {/* Scattered particles */}
      {particles.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={p.r + 2} fill="#9040cc" filter="url(#blur5b)" opacity="0.4" />
          <circle cx={p.x} cy={p.y} r={p.r} fill="url(#particle2)">
            <animate attributeName="opacity" values="0.4;1;0.4"
              dur={`${1.5 + (i % 7) * 0.4}s`} repeatCount="indefinite" begin={`${i * 0.15}s`} />
            <animate attributeName="r" values={`${p.r};${p.r*1.4};${p.r}`}
              dur={`${2 + (i % 5) * 0.5}s`} repeatCount="indefinite" begin={`${i * 0.2}s`} />
          </circle>
        </g>
      ))}

      {/* Entanglement lines between random particle pairs */}
      {[[0,8],[1,14],[3,10],[5,18],[7,15],[2,19],[6,12],[4,16]].map(([a,b],i) => (
        <line key={i}
          x1={particles[a].x} y1={particles[a].y}
          x2={particles[b].x} y2={particles[b].y}
          stroke="#c060ff" strokeWidth="0.5" strokeOpacity="0.2"
        />
      ))}

      {/* Core mass */}
      <circle cx={cx} cy={cy} r="45" fill="#9020cc" filter="url(#blur8b)" opacity="0.5" />
      <circle cx={cx} cy={cy} r="20" fill="#d060ff" filter="url(#blur3b)" opacity="0.8" />
      <circle cx={cx} cy={cy} r="8" fill="#ffffff" opacity="0.9">
        <animate attributeName="r" values="7;10;7" dur="3.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.8;1;0.8" dur="3.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}
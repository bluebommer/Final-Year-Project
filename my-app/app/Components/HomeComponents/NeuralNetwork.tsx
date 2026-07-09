export default function NeuralNetwork() {
  const cx = 320;
  const cy = 180;

  const nodes = [
    { id: 'n1',  x: 520, y:  60 },
    { id: 'n2',  x: 580, y: 140 },
    { id: 'n3',  x: 560, y: 240 },
    { id: 'n4',  x: 490, y: 310 },
    { id: 'n5',  x: 390, y: 340 },
    { id: 'n6',  x: 280, y: 320 },
    { id: 'n7',  x: 160, y: 280 },
    { id: 'n8',  x: 120, y: 170 },
    { id: 'n9',  x: 180, y:  70 },
    { id: 'n10', x: 290, y:  30 },
    { id: 'n11', x: 430, y:  20 },
    { id: 'n12', x: 610, y: 200 },
    { id: 'n13', x: 450, y: 180 },
    { id: 'n14', x: 220, y: 150 },
    { id: 'n15', x: 350, y: 260 },
  ];

  const edges = [
    [0,1],[1,2],[2,3],[3,4],[4,5],[5,6],
    [6,7],[7,8],[8,9],[9,10],[10,0],
    [0,12],[1,12],[2,12],[12,13],[13,7],
    [4,14],[14,5],[14,13],[3,14],[9,13],
    [11,1],[11,2],
  ];

  // Helper function to round coordinates to 6 decimal places
  const roundCoord = (num: number) => Math.round(num * 1e6) / 1e6;

  return (
    <svg viewBox="0 0 700 360" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%' }} aria-hidden="true">
      <defs>
        <radialGradient id="coreGlow1" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#00f0ff" stopOpacity="0.9" />
          <stop offset="35%"  stopColor="#00c8e8" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0040a0" stopOpacity="0" />
        </radialGradient>
        <filter id="blur8a"><feGaussianBlur stdDeviation="8" /></filter>
        <filter id="blur3a"><feGaussianBlur stdDeviation="3" /></filter>
        <filter id="blur16a"><feGaussianBlur stdDeviation="16" /></filter>
        <radialGradient id="nodeDot1" cx="40%" cy="35%" r="60%">
          <stop offset="0%"   stopColor="#8ff5ff" stopOpacity="1" />
          <stop offset="100%" stopColor="#00a8cc" stopOpacity="0.4" />
        </radialGradient>
        {nodes.map((n) => (
          <path key={`rp-${n.id}`} id={`ray1-${n.id}`} d={`M ${cx} ${cy} L ${n.x} ${n.y}`} />
        ))}
      </defs>

      <ellipse cx={cx} cy={cy} rx="200" ry="170" fill="url(#coreGlow1)" filter="url(#blur16a)" opacity="0.6" />
      <ellipse cx="560" cy="80" rx="110" ry="90" fill="#6010a0" filter="url(#blur16a)" opacity="0.35" />

      {edges.map(([a,b],i) => (
        <line key={`e-${i}`} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
          stroke="#00deec" strokeWidth="0.6" strokeOpacity="0.25" />
      ))}
      {nodes.map((n) => (
        <line key={`r-${n.id}`} x1={cx} y1={cy} x2={n.x} y2={n.y}
          stroke="#00deec" strokeWidth="0.7" strokeOpacity="0.18" />
      ))}
      {nodes.map((n, i) => (
        <circle key={`p-${n.id}`} r="2" fill="#8ff5ff" opacity="0.8">
          <animateMotion dur={`${2.2 + i * 0.3}s`} repeatCount="indefinite" begin={`${i * 0.25}s`}>
            <mpath href={`#ray1-${n.id}`} />
          </animateMotion>
        </circle>
      ))}
      {nodes.map((n, i) => (
        <g key={n.id}>
          <circle cx={n.x} cy={n.y} r="6" fill={i % 4 === 3 ? '#8020cc' : '#00deec'} filter="url(#blur3a)" opacity="0.5" />
          <circle cx={n.x} cy={n.y} r="2.5" fill="url(#nodeDot1)">
            <animate attributeName="opacity" values="0.6;1;0.6" dur={`${2+(i%5)*0.4}s`} repeatCount="indefinite" begin={`${i*0.2}s`} />
          </circle>
        </g>
      ))}
      <circle cx={cx} cy={cy} r="38" fill="#00c8e8" filter="url(#blur8a)" opacity="0.4" />
      <circle cx={cx} cy={cy} r="18" fill="#00e8ff" filter="url(#blur3a)" opacity="0.7" />
      <circle cx={cx} cy={cy} r="7" fill="#ffffff" opacity="0.95">
        <animate attributeName="r" values="6;8;6" dur="3s" repeatCount="indefinite" />
      </circle>
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg,i) => {
        const rad = (deg * Math.PI) / 180;
        const x2 = cx + Math.cos(rad) * 80;
        const y2 = cy + Math.sin(rad) * 80;
        return (
          <line 
            key={i} 
            x1={cx} 
            y1={cy} 
            x2={roundCoord(x2)} 
            y2={roundCoord(y2)}
            stroke="#00f0ff" 
            strokeWidth="0.5" 
            strokeOpacity="0.12" 
          />
        );
      })}
    </svg>
  );
}
import { Maximize2, ZoomIn, ZoomOut } from 'lucide-react';

const conditionColors = {
  Poor: { bg: 'bg-red-500', ring: 'ring-red-500/30', text: 'text-red-500' },
  Moderate: { bg: 'bg-amber-500', ring: 'ring-amber-500/30', text: 'text-amber-500' },
  Good: { bg: 'bg-emerald-500', ring: 'ring-emerald-500/30', text: 'text-emerald-500' },
};

export default function MapPlaceholder({ markers }) {
  return (
    <div className="relative rounded-xl overflow-hidden bg-white border border-slate-200 card-shadow h-[540px] w-full">
      {/* Interactive Map Area */}
      <div className="relative h-full w-full bg-[#e0f2fe] overflow-hidden select-none">
        
        {/* Mumbai Light Styled Geographic SVG Background */}
        <svg className="absolute inset-0 w-full h-full object-cover" viewBox="0 0 600 450" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Main Mumbai Land Mass */}
          <path
            d="M 50,-50
               L 420,-50
               Q 400,60 380,120
               Q 350,160 380,220
               Q 410,260 390,310
               L 390,500
               L 160,500
               Q 140,440 170,390
               Q 190,340 160,320
               Q 120,290 145,220
               Q 170,160 110,120
               Q 70,80 80,40
               Q 90,-10 50,-50 Z"
            fill="#f8fafc"
            stroke="#cbd5e1"
            strokeWidth="1.5"
          />

          {/* Navi Mumbai Land Mass (on the far right) */}
          <path
            d="M 470,-50
               L 650,-50
               L 650,500
               L 470,500
               Q 440,410 460,330
               Q 480,250 440,190
               Q 420,110 450,50
               Q 485,0 470,-50 Z"
            fill="#f1f5f9"
            stroke="#cbd5e1"
            strokeWidth="1.5"
          />

          {/* Major Roads Grid System */}
          {/* Western Express Highway */}
          <path d="M 110,-50 Q 140,110 150,280 Q 160,340 180,450" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" />
          
          {/* Eastern Express Highway */}
          <path d="M 360,-50 C 330,70 300,180 300,230 C 300,280 250,330 200,450" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" />

          {/* JVLR Connecting Road */}
          <path d="M 130,80 Q 240,90 340,60" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" opacity="0.3" />

          {/* Santa Cruz - Chembur Link Road */}
          <path d="M 145,200 Q 230,210 300,230" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" opacity="0.3" />

          {/* Sion Panvel Highway (Connecting to Navi Mumbai) */}
          <path d="M 280,310 Q 360,320 460,300" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" opacity="0.3" />

          {/* Area Text Labels */}
          <text x="120" y="70" fill="#94a3b8" fontSize="8" fontWeight="bold" fontFamily="Inter, sans-serif" letterSpacing="0.05em">ANDHERI WEST</text>
          <text x="210" y="55" fill="#94a3b8" fontSize="8" fontWeight="bold" fontFamily="Inter, sans-serif" letterSpacing="0.05em">ANDHERI EAST</text>
          <text x="310" y="50" fill="#94a3b8" fontSize="8" fontWeight="bold" fontFamily="Inter, sans-serif" letterSpacing="0.05em">POWAI</text>
          <text x="365" y="15" fill="#94a3b8" fontSize="8" fontWeight="bold" fontFamily="Inter, sans-serif" letterSpacing="0.05em">MULUND WEST</text>
          <text x="320" y="130" fill="#94a3b8" fontSize="8" fontWeight="bold" fontFamily="Inter, sans-serif" letterSpacing="0.05em">GHATKOPAR</text>
          <text x="125" y="190" fill="#94a3b8" fontSize="8" fontWeight="bold" fontFamily="Inter, sans-serif" letterSpacing="0.05em">BANDRA WEST</text>
          <text x="180" y="315" fill="#94a3b8" fontSize="8" fontWeight="bold" fontFamily="Inter, sans-serif" letterSpacing="0.05em">DADAR</text>
          <text x="290" y="270" fill="#94a3b8" fontSize="8" fontWeight="bold" fontFamily="Inter, sans-serif" letterSpacing="0.05em">CHEMBUR</text>
          <text x="510" y="260" fill="#94a3b8" fontSize="8" fontWeight="bold" fontFamily="Inter, sans-serif" letterSpacing="0.05em">NAVI MUMBAI</text>
          <text x="470" y="195" fill="#94a3b8" fontSize="8" fontWeight="bold" fontFamily="Inter, sans-serif" letterSpacing="0.05em">VASHI</text>
          <text x="175" y="420" fill="#94a3b8" fontSize="8" fontWeight="bold" fontFamily="Inter, sans-serif" letterSpacing="0.05em">COLABA</text>
        </svg>

        {/* Map Markers Overlay */}
        {markers.map((marker) => {
          const colors = conditionColors[marker.condition];
          return (
            <div
              key={marker.id}
              className="absolute group cursor-pointer"
              style={{ left: `${marker.x}%`, top: `${marker.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              {/* Pulse Ring */}
              <div
                className={`absolute inset-0 w-8 h-8 -m-1.5 rounded-full ${colors.ring} ring-4 animate-ping opacity-30`}
              />
              {/* Marker Dot */}
              <div
                className={`relative w-4 h-4 rounded-full ${colors.bg} shadow-md border-2 border-white flex items-center justify-center transition-transform duration-150 group-hover:scale-125 z-10`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-20">
                <div className="bg-slate-900 text-white rounded-lg px-2.5 py-1.5 shadow-lg whitespace-nowrap text-left border border-slate-800">
                  <p className="text-[11px] font-bold">{marker.name}</p>
                  <p className={`text-[10px] font-bold ${colors.text} mt-0.5`}>
                    {marker.condition} Condition
                  </p>
                  <p className="text-[9px] text-slate-400 mt-0.5">
                    {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
                  </p>
                </div>
                <div className="w-1.5 h-1.5 bg-slate-900 rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-0.5" />
              </div>
            </div>
          );
        })}

        {/* Top-Right Widget Controls */}
        <div className="absolute right-4 top-4 flex flex-col gap-1.5 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
          <button className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors" title="Maximize">
            <Maximize2 className="w-4 h-4" />
          </button>
          <hr className="border-slate-200" />
          <button className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors" title="Zoom In">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors" title="Zoom Out">
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

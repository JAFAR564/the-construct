import createGlobe from 'cobe';
import { useEffect, useRef, useState } from 'react';
import { getSectorCoordinates } from '../../utils/mapUtils';
import { useFactionStore } from '../../stores/useFactionStore';
import './FactionGlobe.css';

export const FactionGlobe = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionStart = useRef<number | null>(null);
  const [phi, setPhi] = useState(0);
  const { sectors } = useFactionStore();

  useEffect(() => {
    let currentPhi = 0;
    let width = 0;
    
    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };
    
    window.addEventListener('resize', onResize);
    onResize();

    const globe = createGlobe(canvasRef.current!, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.1, 0.1, 0.2],
      markerColor: [0, 1, 1],
      glowColor: [0.1, 0.5, 1],
      markers: sectors.map(s => {
        const [lat, lng] = getSectorCoordinates(s.id);
        let color: [number, number, number] = [0.5, 0.5, 0.5];
        if (s.controlledBy === 'Technocrats') color = [0, 0.6, 1];
        if (s.controlledBy === 'Keepers') color = [0, 1, 0.4];
        if (s.controlledBy === 'Ironborn') color = [1, 0.2, 0];
        
        return { location: [lat, lng], size: 0.08, color };
      }),
      onRender: (state) => {
        if (!pointerInteracting.current) {
          currentPhi += 0.005;
        }
        state.phi = currentPhi + phi;
        width = canvasRef.current!.offsetWidth;
        state.width = width * 2;
        state.height = width * 2;
      }
    });

    return () => {
      globe.destroy();
      window.removeEventListener('resize', onResize);
    };
  }, [sectors, phi]);

  return (
    <div className="globe-wrapper">
      <div className="globe-container">
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', maxWidth: '100%', aspectRatio: '1' }}
          onPointerDown={(e) => {
            pointerInteracting.current = e.clientX - pointerInteractionStart.current!;
            canvasRef.current!.style.cursor = 'grabbing';
          }}
          onPointerUp={() => {
            pointerInteracting.current = null;
            canvasRef.current!.style.cursor = 'grab';
          }}
          onPointerOut={() => {
            pointerInteracting.current = null;
            canvasRef.current!.style.cursor = 'grab';
          }}
          onMouseMove={(e) => {
            if (pointerInteracting.current !== null) {
              const delta = e.clientX - pointerInteracting.current;
              setPhi(delta / 200);
            }
          }}
        />
        <div className="globe-overlay">
          <div className="scanlines"></div>
          <div className="vignette"></div>
        </div>
      </div>
      <div className="globe-legend">
        <div className="legend-item"><span className="dot tech"></span> TECH</div>
        <div className="legend-item"><span className="dot keeper"></span> KEEP</div>
        <div className="legend-item"><span className="dot iron"></span> IRON</div>
      </div>
    </div>
  );
};

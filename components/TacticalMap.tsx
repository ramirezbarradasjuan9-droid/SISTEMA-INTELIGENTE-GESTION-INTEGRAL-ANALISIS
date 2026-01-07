import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Target, RiskLevel } from '../types';
import { Loader, MapPin, WifiOff, Share2, Link, Mail, Check, Copy } from 'lucide-react';

interface TacticalMapProps {
  targets: Target[];
  selectedTargetId?: string | null;
  onSelectTarget?: (id: string) => void;
  height?: string;
}

// Estilo "Dark HUD" personalizado para Google Maps
const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#121212" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }]
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }]
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }]
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }]
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }]
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }]
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }]
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }]
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#000000" }] // Agua completamente negra para contraste HUD
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }]
  }
];

// Helper for SVG projection (fallback)
const project = (lat: number, lng: number) => {
  const x = (lng + 180) * (100 / 360);
  const latRad = lat * Math.PI / 180;
  const mercN = Math.log(Math.tan((Math.PI / 4) + (latRad / 2)));
  const y = (100 / 2) - (100 * mercN / (2 * Math.PI));
  const clampedY = Math.max(0, Math.min(100, y));
  return { x, y: clampedY };
};

const TacticalMap: React.FC<TacticalMapProps> = ({ targets, selectedTargetId, onSelectTarget, height = 'h-96' }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [useFallback, setUseFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const initTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Share State
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Calculate pins for fallback view
  const pins = useMemo(() => {
    return targets.filter(t => t.lastKnownLocation).map(target => {
      const { x, y } = project(target.lastKnownLocation!.lat, target.lastKnownLocation!.lng);
      return { ...target, x, y };
    });
  }, [targets]);

  // Share Handlers
  const getCurrentLocation = () => {
    if (selectedTargetId) {
        const t = targets.find(target => target.id === selectedTargetId);
        if (t && t.lastKnownLocation) return t.lastKnownLocation;
    }
    // Default or map center (mocked here as we aren't tracking center state explicitly)
    return { lat: 20.0000, lng: 0.0000 };
  };

  const handleCopyLink = () => {
    const loc = getCurrentLocation();
    const mockUrl = `${window.location.origin}/ops?lat=${loc.lat.toFixed(6)}&lng=${loc.lng.toFixed(6)}&target=${selectedTargetId || 'none'}`;
    
    navigator.clipboard.writeText(mockUrl).then(() => {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
        setShowShareMenu(false);
    });
  };

  const handleEmailShare = () => {
    const loc = getCurrentLocation();
    const subject = `SIGG: Reporte Táctico - Coordenadas ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`;
    const body = `
REPORTE DE INTELIGENCIA GEOESPACIAL
-----------------------------------
CLASIFICACIÓN: CONFIDENCIAL
FECHA: ${new Date().toISOString()}

UBICACIÓN OBJETIVO:
Latitud: ${loc.lat}
Longitud: ${loc.lng}

OBJETIVO ID: ${selectedTargetId || 'N/A'}

ENLACE SEGURO:
${window.location.origin}/ops?lat=${loc.lat}&lng=${loc.lng}

-----------------------------------
Generado por Sistema SIGG.OS
    `;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setShowShareMenu(false);
  };

  useEffect(() => {
    let isMounted = true;
    const apiKey = process.env.API_KEY;

    // Handler for Google Maps Auth Failure (Invalid Key / Billing)
    (window as any).gm_authFailure = () => {
        console.warn("Google Maps Auth Failure detected. Switching to fallback vector map.");
        if (isMounted) {
            setUseFallback(true);
            setIsLoading(false);
        }
    };

    if (!apiKey) {
      console.warn("No API Key found. Using fallback map.");
      setUseFallback(true);
      setIsLoading(false);
      return;
    }

    const initMap = async () => {
      if (!isMounted || useFallback) return;
      if (!mapRef.current) return;

      try {
        const w = window as any;
        if (!w.google || !w.google.maps) {
             console.warn("Google Maps script loaded but google object not found.");
             setUseFallback(true);
             setIsLoading(false);
             return;
        }

        let MapConstructor;
        
        // Try importLibrary (Modern)
        if (w.google.maps.importLibrary) {
            try {
                const { Map } = await w.google.maps.importLibrary("maps");
                MapConstructor = Map;
            } catch (e) {
                console.warn("Failed to load maps library via importLibrary. API Key may be invalid for Maps.", e);
            }
        }
        
        // Fallback to legacy
        if (!MapConstructor && w.google.maps.Map) {
            MapConstructor = w.google.maps.Map;
        }

        if (!MapConstructor) {
             console.warn("Could not load Google Maps Map constructor. Switching to vector map.");
             if (isMounted) {
                setUseFallback(true);
                setIsLoading(false);
             }
             return;
        }

        // Safe ControlPosition
        // 9.0 is usually RIGHT_BOTTOM
        let zoomControlPos = 9; 
        if (w.google.maps.ControlPosition && w.google.maps.ControlPosition.RIGHT_BOTTOM !== undefined) {
             zoomControlPos = w.google.maps.ControlPosition.RIGHT_BOTTOM;
        }

        const map = new MapConstructor(mapRef.current, {
          center: { lat: 20, lng: 0 },
          zoom: 2,
          styles: DARK_MAP_STYLE,
          disableDefaultUI: true,
          backgroundColor: '#121212',
          zoomControl: true,
          zoomControlOptions: { position: zoomControlPos }
        });

        mapInstance.current = map;
        
        // Ensure Marker is available or try to load it for later use in updateMarkers
        if (w.google.maps.importLibrary && !w.google.maps.Marker) {
             try {
                // Preload marker library to ensure google.maps.Marker or compatible is available
                await w.google.maps.importLibrary("marker");
             } catch(e) {}
        }

        if (isMounted) {
            setIsLoading(false);
            if (initTimeoutRef.current) clearTimeout(initTimeoutRef.current);
            updateMarkers();
        }
      } catch (e) {
        console.error("Error initializing Google Map:", e);
        if (isMounted) {
            setUseFallback(true);
            setIsLoading(false);
        }
      }
    };

    const loadMap = () => {
      // If script is already loaded and maps object exists
      if ((window as any).google && (window as any).google.maps) {
        initMap();
        return;
      }

      // If script tag exists but maybe loading
      const existingScript = document.getElementById('google-maps-script');
      if (existingScript) {
        existingScript.addEventListener('load', () => initMap());
        existingScript.addEventListener('error', () => {
            if (isMounted) {
                setUseFallback(true);
                setIsLoading(false);
            }
        });
        return;
      }

      // Inject Script
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      // Added &loading=async to src for better performance, requiring importLibrary in initMap
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async`;
      script.async = true;
      script.defer = true;
      script.onload = () => initMap();
      script.onerror = () => {
          console.warn("Google Maps script failed to load.");
          if (isMounted) {
              setUseFallback(true);
              setIsLoading(false);
          }
      };
      document.head.appendChild(script);
    };

    // Safety Timeout: If map doesn't load in 5s, fallback
    initTimeoutRef.current = setTimeout(() => {
        if (isLoading && !mapInstance.current && isMounted) {
            console.warn("Map initialization timed out. Using fallback.");
            setUseFallback(true);
            setIsLoading(false);
        }
    }, 5000);

    loadMap();

    return () => {
       isMounted = false;
       if (initTimeoutRef.current) clearTimeout(initTimeoutRef.current);
       if (markersRef.current) {
           markersRef.current.forEach(m => m.setMap(null));
       }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers for Google Maps
  useEffect(() => {
    if (!useFallback && mapInstance.current) {
      updateMarkers();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targets, selectedTargetId, useFallback]);

  const updateMarkers = async () => {
    const w = window as any;
    if (!w.google || !mapInstance.current) return;

    // Clear existing
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const bounds = new w.google.maps.LatLngBounds();
    let hasPoints = false;

    // Ensure Marker class is available (might need to wait for importLibrary if using loading=async)
    let MarkerClass = w.google.maps.Marker;
    if (!MarkerClass && w.google.maps.importLibrary) {
        try {
             const { Marker } = await w.google.maps.importLibrary("marker");
             MarkerClass = Marker;
        } catch(e) {
            console.warn("Failed to load Marker library");
        }
    }
    
    // If we still don't have a marker class, we can't render pins
    if (!MarkerClass) {
        // Try fallback to w.google.maps.Marker one last time if library load failed but object exists
        if (w.google.maps.Marker) {
             MarkerClass = w.google.maps.Marker;
        } else {
             return;
        }
    }

    // Safe SymbolPath
    const symbolPathCircle = w.google.maps.SymbolPath ? w.google.maps.SymbolPath.CIRCLE : 0;
    const animationBounce = w.google.maps.Animation ? w.google.maps.Animation.BOUNCE : 1;

    targets.forEach(target => {
      if (target.lastKnownLocation) {
        hasPoints = true;
        const position = { lat: target.lastKnownLocation.lat, lng: target.lastKnownLocation.lng };
        bounds.extend(position);

        const isSelected = selectedTargetId === target.id;
        const color = target.riskLevel === RiskLevel.CRITICAL ? '#EF4444' : '#2D9CDB';

        const marker = new MarkerClass({
          position: position,
          map: mapInstance.current,
          title: target.codeName,
          animation: isSelected ? animationBounce : null,
          icon: {
            path: symbolPathCircle,
            scale: isSelected ? 12 : 8,
            fillColor: color,
            fillOpacity: 0.9,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
          },
        });

        marker.addListener("click", () => {
          if (onSelectTarget) onSelectTarget(target.id);
        });

        markersRef.current.push(marker);
      }
    });

    if (hasPoints) {
       if (selectedTargetId) {
           const selected = targets.find(t => t.id === selectedTargetId);
           if (selected && selected.lastKnownLocation) {
               mapInstance.current.panTo({ lat: selected.lastKnownLocation.lat, lng: selected.lastKnownLocation.lng });
               mapInstance.current.setZoom(12);
           }
       } else if (markersRef.current.length > 0) {
           mapInstance.current.fitBounds(bounds);
       }
    }
  };

  const SharedOverlay = () => (
    <div className="absolute top-4 right-4 z-20 flex flex-col items-end space-y-2">
        <div className="flex space-x-2">
            <button 
                onClick={() => setShowShareMenu(!showShareMenu)}
                className={`flex items-center space-x-2 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded border transition-all duration-200 ${showShareMenu ? 'border-accent text-accent' : 'border-gray-700 text-gray-400 hover:text-white'}`}
            >
                {linkCopied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                <span className="font-mono text-[10px] hidden md:inline">COMPARTIR</span>
            </button>
            <div className="bg-black/50 px-2 py-1.5 rounded border border-gray-800 backdrop-blur-sm pointer-events-none">
                <span className="font-mono text-[10px] text-gray-500">VISTA SATELITAL</span>
            </div>
        </div>

        {showShareMenu && (
            <div className="bg-panel/95 backdrop-blur-md border border-gray-700 rounded p-2 shadow-2xl min-w-[180px] animate-in slide-in-from-top-2 fade-in duration-200">
                <div className="text-[10px] text-gray-500 font-mono mb-2 px-2 pb-1 border-b border-gray-800">
                    OPCIONES DE EXPORTACIÓN
                </div>
                <button 
                    onClick={handleCopyLink}
                    className="w-full text-left px-2 py-2 hover:bg-white/5 rounded flex items-center space-x-2 text-xs text-gray-300 hover:text-accent transition-colors group"
                >
                    {linkCopied ? <Check className="w-3 h-3 text-green-500" /> : <Link className="w-3 h-3 text-gray-500 group-hover:text-accent" />}
                    <span className="font-mono">{linkCopied ? 'ENLACE COPIADO' : 'COPIAR ENLACE'}</span>
                </button>
                <button 
                    onClick={handleEmailShare}
                    className="w-full text-left px-2 py-2 hover:bg-white/5 rounded flex items-center space-x-2 text-xs text-gray-300 hover:text-accent transition-colors group"
                >
                    <Mail className="w-3 h-3 text-gray-500 group-hover:text-accent" />
                    <span className="font-mono">ENVIAR REPORTE</span>
                </button>
            </div>
        )}
    </div>
  );

  if (useFallback) {
      return (
        <div className={`relative w-full ${height} bg-[#101015] rounded-lg overflow-hidden border border-gray-800 shadow-inner group`}>
            {/* Grid Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                style={{ 
                    backgroundImage: 'linear-gradient(#2D9CDB 1px, transparent 1px), linear-gradient(90deg, #2D9CDB 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            ></div>

            {/* World Map SVG Silhouette */}
            <svg className="absolute inset-0 w-full h-full text-[#1E1E2E] fill-current opacity-40" viewBox="0 0 100 50" preserveAspectRatio="none">
                <path d="M5,10 Q20,5 30,15 T50,20 T80,10 T95,20 V40 H5 Z" />
                <rect x="0" y="0" width="100" height="100" fill="none" />
                <circle cx="20" cy="20" r="10" stroke="#2D9CDB" strokeWidth="0.1" fill="none" opacity="0.2" />
                <circle cx="80" cy="30" r="15" stroke="#2D9CDB" strokeWidth="0.1" fill="none" opacity="0.2" />
            </svg>
            
            {/* Scanline Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent h-[10%] w-full animate-[scan_3s_linear_infinite] pointer-events-none opacity-20"></div>

            {/* Shared UI Overlay */}
            <SharedOverlay />

            {/* Pins */}
            {pins.map((target) => (
                <div 
                key={target.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${selectedTargetId === target.id ? 'scale-125 z-10' : 'hover:scale-110'}`}
                style={{ left: `${target.x}%`, top: `${target.y}%` }}
                onClick={() => onSelectTarget && onSelectTarget(target.id)}
                >
                <div className="relative flex items-center justify-center">
                    <div className={`absolute w-8 h-8 rounded-full border border-accent/50 animate-ping ${selectedTargetId === target.id ? 'opacity-100' : 'opacity-0'}`}></div>
                    <MapPin className={`w-5 h-5 ${target.riskLevel === 'CRITICAL' ? 'text-danger' : 'text-accent'} drop-shadow-[0_0_5px_rgba(45,156,219,0.8)]`} fill="currentColor" />
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-panel/90 border border-gray-700 px-2 py-1 rounded text-xs whitespace-nowrap text-white hidden group-hover:block pointer-events-none">
                        <span className="font-mono text-accent">{target.codeName}</span>
                    </div>
                </div>
                </div>
            ))}

            <div className="absolute bottom-4 left-4 z-10 bg-black/80 border border-gray-700 p-2 rounded backdrop-blur-sm pointer-events-none">
                <div className="text-[10px] text-accent font-mono mb-1">OBJETIVO (VECTORIAL)</div>
                <div className="text-xs text-white font-mono">
                    LAT: {selectedTargetId ? targets.find(t=>t.id===selectedTargetId)?.lastKnownLocation?.lat.toFixed(4) : '--.----'}
                </div>
                <div className="text-xs text-white font-mono">
                    LNG: {selectedTargetId ? targets.find(t=>t.id===selectedTargetId)?.lastKnownLocation?.lng.toFixed(4) : '--.----'}
                </div>
            </div>
            <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 bg-black/50 px-2 py-1 rounded border border-gray-800">
                <WifiOff className="w-3 h-3 text-orange-500" />
                <span className="font-mono text-[10px] text-gray-500">MODO OFFLINE</span>
            </div>
        </div>
      );
  }

  // Google Maps Render
  return (
    <div className={`relative w-full ${height} bg-[#101015] rounded-lg overflow-hidden border border-gray-800 shadow-inner group`}>
      <div className="absolute inset-0 opacity-5 pointer-events-none z-10" 
        style={{ 
            backgroundImage: 'linear-gradient(#2D9CDB 1px, transparent 1px), linear-gradient(90deg, #2D9CDB 1px, transparent 1px)',
            backgroundSize: '40px 40px'
        }}
      ></div>
      
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent h-[10%] w-full animate-[scan_3s_linear_infinite] pointer-events-none opacity-10 z-10"></div>

      <div ref={mapRef} className="w-full h-full" />

      {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
              <div className="text-accent flex flex-col items-center animate-pulse">
                  <Loader className="w-8 h-8 animate-spin mb-2" />
                  <span className="font-mono text-xs tracking-widest">CONECTANDO SATÉLITE...</span>
              </div>
          </div>
      )}

      {/* Shared UI Overlay */}
      <SharedOverlay />

      <div className="absolute bottom-4 left-4 z-10 bg-black/80 border border-gray-700 p-2 rounded backdrop-blur-sm pointer-events-none">
          <div className="text-[10px] text-accent font-mono mb-1">COORDENADAS</div>
          <div className="text-xs text-white font-mono">
             LAT: {selectedTargetId ? targets.find(t=>t.id===selectedTargetId)?.lastKnownLocation?.lat.toFixed(6) : '---.---'}
          </div>
          <div className="text-xs text-white font-mono">
             LNG: {selectedTargetId ? targets.find(t=>t.id===selectedTargetId)?.lastKnownLocation?.lng.toFixed(6) : '---.---'}
          </div>
      </div>
    </div>
  );
};

export default TacticalMap;
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls, Text, PerspectiveCamera, RoundedBox, Cylinder, Environment } from "@react-three/drei";
import * as THREE from "three";

interface PlacedEquipment {
  id: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  rotation: number;
  equipment: {
    id: string;
    name: string;
    category: string;
    type: string;
    brand: string;
    model: string;
    width: number;
    depth: number;
    height: number;
    color: string;
    price: number;
    monthlyRevenue: number;
    electricityUsage: number;
    waterUsage: number;
    description: string;
  };
}

interface ThreeSceneProps {
  equipment: PlacedEquipment[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  ambientIntensity: number;
  showLabels: boolean;
  canvasWidth: number;
  canvasHeight: number;
}

const SCALE_3D = 0.02;

// Verified manufacturer brand colors (official palettes)
const BRAND_COLORS: Record<string, { primary: string; accent: string; metalness: number }> = {
  // Washer/Dryer Brands - Verified manufacturer colors
  'dexter': { primary: '#1e3a5f', accent: '#4a90d9', metalness: 0.7 },
  'speedqueen': { primary: '#D71920', accent: '#3d3d3d', metalness: 0.6 },
  'continental': { primary: '#2d5a27', accent: '#8bc34a', metalness: 0.65 },
  'continentalgirbau': { primary: '#00857A', accent: '#5eead4', metalness: 0.65 },
  'huebsch': { primary: '#86BC25', accent: '#c0c0c0', metalness: 0.6 },
  'maytag': { primary: '#003A70', accent: '#c0c0c0', metalness: 0.55 },
  'lg': { primary: '#a50034', accent: '#ffffff', metalness: 0.7 },
  'samsung': { primary: '#1428a0', accent: '#ffffff', metalness: 0.7 },
  'electrolux': { primary: '#003580', accent: '#c4b5fd', metalness: 0.65 },
  'girbau': { primary: '#00857A', accent: '#5eead4', metalness: 0.65 },
  'unimac': { primary: '#ca8a04', accent: '#fef08a', metalness: 0.6 },
  'adc': { primary: '#dc2626', accent: '#fca5a5', metalness: 0.6 },
  'miele': { primary: '#059669', accent: '#a7f3d0', metalness: 0.7 },
  'ipso': { primary: '#0891b2', accent: '#67e8f9', metalness: 0.6 },
  'wascomat': { primary: '#0055A4', accent: '#c0c0c0', metalness: 0.6 },
  // Cart Brands
  'rbwire': { primary: '#B3BEC6', accent: '#6B6F72', metalness: 0.9 },
  'temcreat': { primary: '#374151', accent: '#9ca3af', metalness: 0.8 },
  // Table/Seating Brands  
  'solomatic': { primary: '#a8a29e', accent: '#d6d3d1', metalness: 0.3 },
  'sterling': { primary: '#44403c', accent: '#78716c', metalness: 0.4 },
  // Vending Brands
  'vendrite': { primary: '#0ea5e9', accent: '#bae6fd', metalness: 0.6 },
  'national': { primary: '#0284c7', accent: '#7dd3fc', metalness: 0.6 },
  'vendingcom': { primary: '#0369a1', accent: '#38bdf8', metalness: 0.55 },
  // Changer/ATM Brands
  'americanchanger': { primary: '#1f2937', accent: '#4b5563', metalness: 0.75 },
  'hamilton': { primary: '#1e3a8a', accent: '#3b82f6', metalness: 0.7 },
  'rowe': { primary: '#15803d', accent: '#4ade80', metalness: 0.65 },
  'atmdepot': { primary: '#1e293b', accent: '#64748b', metalness: 0.8 },
  // Dog Wash
  'k9000': { primary: '#0891b2', accent: '#22d3ee', metalness: 0.6 },
  // Default
  'default': { primary: '#4a5568', accent: '#a0aec0', metalness: 0.5 },
  'custom': { primary: '#57534e', accent: '#a8a29e', metalness: 0.4 },
};

// Normalize brand name: strip punctuation, collapse whitespace, lowercase
function normalizeBrandKey(brand: string): string {
  if (!brand) return 'default';
  return brand
    .toLowerCase()
    .replace(/[&\-_.']/g, '') // Remove punctuation
    .replace(/\s+/g, '')      // Remove all whitespace
    .replace(/and/g, '')      // Remove "and"
    .trim();
}

function getBrandStyle(brand: string) {
  const key = normalizeBrandKey(brand);
  return BRAND_COLORS[key] || BRAND_COLORS['default'];
}

// ============================================================================
// WASHER MESH - Round door with drum animation
// ============================================================================
function WasherMesh({ 
  item, 
  isSelected, 
  onClick,
  showLabel 
}: { 
  item: PlacedEquipment; 
  isSelected: boolean;
  onClick: () => void;
  showLabel: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const drumRef = useRef<THREE.Mesh>(null);
  
  const width = item.width * SCALE_3D;
  const height = item.height * SCALE_3D;
  const depth = item.depth * SCALE_3D;
  const x = item.x * SCALE_3D;
  const z = item.y * SCALE_3D;
  
  const brandStyle = getBrandStyle(item.equipment.brand);
  const baseColor = isSelected ? "#FF6B6B" : brandStyle.primary;
  
  // Drum animation: fast when selected, slow spin when deselected
  useFrame((state) => {
    if (drumRef.current) {
      const speed = isSelected ? 2 : 0.3;
      drumRef.current.rotation.z = state.clock.elapsedTime * speed;
    }
  });

  const doorRadius = Math.min(width, height) * 0.35;
  const doorDepth = depth * 0.08;

  return (
    <group 
      ref={groupRef}
      position={[x + width/2, height / 2, z + depth/2]} 
      rotation={[0, (item.rotation * Math.PI) / 180, 0]}
    >
      <RoundedBox
        args={[width, height, depth]}
        radius={0.02}
        smoothness={4}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial 
          color={baseColor}
          metalness={brandStyle.metalness}
          roughness={0.3}
          envMapIntensity={0.8}
        />
      </RoundedBox>

      {/* Round door with glass window */}
      <group position={[0, 0, depth/2 + 0.001]}>
        <mesh castShadow>
          <cylinderGeometry args={[doorRadius, doorRadius, doorDepth, 32]} />
          <meshStandardMaterial 
            color="#c0c0c0"
            metalness={0.9}
            roughness={0.15}
          />
        </mesh>
        <mesh ref={drumRef} position={[0, 0, doorDepth/2 + 0.002]}>
          <ringGeometry args={[doorRadius * 0.2, doorRadius * 0.85, 32]} />
          <meshStandardMaterial 
            color="#1a1a2e"
            metalness={0.3}
            roughness={0.8}
            transparent
            opacity={0.9}
          />
        </mesh>
        <mesh position={[0, 0, doorDepth/2 + 0.003]}>
          <ringGeometry args={[doorRadius * 0.85, doorRadius * 0.95, 32]} />
          <meshStandardMaterial 
            color={brandStyle.accent}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* Control panel */}
      <mesh position={[width * 0.35, height * 0.35, depth/2 + 0.01]} castShadow>
        <boxGeometry args={[width * 0.2, height * 0.15, 0.02]} />
        <meshStandardMaterial 
          color="#1a1a2e"
          metalness={0.2}
          roughness={0.5}
          emissive={isSelected ? "#00ff00" : "#003300"}
          emissiveIntensity={0.5}
        />
      </mesh>

      {isSelected && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(width * 1.05, height * 1.05, depth * 1.05)]} />
          <lineBasicMaterial color="#FFFFFF" linewidth={2} />
        </lineSegments>
      )}

      {showLabel && (
        <Text
          position={[0, height / 2 + 0.15, 0]}
          fontSize={0.1}
          color="#FFFFFF"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.015}
          outlineColor="#000000"
        >
          {item.equipment.name}
        </Text>
      )}
    </group>
  );
}

// ============================================================================
// DRYER MESH - Single or stack with venting
// ============================================================================
function DryerMesh({ 
  item, 
  isSelected, 
  onClick,
  showLabel 
}: { 
  item: PlacedEquipment; 
  isSelected: boolean;
  onClick: () => void;
  showLabel: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const drumRef = useRef<THREE.Mesh>(null);
  
  const width = item.width * SCALE_3D;
  const height = item.height * SCALE_3D;
  const depth = item.depth * SCALE_3D;
  const x = item.x * SCALE_3D;
  const z = item.y * SCALE_3D;
  
  const brandStyle = getBrandStyle(item.equipment.brand);
  const baseColor = isSelected ? "#FF6B6B" : brandStyle.primary;

  useFrame((state) => {
    if (drumRef.current && isSelected) {
      drumRef.current.rotation.z = state.clock.elapsedTime * 3;
    }
  });

  const doorRadius = Math.min(width, height) * 0.4;
  const isStack = item.equipment.type === 'stack' || item.equipment.name.toLowerCase().includes('stack');

  return (
    <group 
      ref={groupRef}
      position={[x + width/2, height / 2, z + depth/2]} 
      rotation={[0, (item.rotation * Math.PI) / 180, 0]}
    >
      <RoundedBox
        args={[width, height, depth]}
        radius={0.02}
        smoothness={4}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial 
          color={baseColor}
          metalness={brandStyle.metalness}
          roughness={0.3}
        />
      </RoundedBox>

      {isStack ? (
        <>
          {/* Top drum */}
          <group position={[0, height * 0.25, depth/2 + 0.001]}>
            <mesh castShadow>
              <cylinderGeometry args={[doorRadius * 0.7, doorRadius * 0.7, 0.03, 32]} />
              <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.15} />
            </mesh>
            <mesh ref={drumRef} position={[0, 0, 0.02]}>
              <ringGeometry args={[doorRadius * 0.15, doorRadius * 0.6, 32]} />
              <meshStandardMaterial color="#1a1a2e" metalness={0.3} roughness={0.8} transparent opacity={0.85} />
            </mesh>
          </group>
          {/* Bottom drum */}
          <group position={[0, -height * 0.25, depth/2 + 0.001]}>
            <mesh castShadow>
              <cylinderGeometry args={[doorRadius * 0.7, doorRadius * 0.7, 0.03, 32]} />
              <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.15} />
            </mesh>
            <mesh position={[0, 0, 0.02]}>
              <ringGeometry args={[doorRadius * 0.15, doorRadius * 0.6, 32]} />
              <meshStandardMaterial color="#1a1a2e" metalness={0.3} roughness={0.8} transparent opacity={0.85} />
            </mesh>
          </group>
        </>
      ) : (
        <group position={[0, 0, depth/2 + 0.001]}>
          <mesh castShadow>
            <cylinderGeometry args={[doorRadius, doorRadius, 0.04, 32]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.15} />
          </mesh>
          <mesh ref={drumRef} position={[0, 0, 0.025]}>
            <ringGeometry args={[doorRadius * 0.2, doorRadius * 0.9, 32]} />
            <meshStandardMaterial color="#2a2a3a" metalness={0.2} roughness={0.7} transparent opacity={0.9} />
          </mesh>
        </group>
      )}

      {/* Vent duct at rear */}
      <mesh position={[0, height * 0.3, -depth/2 - 0.04]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.1, 16]} />
        <meshStandardMaterial color="#888888" metalness={0.7} roughness={0.3} />
      </mesh>

      {isSelected && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(width * 1.05, height * 1.05, depth * 1.05)]} />
          <lineBasicMaterial color="#FFFFFF" linewidth={2} />
        </lineSegments>
      )}

      {showLabel && (
        <Text
          position={[0, height / 2 + 0.15, 0]}
          fontSize={0.1}
          color="#FFFFFF"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.015}
          outlineColor="#000000"
        >
          {item.equipment.name}
        </Text>
      )}
    </group>
  );
}

// ============================================================================
// CART MESH - R&B Wire / TEMCREAT with wire basket and wheels
// True specs: R&B 100E = 22×27×26.5", Double Pole = 22×27×26.5", TEMCREAT 400L = 30×42×36"
// ============================================================================
function CartMesh({ 
  item, 
  isSelected, 
  onClick,
  showLabel 
}: { 
  item: PlacedEquipment; 
  isSelected: boolean;
  onClick: () => void;
  showLabel: boolean;
}) {
  const width = item.width * SCALE_3D;
  const height = item.height * SCALE_3D;
  const depth = item.depth * SCALE_3D;
  const x = item.x * SCALE_3D;
  const z = item.y * SCALE_3D;
  
  const brandStyle = getBrandStyle(item.equipment.brand);
  const frameColor = isSelected ? "#FF6B6B" : brandStyle.primary;
  const basketColor = isSelected ? "#FFB6B6" : "#e5e7eb";
  
  const wheelRadius = 0.03;
  const frameThickness = 0.012;
  const basketHeight = height * 0.7;
  const legHeight = height * 0.3;

  return (
    <group 
      position={[x + width/2, 0, z + depth/2]} 
      rotation={[0, (item.rotation * Math.PI) / 180, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {/* Chrome frame legs */}
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([xMult, zMult], i) => (
        <mesh key={`leg-${i}`} position={[xMult * (width/2 - frameThickness), legHeight/2, zMult * (depth/2 - frameThickness)]} castShadow>
          <cylinderGeometry args={[frameThickness, frameThickness, legHeight, 8]} />
          <meshStandardMaterial color={frameColor} metalness={0.9} roughness={0.2} />
        </mesh>
      ))}

      {/* Wire basket - chrome wire grid structure */}
      <group position={[0, legHeight, 0]}>
        {/* Vertical wires - front and back */}
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={`vwire-f-${i}`} position={[(i - 2.5) * (width * 0.18), basketHeight/2, depth * 0.45]}>
            <cylinderGeometry args={[0.003, 0.003, basketHeight, 4]} />
            <meshStandardMaterial color={frameColor} metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={`vwire-b-${i}`} position={[(i - 2.5) * (width * 0.18), basketHeight/2, -depth * 0.45]}>
            <cylinderGeometry args={[0.003, 0.003, basketHeight, 4]} />
            <meshStandardMaterial color={frameColor} metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
        {/* Vertical wires - left and right */}
        {Array.from({ length: 4 }).map((_, i) => (
          <mesh key={`vwire-l-${i}`} position={[-width * 0.45, basketHeight/2, (i - 1.5) * (depth * 0.28)]}>
            <cylinderGeometry args={[0.003, 0.003, basketHeight, 4]} />
            <meshStandardMaterial color={frameColor} metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
        {Array.from({ length: 4 }).map((_, i) => (
          <mesh key={`vwire-r-${i}`} position={[width * 0.45, basketHeight/2, (i - 1.5) * (depth * 0.28)]}>
            <cylinderGeometry args={[0.003, 0.003, basketHeight, 4]} />
            <meshStandardMaterial color={frameColor} metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
        {/* Horizontal rim wires */}
        {[0, basketHeight * 0.5, basketHeight].map((yPos, yi) => (
          <group key={`hframe-${yi}`} position={[0, yPos, 0]}>
            <mesh position={[0, 0, depth * 0.45]} rotation={[0, 0, Math.PI/2]}>
              <cylinderGeometry args={[0.004, 0.004, width * 0.95, 6]} />
              <meshStandardMaterial color={frameColor} metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0, -depth * 0.45]} rotation={[0, 0, Math.PI/2]}>
              <cylinderGeometry args={[0.004, 0.004, width * 0.95, 6]} />
              <meshStandardMaterial color={frameColor} metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[width * 0.45, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
              <cylinderGeometry args={[0.004, 0.004, depth * 0.9, 6]} />
              <meshStandardMaterial color={frameColor} metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[-width * 0.45, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
              <cylinderGeometry args={[0.004, 0.004, depth * 0.9, 6]} />
              <meshStandardMaterial color={frameColor} metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        ))}
        {/* Bottom wire grid */}
        <mesh position={[0, 0.01, 0]}>
          <boxGeometry args={[width * 0.9, 0.005, depth * 0.9]} />
          <meshStandardMaterial color={frameColor} metalness={0.8} roughness={0.3} wireframe />
        </mesh>
      </group>

      {/* Wheels (4 casters) */}
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([xMult, zMult], i) => (
        <group key={`wheel-${i}`} position={[xMult * (width/2 - 0.04), wheelRadius, zMult * (depth/2 - 0.04)]}>
          <mesh rotation={[Math.PI/2, 0, 0]}>
            <cylinderGeometry args={[wheelRadius, wheelRadius, 0.02, 16]} />
            <meshStandardMaterial color="#1f2937" metalness={0.3} roughness={0.7} />
          </mesh>
        </group>
      ))}

      {isSelected && (
        <lineSegments position={[0, height/2, 0]}>
          <edgesGeometry args={[new THREE.BoxGeometry(width * 1.08, height * 1.08, depth * 1.08)]} />
          <lineBasicMaterial color="#FFFFFF" linewidth={2} />
        </lineSegments>
      )}

      {showLabel && (
        <Text
          position={[0, height + 0.15, 0]}
          fontSize={0.08}
          color="#FFFFFF"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.012}
          outlineColor="#000000"
        >
          {item.equipment.name}
        </Text>
      )}
    </group>
  );
}

// ============================================================================
// TABLE MESH - Sol-O-Matic folding tables
// True specs: TFD-306 = 72×30×34", TFD-305 w/Shelf = 72×30×34" + 60×12×16" shelf
// ============================================================================
function TableMesh({ 
  item, 
  isSelected, 
  onClick,
  showLabel 
}: { 
  item: PlacedEquipment; 
  isSelected: boolean;
  onClick: () => void;
  showLabel: boolean;
}) {
  const width = item.width * SCALE_3D;
  const height = item.height * SCALE_3D;
  const depth = item.depth * SCALE_3D;
  const x = item.x * SCALE_3D;
  const z = item.y * SCALE_3D;
  
  const brandStyle = getBrandStyle(item.equipment.brand);
  const topColor = isSelected ? "#FF6B6B" : "#d6d3d1"; // Laminate top
  const legColor = isSelected ? "#FF8888" : "#78716c"; // Chrome legs
  
  const topThickness = 0.025;
  const legHeight = height - topThickness;
  const legWidth = 0.025;
  const hasShelf = item.equipment.name.toLowerCase().includes('shelf');

  return (
    <group 
      position={[x + width/2, 0, z + depth/2]} 
      rotation={[0, (item.rotation * Math.PI) / 180, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {/* Table top - laminate surface */}
      <mesh position={[0, height - topThickness/2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, topThickness, depth]} />
        <meshStandardMaterial 
          color={topColor}
          metalness={0.1}
          roughness={0.6}
        />
      </mesh>

      {/* Chrome legs (4 corners) */}
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([xMult, zMult], i) => (
        <mesh 
          key={`leg-${i}`} 
          position={[xMult * (width/2 - 0.04), legHeight/2, zMult * (depth/2 - 0.04)]} 
          castShadow
        >
          <boxGeometry args={[legWidth, legHeight, legWidth]} />
          <meshStandardMaterial color={legColor} metalness={0.8} roughness={0.25} />
        </mesh>
      ))}

      {/* Under-shelf if applicable (Sol-O-Matic TFD-305) */}
      {hasShelf && (
        <mesh position={[0, height * 0.3, 0]} castShadow>
          <boxGeometry args={[width * 0.85, 0.015, depth * 0.5]} />
          <meshStandardMaterial color={topColor} metalness={0.1} roughness={0.6} />
        </mesh>
      )}

      {isSelected && (
        <lineSegments position={[0, height/2, 0]}>
          <edgesGeometry args={[new THREE.BoxGeometry(width * 1.05, height * 1.05, depth * 1.05)]} />
          <lineBasicMaterial color="#FFFFFF" linewidth={2} />
        </lineSegments>
      )}

      {showLabel && (
        <Text
          position={[0, height + 0.12, 0]}
          fontSize={0.08}
          color="#FFFFFF"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.012}
          outlineColor="#000000"
        >
          {item.equipment.name}
        </Text>
      )}
    </group>
  );
}

// ============================================================================
// SEATING MESH - Sol-O-Matic CMD benches, Sterling
// True specs: CMD-3 = 61×18×34" (3 seats), CMD-DS-5 = 103×18×34" (5 seats), Sterling = 72×18×18"
// ============================================================================
function SeatingMesh({ 
  item, 
  isSelected, 
  onClick,
  showLabel 
}: { 
  item: PlacedEquipment; 
  isSelected: boolean;
  onClick: () => void;
  showLabel: boolean;
}) {
  const width = item.width * SCALE_3D;
  const height = item.height * SCALE_3D;
  const depth = item.depth * SCALE_3D;
  const x = item.x * SCALE_3D;
  const z = item.y * SCALE_3D;
  
  const brandStyle = getBrandStyle(item.equipment.brand);
  const seatColor = isSelected ? "#FF6B6B" : "#57534e"; // Charcoal plastic
  const frameColor = isSelected ? "#FF8888" : "#a8a29e"; // Chrome/steel
  
  const seatHeight = height * 0.5;
  const backHeight = height * 0.5;
  const seatThickness = 0.03;
  
  // Determine seat count from name
  const name = item.equipment.name.toLowerCase();
  const seatCount = name.includes('5') ? 5 : name.includes('3') ? 3 : 3;
  const seatWidth = (width - 0.04) / seatCount;
  const hasSeatDividers = name.includes('cmd');
  const hasBack = height > depth; // Sol-O-Matic has backs, Sterling doesn't

  return (
    <group 
      position={[x + width/2, 0, z + depth/2]} 
      rotation={[0, (item.rotation * Math.PI) / 180, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {/* Seat surface */}
      <mesh position={[0, seatHeight - seatThickness/2, depth * 0.1]} castShadow receiveShadow>
        <boxGeometry args={[width, seatThickness, depth * 0.8]} />
        <meshStandardMaterial color={seatColor} metalness={0.15} roughness={0.7} />
      </mesh>

      {/* Backrest (if applicable) */}
      {hasBack && (
        <mesh position={[0, seatHeight + backHeight/2, -depth/2 + 0.02]} castShadow>
          <boxGeometry args={[width, backHeight, 0.025]} />
          <meshStandardMaterial color={seatColor} metalness={0.15} roughness={0.7} />
        </mesh>
      )}

      {/* Seat dividers (Sol-O-Matic style) */}
      {hasSeatDividers && Array.from({ length: seatCount - 1 }).map((_, i) => (
        <mesh 
          key={`divider-${i}`} 
          position={[(i + 1) * seatWidth - width/2 + 0.02, seatHeight + 0.03, depth * 0.1]}
          castShadow
        >
          <boxGeometry args={[0.01, 0.06, depth * 0.6]} />
          <meshStandardMaterial color={frameColor} metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* Frame legs (powder-coated steel) */}
      {[[-0.9, -0.7], [-0.9, 0.5], [0.9, -0.7], [0.9, 0.5]].map(([xMult, zMult], i) => (
        <mesh 
          key={`leg-${i}`} 
          position={[xMult * width/2, seatHeight/2 - 0.02, zMult * depth/2]} 
          castShadow
        >
          <boxGeometry args={[0.025, seatHeight - 0.02, 0.025]} />
          <meshStandardMaterial color={frameColor} metalness={0.6} roughness={0.4} />
        </mesh>
      ))}

      {isSelected && (
        <lineSegments position={[0, height/2, 0]}>
          <edgesGeometry args={[new THREE.BoxGeometry(width * 1.05, height * 1.05, depth * 1.05)]} />
          <lineBasicMaterial color="#FFFFFF" linewidth={2} />
        </lineSegments>
      )}

      {showLabel && (
        <Text
          position={[0, height + 0.12, 0]}
          fontSize={0.08}
          color="#FFFFFF"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.012}
          outlineColor="#000000"
        >
          {item.equipment.name}
        </Text>
      )}
    </group>
  );
}

// ============================================================================
// VENDING MESH - Soap dispensers, snack machines
// True specs: Vend-Rite 394 = 16.3×9.5×37.8", National 4FL92X = 21.3×9.5×37.8", 
//             Vending.com 20-Select = 29.3×34.75×72"
// ============================================================================
function VendingMesh({ 
  item, 
  isSelected, 
  onClick,
  showLabel 
}: { 
  item: PlacedEquipment; 
  isSelected: boolean;
  onClick: () => void;
  showLabel: boolean;
}) {
  const width = item.width * SCALE_3D;
  const height = item.height * SCALE_3D;
  const depth = item.depth * SCALE_3D;
  const x = item.x * SCALE_3D;
  const z = item.y * SCALE_3D;
  
  const brandStyle = getBrandStyle(item.equipment.brand);
  const bodyColor = isSelected ? "#FF6B6B" : brandStyle.primary;
  
  // Large vending machine vs wall-mount soap dispenser
  const isLarge = height > 1.2; // Over 60" tall

  return (
    <group 
      position={[x + width/2, height/2, z + depth/2]} 
      rotation={[0, (item.rotation * Math.PI) / 180, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {/* Main body */}
      <RoundedBox
        args={[width, height, depth]}
        radius={0.015}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial 
          color={bodyColor}
          metalness={brandStyle.metalness}
          roughness={0.35}
        />
      </RoundedBox>

      {/* Glass front panel (for large machines) */}
      {isLarge && (
        <mesh position={[0, height * 0.1, depth/2 + 0.005]} castShadow>
          <boxGeometry args={[width * 0.8, height * 0.6, 0.01]} />
          <meshStandardMaterial 
            color="#1a1a2e"
            metalness={0.1}
            roughness={0.3}
            transparent
            opacity={0.85}
          />
        </mesh>
      )}

      {/* Coin slot / payment area */}
      <mesh position={[width * 0.3, height * 0.35, depth/2 + 0.01]}>
        <boxGeometry args={[width * 0.15, height * 0.08, 0.015]} />
        <meshStandardMaterial 
          color="#1f2937"
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Product dispensing area */}
      <mesh position={[0, -height * 0.35, depth/2 + 0.01]}>
        <boxGeometry args={[width * 0.6, height * 0.15, 0.02]} />
        <meshStandardMaterial 
          color="#111827"
          metalness={0.4}
          roughness={0.5}
        />
      </mesh>

      {/* Brand logo panel */}
      <mesh position={[0, height * 0.42, depth/2 + 0.008]}>
        <boxGeometry args={[width * 0.7, height * 0.08, 0.01]} />
        <meshStandardMaterial 
          color={brandStyle.accent}
          metalness={0.3}
          roughness={0.6}
        />
      </mesh>

      {isSelected && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(width * 1.05, height * 1.05, depth * 1.05)]} />
          <lineBasicMaterial color="#FFFFFF" linewidth={2} />
        </lineSegments>
      )}

      {showLabel && (
        <Text
          position={[0, height/2 + 0.12, 0]}
          fontSize={0.08}
          color="#FFFFFF"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.012}
          outlineColor="#000000"
        >
          {item.equipment.name}
        </Text>
      )}
    </group>
  );
}

// ============================================================================
// CHANGER MESH - Coin/bill changers
// True specs: American AC1005 = 18×12×42", Hamilton TT = 24×18×48", Rowe BC3500 = 18×16×44"
// ============================================================================
function ChangerMesh({ 
  item, 
  isSelected, 
  onClick,
  showLabel 
}: { 
  item: PlacedEquipment; 
  isSelected: boolean;
  onClick: () => void;
  showLabel: boolean;
}) {
  const width = item.width * SCALE_3D;
  const height = item.height * SCALE_3D;
  const depth = item.depth * SCALE_3D;
  const x = item.x * SCALE_3D;
  const z = item.y * SCALE_3D;
  
  const brandStyle = getBrandStyle(item.equipment.brand);
  const bodyColor = isSelected ? "#FF6B6B" : brandStyle.primary;

  return (
    <group 
      position={[x + width/2, height/2, z + depth/2]} 
      rotation={[0, (item.rotation * Math.PI) / 180, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {/* Base plinth */}
      <mesh position={[0, -height/2 + 0.015, 0]} castShadow>
        <boxGeometry args={[width * 1.05, 0.03, depth * 1.05]} />
        <meshStandardMaterial color="#111827" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Main cabinet - heavy gauge steel */}
      <RoundedBox
        args={[width, height * 0.97, depth]}
        radius={0.01}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial 
          color={bodyColor}
          metalness={0.75}
          roughness={0.25}
        />
      </RoundedBox>

      {/* Recessed front panel door frame */}
      <mesh position={[0, 0, depth/2 - 0.01]}>
        <boxGeometry args={[width * 0.9, height * 0.85, 0.02]} />
        <meshStandardMaterial color={brandStyle.accent} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Bill acceptor housing */}
      <mesh position={[0, height * 0.28, depth/2 + 0.015]}>
        <boxGeometry args={[width * 0.55, height * 0.12, 0.03]} />
        <meshStandardMaterial color="#1f2937" metalness={0.75} roughness={0.25} />
      </mesh>
      {/* Bill acceptor slot */}
      <mesh position={[0, height * 0.25, depth/2 + 0.03]}>
        <boxGeometry args={[width * 0.45, 0.012, 0.01]} />
        <meshStandardMaterial color="#000000" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Coin return tray with rim */}
      <mesh position={[0, -height * 0.32, depth/2 + 0.025]}>
        <boxGeometry args={[width * 0.65, height * 0.1, 0.05]} />
        <meshStandardMaterial color="#374151" metalness={0.85} roughness={0.2} />
      </mesh>
      {/* Coin dispensing slots */}
      {[-0.12, -0.04, 0.04, 0.12].map((xOffset, i) => (
        <mesh key={`coin-${i}`} position={[xOffset, -height * 0.15, depth/2 + 0.03]}>
          <cylinderGeometry args={[0.012, 0.012, 0.01, 12]} />
          <meshStandardMaterial color="#111827" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}

      {/* LED display panel with bezel */}
      <mesh position={[0, height * 0.38, depth/2 + 0.02]}>
        <boxGeometry args={[width * 0.5, height * 0.08, 0.025]} />
        <meshStandardMaterial color="#0f172a" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, height * 0.38, depth/2 + 0.035]}>
        <boxGeometry args={[width * 0.42, height * 0.055, 0.01]} />
        <meshStandardMaterial 
          color="#1f2937"
          metalness={0.2}
          roughness={0.5}
          emissive="#00ff00"
          emissiveIntensity={0.4}
        />
      </mesh>

      {isSelected && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(width * 1.05, height * 1.05, depth * 1.05)]} />
          <lineBasicMaterial color="#FFFFFF" linewidth={2} />
        </lineSegments>
      )}

      {showLabel && (
        <Text
          position={[0, height/2 + 0.12, 0]}
          fontSize={0.08}
          color="#FFFFFF"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.012}
          outlineColor="#000000"
        >
          {item.equipment.name}
        </Text>
      )}
    </group>
  );
}

// ============================================================================
// ATM MESH - Full-size ATM
// True specs: Standard ATM = 24×24×60"
// ============================================================================
function AtmMesh({ 
  item, 
  isSelected, 
  onClick,
  showLabel 
}: { 
  item: PlacedEquipment; 
  isSelected: boolean;
  onClick: () => void;
  showLabel: boolean;
}) {
  const width = item.width * SCALE_3D;
  const height = item.height * SCALE_3D;
  const depth = item.depth * SCALE_3D;
  const x = item.x * SCALE_3D;
  const z = item.y * SCALE_3D;
  
  const bodyColor = isSelected ? "#FF6B6B" : "#1e293b";

  return (
    <group 
      position={[x + width/2, height/2, z + depth/2]} 
      rotation={[0, (item.rotation * Math.PI) / 180, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {/* Base plinth */}
      <mesh position={[0, -height/2 + 0.02, 0]} castShadow>
        <boxGeometry args={[width * 1.08, 0.04, depth * 1.08]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Main cabinet */}
      <RoundedBox
        args={[width, height * 0.96, depth]}
        radius={0.015}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial 
          color={bodyColor}
          metalness={0.7}
          roughness={0.3}
        />
      </RoundedBox>

      {/* Recessed door frame */}
      <mesh position={[0, height * 0.05, depth/2 - 0.01]}>
        <boxGeometry args={[width * 0.88, height * 0.8, 0.02]} />
        <meshStandardMaterial color="#334155" metalness={0.65} roughness={0.35} />
      </mesh>

      {/* Screen bezel */}
      <mesh position={[0, height * 0.18, depth/2 + 0.015]}>
        <boxGeometry args={[width * 0.7, height * 0.3, 0.03]} />
        <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Screen */}
      <mesh position={[0, height * 0.18, depth/2 + 0.032]}>
        <boxGeometry args={[width * 0.58, height * 0.24, 0.01]} />
        <meshStandardMaterial 
          color="#1e293b"
          metalness={0.1}
          roughness={0.3}
          emissive="#3b82f6"
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* Keypad housing */}
      <mesh position={[0, -height * 0.1, depth/2 + 0.02]}>
        <boxGeometry args={[width * 0.55, height * 0.18, 0.04]} />
        <meshStandardMaterial color="#475569" metalness={0.75} roughness={0.3} />
      </mesh>
      {/* Keypad buttons - 3x4 grid */}
      {[0, 1, 2].map((row) => (
        [0, 1, 2, 3].map((col) => (
          <mesh key={`key-${row}-${col}`} position={[(col - 1.5) * 0.04, -height * 0.08 - row * 0.03, depth/2 + 0.042]}>
            <boxGeometry args={[0.025, 0.02, 0.005]} />
            <meshStandardMaterial color="#1f2937" metalness={0.5} roughness={0.6} />
          </mesh>
        ))
      ))}

      {/* Card slot with label */}
      <mesh position={[width * 0.28, height * 0, depth/2 + 0.025]}>
        <boxGeometry args={[width * 0.22, 0.035, 0.04]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[width * 0.28, height * 0, depth/2 + 0.048]}>
        <boxGeometry args={[width * 0.18, 0.008, 0.008]} />
        <meshStandardMaterial color="#000000" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Cash dispenser with shutter */}
      <mesh position={[0, -height * 0.32, depth/2 + 0.025]}>
        <boxGeometry args={[width * 0.45, height * 0.1, 0.05]} />
        <meshStandardMaterial color="#1f2937" metalness={0.85} roughness={0.2} />
      </mesh>
      <mesh position={[0, -height * 0.32, depth/2 + 0.055]}>
        <boxGeometry args={[width * 0.38, height * 0.06, 0.01]} />
        <meshStandardMaterial color="#111827" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Receipt printer slot */}
      <mesh position={[-width * 0.28, -height * 0.15, depth/2 + 0.03]}>
        <boxGeometry args={[width * 0.12, height * 0.04, 0.02]} />
        <meshStandardMaterial color="#1f2937" metalness={0.7} roughness={0.3} />
      </mesh>

      {isSelected && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(width * 1.05, height * 1.05, depth * 1.05)]} />
          <lineBasicMaterial color="#FFFFFF" linewidth={2} />
        </lineSegments>
      )}

      {showLabel && (
        <Text
          position={[0, height/2 + 0.12, 0]}
          fontSize={0.08}
          color="#FFFFFF"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.012}
          outlineColor="#000000"
        >
          {item.equipment.name}
        </Text>
      )}
    </group>
  );
}

// ============================================================================
// DOG WASH MESH - K9000 self-service
// True specs: K9000 = 48×36×84"
// ============================================================================
function DogWashMesh({ 
  item, 
  isSelected, 
  onClick,
  showLabel 
}: { 
  item: PlacedEquipment; 
  isSelected: boolean;
  onClick: () => void;
  showLabel: boolean;
}) {
  const width = item.width * SCALE_3D;
  const height = item.height * SCALE_3D;
  const depth = item.depth * SCALE_3D;
  const x = item.x * SCALE_3D;
  const z = item.y * SCALE_3D;
  
  const bodyColor = isSelected ? "#FF6B6B" : "#0891b2";
  const tubHeight = height * 0.4;
  const cabinetHeight = height * 0.6;

  return (
    <group 
      position={[x + width/2, 0, z + depth/2]} 
      rotation={[0, (item.rotation * Math.PI) / 180, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {/* Stainless steel tub */}
      <mesh position={[0, tubHeight/2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, tubHeight, depth]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Equipment cabinet above */}
      <mesh position={[0, tubHeight + cabinetHeight/2, 0]} castShadow>
        <boxGeometry args={[width * 0.9, cabinetHeight, depth * 0.5]} />
        <meshStandardMaterial color={bodyColor} metalness={0.6} roughness={0.35} />
      </mesh>

      {/* Control panel */}
      <mesh position={[0, tubHeight + cabinetHeight * 0.7, depth * 0.26]}>
        <boxGeometry args={[width * 0.5, cabinetHeight * 0.25, 0.03]} />
        <meshStandardMaterial 
          color="#1f2937"
          metalness={0.3}
          roughness={0.5}
          emissive="#22d3ee"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Hose attachment */}
      <mesh position={[width * 0.35, tubHeight + cabinetHeight * 0.3, depth * 0.26]}>
        <cylinderGeometry args={[0.03, 0.03, 0.2, 8]} />
        <meshStandardMaterial color="#374151" metalness={0.7} roughness={0.3} />
      </mesh>

      {isSelected && (
        <lineSegments position={[0, height/2, 0]}>
          <edgesGeometry args={[new THREE.BoxGeometry(width * 1.05, height * 1.05, depth * 1.05)]} />
          <lineBasicMaterial color="#FFFFFF" linewidth={2} />
        </lineSegments>
      )}

      {showLabel && (
        <Text
          position={[0, height + 0.15, 0]}
          fontSize={0.1}
          color="#FFFFFF"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.015}
          outlineColor="#000000"
        >
          {item.equipment.name}
        </Text>
      )}
    </group>
  );
}

// ============================================================================
// COUNTER MESH - WDF counter, checkout counter
// True specs: WDF Counter = 96×30×36", Checkout = 48×24×36"
// ============================================================================
function CounterMesh({ 
  item, 
  isSelected, 
  onClick,
  showLabel 
}: { 
  item: PlacedEquipment; 
  isSelected: boolean;
  onClick: () => void;
  showLabel: boolean;
}) {
  const width = item.width * SCALE_3D;
  const height = item.height * SCALE_3D;
  const depth = item.depth * SCALE_3D;
  const x = item.x * SCALE_3D;
  const z = item.y * SCALE_3D;
  
  const topColor = isSelected ? "#FF6B6B" : "#78716c";
  const baseColor = isSelected ? "#FFB6B6" : "#57534e";

  return (
    <group 
      position={[x + width/2, 0, z + depth/2]} 
      rotation={[0, (item.rotation * Math.PI) / 180, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {/* Counter top - laminate */}
      <mesh position={[0, height - 0.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.04, depth]} />
        <meshStandardMaterial color={topColor} metalness={0.15} roughness={0.5} />
      </mesh>

      {/* Base cabinet */}
      <mesh position={[0, (height - 0.04) / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width - 0.02, height - 0.04, depth - 0.02]} />
        <meshStandardMaterial color={baseColor} metalness={0.1} roughness={0.7} />
      </mesh>

      {isSelected && (
        <lineSegments position={[0, height/2, 0]}>
          <edgesGeometry args={[new THREE.BoxGeometry(width * 1.05, height * 1.05, depth * 1.05)]} />
          <lineBasicMaterial color="#FFFFFF" linewidth={2} />
        </lineSegments>
      )}

      {showLabel && (
        <Text
          position={[0, height + 0.12, 0]}
          fontSize={0.08}
          color="#FFFFFF"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.012}
          outlineColor="#000000"
        >
          {item.equipment.name}
        </Text>
      )}
    </group>
  );
}

// ============================================================================
// GENERIC EQUIPMENT MESH - Fallback for architectural, utility, etc.
// ============================================================================
function GenericEquipmentMesh({ 
  item, 
  isSelected, 
  onClick,
  showLabel 
}: { 
  item: PlacedEquipment; 
  isSelected: boolean;
  onClick: () => void;
  showLabel: boolean;
}) {
  const width = item.width * SCALE_3D;
  const height = item.height * SCALE_3D;
  const depth = item.depth * SCALE_3D;
  const x = item.x * SCALE_3D;
  const z = item.y * SCALE_3D;
  
  const color = isSelected ? "#FF6B6B" : (item.equipment.color || "#718096");
  
  const getEquipmentStyle = () => {
    const type = item.equipment.type?.toLowerCase() || '';
    const name = item.equipment.name?.toLowerCase() || '';
    
    if (type.includes('door')) {
      return { metalness: 0.3, roughness: 0.6, color: isSelected ? "#FF6B6B" : "#8B4513" };
    }
    if (type.includes('window')) {
      return { metalness: 0.1, roughness: 0.2, color: isSelected ? "#FF6B6B" : "#87CEEB" };
    }
    if (type.includes('wall') || type.includes('bulkhead')) {
      return { metalness: 0.05, roughness: 0.9, color: isSelected ? "#FF6B6B" : "#d1d5db" };
    }
    if (type.includes('column')) {
      return { metalness: 0.2, roughness: 0.7, color: isSelected ? "#FF6B6B" : "#9ca3af" };
    }
    if (type.includes('restroom') || type.includes('utility')) {
      return { metalness: 0.1, roughness: 0.8, color: isSelected ? "#FF6B6B" : "#e5e7eb" };
    }
    return { metalness: 0.4, roughness: 0.6, color };
  };

  const style = getEquipmentStyle();

  return (
    <group 
      position={[x + width/2, height / 2, z + depth/2]} 
      rotation={[0, (item.rotation * Math.PI) / 180, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <RoundedBox
        args={[width, height, depth]}
        radius={0.01}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial 
          color={style.color}
          metalness={style.metalness}
          roughness={style.roughness}
        />
      </RoundedBox>

      {isSelected && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(width * 1.05, height * 1.05, depth * 1.05)]} />
          <lineBasicMaterial color="#FFFFFF" linewidth={2} />
        </lineSegments>
      )}

      {showLabel && (
        <Text
          position={[0, height / 2 + 0.15, 0]}
          fontSize={0.1}
          color="#FFFFFF"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.015}
          outlineColor="#000000"
        >
          {item.equipment.name}
        </Text>
      )}
    </group>
  );
}

// ============================================================================
// EQUIPMENT MESH ROUTER - Routes to correct mesh based on type
// ============================================================================
function EquipmentMesh({ item, isSelected, onClick, showLabel }: { 
  item: PlacedEquipment; 
  isSelected: boolean;
  onClick: () => void;
  showLabel: boolean;
}) {
  const type = item.equipment.type?.toLowerCase() || '';
  
  if (type === 'washer') {
    return <WasherMesh item={item} isSelected={isSelected} onClick={onClick} showLabel={showLabel} />;
  }
  
  if (type === 'dryer' || type === 'stack' || type === 'combo') {
    return <DryerMesh item={item} isSelected={isSelected} onClick={onClick} showLabel={showLabel} />;
  }
  
  if (type === 'cart') {
    return <CartMesh item={item} isSelected={isSelected} onClick={onClick} showLabel={showLabel} />;
  }
  
  if (type === 'table') {
    return <TableMesh item={item} isSelected={isSelected} onClick={onClick} showLabel={showLabel} />;
  }
  
  if (type === 'seating') {
    return <SeatingMesh item={item} isSelected={isSelected} onClick={onClick} showLabel={showLabel} />;
  }
  
  if (type === 'vending') {
    return <VendingMesh item={item} isSelected={isSelected} onClick={onClick} showLabel={showLabel} />;
  }
  
  if (type === 'changer') {
    return <ChangerMesh item={item} isSelected={isSelected} onClick={onClick} showLabel={showLabel} />;
  }
  
  if (type === 'atm') {
    return <AtmMesh item={item} isSelected={isSelected} onClick={onClick} showLabel={showLabel} />;
  }
  
  if (type === 'dogwash') {
    return <DogWashMesh item={item} isSelected={isSelected} onClick={onClick} showLabel={showLabel} />;
  }
  
  if (type === 'counter') {
    return <CounterMesh item={item} isSelected={isSelected} onClick={onClick} showLabel={showLabel} />;
  }
  
  return <GenericEquipmentMesh item={item} isSelected={isSelected} onClick={onClick} showLabel={showLabel} />;
}

// ============================================================================
// FLOOR WITH TILES
// ============================================================================
function Floor({ width, depth }: { width: number; depth: number }) {
  const tileSize = 0.6;
  const tilesX = Math.ceil(width * 1.5 / tileSize);
  const tilesZ = Math.ceil(depth * 1.5 / tileSize);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[width / 2, -0.01, depth / 2]} receiveShadow>
        <planeGeometry args={[width * 1.5, depth * 1.5]} />
        <meshStandardMaterial 
          color="#d4d4d4"
          metalness={0.1}
          roughness={0.7}
        />
      </mesh>
      {Array.from({ length: tilesX }).map((_, i) =>
        Array.from({ length: tilesZ }).map((_, j) => (
          <mesh 
            key={`tile-${i}-${j}`}
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[
              (i - tilesX/2 + 0.5) * tileSize + width/2, 
              0.001, 
              (j - tilesZ/2 + 0.5) * tileSize + depth/2
            ]}
          >
            <planeGeometry args={[tileSize * 0.98, tileSize * 0.98]} />
            <meshStandardMaterial 
              color={(i + j) % 2 === 0 ? "#e8e8e8" : "#f5f5f5"}
              metalness={0.05}
              roughness={0.8}
            />
          </mesh>
        ))
      )}
    </group>
  );
}

// ============================================================================
// WALLS
// ============================================================================
function Walls({ width, depth, height = 2.5 }: { width: number; depth: number; height?: number }) {
  const wallThickness = 0.1;
  const wallColor = "#f0f0f0";
  
  return (
    <group>
      <mesh position={[width / 2, height / 2, -wallThickness/2]} castShadow receiveShadow>
        <boxGeometry args={[width * 1.1, height, wallThickness]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} metalness={0.05} />
      </mesh>
      <mesh position={[-wallThickness/2, height / 2, depth / 2]} castShadow receiveShadow>
        <boxGeometry args={[wallThickness, height, depth * 1.1]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} metalness={0.05} />
      </mesh>
      <mesh position={[width + wallThickness/2, height / 2, depth / 2]} castShadow receiveShadow>
        <boxGeometry args={[wallThickness, height, depth * 1.1]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} metalness={0.05} />
      </mesh>
    </group>
  );
}

// ============================================================================
// LIGHTING
// ============================================================================
function Lights() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[15, 20, 15]} 
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={60}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-10, 15, -10]} intensity={0.3} />
      <pointLight position={[0, 3, 0]} intensity={0.5} color="#ffffff" />
      <hemisphereLight args={['#87CEEB', '#f0f0f0', 0.3]} />
    </>
  );
}

// ============================================================================
// MAIN SCENE EXPORT
// ============================================================================
export default function ThreeScene({
  equipment,
  selectedId,
  onSelect,
  ambientIntensity,
  showLabels,
  canvasWidth,
  canvasHeight,
}: ThreeSceneProps) {
  const floorWidth = canvasWidth * SCALE_3D;
  const floorDepth = canvasHeight * SCALE_3D;
  
  return (
    <>
      <PerspectiveCamera 
        makeDefault 
        position={[floorWidth / 2 + 6, 5, floorDepth / 2 + 12]} 
        fov={45}
      />
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        target={[floorWidth / 2, 0.5, floorDepth / 2]}
        maxPolarAngle={Math.PI / 2 - 0.05}
        minDistance={2}
        maxDistance={40}
        panSpeed={0.8}
        rotateSpeed={0.6}
      />
      
      <Lights />
      
      <Floor width={floorWidth} depth={floorDepth} />
      <Walls width={floorWidth} depth={floorDepth} />
      
      <mesh 
        position={[floorWidth / 2, 0, floorDepth / 2]} 
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={() => onSelect(null)}
      >
        <planeGeometry args={[floorWidth * 2, floorDepth * 2]} />
        <meshBasicMaterial visible={false} />
      </mesh>
      
      {equipment.map((item) => (
        <EquipmentMesh
          key={item.id}
          item={item}
          isSelected={selectedId === item.id}
          onClick={() => onSelect(item.id)}
          showLabel={showLabels}
        />
      ))}
      
      <fog attach="fog" args={["#e8e8e8", 20, 50]} />
    </>
  );
}

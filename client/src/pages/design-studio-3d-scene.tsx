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

const BRAND_COLORS: Record<string, { primary: string; accent: string; metalness: number }> = {
  'dexter': { primary: '#1e3a5f', accent: '#4a90d9', metalness: 0.7 },
  'speed-queen': { primary: '#c41e3a', accent: '#ffffff', metalness: 0.6 },
  'continental': { primary: '#2d5a27', accent: '#8bc34a', metalness: 0.65 },
  'huebsch': { primary: '#ff6b00', accent: '#ffffff', metalness: 0.6 },
  'maytag': { primary: '#003366', accent: '#ffd700', metalness: 0.55 },
  'lg': { primary: '#a50034', accent: '#ffffff', metalness: 0.7 },
  'samsung': { primary: '#1428a0', accent: '#ffffff', metalness: 0.7 },
  'wascomat': { primary: '#006400', accent: '#c0c0c0', metalness: 0.6 },
  'default': { primary: '#4a5568', accent: '#a0aec0', metalness: 0.5 },
};

function getBrandStyle(brand: string) {
  const key = brand?.toLowerCase().replace(/\s+/g, '-') || 'default';
  return BRAND_COLORS[key] || BRAND_COLORS['default'];
}

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
  
  useFrame((state) => {
    if (drumRef.current && isSelected) {
      drumRef.current.rotation.z = state.clock.elapsedTime * 2;
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

      <mesh position={[0, -height/2 + 0.005, -depth * 0.3]} rotation={[-Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, depth * 0.4, 8]} />
        <meshStandardMaterial color="#888888" metalness={0.6} roughness={0.4} />
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
    if (type.includes('table') || type.includes('counter')) {
      return { metalness: 0.1, roughness: 0.8, color: isSelected ? "#FF6B6B" : "#8B7355" };
    }
    if (type.includes('changer') || type.includes('atm')) {
      return { metalness: 0.8, roughness: 0.2, color: isSelected ? "#FF6B6B" : "#2d3748" };
    }
    if (type.includes('vending')) {
      return { metalness: 0.6, roughness: 0.3, color: isSelected ? "#FF6B6B" : "#c41e3a" };
    }
    if (type.includes('cart')) {
      return { metalness: 0.7, roughness: 0.3, color: isSelected ? "#FF6B6B" : "#a0aec0" };
    }
    return { metalness: 0.4, roughness: 0.6, color };
  };

  const style = getEquipmentStyle();

  return (
    <group 
      position={[x + width/2, height / 2, z + depth/2]} 
      rotation={[0, (item.rotation * Math.PI) / 180, 0]}
    >
      <RoundedBox
        args={[width, height, depth]}
        radius={0.015}
        smoothness={4}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
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
  
  return <GenericEquipmentMesh item={item} isSelected={isSelected} onClick={onClick} showLabel={showLabel} />;
}

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

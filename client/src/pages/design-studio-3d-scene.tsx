import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment, Grid, Html, RoundedBox, Edges } from "@react-three/drei";
import * as THREE from "three";
import { equipmentLibrary } from "@shared/schema";

interface PlacedEquipment {
  id: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  rotation: number;
  equipment: typeof equipmentLibrary[number];
}

const SCALE_3D = 0.02;

function WasherModel({ position, color, capacity, isSelected, onClick }: { 
  position: [number, number, number]; 
  color: string; 
  capacity: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && isSelected) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <group position={position} onClick={onClick}>
      <RoundedBox
        ref={meshRef}
        args={[0.7, 1, 0.8]}
        radius={0.05}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
        <Edges color={isSelected ? "#39CCCC" : "#333333"} lineWidth={isSelected ? 3 : 1} />
      </RoundedBox>
      <RoundedBox
        position={[0, 0.1, 0.35]}
        args={[0.5, 0.5, 0.1]}
        radius={0.02}
      >
        <meshStandardMaterial color="#222222" metalness={0.8} roughness={0.2} />
      </RoundedBox>
      <mesh position={[0, 0.1, 0.41]}>
        <circleGeometry args={[0.18, 32]} />
        <meshStandardMaterial color="#111111" metalness={0.9} roughness={0.1} transparent opacity={0.8} />
      </mesh>
      <Html position={[0, 0.7, 0]} center distanceFactor={8}>
        <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap font-bold">
          {capacity}
        </div>
      </Html>
    </group>
  );
}

function DryerModel({ position, color, capacity, isSelected, onClick }: { 
  position: [number, number, number]; 
  color: string; 
  capacity: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && isSelected) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <group position={position} onClick={onClick}>
      <RoundedBox
        ref={meshRef}
        args={[0.75, 1.1, 0.85]}
        radius={0.05}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
        <Edges color={isSelected ? "#39CCCC" : "#333333"} lineWidth={isSelected ? 3 : 1} />
      </RoundedBox>
      <mesh position={[0, 0.05, 0.38]}>
        <circleGeometry args={[0.28, 32]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.05, 0.40]}>
        <ringGeometry args={[0.22, 0.26, 32]} />
        <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.1} />
      </mesh>
      <Html position={[0, 0.75, 0]} center distanceFactor={8}>
        <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap font-bold">
          {capacity}
        </div>
      </Html>
    </group>
  );
}

function FloorGrid() {
  return (
    <Grid
      args={[20, 20]}
      cellSize={0.5}
      cellThickness={0.5}
      cellColor="#39CCCC"
      sectionSize={2}
      sectionThickness={1}
      sectionColor="#2AA0A0"
      fadeDistance={30}
      fadeStrength={1}
      followCamera={false}
      position={[0, -0.01, 0]}
    />
  );
}

interface Scene3DProps {
  equipment: PlacedEquipment[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  ambientIntensity: number;
  showLabels: boolean;
  canvasWidth: number;
  canvasHeight: number;
}

export default function ThreeScene({ 
  equipment, 
  selectedId, 
  onSelect,
  ambientIntensity,
  showLabels,
  canvasWidth,
  canvasHeight
}: Scene3DProps) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[8, 6, 8]} fov={50} />
      <OrbitControls 
        enablePan 
        enableZoom 
        enableRotate 
        minDistance={3} 
        maxDistance={20}
        maxPolarAngle={Math.PI / 2.1}
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_PAN
        }}
      />
      
      <ambientLight intensity={ambientIntensity} />
      <directionalLight 
        position={[10, 15, 10]} 
        intensity={1.2} 
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-5, 10, -5]} intensity={0.4} />
      <pointLight position={[0, 8, 0]} intensity={0.6} />
      
      <FloorGrid />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#001F3F" />
      </mesh>
      
      {equipment.map((item) => {
        const position: [number, number, number] = [
          (item.x - canvasWidth / 2) * SCALE_3D,
          0.5,
          (item.y - canvasHeight / 2) * SCALE_3D
        ];
        
        const isWasher = item.equipment.type === "washer";
        const Model = isWasher ? WasherModel : DryerModel;
        
        return (
          <Model
            key={item.id}
            position={position}
            color={item.equipment.color}
            capacity={item.equipment.capacity}
            isSelected={selectedId === item.id}
            onClick={() => onSelect(item.id)}
          />
        );
      })}
      
      <Environment preset="city" />
    </>
  );
}

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, PerspectiveCamera } from "@react-three/drei";
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

function EquipmentMesh({ 
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
  const meshRef = useRef<THREE.Mesh>(null);
  
  const width = item.width * SCALE_3D;
  const height = item.height * SCALE_3D;
  const depth = item.depth * SCALE_3D;
  const x = item.x * SCALE_3D;
  const z = item.y * SCALE_3D;
  
  const color = item.equipment.color || "#39CCCC";
  
  return (
    <group position={[x, height / 2, z]} rotation={[0, (item.rotation * Math.PI) / 180, 0]}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial 
          color={isSelected ? "#FF6B6B" : color}
          metalness={0.3}
          roughness={0.7}
          emissive={isSelected ? "#FF6B6B" : "#000000"}
          emissiveIntensity={isSelected ? 0.2 : 0}
        />
      </mesh>
      
      {isSelected && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(width * 1.02, height * 1.02, depth * 1.02)]} />
          <lineBasicMaterial color="#FFFFFF" linewidth={2} />
        </lineSegments>
      )}
      
      {showLabel && (
        <Text
          position={[0, height / 2 + 0.3, 0]}
          fontSize={0.15}
          color="#FFFFFF"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {item.equipment.name}
        </Text>
      )}
    </group>
  );
}

function Floor({ width, depth }: { width: number; depth: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[width / 2, 0, depth / 2]} receiveShadow>
      <planeGeometry args={[width * 1.2, depth * 1.2]} />
      <meshStandardMaterial 
        color="#2a2a4a"
        metalness={0.1}
        roughness={0.9}
      />
    </mesh>
  );
}

function Grid({ width, depth }: { width: number; depth: number }) {
  return (
    <gridHelper 
      args={[Math.max(width, depth) * 1.5, 20, "#39CCCC", "#1a1a3a"]} 
      position={[width / 2, 0.01, depth / 2]}
    />
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
        position={[floorWidth / 2 + 5, 8, floorDepth / 2 + 10]} 
        fov={50}
      />
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        target={[floorWidth / 2, 0, floorDepth / 2]}
        maxPolarAngle={Math.PI / 2 - 0.1}
        minDistance={2}
        maxDistance={30}
      />
      
      <ambientLight intensity={ambientIntensity} />
      <directionalLight 
        position={[10, 15, 10]} 
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <pointLight position={[-10, 10, -10]} intensity={0.3} />
      
      <Floor width={floorWidth} depth={floorDepth} />
      <Grid width={floorWidth} depth={floorDepth} />
      
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
      
      <fog attach="fog" args={["#0a0a1a", 15, 40]} />
    </>
  );
}

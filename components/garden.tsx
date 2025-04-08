"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { RigidBody } from "@react-three/rapier"
import * as THREE from "three"

export function Garden() {
  const flowerTypes = [
    { color: "#ff5555", height: 0.5, stemColor: "#3a5f3a" },
    { color: "#ffdd55", height: 0.4, stemColor: "#3a5f3a" },
    { color: "#5555ff", height: 0.6, stemColor: "#3a5f3a" },
    { color: "#ff55ff", height: 0.45, stemColor: "#3a5f3a" },
    { color: "#ffffff", height: 0.35, stemColor: "#3a5f3a" },
  ]

  // Create garden areas
  const gardenAreas = [
    { position: [10, 0, 10], size: [15, 15], count: 100 },
    { position: [-15, 0, -15], size: [10, 10], count: 60 },
    { position: [20, 0, -20], size: [12, 12], count: 80 },
  ]

  return (
    <group>
      {/* Garden areas with flowers */}
      {gardenAreas.map((area, areaIndex) => (
        <group key={areaIndex} position={[area.position[0], 0, area.position[1]]}>
          {/* Garden border */}
          <RigidBody type="fixed" colliders="cuboid">
            <mesh position={[0, 0.15, 0]} receiveShadow castShadow>
              <boxGeometry args={[area.size[0] + 1, 0.3, area.size[1] + 1]} />
              <meshStandardMaterial color="#8B4513" roughness={0.8} />
            </mesh>
          </RigidBody>

          {/* Garden soil */}
          <mesh position={[0, 0.1, 0]} receiveShadow>
            <boxGeometry args={[area.size[0], 0.1, area.size[1]]} />
            <meshStandardMaterial color="#3b2412" roughness={1} />
          </mesh>

          {/* Flowers */}
          <FlowerBed
            position={[0, 0.2, 0]}
            count={area.count}
            size={[area.size[0] * 0.9, area.size[1] * 0.9]}
            flowerTypes={flowerTypes}
          />

          {/* Garden path */}
          {areaIndex === 0 && (
            <mesh position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[2, area.size[1]]} />
              <meshStandardMaterial color="#a88c6d" roughness={0.9} metalness={0} />
            </mesh>
          )}

          {/* Garden decorations */}
          {areaIndex === 0 && <GardenBench position={[4, 0, 0]} rotation={[0, Math.PI / 2, 0]} />}

          {areaIndex === 1 && <BirdBath position={[0, 0, 0]} />}
        </group>
      ))}
    </group>
  )
}

// Component for a garden bench
function GardenBench({ position, rotation }) {
  return (
    <RigidBody type="fixed" position={position} rotation={rotation} colliders="hull">
      <group>
        {/* Bench seat */}
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.8, 0.1, 0.8]} />
          <meshStandardMaterial color="#8B4513" roughness={0.9} />
        </mesh>

        {/* Bench back */}
        <mesh position={[0, 1, -0.35]} rotation={[Math.PI * 0.1, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.8, 0.8, 0.1]} />
          <meshStandardMaterial color="#8B4513" roughness={0.9} />
        </mesh>

        {/* Bench legs */}
        {[
          [-0.7, 0.25, 0.3],
          [0.7, 0.25, 0.3],
          [-0.7, 0.25, -0.3],
          [0.7, 0.25, -0.3],
        ].map((pos, i) => (
          <mesh key={i} position={pos} castShadow receiveShadow>
            <boxGeometry args={[0.1, 0.5, 0.1]} />
            <meshStandardMaterial color="#8B4513" roughness={0.9} />
          </mesh>
        ))}
      </group>
    </RigidBody>
  )
}

// Component for a bird bath
function BirdBath({ position }) {
  return (
    <RigidBody type="fixed" position={position} colliders="hull">
      <group>
        {/* Base */}
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.3, 0.5, 0.6, 12]} />
          <meshStandardMaterial color="#aaaaaa" roughness={0.7} />
        </mesh>

        {/* Pillar */}
        <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.15, 0.2, 0.6, 8]} />
          <meshStandardMaterial color="#aaaaaa" roughness={0.7} />
        </mesh>

        {/* Basin */}
        <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.6, 0.5, 0.15, 16]} />
          <meshStandardMaterial color="#aaaaaa" roughness={0.7} />
        </mesh>

        {/* Water */}
        <mesh position={[0, 1.35, 0]} receiveShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.05, 16]} />
          <meshStandardMaterial color="#4a95e8" roughness={0.1} metalness={0.2} transparent opacity={0.8} />
        </mesh>
      </group>
    </RigidBody>
  )
}

// Component for a bed of flowers
function FlowerBed({ position, count, size, flowerTypes }) {
  const flowersRef = useRef()

  // Create random positions for flowers
  const flowerPositions = useRef(
    Array.from({ length: count }, () => ({
      position: [(Math.random() - 0.5) * size[0], 0, (Math.random() - 0.5) * size[1]],
      rotation: Math.random() * Math.PI * 2,
      scale: 0.7 + Math.random() * 0.6,
      type: Math.floor(Math.random() * flowerTypes.length),
      phase: Math.random() * Math.PI * 2,
    })),
  ).current

  // Animate flowers swaying in the wind
  useFrame(({ clock }) => {
    if (!flowersRef.current) return

    const time = clock.getElapsedTime()

    flowersRef.current.children.forEach((flower, i) => {
      const data = flowerPositions[i]
      flower.rotation.y = data.rotation + Math.sin(time * 0.5 + data.phase) * 0.1
      flower.position.y = Math.sin(time * 0.3 + data.phase) * 0.05
    })
  })

  return (
    <group position={position}>
      <group ref={flowersRef}>
        {flowerPositions.map((data, i) => {
          const flowerType = flowerTypes[data.type]
          return (
            <Flower
              key={i}
              position={data.position}
              rotation={[0, data.rotation, 0]}
              scale={data.scale}
              color={flowerType.color}
              stemColor={flowerType.stemColor}
              height={flowerType.height}
            />
          )
        })}
      </group>
    </group>
  )
}

// Component for a single flower
function Flower({ position, rotation, scale, color, stemColor, height }) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Flower stem */}
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, height, 8]} />
        <meshStandardMaterial color={stemColor} roughness={0.8} />
      </mesh>

      {/* Flower head */}
      <group position={[0, height, 0]}>
        {/* Center of flower */}
        <mesh castShadow>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#ffdd00" roughness={0.5} />
        </mesh>

        {/* Petals */}
        {[...Array(6)].map((_, i) => {
          const angle = (i / 6) * Math.PI * 2
          const x = Math.cos(angle) * 0.08
          const z = Math.sin(angle) * 0.08
          return (
            <mesh key={i} position={[x, 0, z]} rotation={[Math.PI / 2, 0, angle]} castShadow>
              <planeGeometry args={[0.1, 0.15]} />
              <meshStandardMaterial color={color} roughness={0.5} side={THREE.DoubleSide} />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

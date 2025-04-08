"use client"

import { useState, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Text, RoundedBox } from "@react-three/drei"
import type { Group, Mesh } from "three"
import { useSpring, animated } from "@react-spring/three"

// Create an animated mesh component
const AnimatedRoundedBox = animated(RoundedBox)

export default function InteractiveEnvironment() {
  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <shadowMaterial opacity={0.4} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#4a6670" />
      </mesh>

      {/* Interactive objects */}
      <InteractiveBox position={[-2, 1, -3]} color="#f06292" />
      <InteractiveBox position={[0, 1, -3]} color="#64b5f6" />
      <InteractiveBox position={[2, 1, -3]} color="#81c784" />

      {/* Welcome sign */}
      <Text position={[0, 3, -5]} fontSize={0.5} color="#ffffff" anchorX="center" anchorY="middle">
        Welcome to VR
      </Text>

      {/* Floating objects */}
      <FloatingObjects />

      {/* Distant mountains for environment */}
      <Mountains />
    </group>
  )
}

function InteractiveBox({ position, color }: { position: [number, number, number]; color: string }) {
  const [hover, setHover] = useState(false)
  const [active, setActive] = useState(false)
  const meshRef = useRef<Mesh>(null)

  // Animation with react-spring
  const { scale, boxColor } = useSpring({
    scale: hover ? 1.2 : 1,
    boxColor: active ? "#ffffff" : color,
    config: { mass: 1, tension: 170, friction: 26 },
  })

  // Handle pointer events manually instead of using Interactive from @react-three/xr
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.scale.x = scale.get()
      meshRef.current.scale.y = scale.get()
      meshRef.current.scale.z = scale.get()
    }
  })

  return (
    <AnimatedRoundedBox
      ref={meshRef}
      args={[0.8, 0.8, 0.8]}
      radius={0.1}
      position={position}
      castShadow
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      onClick={() => setActive(!active)}
    >
      <animated.meshStandardMaterial color={boxColor} roughness={0.3} metalness={0.3} />
    </AnimatedRoundedBox>
  )
}

function FloatingObjects() {
  const group = useRef<Group>(null)

  useFrame(({ clock }) => {
    if (group.current) {
      group.current.rotation.y = clock.getElapsedTime() * 0.1
    }
  })

  return (
    <group ref={group}>
      {[...Array(10)].map((_, i) => (
        <FloatingSphere
          key={i}
          position={[Math.sin(i * 0.5) * 5, 1.5 + Math.sin(i * 0.3) * 2, Math.cos(i * 0.5) * 5]}
          color={`hsl(${i * 36}, 70%, 60%)`}
          speed={0.2 + Math.random() * 0.3}
        />
      ))}
    </group>
  )
}

function FloatingSphere({
  position,
  color,
  speed,
}: {
  position: [number, number, number]
  color: string
  speed: number
}) {
  const mesh = useRef<Mesh>(null)
  const initialY = position[1]

  useFrame(({ clock }) => {
    if (mesh.current) {
      mesh.current.position.y = initialY + Math.sin(clock.getElapsedTime() * speed) * 0.5
      mesh.current.rotation.x = clock.getElapsedTime() * 0.2
      mesh.current.rotation.z = clock.getElapsedTime() * 0.2
    }
  })

  return (
    <mesh ref={mesh} position={position} castShadow>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshStandardMaterial color={color} roughness={0.2} metalness={0.3} />
    </mesh>
  )
}

function Mountains() {
  return (
    <group position={[0, 0, 0]}>
      {/* Create distant mountains */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const distance = 20
        const x = Math.sin(angle) * distance
        const z = Math.cos(angle) * distance
        const height = 2 + Math.random() * 3

        return (
          <mesh key={i} position={[x, height / 2, z]} castShadow>
            <coneGeometry args={[3 + Math.random() * 2, height, 16]} />
            <meshStandardMaterial color={`hsl(210, 20%, ${20 + Math.random() * 10}%)`} />
          </mesh>
        )
      })}
    </group>
  )
}

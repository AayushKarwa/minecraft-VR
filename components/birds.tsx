"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export function Birds() {
  return (
    <group>
      <BirdFlock position={[0, 20, -50]} count={15} />
      <BirdFlock position={[30, 15, -20]} count={8} />
    </group>
  )
}

// Component for a flock of birds
function BirdFlock({ position, count }) {
  const flockRef = useRef()
  const birdsData = useRef(
    Array.from({ length: count }, () => ({
      position: new THREE.Vector3((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 20),
      rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0),
      speed: 0.2 + Math.random() * 0.3,
      wingSpeed: 0.3 + Math.random() * 0.5,
      wingPhase: Math.random() * Math.PI * 2,
      circleRadius: 5 + Math.random() * 10,
      circlePhase: Math.random() * Math.PI * 2,
      circleHeight: Math.random() * 2 - 1,
    })),
  ).current

  // Animate birds flying
  useFrame(({ clock }) => {
    if (!flockRef.current) return

    const time = clock.getElapsedTime()

    flockRef.current.children.forEach((bird, i) => {
      const data = birdsData[i]

      // Circular flight path
      const angle = time * data.speed + data.circlePhase
      const x = Math.cos(angle) * data.circleRadius
      const z = Math.sin(angle) * data.circleRadius
      const y = Math.sin(time * 0.2 + data.circlePhase) * data.circleHeight

      bird.position.set(x, y, z)

      // Rotate to face direction of movement
      bird.rotation.y = angle - Math.PI / 2

      // Flap wings
      const wingAngle = Math.sin(time * data.wingSpeed * 10 + data.wingPhase) * 0.3
      bird.children[1].rotation.z = wingAngle
      bird.children[2].rotation.z = -wingAngle
    })
  })

  return (
    <group position={position} ref={flockRef}>
      {birdsData.map((_, i) => (
        <Bird key={i} />
      ))}
    </group>
  )
}

// Component for a single bird
function Bird() {
  return (
    <group>
      {/* Bird body */}
      <mesh castShadow>
        <coneGeometry args={[0.1, 0.4, 4]} />
        <meshStandardMaterial color="#444444" />
      </mesh>

      {/* Left wing */}
      <mesh position={[0, 0, 0.1]} castShadow>
        <boxGeometry args={[0.4, 0.05, 0.2]} />
        <meshStandardMaterial color="#444444" />
      </mesh>

      {/* Right wing */}
      <mesh position={[0, 0, -0.1]} castShadow>
        <boxGeometry args={[0.4, 0.05, 0.2]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
    </group>
  )
}

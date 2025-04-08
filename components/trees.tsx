"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { RigidBody } from "@react-three/rapier"

export function Trees() {
  // Create tree clusters
  const treeClusters = [
    { position: [5, 0, -20], count: 15, radius: 10 },
    { position: [-20, 0, 5], count: 10, radius: 8 },
    { position: [25, 0, 15], count: 12, radius: 12 },
    { position: [-15, 0, -30], count: 8, radius: 7 },
  ]

  // Create individual trees along paths
  const pathTrees = [
    { position: [3, 0, 3], scale: 1.2 },
    { position: [-3, 0, 8], scale: 1.0 },
    { position: [8, 0, -3], scale: 1.3 },
    { position: [-8, 0, -5], scale: 0.9 },
    { position: [12, 0, 0], scale: 1.1 },
    { position: [0, 0, 12], scale: 1.0 },
    { position: [-12, 0, -12], scale: 1.2 },
  ]

  return (
    <group>
      {/* Tree clusters */}
      {treeClusters.map((cluster, i) => (
        <TreeCluster key={i} position={cluster.position} count={cluster.count} radius={cluster.radius} />
      ))}

      {/* Individual trees */}
      {pathTrees.map((tree, i) => (
        <Tree key={i} position={tree.position} scale={tree.scale} />
      ))}
    </group>
  )
}

// Component for a cluster of trees
function TreeCluster({ position, count, radius }) {
  // Create random positions for trees within the cluster
  const treePositions = useRef(
    Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2
      const distance = Math.random() * radius
      const x = Math.cos(angle) * distance
      const z = Math.sin(angle) * distance
      return {
        position: [position[0] + x, position[1], position[2] + z],
        rotation: Math.random() * Math.PI * 2,
        scale: 0.8 + Math.random() * 0.4,
      }
    }),
  ).current

  return (
    <group>
      {treePositions.map((tree, i) => (
        <Tree key={i} position={tree.position} rotation={[0, tree.rotation, 0]} scale={tree.scale} />
      ))}
    </group>
  )
}

// Component for a single tree
function Tree({ position, rotation = [0, 0, 0], scale = 1 }) {
  const treeRef = useRef()

  // Animate tree leaves
  useFrame(({ clock }) => {
    if (!treeRef.current) return

    const time = clock.getElapsedTime()
    const leavesGroup = treeRef.current.children[1]

    // Gentle swaying motion
    leavesGroup.rotation.y = Math.sin(time * 0.1) * 0.05
    leavesGroup.rotation.z = Math.sin(time * 0.15) * 0.03
    leavesGroup.position.y = Math.sin(time * 0.2) * 0.05 + 4
  })

  return (
    <RigidBody type="fixed" position={position} rotation={rotation} scale={scale} colliders="hull">
      <group ref={treeRef}>
        {/* Tree trunk */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.2, 0.4, 4, 8]} />
          <meshStandardMaterial color="#8B4513" roughness={0.8} />
        </mesh>

        {/* Tree leaves */}
        <group position={[0, 4, 0]}>
          <mesh castShadow>
            <coneGeometry args={[2, 4, 8]} />
            <meshStandardMaterial color="#2d4c2a" roughness={0.7} />
          </mesh>

          <mesh position={[0, 1.5, 0]} castShadow>
            <coneGeometry args={[1.5, 3, 8]} />
            <meshStandardMaterial color="#2d4c2a" roughness={0.7} />
          </mesh>

          <mesh position={[0, 2.5, 0]} castShadow>
            <coneGeometry args={[1, 2, 8]} />
            <meshStandardMaterial color="#2d4c2a" roughness={0.7} />
          </mesh>
        </group>
      </group>
    </RigidBody>
  )
}

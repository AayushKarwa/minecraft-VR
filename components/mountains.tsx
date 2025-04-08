"use client"
import * as THREE from "three"

export function Mountains() {
  // Create mountain ranges
  const mountainRanges = [
    { position: [0, 0, -150], count: 15, maxHeight: 80, spread: 200 },
    { position: [-150, 0, -100], count: 10, maxHeight: 60, spread: 150 },
    { position: [150, 0, -100], count: 10, maxHeight: 60, spread: 150 },
  ]

  return (
    <group>
      {mountainRanges.map((range, rangeIndex) => (
        <group key={rangeIndex} position={[range.position[0], range.position[1], range.position[2]]}>
          {[...Array(range.count)].map((_, i) => {
            const angle = (i / range.count) * Math.PI - Math.PI / 2
            const distance = Math.random() * range.spread * 0.3 + range.spread * 0.7
            const x = Math.cos(angle) * distance
            const z = Math.sin(angle) * distance
            const height = Math.random() * range.maxHeight * 0.6 + range.maxHeight * 0.4
            const width = Math.random() * 30 + 20

            return <Mountain key={i} position={[x, 0, z]} height={height} width={width} />
          })}
        </group>
      ))}
    </group>
  )
}

// Component for a single mountain
function Mountain({ position, height, width }) {
  // Create mountain geometry
  const geometry = new THREE.ConeGeometry(width, height, 16)

  // Create vertex colors for snow blend
  const colors = []
  const positions = geometry.attributes.position.array

  for (let i = 0; i < positions.length; i += 3) {
    const y = positions[i + 1]
    const normalizedHeight = y / height

    // Calculate snow amount based on height and some noise
    let snowAmount = (normalizedHeight - 0.7) / 0.1
    snowAmount = Math.max(0, Math.min(1, snowAmount))

    // Add some noise to the snow line
    const noise = Math.sin(positions[i] * 0.1) * Math.cos(positions[i + 2] * 0.1) * 0.1
    snowAmount = Math.max(0, Math.min(1, snowAmount + noise))

    colors.push(snowAmount, snowAmount, snowAmount)
  }

  // Add colors to geometry
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3))

  // Create two materials for the mountain
  const rockMaterial = new THREE.MeshStandardMaterial({
    color: "#555555",
    roughness: 0.8,
    metalness: 0.1,
  })

  const snowMaterial = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    roughness: 0.5,
    metalness: 0.1,
  })

  return (
    <mesh position={position} geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        vertexColors
        color="#777777"
        roughness={0.7}
        metalness={0.1}
        onBeforeCompile={(shader) => {
          // Add custom color blending to the fragment shader
          shader.fragmentShader = shader.fragmentShader.replace(
            "#include <color_fragment>",
            `#include <color_fragment>
            // Mix between rock and snow colors based on vertex color
            vec3 rockColor = vec3(0.5, 0.5, 0.5);
            vec3 snowColor = vec3(0.95, 0.95, 0.95);
            diffuseColor.rgb = mix(rockColor, snowColor, vColor.r);`,
          )
        }}
      />
    </mesh>
  )
}

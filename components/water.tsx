"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { RigidBody } from "@react-three/rapier"
import * as THREE from "three"

export function Water() {
  // Create lake and river areas
  const waterAreas = [
    { position: [30, 0, 30], size: [20, 20], depth: 1 }, // Lake
    { position: [15, 0, 15], size: [5, 5], depth: 0.5 }, // Small pond
  ]

  return (
    <group>
      {waterAreas.map((area, i) => (
        <WaterBody
          key={i}
          position={[area.position[0], -area.depth / 2, area.position[1]]}
          size={[area.size[0], area.depth, area.size[1]]}
        />
      ))}

      {/* River */}
      <RiverPath />
    </group>
  )
}

// Component for a water body (lake or pond)
function WaterBody({ position, size }) {
  const waterRef = useRef()

  // Animate water surface
  useFrame(({ clock }) => {
    if (!waterRef.current) return

    const time = clock.getElapsedTime()
    const waterMaterial = waterRef.current.material

    waterMaterial.uniforms.time.value = time
  })

  return (
    <group position={position}>
      {/* Water surface */}
      <mesh ref={waterRef} position={[0, size[1] / 2 + 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[size[0], size[2], 32, 32]} />
        <shaderMaterial
          transparent
          side={THREE.DoubleSide}
          uniforms={{
            time: { value: 0 },
            color: { value: new THREE.Color("#4a95e8") },
            opacity: { value: 0.8 },
          }}
          vertexShader={`
            uniform float time;
            varying vec2 vUv;
            
            void main() {
              vUv = uv;
              
              // Create gentle waves
              float wave1 = sin(position.x * 0.5 + time * 0.5) * 0.1;
              float wave2 = sin(position.z * 0.3 + time * 0.3) * 0.1;
              vec3 pos = position;
              pos.y += wave1 + wave2;
              
              gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
          `}
          fragmentShader={`
            uniform vec3 color;
            uniform float opacity;
            uniform float time;
            varying vec2 vUv;
            
            void main() {
              // Add some variation to the water color
              float depth = sin(vUv.x * 10.0 + time * 0.2) * 0.05 + 
                           sin(vUv.y * 8.0 + time * 0.3) * 0.05;
              
              vec3 finalColor = color + vec3(depth, depth, depth * 2.0);
              
              // Add highlights
              float highlight = pow(sin(vUv.x * 20.0 + time) * 0.5 + 0.5, 8.0) * 
                               pow(sin(vUv.y * 20.0 + time * 1.1) * 0.5 + 0.5, 8.0);
              finalColor += vec3(highlight) * 0.3;
              
              gl_FragColor = vec4(finalColor, opacity);
            }
          `}
        />
      </mesh>

      {/* Water body */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={size} />
          <meshStandardMaterial color="#2a75c8" transparent opacity={0.7} />
        </mesh>
      </RigidBody>
    </group>
  )
}

// Component for a river path
function RiverPath() {
  const riverRef = useRef()

  // Create river path
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(30, 0, 30),
    new THREE.Vector3(25, 0, 20),
    new THREE.Vector3(20, 0, 15),
    new THREE.Vector3(15, 0, 15),
    new THREE.Vector3(10, 0, 20),
    new THREE.Vector3(5, 0, 25),
    new THREE.Vector3(0, 0, 30),
    new THREE.Vector3(-10, 0, 40),
  ])

  const riverWidth = 4
  const riverDepth = 0.8

  // Create river geometry
  const points = curve.getPoints(50)
  const riverGeometry = new THREE.BufferGeometry()
  const vertices = []
  const indices = []

  // Create vertices for river
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i]
    const next = points[i + 1]

    // Calculate direction and perpendicular
    const direction = new THREE.Vector3().subVectors(next, current).normalize()
    const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x).multiplyScalar(riverWidth / 2)

    // Create 4 vertices for this segment
    const v1 = new THREE.Vector3().addVectors(current, perpendicular)
    const v2 = new THREE.Vector3().subVectors(current, perpendicular)
    const v3 = new THREE.Vector3().addVectors(next, perpendicular)
    const v4 = new THREE.Vector3().subVectors(next, perpendicular)

    // Add vertices
    vertices.push(
      v1.x,
      v1.y - riverDepth,
      v1.z,
      v2.x,
      v2.y - riverDepth,
      v2.z,
      v3.x,
      v3.y - riverDepth,
      v3.z,
      v4.x,
      v4.y - riverDepth,
      v4.z,
    )

    // Add indices for triangles
    const offset = i * 4
    indices.push(offset, offset + 1, offset + 2, offset + 1, offset + 3, offset + 2)
  }

  riverGeometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3))
  riverGeometry.setIndex(indices)
  riverGeometry.computeVertexNormals()

  // Animate water surface
  useFrame(({ clock }) => {
    if (!riverRef.current) return

    const time = clock.getElapsedTime()
    riverRef.current.material.uniforms.time.value = time
  })

  return (
    <group>
      {/* River bed */}
      <mesh geometry={riverGeometry}>
        <meshStandardMaterial color="#3b2412" roughness={1} />
      </mesh>

      {/* River water surface */}
      <mesh ref={riverRef} position={[0, 0.05, 0]}>
        <shaderMaterial
          transparent
          side={THREE.DoubleSide}
          uniforms={{
            time: { value: 0 },
            color: { value: new THREE.Color("#4a95e8") },
            opacity: { value: 0.8 },
          }}
          vertexShader={`
            uniform float time;
            varying vec2 vUv;
            
            void main() {
              vUv = uv;
              
              // Create flowing water effect
              float wave = sin(position.x * 0.2 + position.z * 0.2 + time * 2.0) * 0.05;
              vec3 pos = position;
              pos.y += wave;
              
              gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
          `}
          fragmentShader={`
            uniform vec3 color;
            uniform float opacity;
            uniform float time;
            varying vec2 vUv;
            
            void main() {
              // Add some variation to the water color
              float depth = sin(vUv.x * 5.0 + time * 2.0) * 0.05;
              
              vec3 finalColor = color + vec3(depth, depth, depth * 2.0);
              
              // Add flowing highlights
              float highlight = pow(sin(vUv.x * 10.0 + vUv.y * 10.0 + time * 3.0) * 0.5 + 0.5, 4.0);
              finalColor += vec3(highlight) * 0.2;
              
              gl_FragColor = vec4(finalColor, opacity);
            }
          `}
        />
      </mesh>
    </group>
  )
}

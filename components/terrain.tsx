"use client"

import { useRef } from "react"
import { RigidBody } from "@react-three/rapier"
import * as THREE from "three"

export function Terrain() {
  const terrainRef = useRef<THREE.Mesh>(null)

  // Create a heightmap for the terrain
  const terrainSize = 200
  const resolution = 128
  const heightScale = 10
  const heightMap = useRef(generateHeightmap(resolution, heightScale)).current

  // Create the terrain geometry
  const geometry = new THREE.PlaneGeometry(terrainSize, terrainSize, resolution - 1, resolution - 1)

  // Apply the heightmap
  const vertices = geometry.attributes.position.array
  for (let i = 0; i < vertices.length; i += 3) {
    const x = Math.floor((i / 3) % resolution)
    const y = Math.floor(i / 3 / resolution)
    vertices[i + 2] = heightMap[y * resolution + x]
  }

  // Update normals
  geometry.computeVertexNormals()

  // Create a blend map for grass and path
  const blendTexture = createPathTexture(resolution)

  return (
    <RigidBody type="fixed" colliders="trimesh" position={[-terrainSize / 2, -5, -terrainSize / 2]}>
      <mesh ref={terrainRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow geometry={geometry}>
        <meshStandardMaterial color="#4a7349" roughness={0.8} metalness={0.1} displacementScale={0} />
      </mesh>

      {/* Create paths on the terrain */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} receiveShadow>
        <planeGeometry args={[terrainSize, terrainSize, 1, 1]} />
        <meshStandardMaterial
          color="#a88c6d"
          roughness={0.6}
          alphaMap={blendTexture}
          transparent={true}
          alphaTest={0.2}
        />
      </mesh>
    </RigidBody>
  )
}

// Generate a heightmap for the terrain
function generateHeightmap(resolution: number, amplitude: number): Float32Array {
  const size = resolution * resolution
  const data = new Float32Array(size)
  const perlin = new ImprovedNoise()
  const z = Math.random() * 100

  let quality = 1
  const octaves = 6

  for (let j = 0; j < octaves; j++) {
    for (let i = 0; i < size; i++) {
      const x = i % resolution
      const y = ~~(i / resolution)

      // Create smooth rolling hills
      const nx = x / resolution - 0.5
      const ny = y / resolution - 0.5
      const dist = Math.sqrt(nx * nx + ny * ny)

      // Add perlin noise for natural terrain
      data[i] += (perlin.noise(x / quality, y / quality, z) * amplitude) / quality

      // Make the terrain flatter in the center
      data[i] *= 1 - Math.pow(Math.min(1, dist * 2), 3) * 0.6

      // Add a slight bowl shape to create a valley
      data[i] -= Math.pow(dist * 3, 2) * amplitude * 0.1
    }

    quality *= 2
    amplitude *= 0.5
  }

  // Smooth the terrain
  return data
}

// Create a texture for the paths
function createPathTexture(resolution: number): THREE.DataTexture {
  const size = resolution
  const data = new Uint8Array(size * size * 4)

  // Create a path from center to edges
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const index = (i * size + j) * 4

      // Normalize coordinates to -1 to 1
      const x = (j / size) * 2 - 1
      const y = (i / size) * 2 - 1

      // Create paths
      const distToPath1 = Math.abs(y * 0.8)
      const distToPath2 = Math.abs(x * 0.8)
      const distToPath3 = Math.abs(y - x * 0.7)
      const distToPath4 = Math.abs(y + x * 0.7)

      // Combine paths with some noise
      const minDist = Math.min(distToPath1, distToPath2, distToPath3, distToPath4)

      // Create alpha value (0 = path, 255 = no path)
      const alpha = Math.min(255, minDist * 800)

      // Set RGBA values (we only care about alpha)
      data[index] = 255
      data[index + 1] = 255
      data[index + 2] = 255
      data[index + 3] = alpha
    }
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(1, 1)
  texture.needsUpdate = true

  return texture
}

// Perlin noise implementation for terrain generation
class ImprovedNoise {
  p: number[];

  constructor() {
    this.p = [
      151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240,
      21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88,
      237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83,
      111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216,
      80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186,
      3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58,
      17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
      129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193,
      238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157,
      184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128,
      195, 78, 66, 215, 61, 156, 180,
    ]
    for (let i = 0; i < 256; i++) {
      this.p[256 + i] = this.p[i]
    }
  }

  noise(x: number, y: number, z: number): number {
    const X = Math.floor(x) & 255
    const Y = Math.floor(y) & 255
    const Z = Math.floor(z) & 255

    x -= Math.floor(x)
    y -= Math.floor(y)
    z -= Math.floor(z)

    const u = this.fade(x)
    const v = this.fade(y)
    const w = this.fade(z)

    const A = this.p[X] + Y,
      AA = this.p[A] + Z,
      AB = this.p[A + 1] + Z
    const B = this.p[X + 1] + Y,
      BA = this.p[B] + Z,
      BB = this.p[B + 1] + Z

    return this.lerp(
      w,
      this.lerp(
        v,
        this.lerp(u, this.grad(this.p[AA], x, y, z), this.grad(this.p[BA], x - 1, y, z)),
        this.lerp(u, this.grad(this.p[AB], x, y - 1, z), this.grad(this.p[BB], x - 1, y - 1, z)),
      ),
      this.lerp(
        v,
        this.lerp(u, this.grad(this.p[AA + 1], x, y, z - 1), this.grad(this.p[BA + 1], x - 1, y, z - 1)),
        this.lerp(u, this.grad(this.p[AB + 1], x, y - 1, z - 1), this.grad(this.p[BB + 1], x - 1, y - 1, z - 1)),
      ),
    )
  }

  fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10)
  }

  lerp(t: number, a: number, b: number): number {
    return a + t * (b - a)
  }

  grad(hash: number, x: number, y: number, z: number): number {
    const h = hash & 15
    const u = h < 8 ? x : y
    const v = h < 4 ? y : h == 12 || h == 14 ? x : z
    return ((h & 1) == 0 ? u : -u) + ((h & 2) == 0 ? v : -v)
  }
}

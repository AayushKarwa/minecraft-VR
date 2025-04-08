"use client"

import { Suspense, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { Sky, Environment, PointerLockControls, Text, Cloud, Stars, KeyboardControls } from "@react-three/drei"
import { Physics, RigidBody, CuboidCollider } from "@react-three/rapier"
import { FirstPersonControls } from "./first-person-controls"
import { Terrain } from "./terrain"
import { Garden } from "./garden"
import { Mountains } from "./mountains"
import { Water } from "./water"
import { Trees } from "./trees"
import { Birds } from "./birds"
import { Instructions } from "./instructions"

export default function VirtualEnvironment() {
  const [started, setStarted] = useState(false)

  return (
    <>
      {!started ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-sky-400 to-sky-700">
          <div className="max-w-md p-8 bg-white/90 backdrop-blur-sm rounded-lg shadow-xl text-center">
            <h1 className="text-3xl font-bold mb-4 text-sky-900">Virtual Environment Explorer</h1>
            <p className="mb-6 text-gray-700">
              Walk through a beautiful landscape with gardens, mountains, and interactive elements.
            </p>
            <button
              onClick={() => setStarted(true)}
              className="px-6 py-3 bg-sky-600 text-white rounded-lg shadow-lg hover:bg-sky-700 transition-colors"
            >
              Enter Environment
            </button>
            <p className="mt-4 text-sm text-gray-600">
              Use <span className="font-bold">WASD</span> to move and <span className="font-bold">mouse</span> to look
              around
            </p>
          </div>
        </div>
      ) : (
        <>
          <Instructions />
          <KeyboardControls
            map={[
              { name: "forward", keys: ["ArrowUp", "w", "W"] },
              { name: "backward", keys: ["ArrowDown", "s", "S"] },
              { name: "left", keys: ["ArrowLeft", "a", "A"] },
              { name: "right", keys: ["ArrowRight", "d", "D"] },
              { name: "jump", keys: ["Space"] },
            ]}
          >
            <Canvas shadows camera={{ position: [0, 1.6, 10], fov: 70 }}>
              <fog attach="fog" args={["#c9d6de", 10, 500]} />
              <ambientLight intensity={0.5} />
              <directionalLight
                castShadow
                position={[50, 100, 0]}
                intensity={1}
                shadow-mapSize={[2048, 2048]}
                shadow-camera-far={500}
                shadow-camera-left={-100}
                shadow-camera-right={100}
                shadow-camera-top={100}
                shadow-camera-bottom={-100}
              />
              <Suspense fallback={null}>
                <Environment preset="sunset" />
                <Sky sunPosition={[100, 10, 100]} turbidity={0.1} rayleigh={0.5} />
                <Stars radius={100} depth={50} count={1000} factor={4} />
                <hemisphereLight intensity={0.5} groundColor="#85b2d3" />

                <Physics>
                  <FirstPersonControls />

                  {/* Main scene components */}
                  <Terrain />
                  <Mountains />
                  <Garden />
                  <Water />
                  <Trees />
                  <Birds />

                  {/* Invisible walls to contain the player */}
                  <RigidBody type="fixed" colliders={false}>
                    <CuboidCollider args={[100, 20, 1]} position={[0, 0, -100]} />
                    <CuboidCollider args={[100, 20, 1]} position={[0, 0, 100]} />
                    <CuboidCollider args={[1, 20, 100]} position={[-100, 0, 0]} />
                    <CuboidCollider args={[1, 20, 100]} position={[100, 0, 0]} />
                  </RigidBody>

                  {/* Welcome sign */}
                  <group position={[0, 2, 5]}>
                    <RigidBody type="fixed" colliders="cuboid">
                      <mesh castShadow receiveShadow position={[0, 0, 0]}>
                        <boxGeometry args={[5, 2, 0.2]} />
                        <meshStandardMaterial color="#8B4513" />
                      </mesh>
                    </RigidBody>
                    <Text
                      position={[0, 0, 0.11]}
                      fontSize={0.3}
                      color="white"
                      anchorX="center"
                      anchorY="middle"
                      maxWidth={4}
                    >
                      Welcome to the Virtual Environment
                      {"\n\n"}
                      Use WASD keys to move and mouse to look around
                      {"\n\n"}
                      Press ESC to release mouse control
                    </Text>
                  </group>

                  {/* Clouds */}
                  <Cloud position={[-20, 15, -40]} args={[3, 2]} />
                  <Cloud position={[20, 18, -60]} args={[4, 2]} />
                  <Cloud position={[-30, 12, -50]} args={[5, 2]} />
                  <Cloud position={[0, 20, -80]} args={[6, 3]} />
                </Physics>

                {/* Controls */}
                <PointerLockControls makeDefault />
              </Suspense>
            </Canvas>
          </KeyboardControls>
        </>
      )}
    </>
  )
}

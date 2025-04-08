"use client"

import { useState, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { Environment, Sky, OrbitControls } from "@react-three/drei"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import InteractiveEnvironment from "./interactive-environment"

export default function VRScene() {
  const [isVRSupported, setIsVRSupported] = useState<boolean | null>(null)

  useEffect(() => {
    // Check if WebXR is supported
    if (typeof navigator !== "undefined" && "xr" in navigator) {
      // @ts-ignore - TypeScript doesn't have proper types for the WebXR API yet
      navigator.xr
        ?.isSessionSupported("immersive-vr")
        .then((supported) => {
          setIsVRSupported(supported)
        })
        .catch(() => {
          setIsVRSupported(false)
        })
    } else {
      setIsVRSupported(false)
    }
  }, [])

  return (
    <div className="relative w-full h-full">
      {isVRSupported === false && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>VR Not Supported</AlertTitle>
            <AlertDescription>
              Your browser doesn't support WebXR or VR devices. You can still explore the environment in non-VR mode.
            </AlertDescription>
          </Alert>
        </div>
      )}

      <Canvas shadows>
        <SceneContent />
        <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
      </Canvas>
    </div>
  )
}

function SceneContent() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Environment */}
      <Sky sunPosition={[0, 1, 0]} />
      <Environment preset="sunset" />

      {/* Interactive content */}
      <InteractiveEnvironment />
    </>
  )
}

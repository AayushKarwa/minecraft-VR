"use client"

import { useRef } from "react"
import { useThree, useFrame } from "@react-three/fiber"
import { RigidBody, useRapier, type RigidBodyApi } from "@react-three/rapier"
import { Vector3 } from "three"
import { useKeyboardControls } from "@react-three/drei"

// Define controls
const MOVEMENT_SPEED = 5
const JUMP_FORCE = 5

export function FirstPersonControls() {
  const rigidBody = useRef<RigidBodyApi>(null)
  const { camera } = useThree()
  const rapier = useRapier()

  // Updated useKeyboardControls hook usage
  const forward = useKeyboardControls((state) => state.forward)
  const backward = useKeyboardControls((state) => state.backward)
  const left = useKeyboardControls((state) => state.left)
  const right = useKeyboardControls((state) => state.right)
  const jump = useKeyboardControls((state) => state.jump)

  useFrame((state) => {
    if (!rigidBody.current) return

    // Get current camera direction (ignoring y component for flat movement)
    const cameraDirection = new Vector3()
    camera.getWorldDirection(cameraDirection)
    cameraDirection.y = 0
    cameraDirection.normalize()

    // Calculate movement direction based on camera orientation
    const frontVector = new Vector3(0, 0, 0)
    const sideVector = new Vector3(0, 0, 0)

    if (forward) frontVector.add(cameraDirection)
    if (backward) frontVector.sub(cameraDirection)
    if (right) sideVector.add(cameraDirection.clone().cross(new Vector3(0, 1, 0)))
    if (left) sideVector.sub(cameraDirection.clone().cross(new Vector3(0, 1, 0)))

    // Combine movement vectors and normalize
    const moveDirection = new Vector3()
    moveDirection.add(frontVector)
    moveDirection.add(sideVector)
    moveDirection.normalize()

    // Apply movement force
    if (moveDirection.length() > 0) {
      moveDirection.multiplyScalar(MOVEMENT_SPEED)
      rigidBody.current.setLinvel(
        {
          x: moveDirection.x,
          y: rigidBody.current.linvel().y,
          z: moveDirection.z,
        },
        true,
      )
    } else {
      // Apply friction when not moving
      rigidBody.current.setLinvel(
        {
          x: 0,
          y: rigidBody.current.linvel().y,
          z: 0,
        },
        true,
      )
    }

    // Handle jumping - check if grounded first
    if (jump) {
      const origin = rigidBody.current.translation()
      origin.y -= 1.1 // Check slightly below the player

      const direction = { x: 0, y: -1, z: 0 }
      const hit = rapier.world.castRay(origin, direction, 0.2)

      if (hit && hit.toi < 0.2) {
        // If we're close to the ground
        rigidBody.current.setLinvel(
          {
            x: rigidBody.current.linvel().x,
            y: JUMP_FORCE,
            z: rigidBody.current.linvel().z,
          },
          true,
        )
      }
    }

    // Update camera position to follow the player
    const translation = rigidBody.current.translation()
    camera.position.x = translation.x
    camera.position.y = translation.y + 1.5 // Eye height
    camera.position.z = translation.z
  })

  return (
    <RigidBody
      ref={rigidBody}
      position={[0, 3, 0]}
      enabledRotations={[false, false, false]}
      linearDamping={0.5}
      type="dynamic"
      colliders="capsule"
    >
      {/* Player capsule - invisible but used for physics */}
      <mesh visible={false}>
        <capsuleGeometry args={[0.5, 1, 8, 8]} />
        <meshBasicMaterial wireframe />
      </mesh>
    </RigidBody>
  )
}

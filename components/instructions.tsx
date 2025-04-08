"use client"

import { useState, useEffect } from "react"

export function Instructions() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Hide instructions after 10 seconds
    const timer = setTimeout(() => {
      setVisible(false)
    }, 10000)

    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-black/70 text-white p-4 rounded-lg max-w-md text-center">
      <h2 className="text-xl font-bold mb-2">Controls</h2>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="text-right font-bold">W, A, S, D</div>
        <div className="text-left">Move around</div>
        <div className="text-right font-bold">Mouse</div>
        <div className="text-left">Look around</div>
        <div className="text-right font-bold">Space</div>
        <div className="text-left">Jump</div>
        <div className="text-right font-bold">ESC</div>
        <div className="text-left">Release mouse</div>
      </div>
      <div className="mt-2 text-xs text-gray-300">This message will disappear in a few seconds</div>
    </div>
  )
}

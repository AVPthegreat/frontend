"use client"

import { useEffect, useRef } from "react"

interface Vector2D {
  x: number
  y: number
}

class Particle {
  pos: Vector2D = { x: 0, y: 0 }
  vel: Vector2D = { x: 0, y: 0 }
  acc: Vector2D = { x: 0, y: 0 }
  target: Vector2D = { x: 0, y: 0 }

  closeEnoughTarget = 100
  maxSpeed = 1.0
  maxForce = 0.1
  particleSize = 10
  isKilled = false

  startColor = { r: 0, g: 0, b: 0 }
  targetColor = { r: 0, g: 0, b: 0 }
  colorWeight = 0
  colorBlendRate = 0.01


  move() {
    // Check if particle is close enough to its target to slow down
    let proximityMult = 1
    const distance = Math.sqrt(Math.pow(this.pos.x - this.target.x, 2) + Math.pow(this.pos.y - this.target.y, 2))

    if (distance < this.closeEnoughTarget) {
      proximityMult = distance / this.closeEnoughTarget
    }

    // Add force towards target
    const towardsTarget = {
      x: this.target.x - this.pos.x,
      y: this.target.y - this.pos.y,
    }

    const magnitude = Math.sqrt(towardsTarget.x * towardsTarget.x + towardsTarget.y * towardsTarget.y)
    if (magnitude > 0) {
      towardsTarget.x = (towardsTarget.x / magnitude) * this.maxSpeed * proximityMult
      towardsTarget.y = (towardsTarget.y / magnitude) * this.maxSpeed * proximityMult
    }

    const steer = {
      x: towardsTarget.x - this.vel.x,
      y: towardsTarget.y - this.vel.y,
    }

    const steerMagnitude = Math.sqrt(steer.x * steer.x + steer.y * steer.y)
    if (steerMagnitude > 0) {
      steer.x = (steer.x / steerMagnitude) * this.maxForce
      steer.y = (steer.y / steerMagnitude) * this.maxForce
    }

    this.acc.x += steer.x
    this.acc.y += steer.y

    // Move particle
    this.vel.x += this.acc.x
    this.vel.y += this.acc.y
    this.pos.x += this.vel.x
    this.pos.y += this.vel.y
    this.acc.x = 0
    this.acc.y = 0
  }

  draw(ctx: CanvasRenderingContext2D, drawAsPoints: boolean) {
    // Blend towards target color
    if (this.colorWeight < 1.0) {
      this.colorWeight = Math.min(this.colorWeight + this.colorBlendRate, 1.0)
    }

    // Calculate current color
    const currentColor = {
      r: Math.round(this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight),
      g: Math.round(this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight),
      b: Math.round(this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight),
    }

    if (drawAsPoints) {
      ctx.fillStyle = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`
      ctx.fillRect(this.pos.x, this.pos.y, 2, 2)
    } else {
      ctx.fillStyle = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`
      ctx.beginPath()
      ctx.arc(this.pos.x, this.pos.y, this.particleSize / 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  kill(width: number, height: number) {
    if (!this.isKilled) {
      // Generate random angle from 0 to 2π (full circle)
      const angle = Math.random() * Math.PI * 2
      const mag = (width + height) / 2

      // Calculate position on circle perimeter at distance 'mag' from center
      const centerX = width / 2
      const centerY = height / 2
      const exitX = centerX + Math.cos(angle) * mag
      const exitY = centerY + Math.sin(angle) * mag

      this.target.x = exitX
      this.target.y = exitY

      // Begin blending color to black
      this.startColor = {
        r: this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight,
        g: this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight,
        b: this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight,
      }
      this.targetColor = { r: 0, g: 0, b: 0 }
      this.colorWeight = 0

      this.isKilled = true
    }
  }
}

interface ParticleTextEffectProps {
  // No props needed - uses fixed custom sequence
}

const DEFAULT_WORDS = ["Conquer", "CODEBASE", "Code", "Compete"]

// Custom animation sequence configuration
const CUSTOM_SEQUENCE = {
  // First word: CODEBASE for 5 seconds
  initialWord: "CODEBASE",
  initialDuration: 5000, // 5 seconds
  
  // First cycle: Code, Compete, Conquer for 2.5 seconds each
  firstCycleWords: ["Code", "Compete", "Conquer"],
  wordDuration: 2500, // 2.5 seconds each
  
  // Second CODEBASE for 5 seconds
  secondCodebaseDuration: 5000, // 5 seconds
  
  // Second cycle: Code, Compete, Conquer for 2.5 seconds each
  secondCycleWords: ["Code", "Compete", "Conquer"],
  
  // Particle transition time (excluded from timer)
  particleTransitionTime: 2000, // 2 seconds for particles to rearrange
}



export function ParticleTextEffect({}: ParticleTextEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0, isPressed: false, isRightClick: false })
  const floatingIconsRef = useRef<Array<{
    x: number
    y: number
    vx: number
    vy: number
    size: number
    opacity: number
    icon: string
    rotation: number
    rotationSpeed: number
  }>>([])

  // Custom sequence state management
  const sequenceStateRef = useRef({
    phase: 'initial', // 'initial' | 'firstCycle' | 'secondCodebase' | 'secondCycle' | 'restart'
    currentWordIndex: 0,
    phaseStartTime: 0,
    isInitialLoad: true,
    particlesArranged: false, // Track if particles have finished rearranging
    cycleNumber: 1 // Track which cycle we're in (1 or 2)
  })

  const pixelSteps = 8  // Increased from 6 to 8 for better performance
  const drawAsPoints = true

  // Initialize floating icons
  const initializeFloatingIcons = (canvas: HTMLCanvasElement) => {
    const icons = ['💻', '⚡', '🚀', '💡', '✨', '⭐', '🎯', '🔥', '💎', '🌟']
    const floatingIcons: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      opacity: number
      icon: string
      rotation: number
      rotationSpeed: number
    }> = []

    for (let i = 0; i < 15; i++) {
      floatingIcons.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5, // Slow horizontal movement
        vy: (Math.random() - 0.5) * 0.5, // Slow vertical movement
        size: Math.random() * 20 + 15, // Size between 15-35
        opacity: Math.random() * 0.3 + 0.1, // Opacity between 0.1-0.4
        icon: icons[Math.floor(Math.random() * icons.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02
      })
    }

    floatingIconsRef.current = floatingIcons
  }

  // Update and draw floating icons
  const updateFloatingIcons = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const icons = floatingIconsRef.current

    icons.forEach(icon => {
      // Update position
      icon.x += icon.vx
      icon.y += icon.vy
      icon.rotation += icon.rotationSpeed

      // Wrap around screen edges
      if (icon.x < -icon.size) icon.x = canvas.width + icon.size
      if (icon.x > canvas.width + icon.size) icon.x = -icon.size
      if (icon.y < -icon.size) icon.y = canvas.height + icon.size
      if (icon.y > canvas.height + icon.size) icon.y = -icon.size

      // Draw icon
      ctx.save()
      ctx.globalAlpha = icon.opacity
      ctx.translate(icon.x, icon.y)
      ctx.rotate(icon.rotation)
      ctx.font = `${icon.size}px Arial`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
      ctx.fillText(icon.icon, 0, 0)
      ctx.restore()
    })
  }

  // Custom sequence management function
  const handleCustomSequence = (canvas: HTMLCanvasElement) => {
    const now = Date.now()
    const state = sequenceStateRef.current
    const elapsed = now - state.phaseStartTime

    // Phase 1: Initial CODEBASE for 5 seconds (timer starts after particles arrive)
    if (state.phase === 'initial') {
      if (state.isInitialLoad) {
        // First load: particles come towards CODEBASE (add new particles)
        nextWord(CUSTOM_SEQUENCE.initialWord, canvas, true)
        state.isInitialLoad = false
        state.phaseStartTime = now + CUSTOM_SEQUENCE.particleTransitionTime // Start timer after particles arrive
        state.particlesArranged = false
      } else if (elapsed >= CUSTOM_SEQUENCE.initialDuration) {
        // Move to first cycle
        state.phase = 'firstCycle'
        state.currentWordIndex = 0
        state.cycleNumber = 1
        state.phaseStartTime = now + CUSTOM_SEQUENCE.particleTransitionTime // Start timer after rearrangement
        state.particlesArranged = false
        // Rearrange particles to first word (Code) - no new particles
        nextWord(CUSTOM_SEQUENCE.firstCycleWords[0], canvas, false)
      }
    }
    // Phase 2: First cycle - Code, Compete, Conquer for 2.5 seconds each
    else if (state.phase === 'firstCycle') {
      if (elapsed >= CUSTOM_SEQUENCE.wordDuration) {
        state.currentWordIndex++
        if (state.currentWordIndex < CUSTOM_SEQUENCE.firstCycleWords.length) {
          // Rearrange to next word - no new particles
          nextWord(CUSTOM_SEQUENCE.firstCycleWords[state.currentWordIndex], canvas, false)
          state.phaseStartTime = now + CUSTOM_SEQUENCE.particleTransitionTime // Start timer after rearrangement
          state.particlesArranged = false
        } else {
          // Move to second CODEBASE phase
          state.phase = 'secondCodebase'
          state.phaseStartTime = now + CUSTOM_SEQUENCE.particleTransitionTime // Start timer after rearrangement
          state.particlesArranged = false
          // Rearrange particles to CODEBASE - no new particles
          nextWord(CUSTOM_SEQUENCE.initialWord, canvas, false)
        }
      }
    }
    // Phase 3: Second CODEBASE for 5 seconds
    else if (state.phase === 'secondCodebase') {
      if (elapsed >= CUSTOM_SEQUENCE.secondCodebaseDuration) {
        // Move to second cycle
        state.phase = 'secondCycle'
        state.currentWordIndex = 0
        state.cycleNumber = 2
        state.phaseStartTime = now + CUSTOM_SEQUENCE.particleTransitionTime // Start timer after rearrangement
        state.particlesArranged = false
        // Rearrange particles to first word of second cycle (Code) - no new particles
        nextWord(CUSTOM_SEQUENCE.secondCycleWords[0], canvas, false)
      }
    }
    // Phase 4: Second cycle - Code, Compete, Conquer for 2.5 seconds each
    else if (state.phase === 'secondCycle') {
      if (elapsed >= CUSTOM_SEQUENCE.wordDuration) {
        state.currentWordIndex++
        if (state.currentWordIndex < CUSTOM_SEQUENCE.secondCycleWords.length) {
          // Rearrange to next word - no new particles
          nextWord(CUSTOM_SEQUENCE.secondCycleWords[state.currentWordIndex], canvas, false)
          state.phaseStartTime = now + CUSTOM_SEQUENCE.particleTransitionTime // Start timer after rearrangement
          state.particlesArranged = false
        } else {
          // Restart the entire sequence
          state.phase = 'restart'
          state.phaseStartTime = now + CUSTOM_SEQUENCE.particleTransitionTime
          state.particlesArranged = false
        }
      }
    }
    // Phase 5: Restart sequence
    else if (state.phase === 'restart') {
      if (elapsed >= 1000) { // Brief pause before restart
        // Restart the entire sequence
        state.phase = 'initial'
        state.isInitialLoad = true
        state.cycleNumber = 1
        state.currentWordIndex = 0
        state.phaseStartTime = now + CUSTOM_SEQUENCE.particleTransitionTime
        state.particlesArranged = false
        // Start with CODEBASE again (add new particles)
        nextWord(CUSTOM_SEQUENCE.initialWord, canvas, true)
      }
    }
  }

  const generateRandomPos = (
    x: number,
    y: number,
    mag: number,
    canvasWidth: number,
    canvasHeight: number,
  ): Vector2D => {
    // Generate random angle from 0 to 2π (full circle)
    const angle = Math.random() * Math.PI * 2

    // Calculate position on circle perimeter at distance 'mag' from center
    const startX = x + Math.cos(angle) * mag
    const startY = y + Math.sin(angle) * mag

    return {
      x: startX,
      y: startY,
    }
  }


  const nextWord = (word: string, canvas: HTMLCanvasElement, shouldAddNewParticles: boolean = true) => {
    // Create off-screen canvas for text rendering
    const offscreenCanvas = document.createElement("canvas")
    offscreenCanvas.width = canvas.width
    offscreenCanvas.height = canvas.height
    const offscreenCtx = offscreenCanvas.getContext("2d")!

    // Draw text
    offscreenCtx.fillStyle = "white"
    offscreenCtx.font = "bold 100px Arial"
    offscreenCtx.textAlign = "center"
    offscreenCtx.textBaseline = "middle"
    offscreenCtx.fillText(word, canvas.width / 2, canvas.height / 3)

    const imageData = offscreenCtx.getImageData(0, 0, canvas.width, canvas.height)
    const pixels = imageData.data

    // Generate new color
    const newColor = {
      r: 255, // White particles
      g: 255,
      b: 255,
    }

    const particles = particlesRef.current
    let particleIndex = 0

    // Collect coordinates
    const coordsIndexes: number[] = []
    for (let i = 0; i < pixels.length; i += pixelSteps * 4) {
      coordsIndexes.push(i)
    }

    // Shuffle coordinates for fluid motion
    for (let i = coordsIndexes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[coordsIndexes[i], coordsIndexes[j]] = [coordsIndexes[j], coordsIndexes[i]]
    }


    for (let i = 0; i < coordsIndexes.length; i++) {
      const coordIndex = coordsIndexes[i]
      const pixelIndex = coordIndex
      const alpha = pixels[pixelIndex + 3]

      if (alpha > 0) {
        const x = (pixelIndex / 4) % canvas.width
        const y = Math.floor(pixelIndex / 4 / canvas.width)

        let particle: Particle

        if (particleIndex < particles.length) {
          // Reuse existing particle for rearrangement
          particle = particles[particleIndex]
          particle.isKilled = false
          particleIndex++
        } else if (shouldAddNewParticles) {
          // Only add new particles for CODEBASE
          particle = new Particle()

          const randomPos = generateRandomPos(
            canvas.width / 2,
            canvas.height / 2,
            (canvas.width + canvas.height) / 2,
            canvas.width,
            canvas.height,
          )
          particle.pos.x = randomPos.x
          particle.pos.y = randomPos.y

          particle.maxSpeed = Math.random() * 6 + 4
          particle.maxForce = particle.maxSpeed * 0.05
          particle.particleSize = Math.random() * 6 + 6
          particle.colorBlendRate = Math.random() * 0.0275 + 0.0025

          particles.push(particle)
        } else {
          // Skip this pixel if we're not adding new particles and don't have enough existing ones
          continue
        }


        // Set color transition
        particle.startColor = {
          r: particle.startColor.r + (particle.targetColor.r - particle.startColor.r) * particle.colorWeight,
          g: particle.startColor.g + (particle.targetColor.g - particle.startColor.g) * particle.colorWeight,
          b: particle.startColor.b + (particle.targetColor.b - particle.startColor.b) * particle.colorWeight,
        }
        particle.targetColor = newColor
        particle.colorWeight = 0

        // Set target position
        particle.target.x = x
        particle.target.y = y
      }
    }

    // Kill remaining particles
    for (let i = particleIndex; i < particles.length; i++) {
      particles[i].kill(canvas.width, canvas.height)
    }
  }

  const animate = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")!
    const particles = particlesRef.current

    // Background with motion blur (optimized)
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)"  // Increased opacity for better performance
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw floating icons in background
    updateFloatingIcons(ctx, canvas)

    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i]
      
      
      particle.move()
      particle.draw(ctx, drawAsPoints)

      // Remove dead particles that are out of bounds
      if (particle.isKilled) {
        if (
          particle.pos.x < 0 ||
          particle.pos.x > canvas.width ||
          particle.pos.y < 0 ||
          particle.pos.y > canvas.height
        ) {
          particles.splice(i, 1)
        }
      }
    }

    // Handle mouse interaction
    if (mouseRef.current.isPressed && mouseRef.current.isRightClick) {
      particles.forEach((particle) => {
        const distance = Math.sqrt(
          Math.pow(particle.pos.x - mouseRef.current.x, 2) + Math.pow(particle.pos.y - mouseRef.current.y, 2),
        )
        if (distance < 50) {
          particle.kill(canvas.width, canvas.height)
        }
      })
    }

    // Handle custom sequence
    handleCustomSequence(canvas)

    animationRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (container) {
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
      }
    }

    // Initial resize
    resizeCanvas()

    // Initialize floating icons
    initializeFloatingIcons(canvas)

    // Initialize custom sequence with CODEBASE
    sequenceStateRef.current.phase = 'initial'
    sequenceStateRef.current.isInitialLoad = true
    sequenceStateRef.current.cycleNumber = 1
    sequenceStateRef.current.currentWordIndex = 0
    sequenceStateRef.current.particlesArranged = false
    sequenceStateRef.current.phaseStartTime = Date.now() + CUSTOM_SEQUENCE.particleTransitionTime
    nextWord(CUSTOM_SEQUENCE.initialWord, canvas, true)

    // Start animation
    animate()

    // Mouse event handlers
    const handleMouseDown = (e: MouseEvent) => {
      mouseRef.current.isPressed = true
      mouseRef.current.isRightClick = e.button === 2
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.x = e.clientX - rect.left
      mouseRef.current.y = e.clientY - rect.top
    }

    const handleMouseUp = () => {
      mouseRef.current.isPressed = false
      mouseRef.current.isRightClick = false
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.x = e.clientX - rect.left
      mouseRef.current.y = e.clientY - rect.top
    }

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    const handleResize = () => {
      resizeCanvas()
      // Reinitialize particles with new dimensions
      nextWord(CUSTOM_SEQUENCE.initialWord, canvas, true)
    }

    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("mouseup", handleMouseUp)
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("contextmenu", handleContextMenu)
    window.addEventListener("resize", handleResize)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      canvas.removeEventListener("mousedown", handleMouseDown)
      canvas.removeEventListener("mouseup", handleMouseUp)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("contextmenu", handleContextMenu)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <div className="w-full h-full absolute inset-0">
      <canvas ref={canvasRef} className="w-full h-full" style={{ background: "black", zIndex: 10 }} />
    </div>
  )
}

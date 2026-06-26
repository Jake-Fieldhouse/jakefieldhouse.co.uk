import './styles.css'

type Point = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
}

const canvas = document.querySelector<HTMLCanvasElement>('#signal-canvas')
const context = canvas?.getContext('2d', { alpha: true })

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const points: Point[] = []
let width = 0
let height = 0
let animationFrame = 0
let targetX = 50
let targetY = 47
let currentX = 50
let currentY = 47

function resizeCanvas() {
  if (!canvas || !context) return

  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
  width = window.innerWidth
  height = window.innerHeight
  canvas.width = Math.floor(width * pixelRatio)
  canvas.height = Math.floor(height * pixelRatio)
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
  seedPoints()
}

function seedPoints() {
  points.length = 0
  const count = Math.max(42, Math.floor((width * height) / 26000))

  for (let index = 0; index < count; index += 1) {
    points.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      size: Math.random() * 1.8 + 0.6
    })
  }
}

function draw() {
  if (!context) return

  currentX += (targetX - currentX) * 0.16
  currentY += (targetY - currentY) * 0.16
  document.documentElement.style.setProperty('--x', `${currentX}%`)
  document.documentElement.style.setProperty('--y', `${currentY}%`)

  context.clearRect(0, 0, width, height)
  context.fillStyle = 'rgba(5, 6, 8, 0.22)'
  context.fillRect(0, 0, width, height)

  for (const point of points) {
    if (!prefersReducedMotion) {
      point.x += point.vx
      point.y += point.vy
    }

    if (point.x < -20) point.x = width + 20
    if (point.x > width + 20) point.x = -20
    if (point.y < -20) point.y = height + 20
    if (point.y > height + 20) point.y = -20

    context.beginPath()
    context.fillStyle = 'rgba(115, 255, 216, 0.72)'
    context.arc(point.x, point.y, point.size, 0, Math.PI * 2)
    context.fill()
  }

  for (let a = 0; a < points.length; a += 1) {
    for (let b = a + 1; b < points.length; b += 1) {
      const first = points[a]
      const second = points[b]
      const dx = first.x - second.x
      const dy = first.y - second.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 145) {
        const alpha = (1 - distance / 145) * 0.18
        context.strokeStyle = `rgba(115, 255, 216, ${alpha})`
        context.lineWidth = 1
        context.beginPath()
        context.moveTo(first.x, first.y)
        context.lineTo(second.x, second.y)
        context.stroke()
      }
    }
  }

  animationFrame = window.requestAnimationFrame(draw)
}

function boot() {
  if (!canvas || !context) return

  resizeCanvas()
  draw()
  window.addEventListener('resize', resizeCanvas)
  window.addEventListener('pointermove', (event) => {
    targetX = (event.clientX / window.innerWidth) * 100
    targetY = (event.clientY / window.innerHeight) * 100
  }, { passive: true })
}

boot()

window.addEventListener('beforeunload', () => {
  window.cancelAnimationFrame(animationFrame)
})

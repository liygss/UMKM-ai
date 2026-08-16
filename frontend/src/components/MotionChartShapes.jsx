import { motion, useReducedMotion } from 'motion/react'

const BAR_STAGGER = 0.05
const BAR_GROW_SPRING = { type: 'spring', stiffness: 320, damping: 28, mass: 0.8 }

export function MotionBarShape(props) {
  const { x, y, width, height, fill, radius, index = 0 } = props
  const reduceMotion = useReducedMotion()
  const rx = Array.isArray(radius) ? radius[0] : radius ?? 4
  const ry = Array.isArray(radius) ? radius[0] : radius ?? 4

  if (reduceMotion || !isFinite(height) || height <= 0) {
    return (
      <g>
        <rect x={x} y={y} width={width} height={Math.max(height, 0)} rx={rx} ry={ry} fill={fill} />
      </g>
    )
  }

  return (
    <motion.g
      style={{ originY: 1 }}
      initial={{ scaleY: 0, opacity: 0.5 }}
      animate={{ scaleY: 1, opacity: 1 }}
      transition={{ ...BAR_GROW_SPRING, delay: index * BAR_STAGGER }}
    >
      <rect x={x} y={y} width={width} height={height} rx={rx} ry={ry} fill={fill} />
    </motion.g>
  )
}

export function MotionActiveBar(props) {
  const { x, y, width, height, fill, radius } = props
  const rx = Array.isArray(radius) ? radius[0] : radius ?? 4
  const ry = Array.isArray(radius) ? radius[0] : radius ?? 4

  return (
    <motion.g
      style={{ originY: 1 }}
      initial={{ scaleX: 1, opacity: 1 }}
      animate={{ scaleX: 1.05, opacity: 1 }}
      transition={BAR_GROW_SPRING}
    >
      <rect
        x={x}
        y={y - 3}
        width={width}
        height={height + 3}
        rx={rx}
        ry={ry}
        fill={fill}
        opacity={0.9}
        filter="drop-shadow(0 6px 16px rgba(0,0,0,0.35))"
      />
    </motion.g>
  )
}

export function MotionTooltip({ children }) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      initial={reduceMotion ? undefined : { opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 30, mass: 0.9 }}
    >
      {children}
    </motion.div>
  )
}

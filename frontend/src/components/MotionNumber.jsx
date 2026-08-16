import { useEffect, useRef } from 'react'
import { motion, animate, useInView, useMotionValue, useTransform } from 'motion/react'

export default function MotionNumber({ value, duration = 1.1, format }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const motionValue = useMotionValue(0)
  const formatted = useTransform(motionValue, (v) => format ? format(v) : Math.round(v).toString())

  useEffect(() => {
    if (!inView) return
    const controls = animate(motionValue, Number(value) || 0, {
      duration,
      ease: [0.22, 1, 0.36, 1],
    })
    return controls.stop
  }, [inView, value, duration, motionValue])

  return (
    <motion.span ref={ref} className="tabular-nums">
      {formatted}
    </motion.span>
  )
}

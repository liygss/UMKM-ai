export const EASE_SPRING = { type: 'spring', stiffness: 260, damping: 30, mass: 0.9 }
export const EASE_GENTLE = { type: 'spring', stiffness: 180, damping: 28, mass: 1 }

export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: EASE_SPRING },
}

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: EASE_SPRING },
}

export const slideInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: EASE_SPRING },
}

export const popIn = {
  hidden: { opacity: 0, scale: 0.6, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: EASE_GENTLE },
}

export const staggerContainer = (stagger = 0.08, delayChildren = 0.05) => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren } },
})

export const itemStagger = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: EASE_SPRING },
}

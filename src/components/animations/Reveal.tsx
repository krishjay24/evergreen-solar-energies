import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react'
import { fadeUp } from '@/lib/motion'


interface RevealProps extends HTMLMotionProps<'div'> {
  delay?: number
  once?: boolean
}

export function Reveal({ delay = 0, once = true, variants = fadeUp, transition, children, ...props }: RevealProps) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) return <motion.div {...props}>{children}</motion.div>

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.2 }}
      variants={variants}
      transition={{ delay, ...transition }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

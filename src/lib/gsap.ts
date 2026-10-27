import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(useGSAP, ScrollTrigger, MotionPathPlugin)

gsap.defaults({ ease: 'power3.out', duration: 0.8 })

export { REDUCED_MOTION_QUERY } from './motion'
export { gsap, ScrollTrigger, useGSAP }

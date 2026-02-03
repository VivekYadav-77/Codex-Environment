import { motion } from 'framer-motion'

export function Glass({ children, className = '', hover = true, ...props }) {
    return (
        <motion.div
            className={`glass-card ${className}`}
            whileHover={hover ? { scale: 1.01 } : {}}
            transition={{ type: 'spring', stiffness: 300 }}
            {...props}
        >
            {children}
        </motion.div>
    )
}

export function GlassPanel({ children, className = '', ...props }) {
    return (
        <div
            className={`glass p-6 ${className}`}
            {...props}
        >
            {children}
        </div>
    )
}

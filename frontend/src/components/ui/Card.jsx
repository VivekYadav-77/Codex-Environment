import { motion } from 'framer-motion'

export function Card({
    children,
    className = '',
    title,
    subtitle,
    icon: Icon,
    accent = 'blue', // blue, green, red, yellow
    onClick,
    ...props
}) {
    const accents = {
        blue: 'from-google-blue/20 to-transparent border-google-blue/30',
        green: 'from-google-green/20 to-transparent border-google-green/30',
        red: 'from-google-red/20 to-transparent border-google-red/30',
        yellow: 'from-google-yellow/20 to-transparent border-google-yellow/30',
    }

    return (
        <motion.div
            className={`
        glass-card p-6
        bg-gradient-to-br ${accents[accent]}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
            whileHover={onClick ? { scale: 1.02, y: -4 } : {}}
            whileTap={onClick ? { scale: 0.98 } : {}}
            onClick={onClick}
            {...props}
        >
            {(Icon || title) && (
                <div className="flex items-start gap-4 mb-4">
                    {Icon && (
                        <div className={`p-3 rounded-xl bg-google-${accent}/20`}>
                            <Icon size={24} className={`text-google-${accent}`} />
                        </div>
                    )}
                    <div>
                        {title && <h3 className="text-xl font-semibold text-white">{title}</h3>}
                        {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
                    </div>
                </div>
            )}
            {children}
        </motion.div>
    )
}

export function StatCard({
    label,
    value,
    change,
    accent = 'blue',
    icon: Icon,
}) {
    const isPositive = change > 0

    return (
        <Card accent={accent} className="text-center">
            {Icon && (
                <div className="flex justify-center mb-3">
                    <div className={`p-3 rounded-xl bg-google-${accent}/20`}>
                        <Icon size={24} className={`text-google-${accent}`} />
                    </div>
                </div>
            )}
            <p className="text-3xl font-bold text-white mb-1">{value}</p>
            <p className="text-sm text-gray-400">{label}</p>
            {change !== undefined && (
                <p className={`text-sm mt-2 ${isPositive ? 'text-google-green' : 'text-google-red'}`}>
                    {isPositive ? '+' : ''}{change}%
                </p>
            )}
        </Card>
    )
}

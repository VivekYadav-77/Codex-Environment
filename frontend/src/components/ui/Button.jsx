import { motion } from 'framer-motion'

const variants = {
    blue: 'btn-blue',
    green: 'btn-green',
    red: 'btn-red',
    glass: 'glass-button',
}

const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
}

export function Button({
    children,
    variant = 'blue',
    size = 'md',
    className = '',
    disabled = false,
    loading = false,
    icon: Icon,
    iconPosition = 'left',
    onClick,
    ...props
}) {
    return (
        <motion.button
            className={`
        ${variants[variant]} 
        ${sizes[size]} 
        inline-flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
            whileHover={!disabled ? { scale: 1.02 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            disabled={disabled || loading}
            onClick={onClick}
            {...props}
        >
            {loading ? (
                <motion.div
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
            ) : (
                <>
                    {Icon && iconPosition === 'left' && <Icon size={20} />}
                    {children}
                    {Icon && iconPosition === 'right' && <Icon size={20} />}
                </>
            )}
        </motion.button>
    )
}

export function IconButton({
    icon: Icon,
    variant = 'glass',
    size = 'md',
    className = '',
    ...props
}) {
    const iconSizes = { sm: 16, md: 20, lg: 24 }
    const paddings = { sm: 'p-2', md: 'p-3', lg: 'p-4' }

    return (
        <motion.button
            className={`
        ${variants[variant]}
        ${paddings[size]}
        rounded-full
        ${className}
      `}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            {...props}
        >
            <Icon size={iconSizes[size]} />
        </motion.button>
    )
}

import { motion } from 'framer-motion';

export default function PrimaryButton({
    className = '',
    disabled = false,
    children,
    ...props
}) {
    return (
        <motion.button
            {...props}
            whileHover={disabled ? undefined : { scale: 1.015 }}
            whileTap={disabled ? undefined : { scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            className={
                `inline-flex items-center justify-center rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-brand-primary-hover active:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 dark:focus:ring-offset-[#161b24] ${
                    disabled ? 'opacity-60 cursor-not-allowed select-none' : ''
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </motion.button>
    );
}

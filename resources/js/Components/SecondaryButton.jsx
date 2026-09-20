export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            type={type}
            className={
                `inline-flex items-center justify-center rounded-xl bg-[#ebf1f7] px-4 py-2.5 text-sm font-semibold text-[#293951] transition hover:bg-[#dfe7ef] focus:outline-none focus:ring-2 focus:ring-brand-primary dark:bg-[#16191c] dark:text-[#ffffff] dark:hover:bg-[#20252b] ${
                    disabled ? 'opacity-50 cursor-not-allowed' : ''
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}

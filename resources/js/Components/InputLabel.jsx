export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                `block text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}

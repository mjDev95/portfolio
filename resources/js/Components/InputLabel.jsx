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
                `block text-sm font-semibold uppercase tracking-wider text-[#293951] dark:text-[#ffffff] ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}

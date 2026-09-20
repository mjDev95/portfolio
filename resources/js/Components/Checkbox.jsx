export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-gray-300 text-brand-primary shadow-sm focus:ring-brand-primary dark:border-gray-700 dark:bg-[#16191c] ' +
                className
            }
        />
    );
}

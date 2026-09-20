export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded-lg border-slate-300 text-brand-primary shadow-xs focus:ring-brand-primary/20 dark:border-slate-700 dark:bg-[#12161f] ' +
                className
            }
        />
    );
}

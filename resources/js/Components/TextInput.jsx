import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                'rounded-xl border-0 bg-[#ebf1f7] text-sm text-[#293951] transition placeholder:text-[#95aac9] focus:border-0 focus:bg-white focus:ring-2 focus:ring-brand-primary dark:border-0 dark:bg-[#16191c] dark:text-white dark:placeholder:text-[#a7a6a8] dark:focus:bg-[#16191c] dark:focus:ring-brand-primary ' +
                className
            }
            ref={localRef}
        />
    );
});

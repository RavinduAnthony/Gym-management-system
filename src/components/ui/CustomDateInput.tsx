import { useRef, useCallback, forwardRef } from 'react';
import { CalendarDays } from 'lucide-react';

export interface CustomDateInputProps {
    value?: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
    name?: string;
    readOnly?: boolean;
    disabled?: boolean;
    placeholder?: string;
    min?: string | number;
    max?: string | number;
    className?: string;
}

const formatDisplay = (value?: string) => {
    if (!value) return null;
    const d = new Date(value + 'T00:00:00');
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const CustomDateInput = forwardRef<HTMLInputElement, CustomDateInputProps>(
    function CustomDateInput(
        { value, onChange, onBlur, name, readOnly, disabled, placeholder = 'Pick a date', min, max, className },
        ref
    ) {
        const nativeRef = useRef<HTMLInputElement>(null);

        const mergedRef = useCallback(
            (node: HTMLInputElement | null) => {
                (nativeRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
                if (typeof ref === 'function') ref(node);
                else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
            },
            [ref]
        );

        const handleTriggerClick = () => {
            if (disabled || readOnly) return;
            const input = nativeRef.current;
            if (!input) return;
            try {
                (input as any).showPicker();
            } catch {
                input.click();
            }
        };

        const formatted = formatDisplay(value);

        return (
            <div className={`relative${className ? ` ${className}` : ''}`}>
                <button
                    type="button"
                    onClick={handleTriggerClick}
                    disabled={disabled}
                    className={[
                        'w-full flex items-center justify-between',
                        'px-3 py-2.5',
                        'bg-muted border border-input rounded-xl',
                        'text-sm font-medium transition-colors text-left',
                        'hover:border-ring/40 focus:outline-none focus:border-ring',
                        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                        readOnly ? 'bg-muted/40 cursor-not-allowed text-muted-foreground' : '',
                    ].filter(Boolean).join(' ')}
                >
                    <span className={formatted ? 'text-foreground' : 'text-muted-foreground'}>
                        {formatted ?? placeholder}
                    </span>
                    <CalendarDays className="w-4 h-4 flex-shrink-0 ml-2 text-muted-foreground" />
                </button>

                {/* Hidden native input — handles browser date picker & RHF registration */}
                <input
                    ref={mergedRef}
                    type="date"
                    name={name}
                    value={value ?? ''}
                    onChange={onChange}
                    onBlur={onBlur}
                    readOnly={readOnly}
                    disabled={disabled}
                    min={min}
                    max={max}
                    tabIndex={-1}
                    className="absolute inset-0 opacity-0 pointer-events-none w-full h-full"
                    aria-hidden="true"
                />
            </div>
        );
    }
);

CustomDateInput.displayName = 'CustomDateInput';

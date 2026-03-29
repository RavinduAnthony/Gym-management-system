import { useRef, useCallback, forwardRef } from 'react';
import { Clock } from 'lucide-react';

export interface CustomTimeInputProps {
    value?: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
    name?: string;
    disabled?: boolean;
    placeholder?: string;
    min?: string | number;
    max?: string | number;
    className?: string;
}

const formatDisplay = (value?: string) => {
    if (!value) return null;
    const [h, m] = value.split(':');
    const hours = parseInt(h, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const display = hours % 12 || 12;
    return `${display}:${m} ${ampm}`;
};

export const CustomTimeInput = forwardRef<HTMLInputElement, CustomTimeInputProps>(
    function CustomTimeInput(
        { value, onChange, onBlur, name, disabled, placeholder = 'Pick a time', min, max, className },
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
            if (disabled) return;
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
                    ].filter(Boolean).join(' ')}
                >
                    <span className={formatted ? 'text-foreground' : 'text-muted-foreground'}>
                        {formatted ?? placeholder}
                    </span>
                    <Clock className="w-4 h-4 flex-shrink-0 ml-2 text-muted-foreground" />
                </button>

                {/* Hidden native input — handles browser time picker & RHF registration */}
                <input
                    ref={mergedRef}
                    type="time"
                    name={name}
                    value={value ?? ''}
                    onChange={onChange}
                    onBlur={onBlur}
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

CustomTimeInput.displayName = 'CustomTimeInput';

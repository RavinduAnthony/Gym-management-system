import { useState, useRef, useEffect, useId, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface CustomSelectProps {
    value?: string;
    options: SelectOption[];
    onChange?: React.ChangeEventHandler<HTMLSelectElement>;
    name?: string;
    onBlur?: React.FocusEventHandler<HTMLSelectElement>;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

type DropdownPos = { top: number; left: number; width: number };

export const CustomSelect = forwardRef<HTMLButtonElement, CustomSelectProps>(
    function CustomSelect(
        {
            value,
            options,
            onChange,
            name,
            onBlur,
            placeholder = 'Select...',
            disabled = false,
            className,
        },
        _ref // accepted for RHF spread compat, positioning uses internal ref
    ) {
        const uid = useId();
        const [open, setOpen] = useState(false);
        const [pos, setPos] = useState<DropdownPos>({ top: 0, left: 0, width: 0 });
        const triggerRef = useRef<HTMLButtonElement>(null);

        const calcPos = () => {
            if (triggerRef.current) {
                const rect = triggerRef.current.getBoundingClientRect();
                setPos({ top: rect.bottom + 6, left: rect.left, width: rect.width });
            }
        };

        const handleToggle = () => {
            if (disabled) return;
            if (!open) calcPos();
            setOpen(o => !o);
        };

        // Close on outside click
        useEffect(() => {
            if (!open) return;
            const handle = (e: MouseEvent) => {
                const dropdown = document.getElementById(`csd-${uid}`);
                if (
                    triggerRef.current?.contains(e.target as Node) ||
                    dropdown?.contains(e.target as Node)
                ) return;
                setOpen(false);
            };
            document.addEventListener('mousedown', handle);
            return () => document.removeEventListener('mousedown', handle);
        }, [open, uid]);

        // Close on any scroll so the fixed panel doesn't drift
        useEffect(() => {
            if (!open) return;
            const handle = () => setOpen(false);
            window.addEventListener('scroll', handle, true);
            return () => window.removeEventListener('scroll', handle, true);
        }, [open]);

        // Update position on resize
        useEffect(() => {
            if (!open) return;
            window.addEventListener('resize', calcPos);
            return () => window.removeEventListener('resize', calcPos);
        }, [open]);

        const selected = options.find(o => o.value === value);

        const handleSelect = (optValue: string) => {
            onChange?.({ target: { value: optValue, name: name ?? '' } } as React.ChangeEvent<HTMLSelectElement>);
            onBlur?.({} as React.FocusEvent<HTMLSelectElement>);
            setOpen(false);
        };

        return (
            <div className={`relative${className ? ` ${className}` : ''}`}>
                <button
                    ref={triggerRef}
                    type="button"
                    disabled={disabled}
                    onClick={handleToggle}
                    className={[
                        'w-full flex items-center justify-between',
                        'pl-3 pr-3 py-2.5',
                        'bg-muted border border-input rounded-xl',
                        'text-sm font-medium transition-colors text-left',
                        'hover:border-ring/40 focus:outline-none focus:border-ring',
                        open ? 'border-ring' : '',
                        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                    ].filter(Boolean).join(' ')}
                >
                    <span className={selected && selected.value !== '' ? 'text-foreground' : 'text-muted-foreground'}>
                        {selected && selected.value !== '' ? selected.label : placeholder}
                    </span>
                    <motion.div
                        animate={{ rotate: open ? 180 : 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="flex-shrink-0 ml-2"
                    >
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </motion.div>
                </button>

                {createPortal(
                    <AnimatePresence>
                        {open && (
                            <motion.div
                                id={`csd-${uid}`}
                                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                                transition={{ duration: 0.15, ease: 'easeOut' }}
                                style={{
                                    position: 'fixed',
                                    top: pos.top,
                                    left: pos.left,
                                    width: pos.width,
                                    zIndex: 9999,
                                }}
                                className="bg-card border border-border rounded-2xl shadow-2xl shadow-black/20"
                            >
                                <div className="p-1.5 max-h-56 overflow-y-auto space-y-0.5">
                                    {options.length === 0 ? (
                                        <p className="px-3 py-2 text-sm text-muted-foreground text-center">No options available</p>
                                    ) : (
                                        options.map(option => {
                                            const isSelected = option.value === value;
                                            return (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    disabled={option.disabled}
                                                    onMouseDown={e => {
                                                        e.preventDefault();
                                                        if (!option.disabled) handleSelect(option.value);
                                                    }}
                                                    className={[
                                                        'w-full flex items-center justify-between',
                                                        'px-3 py-2 rounded-xl text-sm text-left transition-colors',
                                                        isSelected
                                                            ? 'bg-primary/10 text-primary font-semibold'
                                                            : 'text-foreground hover:bg-accent hover:text-accent-foreground',
                                                        option.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
                                                    ].filter(Boolean).join(' ')}
                                                >
                                                    <span className="truncate">{option.label}</span>
                                                    {isSelected && (
                                                        <Check className="w-3.5 h-3.5 flex-shrink-0 ml-2 text-primary" />
                                                    )}
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body
                )}
            </div>
        );
    }
);

CustomSelect.displayName = 'CustomSelect';

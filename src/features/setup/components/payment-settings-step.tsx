import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Coins, Percent, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { paymentSettingsSchema, type PaymentSettingsFormData } from '../schemas/setup-schema';

interface Props {
    onNext: (data: PaymentSettingsFormData) => void;
    onBack: () => void;
    isSubmitting?: boolean;
    defaultValues?: Partial<PaymentSettingsFormData>;
}

export function PaymentSettingsStep({ onNext, onBack, isSubmitting, defaultValues }: Props) {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isValid },
    } = useForm<PaymentSettingsFormData>({
        resolver: zodResolver(paymentSettingsSchema),
        defaultValues: {
            currency: 'LKR',
            taxRate: 0,
            paymentMethods: ['Cash'], // Default to cash
            ...defaultValues,
        },
        mode: 'onChange',
    });

    const selectedMethods = watch('paymentMethods') || [];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground">Payment Settings</h2>
                <p className="text-muted-foreground mt-1">Configure how your gym collects memberships.</p>
            </div>

            <form id="step-4-form" onSubmit={handleSubmit(onNext)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Currency */}
                    <div>
                        <label htmlFor="currency" className="block text-sm font-medium text-foreground mb-1.5">
                            Currency
                        </label>
                        <div className="relative">
                            <Coins className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            <select
                                id="currency"
                                {...register('currency')}
                                className={`w-full pl-10 pr-4 py-2.5 bg-background border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:border-transparent transition-shadow text-sm appearance-none cursor-pointer ${errors.currency ? 'border-destructive focus:ring-destructive/30' : 'border-input focus:ring-ring'
                                    }`}
                            >
                                <option value="LKR">LKR - Sri Lankan Rupee</option>
                                <option value="USD">USD - US Dollar</option>
                                <option value="EUR">EUR - Euro</option>
                                <option value="GBP">GBP - British Pound</option>
                            </select>
                        </div>
                        {errors.currency && <p className="mt-1.5 text-xs text-destructive">{errors.currency.message}</p>}
                    </div>

                    {/* Tax Rate */}
                    <div>
                        <label htmlFor="taxRate" className="block text-sm font-medium text-foreground mb-1.5">
                            Tax Rate (%)
                        </label>
                        <div className="relative">
                            <Percent className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                id="taxRate"
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                placeholder="0"
                                {...register('taxRate', { valueAsNumber: true })}
                                className={`w-full pl-10 pr-4 py-2.5 bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-transparent transition-shadow text-sm ${errors.taxRate ? 'border-destructive focus:ring-destructive/30' : 'border-input focus:ring-ring'
                                    }`}
                            />
                        </div>
                        {errors.taxRate && <p className="mt-1.5 text-xs text-destructive">{errors.taxRate.message}</p>}
                        <p className="mt-1.5 text-xs text-muted-foreground">Default tax applied to invoices.</p>
                    </div>
                </div>

                {/* Payment Methods */}
                <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                        Accepted Payment Methods <span className="text-destructive">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Cash Option */}
                        <label
                            className={`relative flex items-center p-4 cursor-pointer rounded-xl border-2 transition-all duration-200 ${selectedMethods.includes('Cash')
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-border bg-card text-foreground hover:border-primary/50'
                                }`}
                        >
                            <input type="checkbox" value="Cash" {...register('paymentMethods')} className="sr-only" />
                            <div className="flex flex-col items-center gap-2 w-full">
                                <Banknote className="w-6 h-6" />
                                <span className="text-sm font-medium">Cash</span>
                            </div>
                        </label>

                        {/* Credit Card Option */}
                        <label
                            className={`relative flex items-center p-4 cursor-pointer rounded-xl border-2 transition-all duration-200 ${selectedMethods.includes('Credit Card')
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-border bg-card text-foreground hover:border-primary/50'
                                }`}
                        >
                            <input type="checkbox" value="Credit Card" {...register('paymentMethods')} className="sr-only" />
                            <div className="flex flex-col items-center gap-2 w-full">
                                <CreditCard className="w-6 h-6" />
                                <span className="text-sm font-medium">Credit Card</span>
                            </div>
                        </label>

                        {/* Bank Transfer Option */}
                        <label
                            className={`relative flex items-center p-4 cursor-pointer rounded-xl border-2 transition-all duration-200 ${selectedMethods.includes('Bank Transfer')
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-border bg-card text-foreground hover:border-primary/50'
                                }`}
                        >
                            <input type="checkbox" value="Bank Transfer" {...register('paymentMethods')} className="sr-only" />
                            <div className="flex flex-col items-center gap-2 w-full">
                                <Smartphone className="w-6 h-6" />
                                <span className="text-sm font-medium">Bank Transfer</span>
                            </div>
                        </label>
                    </div>
                    {errors.paymentMethods && <p className="mt-2 text-xs text-destructive">{errors.paymentMethods.message}</p>}
                </div>

                {/* Footer Actions */}
                <div className="pt-6 border-t border-border flex justify-between items-center">
                    <button
                        type="button"
                        onClick={onBack}
                        disabled={isSubmitting}
                        className="px-6 py-2.5 text-foreground hover:bg-muted rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        Back
                    </button>
                    <button
                        type="submit"
                        disabled={!isValid || isSubmitting}
                        className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                Validating...
                            </>
                        ) : (
                            'Complete Setup'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, Building, Image as ImageIcon, Clock } from 'lucide-react';
import { gymProfileSchema, type GymProfileFormData } from '../schemas/setup-schema';

interface Props {
    onNext: (data: GymProfileFormData) => void;
    defaultValues?: Partial<GymProfileFormData>;
}

export function GymProfileStep({ onNext, defaultValues }: Props) {
    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<GymProfileFormData>({
        resolver: zodResolver(gymProfileSchema),
        defaultValues: {
            address: '',
            city: '',
            district: '',
            openingHours: '',
            ...defaultValues,
        },
        mode: 'onChange',
    });

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground">Gym Profile</h2>
                <p className="text-muted-foreground mt-1">Tell us a bit more about your physical location.</p>
            </div>

            <form id="step-1-form" onSubmit={handleSubmit(onNext)} className="space-y-6">
                {/* Address */}
                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-foreground mb-1.5">
                        Street Address <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            id="address"
                            type="text"
                            placeholder="123 Fitness Street"
                            {...register('address')}
                            className={`w-full pl-10 pr-4 py-2.5 bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-transparent transition-shadow text-sm ${errors.address ? 'border-destructive focus:ring-destructive/30' : 'border-input focus:ring-ring'
                                }`}
                        />
                    </div>
                    {errors.address && <p className="mt-1.5 text-xs text-destructive">{errors.address.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* City */}
                    <div>
                        <label htmlFor="city" className="block text-sm font-medium text-foreground mb-1.5">
                            City <span className="text-destructive">*</span>
                        </label>
                        <div className="relative">
                            <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                id="city"
                                type="text"
                                placeholder="Colombo"
                                {...register('city')}
                                className={`w-full pl-10 pr-4 py-2.5 bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-transparent transition-shadow text-sm ${errors.city ? 'border-destructive focus:ring-destructive/30' : 'border-input focus:ring-ring'
                                    }`}
                            />
                        </div>
                        {errors.city && <p className="mt-1.5 text-xs text-destructive">{errors.city.message}</p>}
                    </div>

                    {/* District */}
                    <div>
                        <label htmlFor="district" className="block text-sm font-medium text-foreground mb-1.5">
                            District <span className="text-destructive">*</span>
                        </label>
                        <div className="relative">
                            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                id="district"
                                type="text"
                                placeholder="Western Province"
                                {...register('district')}
                                className={`w-full pl-10 pr-4 py-2.5 bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-transparent transition-shadow text-sm ${errors.district ? 'border-destructive focus:ring-destructive/30' : 'border-input focus:ring-ring'
                                    }`}
                            />
                        </div>
                        {errors.district && <p className="mt-1.5 text-xs text-destructive">{errors.district.message}</p>}
                    </div>
                </div>

                {/* Opening Hours */}
                <div>
                    <label htmlFor="openingHours" className="block text-sm font-medium text-foreground mb-1.5">
                        Opening Hours <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                        <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            id="openingHours"
                            type="text"
                            placeholder="e.g. Mon-Sat: 6 AM - 10 PM, Sun: Closed"
                            {...register('openingHours')}
                            className={`w-full pl-10 pr-4 py-2.5 bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-transparent transition-shadow text-sm ${errors.openingHours ? 'border-destructive focus:ring-destructive/30' : 'border-input focus:ring-ring'
                                }`}
                        />
                    </div>
                    {errors.openingHours && <p className="mt-1.5 text-xs text-destructive">{errors.openingHours.message}</p>}
                </div>

                {/* Logo Upload Placeholder */}
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Gym Logo (Optional)</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border border-dashed rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer group">
                        <div className="space-y-1 text-center">
                            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors" />
                            <div className="flex text-sm text-muted-foreground justify-center">
                                <span className="relative cursor-pointer bg-transparent rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                                    Upload a file
                                </span>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 2MB</p>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-6 border-t border-border flex justify-end">
                    <button
                        type="submit"
                        disabled={!isValid}
                        className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        Continue to Plans
                    </button>
                </div>
            </form>
        </div>
    );
}

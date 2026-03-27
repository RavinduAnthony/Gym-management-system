import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Stepper } from '@/components/common/stepper';
import { useAuthStore } from '@/core/auth';
import { GymProfileStep } from '../components/gym-profile-step';
import { MembershipPlansStep } from '../components/membership-plans-step';
import { AddStaffStep } from '../components/add-staff-step';
import { PaymentSettingsStep } from '../components/payment-settings-step';
import type { GymProfileFormData, MembershipPlansFormData, StaffFormData, PaymentSettingsFormData } from '../schemas/setup-schema';

const WIZARD_STEPS = ['Gym Profile', 'Plans', 'Staff', 'Payments'];

export function SetupWizardPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Accumulated data state
    const [wizardData, setWizardData] = useState<{
        profile?: GymProfileFormData;
        plans?: MembershipPlansFormData;
        staff?: StaffFormData;
        payments?: PaymentSettingsFormData;
    }>({});

    const { updateUser } = useAuthStore();
    const navigate = useNavigate();

    const handleNext = (stepData: any, stepKey: keyof typeof wizardData) => {
        setWizardData((prev) => ({ ...prev, [stepKey]: stepData }));
        setCurrentStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(1, prev - 1));
    };

    const handleComplete = async (paymentData: PaymentSettingsFormData) => {
        setIsSubmitting(true);

        const finalData = {
            ...wizardData,
            payments: paymentData,
        };

        console.log('Setup Complete! Payload:', finalData);

        // TODO: Replace with real API call
        try {
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Update local user state
            updateUser({ setupCompleted: true });

            toast.success('Setup completed successfully! Welcome to your dashboard.');

            // Navigate to dashboard
            navigate('/dashboard', { replace: true });
        } catch (error) {
            toast.error('Failed to complete setup. Please try again.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-4 sm:p-8">
            {/* Container */}
            <div className="w-full max-w-3xl bg-background border border-border shadow-xl rounded-2xl overflow-hidden flex flex-col">

                {/* Header Ribbon */}
                <div className="bg-card border-b border-border px-8 py-6">
                    <Stepper steps={WIZARD_STEPS} currentStep={currentStep} />
                </div>

                {/* Content Area */}
                <div className="p-8">
                    {currentStep === 1 && (
                        <GymProfileStep
                            defaultValues={wizardData.profile}
                            onNext={(data) => handleNext(data, 'profile')}
                        />
                    )}
                    {currentStep === 2 && (
                        <MembershipPlansStep
                            defaultValues={wizardData.plans}
                            onBack={handleBack}
                            onNext={(data) => handleNext(data, 'plans')}
                        />
                    )}
                    {currentStep === 3 && (
                        <AddStaffStep
                            defaultValues={wizardData.staff}
                            onBack={handleBack}
                            onNext={(data) => handleNext(data, 'staff')}
                        />
                    )}
                    {currentStep === 4 && (
                        <PaymentSettingsStep
                            defaultValues={wizardData.payments}
                            onBack={handleBack}
                            isSubmitting={isSubmitting}
                            onNext={handleComplete}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

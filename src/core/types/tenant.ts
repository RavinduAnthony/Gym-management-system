export interface Tenant {
    id: string;
    gymName: string;
    ownerName: string;
    ownerEmail: string;
    phone: string;
    country: string;
    timezone: string;
    status: 'Active' | 'Inactive' | 'Suspended';
    subscriptionPlan: 'Trial' | 'Basic' | 'Pro' | 'Enterprise';
    logo?: string;
    createdDate: string;
}

export interface Branch {
    id: string;
    tenantId: string;
    name: string;
    address: string;
    city: string;
    district: string;
    openingHours: string;
}

import { api } from '@/core/api/axios-instance';
import type { Member, MemberRecord, MembershipRecord, MemberFormData, PaymentRecord } from '../types';

// Map full form data to the backend CreateMemberDto (no membership fields)
const mapMemberToBackendDto = (data: Partial<MemberFormData>) => {
    return {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth || null,
        joinDate: data.joinDate || null,
        branchId: data.branchId || null,
        email: data.email || null,
        emergencyContact: data.emergencyContact || null,
        address: data.address || null,
        height: data.height || null,
        weight: data.weight || null,
        medicalConditions: data.medicalConditions || null,
        trainerId: data.trainerId || null,
    };
};

// Map full form data to the backend CreateMembershipDto
const mapMembershipToBackendDto = (memberId: string, data: MemberFormData, price: number) => {
    return {
        memberId,
        packageId: data.membershipPlanId,
        startDate: data.membershipStartDate,
        endDate: data.membershipEndDate,
        price,
        discount: 0,
        paymentStatus: data.paymentStatus,
        registrationFee: data.registrationFee ?? 0,
    };
};

// Merge a MemberRecord with its latest MembershipRecord into the combined Member type
const mergeWithMembership = (member: MemberRecord, membership?: MembershipRecord | null): Member => ({
    ...member,
    membershipId: membership?.id,
    membershipPlanId: membership?.packageId,
    membershipStartDate: membership?.startDate,
    membershipEndDate: membership?.endDate,
    paymentStatus: membership?.paymentStatus,
});

export const membersApi = {
    getMembers: async (): Promise<Member[]> => {
        const membersRes = await api.get<{ data: MemberRecord[] }>('/member');
        const members = membersRes.data.data;

        // Fetch all memberships per member and attach the most recent one
        const enriched = await Promise.all(
            members.map(async (m) => {
                try {
                    const msRes = await api.get<{ data: MembershipRecord[] }>(`/membership/member/${m.id}`);
                    const list = msRes.data.data ?? [];
                    // Pick the most recent (latest startDate)
                    const latest = list.sort((a, b) =>
                        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
                    )[0] ?? null;
                    return mergeWithMembership(m, latest);
                } catch {
                    return mergeWithMembership(m, null);
                }
            })
        );
        return enriched;
    },

    getMemberById: async (id: string): Promise<Member | undefined> => {
        const memberRes = await api.get<{ data: MemberRecord }>(`/member/${id}`);
        const member = memberRes.data.data;
        try {
            const msRes = await api.get<{ data: MembershipRecord[] }>(`/membership/member/${id}`);
            const list = msRes.data.data ?? [];
            const latest = list.sort((a, b) =>
                new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
            )[0] ?? null;
            return mergeWithMembership(member, latest);
        } catch {
            return mergeWithMembership(member, null);
        }
    },

    createMember: async (data: MemberFormData & { _price?: number }): Promise<Member> => {
        // 1. Create the member record
        const memberPayload = mapMemberToBackendDto(data);
        const memberRes = await api.post<{ data: MemberRecord }>('/member', memberPayload);
        const member = memberRes.data.data;

        // 2. Create the membership record
        const price = data._price ?? 0;
        const membershipPayload = mapMembershipToBackendDto(member.id, data, price);
        const msRes = await api.post<{ data: MembershipRecord }>('/membership', membershipPayload);
        const membership = msRes.data.data;

        return mergeWithMembership(member, membership);
    },

    updateMember: async (id: string, data: Partial<MemberFormData> & { _price?: number }, membershipId?: string): Promise<Member> => {
        // 1. Update the member record
        const memberPayload = { ...mapMemberToBackendDto(data), status: (data as any).status };
        const memberRes = await api.put<{ data: MemberRecord }>(`/member/${id}`, memberPayload);
        const member = memberRes.data.data;

        // 2. Update or create the membership record
        let membership: MembershipRecord | null = null;
        const price = data._price ?? 0;
        if (membershipId && data.membershipPlanId && data.membershipStartDate && data.membershipEndDate) {
            const msPayload = {
                packageId: data.membershipPlanId,
                startDate: data.membershipStartDate,
                endDate: data.membershipEndDate,
                price,
                discount: 0,
                paymentStatus: data.paymentStatus ?? 'Pending',
            };
            const msRes = await api.put<{ data: MembershipRecord }>(`/membership/${membershipId}`, msPayload);
            membership = msRes.data.data;
        } else if (!membershipId && data.membershipPlanId && data.membershipStartDate && data.membershipEndDate) {
            // No existing membership — create one
            const membershipPayload = mapMembershipToBackendDto(id, data as MemberFormData, price);
            const msRes = await api.post<{ data: MembershipRecord }>('/membership', membershipPayload);
            membership = msRes.data.data;
        }

        return mergeWithMembership(member, membership);
    },

    deleteMember: async (id: string): Promise<void> => {
        await api.delete(`/member/${id}`);
    },


    deactivateMember: async (id: string): Promise<void> => {
        await api.post(`/member/${id}/deactivate`);
    },

    reactivateMember: async (id: string): Promise<void> => {
        await api.post(`/member/${id}/reactivate`);
    },

    getInactiveMembers: async (): Promise<Member[]> => {
        const membersRes = await api.get<{ data: MemberRecord[] }>('/member/inactive');
        const members = membersRes.data.data ?? [];
        const enriched = await Promise.all(
            members.map(async (m) => {
                try {
                    const msRes = await api.get<{ data: MembershipRecord[] }>(`/membership/member/${m.id}`);
                    const list = msRes.data.data ?? [];
                    const latest = list.sort((a, b) =>
                        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
                    )[0] ?? null;
                    return mergeWithMembership(m, latest);
                } catch {
                    return mergeWithMembership(m, null);
                }
            })
        );
        return enriched;
    },
    getMembershipsByMember: async (memberId: string): Promise<MembershipRecord[]> => {
        try {
            const response = await api.get<{ data: MembershipRecord[] }>(`/membership/member/${memberId}`);
            return response.data.data ?? [];
        } catch {
            return [];
        }
    },

    getPaymentsByMember: async (memberId: string): Promise<PaymentRecord[]> => {
        try {
            const response = await api.get<{ data: PaymentRecord[] }>(`/membership/payments/${memberId}`);
            return response.data.data ?? [];
        } catch {
            return [];
        }
    },

    renewMembership: async (membershipId: string, _packageId: string, planName: string, amount: number, endDate: string): Promise<void> => {
        await api.post('/membership/renew', {
            membershipId,
            newEndDate: endDate,
            planName,
            amount,
            discount: 0,
        });
    },
};


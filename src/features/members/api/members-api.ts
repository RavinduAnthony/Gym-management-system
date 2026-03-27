import type { Member, MemberFormData, PaymentRecord } from '../types';

let members: Member[] = [
    {
        id: 'mem_1',
        firstName: 'John',
        lastName: 'Doe',
        phone: '0712345678',
        gender: 'Male',
        dateOfBirth: '1990-05-15',
        joinDate: '2025-01-10',
        branchId: 'Colombo Main',
        status: 'Active',
        email: 'john.doe@example.com',
        emergencyContact: 'Jane Doe - 0777654321',
        membershipPlanId: 'pkg_1', // Assume this maps to a plan
        membershipStartDate: '2026-02-10',
        membershipEndDate: '2026-03-10',
        paymentStatus: 'Paid',
        trainerId: 'trn_1',
        createdAt: '2025-01-10T00:00:00Z',
    },
    {
        id: 'mem_2',
        firstName: 'Emma',
        lastName: 'Watson',
        phone: '0759876543',
        gender: 'Female',
        dateOfBirth: '1995-08-22',
        joinDate: '2025-11-05',
        branchId: 'Kandy Branch',
        status: 'Inactive',
        email: 'emma.w@example.com',
        membershipPlanId: 'pkg_2',
        membershipStartDate: '2025-11-05',
        membershipEndDate: '2026-02-05',
        paymentStatus: 'Pending',
        createdAt: '2025-11-05T00:00:00Z',
    }
];

let payments: PaymentRecord[] = [
    {
        id: 'py_1',
        memberId: 'mem_1',
        date: '2026-02-10',
        planName: 'Monthly',
        amount: 5000,
    },
    {
        id: 'py_2',
        memberId: 'mem_1',
        date: '2026-01-10',
        planName: 'Monthly',
        amount: 5000,
    }
];

export const membersApi = {
    getMembers: async (): Promise<Member[]> => {
        return new Promise((resolve) => setTimeout(() => resolve([...members]), 600));
    },

    getMemberById: async (id: string): Promise<Member | undefined> => {
        return new Promise((resolve) => setTimeout(() => resolve(members.find(m => m.id === id)), 400));
    },

    createMember: async (data: MemberFormData): Promise<Member> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newMember: Member = {
                    ...data,
                    id: `mem_${Date.now()}`,
                    createdAt: new Date().toISOString(),
                };
                members = [newMember, ...members];

                // Add initial payment if marked as paid
                if (data.paymentStatus === 'Paid') {
                    payments = [{
                        id: `py_${Date.now()}`,
                        memberId: newMember.id,
                        date: new Date().toISOString().split('T')[0],
                        planName: 'Initial Plan',
                        amount: 0, // In real app, we'd look up the plan price
                    }, ...payments];
                }

                resolve(newMember);
            }, 800);
        });
    },

    updateMember: async (id: string, data: Partial<MemberFormData>): Promise<Member> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = members.findIndex((m) => m.id === id);
                if (index === -1) return reject(new Error('Member not found'));

                members[index] = { ...members[index], ...data };
                resolve(members[index]);
            }, 600);
        });
    },

    deleteMember: async (id: string): Promise<void> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                members = members.filter((m) => m.id !== id);
                payments = payments.filter((p) => p.memberId !== id);
                resolve();
            }, 600);
        });
    },

    getPaymentsByMember: async (memberId: string): Promise<PaymentRecord[]> => {
        return new Promise((resolve) => {
            setTimeout(() => resolve(payments.filter(p => p.memberId === memberId)), 400);
        });
    },

    renewMembership: async (memberId: string, planName: string, amount: number, endDate: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = members.findIndex((m) => m.id === memberId);
                if (index === -1) return reject(new Error('Member not found'));

                // Update member
                members[index] = {
                    ...members[index],
                    membershipEndDate: endDate,
                    paymentStatus: 'Paid',
                    status: 'Active'
                };

                // Record payment
                payments = [{
                    id: `py_${Date.now()}`,
                    memberId,
                    date: new Date().toISOString().split('T')[0],
                    planName,
                    amount,
                }, ...payments];

                resolve();
            }, 800);
        });
    }
};

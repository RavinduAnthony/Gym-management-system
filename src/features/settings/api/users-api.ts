import api from '@/lib/api';

export interface UserDto {
    id: string;
    firstName: string;
    lastName: string;
    mobileNumber: string;
    email: string;
    dateOfBirth?: string;
    gender?: string;
    role: string;
    customRole?: string;
    isActive: boolean;
    isTemporaryPassword: boolean;
    createdAt: string;
}

export interface CreateUserPayload {
    firstName: string;
    lastName: string;
    mobileNumber: string;
    email: string;
    dateOfBirth?: string;
    gender?: string;
    customRole: string;
}

export interface CreateUserResponse extends UserDto {
    emailSent: boolean;
    emailError?: string;
}

export interface UpdateUserPayload {
    firstName: string;
    lastName: string;
    mobileNumber: string;
    email: string;
    dateOfBirth?: string;
    gender?: string;
    role: string;
    customRole?: string;
    isActive: boolean;
}

const extract = <T>(res: { data: { data: T } }) => res.data.data;

export const usersApi = {
    getAll: () => api.get<{ data: UserDto[] }>('/user').then(extract),
    create: (payload: CreateUserPayload) => api.post<{ data: CreateUserResponse }>('/user', payload).then(extract),
    update: (id: string, payload: UpdateUserPayload) => api.put<{ data: UserDto }>(`/user/${id}`, payload).then(extract),
    remove: (id: string) => api.delete(`/user/${id}`),
    resetPassword: (id: string, newPassword: string) =>
        api.post(`/user/${id}/reset-password`, { newPassword }).then(extract),
};


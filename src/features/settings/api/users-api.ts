import api from '@/lib/api';

export interface UserDto {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    customRole?: string;
    isActive: boolean;
    createdAt: string;
}

export interface CreateUserPayload {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    customRole?: string;
}

export interface UpdateUserPayload {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    customRole?: string;
    isActive: boolean;
}

const extract = <T>(res: { data: { data: T } }) => res.data.data;

export const usersApi = {
    getAll: () => api.get<{ data: UserDto[] }>('/user').then(extract),
    create: (payload: CreateUserPayload) => api.post<{ data: UserDto }>('/user', payload).then(extract),
    update: (id: string, payload: UpdateUserPayload) => api.put<{ data: UserDto }>(`/user/${id}`, payload).then(extract),
    remove: (id: string) => api.delete(`/user/${id}`),
};

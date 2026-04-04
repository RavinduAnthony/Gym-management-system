import type { PtPackage, PtPackageFormData } from '../schemas/pt-package-schema';

const STORAGE_KEY = 'gym_pt_packages';

const load = (): PtPackage[] => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    } catch {
        return [];
    }
};

const save = (data: PtPackage[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const ptPackagesApi = {
    getAll: async (): Promise<PtPackage[]> => load(),

    create: async (data: PtPackageFormData): Promise<PtPackage> => {
        const records = load();
        const newRecord: PtPackage = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
        save([...records, newRecord]);
        return newRecord;
    },

    update: async (id: string, data: PtPackageFormData): Promise<PtPackage> => {
        const records = load();
        const updated = records.map(r => r.id === id ? { ...r, ...data, id } : r);
        save(updated);
        const result = updated.find(r => r.id === id);
        if (!result) throw new Error('Not found');
        return result;
    },

    delete: async (id: string): Promise<void> => {
        save(load().filter(r => r.id !== id));
    },
};

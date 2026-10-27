import { createMMKV } from 'react-native-mmkv'

// Initialize MMKV instance
export const storage = createMMKV({
    id: "kaveri_storage",
});

export const secureStorage = createMMKV({
    id: "kaveri_seqr_storage",
    encryptionKey: "e2083fd2bd5174b0f420b583b235128dc14c95d4b3a4630cb133480f8c2abbf9",
});


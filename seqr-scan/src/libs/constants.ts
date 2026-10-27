import { generateUniqueStorageKey } from "./utils";

export const STORAGE_KEYS = {
    accessToken: generateUniqueStorageKey("ACCESS_TOKEN"),
    localUser: generateUniqueStorageKey("LOCAL_USER"),
}

export const TITLES = {
    APP_NAME: 'Kaveri',
    SHOW_POWER_BY: false,
    SHOW_REMOVE_ACCOUNT: true,
    SHOW_ANSWER_BOOKLET: false
}

export function cleanBase64(input: string): string {
    const match = input.match(/[A-Za-z0-9+/=]+/);
    return match ? match[0] : input;
};
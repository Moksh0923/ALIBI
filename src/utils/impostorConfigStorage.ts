import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ImpostorPreferences {
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    impostorCount: number;
    variation: 'different-word' | 'no-word' | 'hint-only';
}

const STORAGE_KEY = '@alibi/impostor_preferences';

const DEFAULT_PREFERENCES: ImpostorPreferences = {
    category: 'food',
    difficulty: 'medium',
    impostorCount: 1,
    variation: 'different-word',
};

export async function loadImpostorPreferences(): Promise<ImpostorPreferences> {
    try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);

        if (!saved) return DEFAULT_PREFERENCES;

        const parsed = JSON.parse(saved);

        return {
            category: ['food', 'places', 'animals', 'objects', 'movies'].includes(parsed.category)
                ? parsed.category
                : DEFAULT_PREFERENCES.category,

            difficulty: ['easy', 'medium', 'hard'].includes(parsed.difficulty)
                ? parsed.difficulty
                : DEFAULT_PREFERENCES.difficulty,

            impostorCount:
                Number.isInteger(parsed.impostorCount) && parsed.impostorCount >= 1
                    ? parsed.impostorCount
                    : DEFAULT_PREFERENCES.impostorCount,

            variation: ['different-word', 'no-word', 'hint-only'].includes(parsed.variation)
                ? parsed.variation
                : DEFAULT_PREFERENCES.variation,
        };
    } catch (error) {
        console.error('Could not load Impostor preferences:', error);
        return DEFAULT_PREFERENCES;
    }
}

export async function saveImpostorPreferences(
    preferences: ImpostorPreferences
) {
    try {
        await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(preferences)
        );
    } catch (error) {
        console.error('Could not save Impostor preferences:', error);
    }
}
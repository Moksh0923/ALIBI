import AsyncStorage from '@react-native-async-storage/async-storage';

const MAFIA_CONFIG_KEY = '@alibi/mafia_config';

export interface MafiaPreferences {
    mafiaCount: number;
    godCount: number;
    policeCount: number;
    doctorCount: number;
}

export const DEFAULT_MAFIA_PREFERENCES: MafiaPreferences = {
    mafiaCount: 1,
    godCount: 1,
    policeCount: 0,
    doctorCount: 0,
};

export async function saveMafiaPreferences(
    preferences: MafiaPreferences
): Promise<void> {
    try {
        await AsyncStorage.setItem(
            MAFIA_CONFIG_KEY,
            JSON.stringify(preferences)
        );
    } catch (error) {
        console.error('Could not save Mafia preferences:', error);
    }
}

export async function loadMafiaPreferences(): Promise<MafiaPreferences> {
    try {
        const saved = await AsyncStorage.getItem(MAFIA_CONFIG_KEY);
        if (!saved) return DEFAULT_MAFIA_PREFERENCES;

        const parsed = JSON.parse(saved) as Partial<MafiaPreferences>;

        const safeNumber = (value: unknown, fallback: number) =>
            Number.isInteger(value) && Number(value) >= 0
                ? Number(value)
                : fallback;

        return {
            mafiaCount: Math.max(1, safeNumber(parsed.mafiaCount, 1)),
            godCount: Math.max(1, safeNumber(parsed.godCount, 1)),
            policeCount: safeNumber(parsed.policeCount, 0),
            doctorCount: safeNumber(parsed.doctorCount, 0),
        };
    } catch (error) {
        console.error('Could not load Mafia preferences:', error);
        return DEFAULT_MAFIA_PREFERENCES;
    }
}

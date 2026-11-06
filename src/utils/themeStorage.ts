import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_MODE_KEY = '@alibi/theme_mode';

export type ThemeMode = 'light' | 'dark' | 'system';

export async function loadThemeMode(): Promise<ThemeMode> {
    try {
        const saved = await AsyncStorage.getItem(THEME_MODE_KEY);

        if (saved === 'light' || saved === 'dark' || saved === 'system') {
            return saved;
        }

        return 'system';
    } catch (error) {
        console.error('Could not load theme preference:', error);
        return 'system';
    }
}

export async function saveThemeMode(mode: ThemeMode): Promise<void> {
    try {
        await AsyncStorage.setItem(THEME_MODE_KEY, mode);
    } catch (error) {
        console.error('Could not save theme preference:', error);
    }
}

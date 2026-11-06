import AsyncStorage from '@react-native-async-storage/async-storage';

const IMPOSTOR_PLAYERS_KEY = '@alibi/impostor_players';

export async function saveImpostorPlayers(names: string[]) {
    try {
        await AsyncStorage.setItem(
            IMPOSTOR_PLAYERS_KEY,
            JSON.stringify(names)
        );
    } catch (error) {
        console.error('Could not save player names:', error);
    }
}

export async function loadImpostorPlayers(): Promise<string[]> {
    try {
        const saved = await AsyncStorage.getItem(IMPOSTOR_PLAYERS_KEY);

        if (!saved) return [];

        const parsed = JSON.parse(saved);

        return Array.isArray(parsed)
            ? parsed.filter((name): name is string => typeof name === 'string')
            : [];
    } catch (error) {
        console.error('Could not load player names:', error);
        return [];
    }
}
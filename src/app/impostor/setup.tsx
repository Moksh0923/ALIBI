import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    ScrollView,
    StyleSheet,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import {
    loadImpostorPlayers,
    saveImpostorPlayers,
} from '@/utils/playerStorage';

const C = {
    background: '#F5F4EF',
    surface: '#FFFFFF',
    soft: '#EAE9E2',
    ink: '#20211F',
    muted: '#73756D',
    border: '#E2E1D9',
    accent: '#DDF0AA',
    accentDark: '#34412A',
    accentText: '#4F5A3E',
    danger: '#B65D55',
};

const AVATAR_COLORS = [
    '#DDF0AA',
    '#DCD2F5',
    '#F1D7C9',
    '#D6E7E5',
    '#E9E1C9',
    '#E8D6E8',
    '#D5E1F0',
    '#EBDCC5',
];

interface Player {
    id: number;
    name: string;
}

export default function ImpostorSetupScreen() {
    const router = useRouter();

    const [players, setPlayers] = useState<Player[]>([
        { id: 1, name: '' },
        { id: 2, name: '' },
        { id: 3, name: '' },
    ]);

    const [nextId, setNextId] = useState(4);
    const [error, setError] = useState('');

    // Restore previously saved player names.
    useEffect(() => {
        let isMounted = true;

        const loadSavedPlayers = async () => {
            const savedNames = await loadImpostorPlayers();

            if (!isMounted || savedNames.length === 0) return;

            const restoredPlayers: Player[] = savedNames
                .slice(0, 20)
                .map((name, index) => ({
                    id: index + 1,
                    name,
                }));

            while (restoredPlayers.length < 3) {
                restoredPlayers.push({
                    id: restoredPlayers.length + 1,
                    name: '',
                });
            }

            setPlayers(restoredPlayers);
            setNextId(restoredPlayers.length + 1);
        };

        loadSavedPlayers();

        return () => {
            isMounted = false;
        };
    }, []);

    const updatePlayer = (id: number, name: string) => {
        setPlayers(current =>
            current.map(player =>
                player.id === id ? { ...player, name } : player
            )
        );
        setError('');
    };

    const addPlayer = () => {
        if (players.length >= 20) {
            setError('A maximum of 20 players is allowed.');
            return;
        }

        setPlayers(current => [
            ...current,
            { id: nextId, name: '' },
        ]);

        setNextId(current => current + 1);
        setError('');
    };

    const removePlayer = (id: number) => {
        setPlayers(current =>
            current.filter(player => player.id !== id)
        );
        setError('');
    };

    const continueSetup = async () => {
        const cleanedPlayers = players.map(player => ({
            ...player,
            name: player.name.trim(),
        }));

        if (cleanedPlayers.length < 3) {
            setError('You need at least 3 players.');
            return;
        }

        if (cleanedPlayers.some(player => !player.name)) {
            setError('Please enter a name for every player.');
            return;
        }

        const names = cleanedPlayers.map(player =>
            player.name.toLocaleLowerCase()
        );

        if (new Set(names).size !== names.length) {
            setError('Every player must have a unique name.');
            return;
        }

        // Save names locally for future rounds.
        await saveImpostorPlayers(
            cleanedPlayers.map(player => player.name)
        );

        router.push({
            pathname: '/impostor/config',
            params: {
                players: JSON.stringify(cleanedPlayers),
            },
        });
    };

    const filledCount = players.filter(
        player => player.name.trim().length > 0
    ).length;

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor={C.background}
            />

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
            >
                <ScrollView
                    style={styles.flex}
                    showsVerticalScrollIndicator={true}
                    keyboardShouldPersistTaps="always"
                    keyboardDismissMode="none"
                    contentContainerStyle={[
                        styles.container,
                        { paddingBottom: 300 },
                    ]}
                >
                    {/* Navigation */}
                    <View style={styles.topBar}>
                        <Pressable
                            onPress={() => router.back()}
                            style={styles.backButton}
                            hitSlop={10}
                        >
                            <Text style={styles.backIcon}>‹</Text>
                        </Pressable>

                        <Text style={styles.stepLabel}>
                            IMPOSTOR  /  01 OF 03
                        </Text>
                    </View>

                    {/* Heading */}
                    <View style={styles.heading}>
                        <Text style={styles.title}>Who's playing?</Text>
                        <Text style={styles.subtitle}>
                            Add everyone sharing the phone.
                        </Text>
                    </View>

                    {/* Player count */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionLabel}>PLAYERS</Text>
                        <Text style={styles.playerCount}>
                            {filledCount} ADDED
                        </Text>
                    </View>

                    {/* Player rows */}
                    <View style={styles.playerList}>
                        {players.map((player, index) => {
                            const avatarColor =
                                AVATAR_COLORS[index % AVATAR_COLORS.length];

                            const initial = player.name.trim()
                                ? player.name.trim().charAt(0).toUpperCase()
                                : String(index + 1);

                            return (
                                <View key={player.id} style={styles.playerRow}>
                                    <View
                                        style={[
                                            styles.avatar,
                                            { backgroundColor: avatarColor },
                                        ]}
                                    >
                                        <Text style={styles.avatarText}>
                                            {initial}
                                        </Text>
                                    </View>

                                    <TextInput
                                        style={styles.nameInput}
                                        placeholder={`Player ${index + 1}`}
                                        placeholderTextColor="#A4A49C"
                                        value={player.name}
                                        onChangeText={value =>
                                            updatePlayer(player.id, value)
                                        }
                                        autoCapitalize="words"
                                        autoCorrect={false}
                                        returnKeyType="done"
                                        maxLength={24}
                                    />

                                    <Pressable
                                        onPress={() => removePlayer(player.id)}
                                        style={styles.removeButton}
                                        hitSlop={8}
                                        accessibilityLabel={`Remove player ${index + 1}`}
                                    >
                                        <Text style={styles.removeIcon}>×</Text>
                                    </Pressable>
                                </View>
                            );
                        })}
                    </View>

                    {/* Add player */}
                    <Pressable
                        onPress={addPlayer}
                        style={({ pressed }) => [
                            styles.addButton,
                            pressed && styles.pressed,
                        ]}
                    >
                        <Text style={styles.addIcon}>＋</Text>
                        <Text style={styles.addText}>Add another player</Text>
                    </Pressable>

                    {/* Validation */}
                    {!!error && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    {/* Continue */}
                    <Pressable
                        onPress={continueSetup}
                        style={({ pressed }) => [
                            styles.continueButton,
                            pressed && styles.continuePressed,
                        ]}
                    >
                        <Text style={styles.continueText}>Continue</Text>
                        <Text style={styles.continueArrow}>→</Text>
                    </Pressable>

                    <Text style={styles.minimumText}>
                        MINIMUM 3 PLAYERS  ·  MAXIMUM 20
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },

    safeArea: {
        flex: 1,
        backgroundColor: C.background,
    },

    container: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 35,
    },

    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 43,
    },

    backButton: {
        width: 34,
        height: 34,
        justifyContent: 'center',
    },

    backIcon: {
        fontSize: 34,
        lineHeight: 36,
        color: C.ink,
        fontWeight: '300',
    },

    stepLabel: {
        marginLeft: 10,
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.6,
        color: C.muted,
    },

    heading: {
        marginBottom: 43,
    },

    title: {
        fontSize: 32,
        lineHeight: 40,
        fontWeight: '800',
        letterSpacing: -1.1,
        color: C.ink,
    },

    subtitle: {
        fontSize: 14,
        color: C.muted,
        marginTop: 7,
    },

    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 13,
    },

    sectionLabel: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.6,
        color: C.muted,
    },

    playerCount: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
        color: C.muted,
    },

    playerList: {
        gap: 10,
    },

    playerRow: {
        height: 58,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        backgroundColor: C.surface,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: C.border,
    },

    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },

    avatarText: {
        fontSize: 13,
        fontWeight: '800',
        color: '#35362F',
    },

    nameInput: {
        flex: 1,
        height: '100%',
        marginLeft: 12,
        fontSize: 14,
        fontWeight: '600',
        color: C.ink,
        paddingVertical: 0,
    },

    removeButton: {
        width: 32,
        height: 38,
        justifyContent: 'center',
        alignItems: 'center',
    },

    removeIcon: {
        fontSize: 23,
        fontWeight: '300',
        color: '#92938A',
    },

    addButton: {
        height: 54,
        borderRadius: 15,
        backgroundColor: C.soft,
        marginTop: 13,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },

    addIcon: {
        fontSize: 20,
        color: C.ink,
        marginRight: 9,
    },

    addText: {
        fontSize: 14,
        fontWeight: '700',
        color: C.ink,
    },

    errorContainer: {
        backgroundColor: '#F7E9E6',
        padding: 12,
        borderRadius: 12,
        marginTop: 14,
    },

    errorText: {
        fontSize: 12,
        color: C.danger,
        fontWeight: '600',
    },

    continueButton: {
        height: 56,
        borderRadius: 17,
        backgroundColor: C.ink,
        marginTop: 32,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    continueText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    continueArrow: {
        fontSize: 21,
        color: '#FFFFFF',
    },

    continuePressed: {
        opacity: 0.8,
        transform: [{ scale: 0.99 }],
    },

    pressed: {
        opacity: 0.7,
    },

    minimumText: {
        textAlign: 'center',
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 0.5,
        color: C.muted,
        marginTop: 17,
    },
});

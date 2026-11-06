import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Pressable,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useRouter } from 'expo-router';

import {
    getImpostorGame,
    clearImpostorGame,
} from '../../engines/impostorSession';

const COLORS = {
    background: '#F5F4EF',
    surface: '#FFFFFF',
    ink: '#20211F',
    muted: '#73756D',
    border: '#E2E1D9',
    green: '#DDF0AA',
    greenDark: '#53633A',
    purple: '#DCD2F5',
    purpleDark: '#65558D',
};

export default function ImpostorCompleteScreen() {
    const router = useRouter();
    const game = getImpostorGame();
    const [impostorRevealed, setImpostorRevealed] = useState(false);
    const revealMotion = useRef(new Animated.Value(0)).current;

    const totalPlayers = game?.totalPlayers ?? 0;
    const impostors = game?.assignments.filter((player) => player.isImpostor) ?? [];
    const starterName =
        game?.conversationStarter?.name ??
        game?.assignments[0]?.playerName ??
        'Your group';

    useEffect(() => {
        Animated.timing(revealMotion, {
            toValue: impostorRevealed ? 1 : 0,
            duration: 360,
            useNativeDriver: true,
        }).start();
    }, [impostorRevealed, revealMotion]);

    function handlePlayAgain() {
        clearImpostorGame();
        router.replace('/impostor/setup');
    }

    function handleHome() {
        clearImpostorGame();
        router.replace('/');
    }

    if (!game) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="dark-content" />
                <View style={styles.emptyState}>
                    <Text style={styles.heading}>No active round</Text>
                    <Pressable style={styles.primaryButton} onPress={handleHome}>
                        <Text style={styles.primaryButtonText}>Back to home</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    const revealOpacity = revealMotion.interpolate({
        inputRange: [0, 1],
        outputRange: [0.92, 1],
    });
    const revealScale = revealMotion.interpolate({
        inputRange: [0, 1],
        outputRange: [0.97, 1],
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>
                <View style={styles.topLine}>
                    <View style={styles.mark}>
                        <Text style={styles.markText}>A</Text>
                    </View>
                    <Text style={styles.step}>IMPOSTOR</Text>
                </View>

                {!impostorRevealed ? (
                    <View style={styles.content}>
                        <Text style={styles.eyebrow}>ROUND READY</Text>
                        <Text style={styles.heading}>The cards are dealt.</Text>
                        <Text style={styles.subtitle}>
                            All {totalPlayers} players have their secrets. Let the conversation begin.
                        </Text>

                        <View style={styles.starterCard}>
                            <Text style={styles.cardLabel}>WHO STARTS?</Text>
                            <Text style={styles.starterName}>{starterName}</Text>
                            <Text style={styles.cardHint}>Your conversation starter</Text>
                        </View>

                        <Pressable
                            style={styles.primaryButton}
                            onPress={() => setImpostorRevealed(true)}
                        >
                            <Text style={styles.primaryButtonText}>Reveal the impostor</Text>
                        </Pressable>
                        <Text style={styles.footnote}>
                            Keep the identities hidden until your group is ready.
                        </Text>
                    </View>
                ) : (
                    <Animated.View
                        style={[
                            styles.content,
                            {
                                opacity: revealOpacity,
                                transform: [{ scale: revealScale }],
                            },
                        ]}
                    >
                        <Text style={styles.eyebrow}>THE REVEAL</Text>
                        <Text style={styles.heading}>The impostor{impostors.length > 1 ? 's' : ''}.</Text>
                        <Text style={styles.subtitle}>
                            The secret is out.
                        </Text>

                        <View style={styles.revealedCard}>
                            <Text style={styles.cardLabel}>ASSIGNED PLAYER{impostors.length > 1 ? 'S' : ''}</Text>
                            {impostors.map((player) => (
                                <View key={player.playerId} style={styles.impostorRow}>
                                    <Text style={styles.impostorName}>{player.playerName}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.actions}>
                            <Pressable style={styles.primaryButton} onPress={handlePlayAgain}>
                                <Text style={styles.primaryButtonText}>Play another round</Text>
                            </Pressable>
                            <Pressable style={styles.secondaryButton} onPress={handleHome}>
                                <Text style={styles.secondaryButtonText}>Home</Text>
                            </Pressable>
                        </View>
                    </Animated.View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flex: 1,
        paddingHorizontal: 26,
        paddingTop: 18,
        paddingBottom: 24,
    },
    topLine: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    mark: {
        width: 38,
        height: 38,
        borderRadius: 13,
        backgroundColor: COLORS.green,
        alignItems: 'center',
        justifyContent: 'center',
    },
    markText: {
        color: COLORS.greenDark,
        fontSize: 18,
        fontWeight: '900',
    },
    step: {
        color: COLORS.muted,
        fontSize: 10,
        letterSpacing: 2,
        fontWeight: '800',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
    },
    eyebrow: {
        color: COLORS.greenDark,
        fontSize: 11,
        letterSpacing: 2.2,
        fontWeight: '800',
        marginBottom: 14,
        textAlign: 'center',
    },
    heading: {
        color: COLORS.ink,
        fontSize: 34,
        lineHeight: 41,
        fontWeight: '800',
        textAlign: 'center',
    },
    subtitle: {
        color: COLORS.muted,
        fontSize: 14,
        lineHeight: 22,
        textAlign: 'center',
        marginTop: 12,
        marginBottom: 30,
    },
    starterCard: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 24,
        paddingHorizontal: 22,
        paddingVertical: 30,
        alignItems: 'center',
        marginBottom: 18,
    },
    cardLabel: {
        color: COLORS.muted,
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.8,
        textAlign: 'center',
        marginBottom: 16,
    },
    starterName: {
        color: COLORS.ink,
        fontSize: 30,
        lineHeight: 36,
        fontWeight: '800',
        textAlign: 'center',
    },
    cardHint: {
        color: COLORS.muted,
        fontSize: 12,
        marginTop: 8,
    },
    primaryButton: {
        backgroundColor: COLORS.ink,
        borderRadius: 16,
        paddingVertical: 17,
        paddingHorizontal: 20,
        alignItems: 'center',
        width: '100%',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    footnote: {
        color: COLORS.muted,
        textAlign: 'center',
        fontSize: 11,
        lineHeight: 18,
        marginTop: 16,
    },
    revealedCard: {
        backgroundColor: COLORS.purple,
        borderWidth: 1,
        borderColor: '#C8B9EA',
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingVertical: 26,
        alignItems: 'stretch',
    },
    impostorRow: {
        backgroundColor: '#FFFFFFB8',
        borderRadius: 14,
        paddingVertical: 16,
        paddingHorizontal: 18,
        marginTop: 8,
        alignItems: 'center',
    },
    impostorName: {
        color: COLORS.ink,
        fontSize: 22,
        fontWeight: '800',
    },
    actions: {
        marginTop: 22,
        gap: 8,
    },
    secondaryButton: {
        paddingVertical: 15,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: COLORS.ink,
        fontSize: 14,
        fontWeight: '700',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        padding: 26,
        gap: 24,
    },
});

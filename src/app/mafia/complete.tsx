import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useRouter } from 'expo-router';

import {
    clearMafiaGame,
    getMafiaGame,
} from '../../engines/mafiaSession';

import type { MafiaRole } from '../../engines/mafiaEngine';

const C = {
    background: '#F5F4EF',
    surface: '#FFFFFF',
    ink: '#20211F',
    muted: '#73756D',
    border: '#E2E1D9',
    green: '#DDF0AA',
    greenDark: '#53633A',
    purple: '#DCD2F5',
    purpleDark: '#65558D',
    blue: '#D9E8F1',
    blueDark: '#47677A',
    gold: '#F0E5CC',
    goldDark: '#80643C',
};

const ROLE_META: Record<Exclude<MafiaRole, 'citizen'>, { label: string; background: string; foreground: string }> = {
    mafia: { label: 'MAFIA', background: C.purple, foreground: C.purpleDark },
    god: { label: 'GOD', background: C.gold, foreground: C.goldDark },
    police: { label: 'POLICE', background: C.blue, foreground: C.blueDark },
    doctor: { label: 'DOCTOR', background: C.green, foreground: C.greenDark },
};

const SPECIAL_ROLE_ORDER: Exclude<MafiaRole, 'citizen'>[] = [
    'mafia',
    'god',
    'police',
    'doctor',
];

export default function MafiaCompleteScreen() {
    const router = useRouter();
    const game = getMafiaGame();
    const [rolesRevealed, setRolesRevealed] = useState(false);
    const revealProgress = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(revealProgress, {
            toValue: rolesRevealed ? 1 : 0,
            duration: 360,
            useNativeDriver: true,
        }).start();
    }, [rolesRevealed, revealProgress]);

    function handlePlayAgain() {
        clearMafiaGame();
        router.replace('/mafia/setup');
    }

    function handleHome() {
        clearMafiaGame();
        router.replace('/');
    }

    if (!game) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="dark-content" />
                <View style={styles.emptyState}>
                    <Text style={styles.heading}>No active game</Text>
                    <Pressable style={styles.primaryButton} onPress={handleHome}>
                        <Text style={styles.primaryButtonText}>Back to home</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    const revealOpacity = revealProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [0.94, 1],
    });
    const revealScale = revealProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [0.98, 1],
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>
                <View style={styles.topLine}>
                    <View style={styles.mark}>
                        <Text style={styles.markText}>A</Text>
                    </View>
                    <Text style={styles.step}>MAFIA</Text>
                </View>

                {!rolesRevealed ? (
                    <View style={styles.content}>
                        <Text style={styles.eyebrow}>ALL CARDS DEALT</Text>
                        <Text style={styles.heading}>Every role is set.</Text>
                        <Text style={styles.subtitle}>
                            All {game.totalPlayers} players have received their role cards.
                            Reveal the special roles when your group is ready.
                        </Text>

                        <View style={styles.hiddenCard}>
                            <View style={styles.questionCircle}>
                                <Text style={styles.question}>?</Text>
                            </View>
                            <Text style={styles.hiddenTitle}>SPECIAL ROLES ARE HIDDEN</Text>
                            <Text style={styles.hiddenSubtitle}>
                                Mafia, God, Police and Doctor identities stay secret until revealed.
                            </Text>
                        </View>

                        <Pressable style={styles.primaryButton} onPress={() => setRolesRevealed(true)}>
                            <Text style={styles.primaryButtonText}>Reveal all roles</Text>
                        </Pressable>
                        <Text style={styles.footnote}>
                            Citizens are not listed on the reveal screen.
                        </Text>
                    </View>
                ) : (
                    <Animated.View
                        style={[
                            styles.content,
                            { opacity: revealOpacity, transform: [{ scale: revealScale }] },
                        ]}
                    >
                        <Text style={styles.eyebrow}>THE REVEAL</Text>
                        <Text style={styles.heading}>The roles are out.</Text>
                        <Text style={styles.subtitle}>
                            Here are the players assigned to each special role.
                        </Text>

                        <ScrollView
                            style={styles.roleList}
                            showsVerticalScrollIndicator={false}
                            nestedScrollEnabled
                        >
                            {SPECIAL_ROLE_ORDER.map((role) => {
                                const players = game.assignments.filter(
                                    (assignment) => assignment.role === role
                                );

                                if (players.length === 0) return null;

                                const meta = ROLE_META[role];

                                return (
                                    <View key={role} style={styles.roleGroup}>
                                        <View style={[styles.roleBadge, { backgroundColor: meta.background }]}>
                                            <Text style={[styles.roleBadgeText, { color: meta.foreground }]}>
                                                {meta.label}
                                            </Text>
                                            <Text style={[styles.roleCount, { color: meta.foreground }]}>
                                                {players.length}
                                            </Text>
                                        </View>
                                        {players.map((player) => (
                                            <Text key={player.playerId} style={styles.playerName}>
                                                {player.playerName}
                                            </Text>
                                        ))}
                                    </View>
                                );
                            })}
                        </ScrollView>

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
    safeArea: { flex: 1, backgroundColor: C.background },
    container: { flex: 1, paddingHorizontal: 26, paddingTop: 18, paddingBottom: 24 },
    topLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    mark: { width: 38, height: 38, borderRadius: 13, backgroundColor: C.purple, alignItems: 'center', justifyContent: 'center' },
    markText: { color: C.purpleDark, fontSize: 18, fontWeight: '900' },
    step: { color: C.muted, fontSize: 10, letterSpacing: 2, fontWeight: '800' },
    content: { flex: 1, justifyContent: 'center', alignItems: 'stretch' },
    eyebrow: { color: C.purpleDark, fontSize: 11, letterSpacing: 2.2, fontWeight: '800', marginBottom: 14, textAlign: 'center' },
    heading: { color: C.ink, fontSize: 33, lineHeight: 40, fontWeight: '800', textAlign: 'center' },
    subtitle: { color: C.muted, fontSize: 13, lineHeight: 21, textAlign: 'center', marginTop: 12, marginBottom: 26 },
    hiddenCard: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 23, padding: 24, alignItems: 'center', marginBottom: 18 },
    questionCircle: { width: 54, height: 54, borderRadius: 27, backgroundColor: C.purple, alignItems: 'center', justifyContent: 'center', marginBottom: 17 },
    question: { color: C.purpleDark, fontSize: 29, fontWeight: '700' },
    hiddenTitle: { color: C.ink, fontSize: 11, fontWeight: '800', letterSpacing: 1.3, textAlign: 'center' },
    hiddenSubtitle: { color: C.muted, fontSize: 12, lineHeight: 19, textAlign: 'center', marginTop: 9 },
    primaryButton: { backgroundColor: C.ink, borderRadius: 16, paddingVertical: 17, paddingHorizontal: 20, alignItems: 'center', width: '100%' },
    primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
    footnote: { color: C.muted, textAlign: 'center', fontSize: 11, marginTop: 15 },
    roleList: { gap: 10, maxHeight: '55%' },
    roleGroup: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 15, padding: 13, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
    roleBadge: { paddingVertical: 7, paddingHorizontal: 10, borderRadius: 9, flexDirection: 'row', alignItems: 'center', gap: 8 },
    roleBadgeText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
    roleCount: { fontSize: 10, fontWeight: '800' },
    playerName: { color: C.ink, fontSize: 13, fontWeight: '700', paddingHorizontal: 4, paddingVertical: 5 },
    actions: { marginTop: 20, gap: 8 },
    secondaryButton: { paddingVertical: 15, alignItems: 'center' },
    secondaryButtonText: { color: C.ink, fontSize: 14, fontWeight: '700' },
    emptyState: { flex: 1, justifyContent: 'center', padding: 26, gap: 24 },
});

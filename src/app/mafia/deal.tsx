import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    AppState,
    Easing,
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { generateMafiaGame } from '../../engines/mafiaEngine';
import {
    getMafiaGame,
    saveMafiaGame,
} from '../../engines/mafiaSession';

import type { Player } from '../../engines/impostorEngine';
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

const ROLE_STYLE: Record<MafiaRole, { title: string; detail: string; background: string; border: string; ink: string }> = {
    mafia: {
        title: 'MAFIA',
        detail: 'You are part of the Mafia.',
        background: C.purple,
        border: '#C8B9EA',
        ink: C.purpleDark,
    },
    god: {
        title: 'GOD',
        detail: 'You have the God role.',
        background: C.gold,
        border: '#E2D1AD',
        ink: C.goldDark,
    },
    police: {
        title: 'POLICE',
        detail: 'You have the Police role.',
        background: C.blue,
        border: '#BDD5E2',
        ink: C.blueDark,
    },
    doctor: {
        title: 'DOCTOR',
        detail: 'You have the Doctor role.',
        background: C.green,
        border: '#C9DDA0',
        ink: C.greenDark,
    },
    citizen: {
        title: 'CITIZEN',
        detail: 'You are a Citizen.',
        background: C.surface,
        border: C.border,
        ink: C.ink,
    },
};

export default function MafiaDealScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        players?: string;
        mafiaCount?: string;
        godCount?: string;
        policeCount?: string;
        doctorCount?: string;
    }>();

    const [gameReady, setGameReady] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [revealed, setRevealed] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const flipProgress = useRef(new Animated.Value(0)).current;
    const entranceProgress = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        try {
            const existingGame = getMafiaGame();

            if (existingGame) {
                setGameReady(true);
                return;
            }

            if (
                !params.players ||
                !params.mafiaCount ||
                !params.godCount ||
                params.policeCount === undefined ||
                params.doctorCount === undefined
            ) {
                router.replace('/mafia/setup');
                return;
            }

            const players = JSON.parse(params.players) as Player[];
            const game = generateMafiaGame({
                players,
                mafiaCount: Number(params.mafiaCount),
                godCount: Number(params.godCount),
                policeCount: Number(params.policeCount),
                doctorCount: Number(params.doctorCount),
            });

            saveMafiaGame(game);
            setGameReady(true);
        } catch (error) {
            console.error('Could not generate Mafia game:', error);
            router.replace('/mafia/config');
        }
    }, []);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (state) => {
            if (state !== 'active') {
                flipProgress.stopAnimation();
                flipProgress.setValue(0);
                setRevealed(false);
                setIsAnimating(false);
            }
        });

        return () => subscription.remove();
    }, [flipProgress]);

    useEffect(() => {
        entranceProgress.setValue(0);
        Animated.spring(entranceProgress, {
            toValue: 1,
            speed: 16,
            bounciness: 5,
            useNativeDriver: true,
        }).start();
    }, [currentIndex, entranceProgress]);

    const game = getMafiaGame();

    if (!gameReady || !game) {
        return (
            <SafeAreaView style={styles.loading}>
                <StatusBar barStyle="dark-content" />
                <Text style={styles.loadingText}>Preparing your role cards...</Text>
            </SafeAreaView>
        );
    }

    const assignment = game.assignments[currentIndex];
    if (!assignment) {
        router.replace('/mafia/complete');
        return null;
    }

    const roleStyle = ROLE_STYLE[assignment.role];
    const isLastPlayer = currentIndex === game.assignments.length - 1;

    const backRotation = flipProgress.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });
    const frontRotation = flipProgress.interpolate({
        inputRange: [0, 1],
        outputRange: ['180deg', '360deg'],
    });
    const cardOpacity = entranceProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });
    const cardTranslateY = entranceProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [18, 0],
    });

    function handleReveal() {
        if (isAnimating || revealed) return;

        setIsAnimating(true);
        Animated.timing(flipProgress, {
            toValue: 1,
            duration: 680,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (finished) setRevealed(true);
            setIsAnimating(false);
        });
    }

    function handleNext() {
        if (isAnimating || !revealed) return;

        setIsAnimating(true);
        Animated.timing(flipProgress, {
            toValue: 0,
            duration: 360,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (!finished) {
                setIsAnimating(false);
                return;
            }

            setRevealed(false);
            setIsAnimating(false);

            if (isLastPlayer) {
                router.replace('/mafia/complete');
            } else {
                setCurrentIndex((previous) => previous + 1);
            }
        });
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.topBar}>
                    <Pressable onPress={() => router.back()} disabled={isAnimating} hitSlop={10}>
                        <Text style={styles.backText}>‹  Back</Text>
                    </Pressable>
                    <Text style={styles.stepText}>ROLE DEALING</Text>
                </View>

                <View style={styles.progressSection}>
                    <View style={styles.progressLabels}>
                        <Text style={styles.progressTitle}>Private role reveal</Text>
                        <Text style={styles.progressCount}>
                            {currentIndex + 1} / {game.totalPlayers}
                        </Text>
                    </View>
                    <View style={styles.progressTrack}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${((currentIndex + 1) / game.totalPlayers) * 100}%` },
                            ]}
                        />
                    </View>
                </View>

                <View style={styles.headingSection}>
                    <Text style={styles.eyebrow}>PASS THE PHONE</Text>
                    <Text style={styles.heading}>
                        It's your turn, <Text style={styles.headingName}>{assignment.playerName}.</Text>
                    </Text>
                    <Text style={styles.subtitle}>
                        Make sure nobody else is looking before revealing your role.
                    </Text>
                </View>

                <View style={styles.cardArea}>
                    <Animated.View
                        style={[
                            styles.cardShell,
                            { opacity: cardOpacity, transform: [{ translateY: cardTranslateY }] },
                        ]}
                    >
                        <Animated.View
                            pointerEvents={revealed ? 'none' : 'auto'}
                            style={[
                                styles.cardFace,
                                styles.hiddenCard,
                                {
                                    transform: [
                                        { perspective: 1000 },
                                        { rotateY: backRotation },
                                    ],
                                },
                            ]}
                        >
                            <View style={styles.cardDecoration}>
                                <Text style={styles.cardSymbol}>✳</Text>
                            </View>
                            <Text style={styles.hiddenCardTitle}>YOUR ROLE IS READY</Text>
                            <Text style={styles.hiddenCardSubtitle}>
                                Your role stays secret until you reveal it.
                            </Text>
                            <Pressable style={styles.revealButton} onPress={handleReveal} disabled={isAnimating}>
                                <Text style={styles.revealButtonText}>
                                    {isAnimating ? 'Revealing…' : 'Reveal my role'}
                                </Text>
                            </Pressable>
                        </Animated.View>

                        <Animated.View
                            pointerEvents={revealed ? 'auto' : 'none'}
                            style={[
                                styles.cardFace,
                                { backgroundColor: roleStyle.background, borderColor: roleStyle.border },
                                {
                                    transform: [
                                        { perspective: 1000 },
                                        { rotateY: frontRotation },
                                    ],
                                },
                            ]}
                        >
                            <Text style={[styles.roleEyebrow, { color: roleStyle.ink }]}>YOUR SECRET ROLE</Text>
                            <Text style={[styles.roleTitle, { color: roleStyle.ink }]}>{roleStyle.title}</Text>
                            <Text style={styles.roleDetail}>{roleStyle.detail}</Text>
                            <Text style={styles.secretNote}>Keep this information to yourself.</Text>
                            <Pressable style={styles.hideButton} onPress={handleNext} disabled={isAnimating || !revealed}>
                                <Text style={styles.hideButtonText}>
                                    {isLastPlayer ? 'Hide & finish' : 'Hide & pass phone'}
                                </Text>
                            </Pressable>
                        </Animated.View>
                    </Animated.View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerTitle}>
                        {revealed ? 'Remember your role.' : 'Keep your card private.'}
                    </Text>
                    <Text style={styles.footerSubtitle}>
                        {revealed
                            ? 'Hide your card before passing the phone.'
                            : 'Only the current player should reveal their role.'}
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: C.background },
    loading: { flex: 1, backgroundColor: C.background, alignItems: 'center', justifyContent: 'center' },
    loadingText: { color: C.muted, fontSize: 15 },
    container: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    backText: { color: C.ink, fontSize: 16, fontWeight: '600' },
    stepText: { color: C.muted, fontSize: 10, letterSpacing: 2, fontWeight: '700' },
    progressSection: { marginTop: 36 },
    progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    progressTitle: { fontSize: 13, color: C.ink, fontWeight: '600' },
    progressCount: { fontSize: 13, color: C.muted },
    progressTrack: { height: 5, borderRadius: 10, backgroundColor: C.border, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: C.purpleDark, borderRadius: 10 },
    headingSection: { marginTop: 42 },
    eyebrow: { color: C.purpleDark, fontSize: 11, letterSpacing: 2, fontWeight: '800', marginBottom: 12 },
    heading: { color: C.ink, fontSize: 32, lineHeight: 40, fontWeight: '700' },
    headingName: { color: C.purpleDark },
    subtitle: { color: C.muted, fontSize: 14, lineHeight: 22, marginTop: 12 },
    cardArea: { marginTop: 34 },
    cardShell: { height: 350, width: '100%' },
    cardFace: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 28,
        padding: 26,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        backfaceVisibility: 'hidden',
    },
    hiddenCard: { backgroundColor: C.surface, borderColor: C.border },
    cardDecoration: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: C.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
    },
    cardSymbol: { fontSize: 34, color: C.purpleDark },
    hiddenCardTitle: { color: C.ink, fontSize: 14, letterSpacing: 1.5, fontWeight: '800', textAlign: 'center' },
    hiddenCardSubtitle: { color: C.muted, fontSize: 13, textAlign: 'center', lineHeight: 20, marginTop: 10, marginBottom: 28 },
    revealButton: {
        backgroundColor: C.ink,
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 28,
        width: '100%',
        alignItems: 'center',
    },
    revealButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
    roleEyebrow: { fontSize: 10, letterSpacing: 2, fontWeight: '800', textAlign: 'center' },
    roleTitle: { fontSize: 37, fontWeight: '900', letterSpacing: 1, textAlign: 'center', marginTop: 18 },
    roleDetail: { color: C.ink, fontSize: 14, fontWeight: '600', marginTop: 12, textAlign: 'center' },
    secretNote: { color: C.muted, fontSize: 12, marginTop: 14, textAlign: 'center' },
    hideButton: {
        backgroundColor: C.ink,
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 20,
        width: '100%',
        alignItems: 'center',
        marginTop: 34,
    },
    hideButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
    footer: { marginTop: 30, alignItems: 'center' },
    footerTitle: { color: C.ink, fontSize: 13, fontWeight: '700' },
    footerSubtitle: { color: C.muted, fontSize: 12, marginTop: 6, textAlign: 'center' },
});

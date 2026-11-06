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

import { generateImpostorGame } from '../../engines/impostorEngine';
import {
    getImpostorGame,
    saveImpostorGame,
} from '../../engines/impostorSession';

import type {
    Player,
    ImpostorVariation,
} from '../../engines/impostorEngine';

const COLORS = {
    background: '#F5F4EF',
    surface: '#FFFFFF',
    ink: '#20211F',
    muted: '#73756D',
    border: '#E2E1D9',
    green: '#DDF0AA',
    greenDark: '#53633A',
    purple: '#DCD2F5',
};

export default function ImpostorDealScreen() {
    const router = useRouter();

    const params = useLocalSearchParams<{
        players?: string;
        category?: string;
        difficulty?: string;
        impostorCount?: string;
        variation?: string;
    }>();

    const [gameReady, setGameReady] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [revealed, setRevealed] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const flipProgress = useRef(new Animated.Value(0)).current;
    const entranceProgress = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        try {
            const existingGame = getImpostorGame();

            if (existingGame) {
                setGameReady(true);
                return;
            }

            if (
                !params.players ||
                !params.category ||
                !params.difficulty ||
                !params.impostorCount ||
                !params.variation
            ) {
                router.replace('/impostor/setup');
                return;
            }

            const players = JSON.parse(params.players) as Player[];

            const game = generateImpostorGame({
                players,
                category: params.category,
                difficulty: params.difficulty as 'easy' | 'medium' | 'hard',
                impostorCount: Number(params.impostorCount),
                variation: params.variation as ImpostorVariation,
            });

            saveImpostorGame(game);
            setGameReady(true);
        } catch (error) {
            console.error('Could not generate Impostor game:', error);
            router.replace('/impostor/setup');
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

    const game = getImpostorGame();

    if (!gameReady || !game) {
        return (
            <SafeAreaView style={styles.loading}>
                <StatusBar barStyle="dark-content" />
                <Text style={styles.loadingText}>Preparing your cards...</Text>
            </SafeAreaView>
        );
    }

    const assignment = game.assignments[currentIndex];
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
            if (finished) {
                setRevealed(true);
            }
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
                router.replace('/impostor/complete');
                return;
            }

            setCurrentIndex((previous) => previous + 1);
        });
    }

    function getSecretLabel() {
        return assignment.isImpostor
            ? 'YOU ARE THE IMPOSTOR'
            : 'YOUR SECRET WORD';
    }

    function getSecretContent() {
        if (assignment.hint) return assignment.hint;
        if (assignment.word) return assignment.word;
        return 'You have no word. Blend in carefully.';
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.topBar}>
                    <Pressable
                        onPress={() => router.back()}
                        disabled={isAnimating}
                        hitSlop={10}
                    >
                        <Text style={styles.backText}>‹  Back</Text>
                    </Pressable>
                    <Text style={styles.stepText}>CARD DEALING</Text>
                </View>

                <View style={styles.progressSection}>
                    <View style={styles.progressLabels}>
                        <Text style={styles.progressTitle}>Private reveal</Text>
                        <Text style={styles.progressCount}>
                            {currentIndex + 1} / {game.totalPlayers}
                        </Text>
                    </View>
                    <View style={styles.progressTrack}>
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${
                                        ((currentIndex + 1) / game.totalPlayers) * 100
                                    }%`,
                                },
                            ]}
                        />
                    </View>
                </View>

                <View style={styles.headingSection}>
                    <Text style={styles.eyebrow}>PASS THE PHONE</Text>
                    <Text style={styles.heading}>
                        It's your turn,{' '}
                        <Text style={styles.headingName}>
                            {assignment.playerName}.
                        </Text>
                    </Text>
                    <Text style={styles.subtitle}>
                        Make sure nobody else is looking before revealing your card.
                    </Text>
                </View>

                <View style={styles.cardArea}>
                    <Animated.View
                        style={[
                            styles.cardShell,
                            {
                                opacity: cardOpacity,
                                transform: [{ translateY: cardTranslateY }],
                            },
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
                            <Text style={styles.hiddenCardTitle}>YOUR CARD IS READY</Text>
                            <Text style={styles.hiddenCardSubtitle}>
                                Your secret is hidden until you reveal it.
                            </Text>
                            <Pressable
                                style={styles.revealButton}
                                onPress={handleReveal}
                                disabled={isAnimating}
                            >
                                <Text style={styles.revealButtonText}>
                                    {isAnimating ? 'Revealing…' : 'Reveal my card'}
                                </Text>
                            </Pressable>
                        </Animated.View>

                        <Animated.View
                            pointerEvents={revealed ? 'auto' : 'none'}
                            style={[
                                styles.cardFace,
                                assignment.isImpostor ? styles.impostorCard : styles.wordCard,
                                {
                                    transform: [
                                        { perspective: 1000 },
                                        { rotateY: frontRotation },
                                    ],
                                },
                            ]}
                        >
                            <Text style={styles.secretLabel}>{getSecretLabel()}</Text>
                            <Text style={styles.secretWord}>{getSecretContent()}</Text>
                            <Text style={styles.secretNote}>
                                Keep this information to yourself.
                            </Text>
                            <Pressable
                                style={styles.hideButton}
                                onPress={handleNext}
                                disabled={isAnimating || !revealed}
                            >
                                <Text style={styles.hideButtonText}>
                                    {isLastPlayer ? 'Hide & finish' : 'Hide & pass phone'}
                                </Text>
                            </Pressable>
                        </Animated.View>
                    </Animated.View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerTitle}>
                        {revealed ? 'Remember your secret.' : 'Keep your card private.'}
                    </Text>
                    <Text style={styles.footerSubtitle}>
                        {revealed
                            ? 'Hide your card before passing the phone.'
                            : 'Only the current player should reveal their card.'}
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loading: {
        flex: 1,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        color: COLORS.muted,
        fontSize: 15,
    },
    container: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 40,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backText: {
        color: COLORS.ink,
        fontSize: 16,
        fontWeight: '600',
    },
    stepText: {
        color: COLORS.muted,
        fontSize: 10,
        letterSpacing: 2,
        fontWeight: '700',
    },
    progressSection: {
        marginTop: 36,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    progressTitle: {
        fontSize: 13,
        color: COLORS.ink,
        fontWeight: '600',
    },
    progressCount: {
        fontSize: 13,
        color: COLORS.muted,
    },
    progressTrack: {
        height: 5,
        borderRadius: 10,
        backgroundColor: COLORS.border,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: COLORS.greenDark,
        borderRadius: 10,
    },
    headingSection: {
        marginTop: 42,
    },
    eyebrow: {
        color: COLORS.greenDark,
        fontSize: 11,
        letterSpacing: 2,
        fontWeight: '800',
        marginBottom: 12,
    },
    heading: {
        color: COLORS.ink,
        fontSize: 32,
        lineHeight: 40,
        fontWeight: '700',
    },
    headingName: {
        color: COLORS.greenDark,
    },
    subtitle: {
        color: COLORS.muted,
        fontSize: 14,
        lineHeight: 22,
        marginTop: 12,
    },
    cardArea: {
        marginTop: 34,
    },
    cardShell: {
        height: 350,
        width: '100%',
    },
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
        borderColor: COLORS.border,
        backfaceVisibility: 'hidden',
    },
    hiddenCard: {
        backgroundColor: COLORS.surface,
    },
    wordCard: {
        backgroundColor: COLORS.green,
        borderColor: '#C9DDA0',
    },
    impostorCard: {
        backgroundColor: COLORS.purple,
        borderColor: '#C8B9EA',
    },
    cardDecoration: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
    },
    cardSymbol: {
        fontSize: 34,
        color: COLORS.greenDark,
    },
    hiddenCardTitle: {
        color: COLORS.ink,
        fontSize: 14,
        letterSpacing: 1.5,
        fontWeight: '800',
        textAlign: 'center',
    },
    hiddenCardSubtitle: {
        color: COLORS.muted,
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 20,
        marginTop: 10,
        marginBottom: 28,
    },
    revealButton: {
        backgroundColor: COLORS.ink,
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 28,
        width: '100%',
        alignItems: 'center',
    },
    revealButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    secretLabel: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 2,
        color: COLORS.ink,
        textAlign: 'center',
    },
    secretWord: {
        fontSize: 34,
        fontWeight: '800',
        color: COLORS.ink,
        textAlign: 'center',
        marginTop: 28,
        lineHeight: 42,
    },
    secretNote: {
        color: COLORS.muted,
        fontSize: 12,
        marginTop: 16,
        textAlign: 'center',
    },
    hideButton: {
        backgroundColor: COLORS.ink,
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 20,
        width: '100%',
        alignItems: 'center',
        marginTop: 36,
    },
    hideButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    footer: {
        marginTop: 30,
        alignItems: 'center',
    },
    footerTitle: {
        color: COLORS.ink,
        fontSize: 13,
        fontWeight: '700',
    },
    footerSubtitle: {
        color: COLORS.muted,
        fontSize: 12,
        marginTop: 6,
        textAlign: 'center',
    },
});

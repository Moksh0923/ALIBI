
import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    Pressable,
    ScrollView,
    StyleSheet,
    StatusBar,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
    loadImpostorPreferences,
    saveImpostorPreferences,
} from '../../utils/impostorConfigStorage';

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

const CATEGORIES = [
    { id: 'food', label: 'Food', icon: '◈' },
    { id: 'places', label: 'Places', icon: '⌖' },
    { id: 'animals', label: 'Animals', icon: '♧' },
    { id: 'objects', label: 'Objects', icon: '◇' },
    { id: 'movies', label: 'Movies', icon: '▣' },
];

const DIFFICULTIES = [
    { id: 'easy', label: 'Easy', description: 'Familiar words' },
    { id: 'medium', label: 'Medium', description: 'A little tricky' },
    { id: 'hard', label: 'Hard', description: 'Think carefully' },
] as const;

const VARIATIONS = [
    {
        id: 'different-word',
        title: 'Different word',
        description: 'Impostors receive a related word.',
    },
    {
        id: 'no-word',
        title: 'No word',
        description: 'Impostors receive no word.',
    },
    {
        id: 'hint-only',
        title: 'Hint only',
        description: 'Impostors receive a subtle hint.',
    },
] as const;

type Difficulty = 'easy' | 'medium' | 'hard';
type Variation = 'different-word' | 'no-word' | 'hint-only';

interface Player {
    id: number;
    name: string;
}

export default function ImpostorConfigScreen() {
    const router = useRouter();

    const params = useLocalSearchParams<{ players?: string }>();

    const players: Player[] = useMemo(() => {
        try {
            const parsed = JSON.parse(params.players ?? '[]');
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }, [params.players]);

    const [selectedCategory, setSelectedCategory] = useState('food');
    const [difficulty, setDifficulty] = useState<Difficulty>('medium');
    const [impostorCount, setImpostorCount] = useState(1);
    const [variation, setVariation] =
        useState<Variation>('different-word');

    const [preferencesLoaded, setPreferencesLoaded] = useState(false);

    const maximumImpostors = Math.max(1, players.length - 1);

    // Restore the previous configuration.
    useEffect(() => {
        let isMounted = true;

        const restorePreferences = async () => {
            const saved = await loadImpostorPreferences();

            if (!isMounted) return;

            setSelectedCategory(saved.category);
            setDifficulty(saved.difficulty);
            setVariation(saved.variation);

            // Never restore more impostors than the current group allows.
            setImpostorCount(
                Math.min(saved.impostorCount, maximumImpostors)
            );

            setPreferencesLoaded(true);
        };

        restorePreferences();

        return () => {
            isMounted = false;
        };
    }, [maximumImpostors]);

    const changeImpostorCount = (amount: number) => {
        setImpostorCount(current =>
            Math.max(1, Math.min(maximumImpostors, current + amount))
        );
    };

    const dealCards = async () => {
        if (!preferencesLoaded) return;

        if (players.length < 3) {
            Alert.alert(
                'Players missing',
                'Please return and add at least three players.'
            );
            return;
        }

        const preferences = {
            category: selectedCategory,
            difficulty,
            impostorCount,
            variation,
        };

        // Save the current choices for the next round.
        await saveImpostorPreferences(preferences);

        router.push({
            pathname: '/impostor/deal',
            params: {
                players: JSON.stringify(players),
                category: selectedCategory,
                difficulty,
                impostorCount: String(impostorCount),
                variation,
            },
        });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor={C.background}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.container}
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
                        IMPOSTOR  /  02 OF 03
                    </Text>
                </View>

                {/* Heading */}
                <View style={styles.heading}>
                    <Text style={styles.title}>Set the secret.</Text>
                    <Text style={styles.subtitle}>
                        Choose how the round is dealt.
                    </Text>
                </View>

                {/* Category */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>WORD CATEGORY</Text>

                    <View style={styles.categoryGrid}>
                        {CATEGORIES.map(category => {
                            const selected = selectedCategory === category.id;

                            return (
                                <Pressable
                                    key={category.id}
                                    onPress={() => setSelectedCategory(category.id)}
                                    style={[
                                        styles.categoryChip,
                                        selected && styles.categorySelected,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.categoryIcon,
                                            selected && styles.selectedText,
                                        ]}
                                    >
                                        {category.icon}
                                    </Text>

                                    <Text
                                        style={[
                                            styles.categoryText,
                                            selected && styles.selectedText,
                                        ]}
                                    >
                                        {category.label}
                                    </Text>

                                    {selected && (
                                        <Text style={styles.checkMark}>✓</Text>
                                    )}
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                {/* Difficulty */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>DIFFICULTY</Text>

                    <View style={styles.difficultyRow}>
                        {DIFFICULTIES.map(item => {
                            const selected = difficulty === item.id;

                            return (
                                <Pressable
                                    key={item.id}
                                    onPress={() => setDifficulty(item.id)}
                                    style={[
                                        styles.difficultyCard,
                                        selected && styles.difficultySelected,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.difficultyTitle,
                                            selected && styles.selectedText,
                                        ]}
                                    >
                                        {item.label}
                                    </Text>

                                    <Text
                                        style={[
                                            styles.difficultyDescription,
                                            selected && styles.selectedMutedText,
                                        ]}
                                    >
                                        {item.description}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                {/* Impostor count */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionLabel}>
                            NUMBER OF IMPOSTORS
                        </Text>

                        <Text style={styles.playerMeta}>
                            {players.length} PLAYERS
                        </Text>
                    </View>

                    <View style={styles.counterCard}>
                        <Pressable
                            onPress={() => changeImpostorCount(-1)}
                            disabled={impostorCount <= 1}
                            style={[
                                styles.counterButton,
                                impostorCount <= 1 && styles.disabledButton,
                            ]}
                        >
                            <Text style={styles.counterSymbol}>−</Text>
                        </Pressable>

                        <View style={styles.counterValue}>
                            <Text style={styles.counterNumber}>
                                {impostorCount}
                            </Text>
                            <Text style={styles.counterCaption}>
                                IMPOSTOR{impostorCount > 1 ? 'S' : ''}
                            </Text>
                        </View>

                        <Pressable
                            onPress={() => changeImpostorCount(1)}
                            disabled={impostorCount >= maximumImpostors}
                            style={[
                                styles.counterButton,
                                impostorCount >= maximumImpostors &&
                                styles.disabledButton,
                            ]}
                        >
                            <Text style={styles.counterSymbol}>+</Text>
                        </Pressable>
                    </View>

                    <Text style={styles.helperText}>
                        Maximum {maximumImpostors} impostors for this group.
                    </Text>
                </View>

                {/* Variation */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>IMPOSTOR'S CLUE</Text>

                    <View style={styles.variationList}>
                        {VARIATIONS.map(item => {
                            const selected = variation === item.id;

                            return (
                                <Pressable
                                    key={item.id}
                                    onPress={() => setVariation(item.id)}
                                    style={[
                                        styles.variationCard,
                                        selected && styles.variationSelected,
                                    ]}
                                >
                                    <View style={styles.variationInfo}>
                                        <Text style={styles.variationTitle}>
                                            {item.title}
                                        </Text>

                                        <Text style={styles.variationDescription}>
                                            {item.description}
                                        </Text>
                                    </View>

                                    <View
                                        style={[
                                            styles.radio,
                                            selected && styles.radioSelected,
                                        ]}
                                    >
                                        {selected && <View style={styles.radioDot} />}
                                    </View>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                {/* Summary */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>ROUND SUMMARY</Text>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryText}>Players</Text>
                        <Text style={styles.summaryValue}>{players.length}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryText}>Impostors</Text>
                        <Text style={styles.summaryValue}>{impostorCount}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryText}>Word holders</Text>
                        <Text style={styles.summaryValue}>
                            {players.length - impostorCount}
                        </Text>
                    </View>
                </View>

                {/* Deal */}
                <Pressable
                    onPress={dealCards}
                    disabled={!preferencesLoaded}
                    style={({ pressed }) => [
                        styles.continueButton,
                        pressed && styles.buttonPressed,
                        !preferencesLoaded && styles.loadingButton,
                    ]}
                >
                    <Text style={styles.continueText}>
                        {preferencesLoaded ? 'Deal cards' : 'Loading settings...'}
                    </Text>
                    <Text style={styles.continueArrow}>→</Text>
                </Pressable>

                <Text style={styles.footer}>
                    CHECK YOUR SETTINGS BEFORE DEALING
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: C.background,
    },

    container: {
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 40,
    },

    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 38,
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
        marginBottom: 38,
    },

    title: {
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: -1,
        color: C.ink,
    },

    subtitle: {
        fontSize: 14,
        color: C.muted,
        marginTop: 7,
    },

    section: {
        marginBottom: 30,
    },

    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    sectionLabel: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.6,
        color: C.muted,
        marginBottom: 14,
    },

    playerMeta: {
        fontSize: 10,
        color: C.muted,
        fontWeight: '700',
        marginBottom: 14,
    },

    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 9,
    },

    categoryChip: {
        minHeight: 43,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        paddingHorizontal: 13,
        borderRadius: 22,
        backgroundColor: C.surface,
        borderWidth: 1,
        borderColor: C.border,
    },

    categorySelected: {
        backgroundColor: C.accent,
        borderColor: C.accent,
    },

    categoryIcon: {
        fontSize: 14,
        color: C.muted,
    },

    categoryText: {
        fontSize: 12,
        fontWeight: '600',
        color: C.muted,
    },

    selectedText: {
        color: C.accentDark,
    },

    checkMark: {
        fontSize: 12,
        color: C.accentDark,
        fontWeight: '800',
    },

    difficultyRow: {
        flexDirection: 'row',
        gap: 9,
    },

    difficultyCard: {
        flex: 1,
        minHeight: 74,
        justifyContent: 'center',
        paddingHorizontal: 10,
        paddingVertical: 12,
        borderRadius: 15,
        backgroundColor: C.surface,
        borderWidth: 1,
        borderColor: C.border,
    },

    difficultySelected: {
        backgroundColor: C.ink,
        borderColor: C.ink,
    },

    difficultyTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: C.ink,
        marginBottom: 5,
    },

    difficultyDescription: {
        fontSize: 9,
        color: C.muted,
    },

    selectedMutedText: {
        color: '#D0D0C8',
    },

    counterCard: {
        height: 66,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: C.border,
        backgroundColor: C.surface,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 13,
    },

    counterButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: C.soft,
        alignItems: 'center',
        justifyContent: 'center',
    },

    disabledButton: {
        opacity: 0.35,
    },

    counterSymbol: {
        fontSize: 23,
        color: C.ink,
        fontWeight: '500',
    },

    counterValue: {
        alignItems: 'center',
    },

    counterNumber: {
        fontSize: 21,
        color: C.ink,
        fontWeight: '800',
    },

    counterCaption: {
        fontSize: 8,
        color: C.muted,
        fontWeight: '800',
        letterSpacing: 0.5,
    },

    helperText: {
        fontSize: 10,
        color: C.muted,
        marginTop: 9,
    },

    variationList: {
        gap: 9,
    },

    variationCard: {
        minHeight: 62,
        borderRadius: 14,
        backgroundColor: C.surface,
        borderWidth: 1,
        borderColor: C.border,
        paddingHorizontal: 15,
        paddingVertical: 11,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    variationSelected: {
        backgroundColor: '#EDF3E2',
        borderColor: '#C6D8A7',
    },

    variationInfo: {
        flex: 1,
        paddingRight: 12,
    },

    variationTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: C.ink,
    },

    variationDescription: {
        fontSize: 10,
        color: C.muted,
        marginTop: 4,
    },

    radio: {
        width: 21,
        height: 21,
        borderRadius: 11,
        borderWidth: 1.5,
        borderColor: '#B9B9AF',
        alignItems: 'center',
        justifyContent: 'center',
    },

    radioSelected: {
        borderColor: '#7F965B',
    },

    radioDot: {
        width: 11,
        height: 11,
        borderRadius: 6,
        backgroundColor: '#7F965B',
    },

    summaryCard: {
        padding: 17,
        borderRadius: 17,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: C.border,
        marginBottom: 22,
    },

    summaryLabel: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.6,
        color: C.muted,
        marginBottom: 13,
    },

    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 9,
    },

    summaryText: {
        fontSize: 12,
        color: C.muted,
    },

    summaryValue: {
        fontSize: 12,
        color: C.ink,
        fontWeight: '800',
    },

    continueButton: {
        height: 57,
        backgroundColor: C.ink,
        borderRadius: 17,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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

    buttonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.99 }],
    },

    loadingButton: {
        opacity: 0.6,
    },

    footer: {
        fontSize: 9,
        color: C.muted,
        fontWeight: '800',
        textAlign: 'center',
        letterSpacing: 0.5,
        marginTop: 17,
    },
});

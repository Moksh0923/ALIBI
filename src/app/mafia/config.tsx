import { useEffect, useMemo, useState } from 'react';
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
    DEFAULT_MAFIA_PREFERENCES,
    loadMafiaPreferences,
    saveMafiaPreferences,
} from '../../utils/mafiaConfigStorage';

import type { MafiaPreferences } from '../../utils/mafiaConfigStorage';
import type { Player } from '../../engines/impostorEngine';

const C = {
    background: '#F5F4EF',
    surface: '#FFFFFF',
    ink: '#20211F',
    muted: '#73756D',
    border: '#E2E1D9',
    soft: '#EAE9E2',
    green: '#DDF0AA',
    greenDark: '#53633A',
    purple: '#DCD2F5',
    purpleDark: '#65558D',
    blue: '#D9E8F1',
    blueDark: '#47677A',
    danger: '#B65D55',
};

type CountKey = keyof MafiaPreferences;

export default function MafiaConfigScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ players?: string }>();

    const [preferences, setPreferences] = useState<MafiaPreferences>(
        DEFAULT_MAFIA_PREFERENCES
    );
    const [players, setPlayers] = useState<Player[]>([]);
    const [ready, setReady] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;

        async function load() {
            try {
                if (!params.players) {
                    router.replace('/mafia/setup');
                    return;
                }

                const parsedPlayers = JSON.parse(params.players) as Player[];
                const savedPreferences = await loadMafiaPreferences();

                if (!mounted) return;

                setPlayers(parsedPlayers);
                setPreferences(savedPreferences);
                setReady(true);
            } catch (loadError) {
                console.error('Could not load Mafia setup:', loadError);
                router.replace('/mafia/setup');
            }
        }

        load();

        return () => {
            mounted = false;
        };
    }, []);

    const specialRoleTotal = useMemo(
        () =>
            preferences.mafiaCount +
            preferences.godCount +
            preferences.policeCount +
            preferences.doctorCount,
        [preferences]
    );

    const citizenCount = players.length - specialRoleTotal;
    const canDeal = ready && players.length >= 3 && citizenCount >= 1;

    function updateCount(key: CountKey, delta: number) {
        setPreferences((current) => {
            const minimum = key === 'mafiaCount' || key === 'godCount' ? 1 : 0;
            const nextValue = Math.max(minimum, current[key] + delta);
            const otherTotal =
                current.mafiaCount +
                current.godCount +
                current.policeCount +
                current.doctorCount -
                current[key];

            if (nextValue + otherTotal > players.length - 1) {
                return current;
            }

            return { ...current, [key]: nextValue };
        });
        setError('');
    }

    function toggleOptionalRole(key: 'policeCount' | 'doctorCount') {
        setPreferences((current) => {
            if (current[key] > 0) {
                return { ...current, [key]: 0 };
            }

            const otherTotal =
                current.mafiaCount +
                current.godCount +
                current.policeCount +
                current.doctorCount;

            if (otherTotal + 1 > players.length - 1) return current;

            return { ...current, [key]: 1 };
        });
        setError('');
    }

    async function handleDealCards() {
        if (specialRoleTotal >= players.length) {
            setError('At least one player must remain a Citizen.');
            return;
        }

        if (preferences.mafiaCount < 1 || preferences.godCount < 1) {
            setError('At least one Mafia and one God role are required.');
            return;
        }

        await saveMafiaPreferences(preferences);

        router.push({
            pathname: '/mafia/deal',
            params: {
                players: JSON.stringify(players),
                mafiaCount: String(preferences.mafiaCount),
                godCount: String(preferences.godCount),
                policeCount: String(preferences.policeCount),
                doctorCount: String(preferences.doctorCount),
            },
        });
    }

    function CountControl({
        label,
        description,
        value,
        accent,
        onMinus,
        onPlus,
        minimum,
    }: {
        label: string;
        description: string;
        value: number;
        accent: string;
        onMinus: () => void;
        onPlus: () => void;
        minimum: number;
    }) {
        const canAdd = specialRoleTotal < players.length - 1;

        return (
            <View style={styles.roleRow}>
                <View style={styles.roleInfo}>
                    <View style={[styles.roleDot, { backgroundColor: accent }]} />
                    <View style={styles.roleTextWrap}>
                        <Text style={styles.roleName}>{label}</Text>
                        <Text style={styles.roleDescription}>{description}</Text>
                    </View>
                </View>
                <View style={styles.counter}>
                    <Pressable
                        style={[styles.counterButton, value <= minimum && styles.counterDisabled]}
                        onPress={onMinus}
                        disabled={value <= minimum}
                    >
                        <Text style={styles.counterSymbol}>−</Text>
                    </Pressable>
                    <Text style={styles.counterValue}>{value}</Text>
                    <Pressable
                        style={[styles.counterButton, !canAdd && styles.counterDisabled]}
                        onPress={onPlus}
                        disabled={!canAdd}
                    >
                        <Text style={styles.counterSymbol}>＋</Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    function OptionalRole({
        label,
        description,
        value,
        accent,
        onToggle,
        onMinus,
        onPlus,
    }: {
        label: string;
        description: string;
        value: number;
        accent: string;
        onToggle: () => void;
        onMinus: () => void;
        onPlus: () => void;
    }) {
        const enabled = value > 0;

        return (
            <View style={styles.optionalCard}>
                <View style={styles.optionalTop}>
                    <View style={styles.roleInfo}>
                        <View style={[styles.roleDot, { backgroundColor: accent }]} />
                        <View style={styles.roleTextWrap}>
                            <Text style={styles.roleName}>{label}</Text>
                            <Text style={styles.roleDescription}>{description}</Text>
                        </View>
                    </View>
                    <Pressable
                        onPress={onToggle}
                        style={[styles.toggle, enabled && styles.toggleActive]}
                        accessibilityRole="switch"
                        accessibilityState={{ checked: enabled }}
                    >
                        <View style={[styles.toggleKnob, enabled && styles.toggleKnobActive]} />
                    </Pressable>
                </View>
                {enabled && (
                    <View style={styles.optionalCounter}>
                        <Text style={styles.optionalCountLabel}>NUMBER OF CARDS</Text>
                        <View style={styles.counter}>
                            <Pressable
                                style={[styles.counterButton, value <= 1 && styles.counterDisabled]}
                                onPress={onMinus}
                                disabled={value <= 1}
                            >
                                <Text style={styles.counterSymbol}>−</Text>
                            </Pressable>
                            <Text style={styles.counterValue}>{value}</Text>
                            <Pressable
                                style={[
                                    styles.counterButton,
                                    specialRoleTotal >= players.length - 1 && styles.counterDisabled,
                                ]}
                                onPress={onPlus}
                                disabled={specialRoleTotal >= players.length - 1}
                            >
                                <Text style={styles.counterSymbol}>＋</Text>
                            </Pressable>
                        </View>
                    </View>
                )}
            </View>
        );
    }

    if (!ready) {
        return (
            <SafeAreaView style={styles.loading}>
                <StatusBar barStyle="dark-content" />
                <Text style={styles.loadingText}>Preparing roles...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.topBar}>
                    <Pressable onPress={() => router.back()} hitSlop={10}>
                        <Text style={styles.backText}>‹  Back</Text>
                    </Pressable>
                    <Text style={styles.stepText}>MAFIA  /  02 OF 04</Text>
                </View>

                <View style={styles.heading}>
                    <Text style={styles.eyebrow}>SET UP YOUR ROUND</Text>
                    <Text style={styles.title}>Choose the roles.</Text>
                    <Text style={styles.subtitle}>
                        Decide how many special roles will be in this game.
                    </Text>
                </View>

                <View style={styles.summaryCard}>
                    <View>
                        <Text style={styles.summaryLabel}>PLAYERS</Text>
                        <Text style={styles.summaryNumber}>{players.length}</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View>
                        <Text style={styles.summaryLabel}>CITIZENS</Text>
                        <Text style={[styles.summaryNumber, citizenCount < 1 && styles.invalidNumber]}>
                            {Math.max(0, citizenCount)}
                        </Text>
                    </View>
                </View>

                <Text style={styles.sectionLabel}>REQUIRED ROLES</Text>
                <View style={styles.rolesCard}>
                    <CountControl
                        label="Mafia"
                        description="The secret opposing team"
                        value={preferences.mafiaCount}
                        accent={C.purpleDark}
                        minimum={1}
                        onMinus={() => updateCount('mafiaCount', -1)}
                        onPlus={() => updateCount('mafiaCount', 1)}
                    />
                    <View style={styles.separator} />
                    <CountControl
                        label="God"
                        description="Receives the God role card"
                        value={preferences.godCount}
                        accent="#B08B52"
                        minimum={1}
                        onMinus={() => updateCount('godCount', -1)}
                        onPlus={() => updateCount('godCount', 1)}
                    />
                </View>

                <Text style={[styles.sectionLabel, styles.optionalHeading]}>
                    OPTIONAL ROLES
                </Text>
                <View style={styles.optionalStack}>
                    <OptionalRole
                        label="Police"
                        description="Include Police role cards"
                        value={preferences.policeCount}
                        accent={C.blueDark}
                        onToggle={() => toggleOptionalRole('policeCount')}
                        onMinus={() => updateCount('policeCount', -1)}
                        onPlus={() => updateCount('policeCount', 1)}
                    />
                    <OptionalRole
                        label="Doctor"
                        description="Include Doctor role cards"
                        value={preferences.doctorCount}
                        accent={C.greenDark}
                        onToggle={() => toggleOptionalRole('doctorCount')}
                        onMinus={() => updateCount('doctorCount', -1)}
                        onPlus={() => updateCount('doctorCount', 1)}
                    />
                </View>

                {citizenCount < 1 && (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorText}>
                            Reduce the special roles to leave at least one Citizen.
                        </Text>
                    </View>
                )}
                {!!error && (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                <Pressable
                    style={[styles.primaryButton, !canDeal && styles.buttonDisabled]}
                    onPress={handleDealCards}
                    disabled={!canDeal}
                >
                    <Text style={styles.primaryButtonText}>Deal the cards</Text>
                    <Text style={styles.primaryArrow}>→</Text>
                </Pressable>
                <Text style={styles.footerText}>
                    ROLE ASSIGNMENTS ARE RANDOMISED FOR EVERY ROUND
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: C.background },
    loading: {
        flex: 1,
        backgroundColor: C.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: { color: C.muted, fontSize: 14 },
    container: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 14, paddingBottom: 36 },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 35,
    },
    backText: { color: C.ink, fontSize: 16, fontWeight: '600' },
    stepText: { color: C.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
    heading: { marginBottom: 24 },
    eyebrow: {
        color: C.greenDark,
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.8,
        marginBottom: 10,
    },
    title: { color: C.ink, fontSize: 32, fontWeight: '800', letterSpacing: -1 },
    subtitle: { color: C.muted, fontSize: 14, lineHeight: 21, marginTop: 8 },
    summaryCard: {
        backgroundColor: C.soft,
        borderRadius: 18,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: 28,
    },
    summaryLabel: { color: C.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1.4 },
    summaryNumber: { color: C.ink, fontSize: 25, fontWeight: '800', marginTop: 5 },
    invalidNumber: { color: C.danger },
    summaryDivider: { width: 1, height: 36, backgroundColor: C.border },
    sectionLabel: {
        color: C.muted,
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.5,
        marginBottom: 11,
    },
    rolesCard: {
        backgroundColor: C.surface,
        borderRadius: 19,
        borderWidth: 1,
        borderColor: C.border,
        paddingHorizontal: 16,
    },
    roleRow: {
        minHeight: 82,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },
    roleInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 11 },
    roleDot: { width: 11, height: 11, borderRadius: 6 },
    roleTextWrap: { flex: 1 },
    roleName: { color: C.ink, fontSize: 15, fontWeight: '800' },
    roleDescription: { color: C.muted, fontSize: 11, marginTop: 4 },
    separator: { height: 1, backgroundColor: C.border },
    counter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    counterButton: {
        width: 32,
        height: 32,
        borderRadius: 11,
        backgroundColor: C.soft,
        alignItems: 'center',
        justifyContent: 'center',
    },
    counterDisabled: { opacity: 0.35 },
    counterSymbol: { color: C.ink, fontSize: 19, lineHeight: 22, fontWeight: '500' },
    counterValue: { color: C.ink, fontSize: 17, fontWeight: '800', minWidth: 18, textAlign: 'center' },
    optionalHeading: { marginTop: 26 },
    optionalStack: { gap: 10 },
    optionalCard: {
        backgroundColor: C.surface,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: C.border,
        paddingHorizontal: 16,
        paddingVertical: 15,
    },
    optionalTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    toggle: {
        width: 46,
        height: 27,
        borderRadius: 14,
        backgroundColor: C.soft,
        justifyContent: 'center',
        padding: 3,
    },
    toggleActive: { backgroundColor: C.greenDark },
    toggleKnob: {
        width: 21,
        height: 21,
        borderRadius: 11,
        backgroundColor: C.surface,
        alignSelf: 'flex-start',
    },
    toggleKnobActive: { alignSelf: 'flex-end' },
    optionalCounter: {
        marginTop: 15,
        paddingTop: 13,
        borderTopWidth: 1,
        borderTopColor: C.border,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    optionalCountLabel: { color: C.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
    errorBox: {
        backgroundColor: '#F7E9E6',
        padding: 12,
        borderRadius: 12,
        marginTop: 16,
    },
    errorText: { color: C.danger, fontSize: 12, fontWeight: '600' },
    primaryButton: {
        height: 56,
        borderRadius: 17,
        backgroundColor: C.ink,
        marginTop: 28,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    buttonDisabled: { opacity: 0.35 },
    primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
    primaryArrow: { color: '#FFFFFF', fontSize: 21 },
    footerText: {
        color: C.muted,
        textAlign: 'center',
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 0.65,
        marginTop: 16,
    },
});

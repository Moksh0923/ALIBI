import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useRouter } from 'expo-router';

const C = {
    background: '#F5F4EF',
    surface: '#FFFFFF',
    soft: '#EAE9E2',
    ink: '#20211F',
    muted: '#73756D',
    border: '#E2E1D9',
    green: '#DDF0AA',
    greenDark: '#53633A',
    purple: '#DCD2F5',
    purpleDark: '#65558D',
};

export default function SettingsScreen() {
    const router = useRouter();

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
                        hitSlop={10}
                        style={styles.backButton}
                    >
                        <Text style={styles.backIcon}>‹</Text>
                    </Pressable>
                    <Text style={styles.topLabel}>ALIBI  /  ABOUT</Text>
                </View>

                <View style={styles.heading}>
                    <Text style={styles.eyebrow}>THE GAME NIGHT COMPANION</Text>
                    <Text style={styles.title}>A little mystery.</Text>
                    <Text style={styles.title}>A lot of suspicion.</Text>
                    <Text style={styles.subtitle}>
                        ALIBI helps your group set up a game, secretly deal words
                        and roles, and get everyone ready to play using one phone.
                    </Text>
                </View>

                <View style={styles.aboutCard}>
                    <View style={styles.aboutMark}>
                        <Text style={styles.aboutMarkText}>A</Text>
                    </View>
                    <View style={styles.aboutCopy}>
                        <Text style={styles.aboutTitle}>ABOUT ALIBI</Text>
                        <Text style={styles.aboutText}>
                            No accounts or extra devices needed around the group.
                            ALIBI handles setup and private card distribution.
                            The players take it from there.
                        </Text>
                    </View>
                </View>

                <View style={styles.sectionHeading}>
                    <Text style={styles.sectionLabel}>THE GAMES</Text>
                    <Text style={styles.sectionHint}>Two ways to keep everyone guessing.</Text>
                </View>

                <View style={styles.gameCard}>
                    <View style={styles.gameCardTop}>
                        <View style={[styles.gameSymbol, styles.impostorSymbol]}>
                            <Text style={[styles.gameSymbolText, { color: C.greenDark }]}>?</Text>
                        </View>
                        <View style={styles.gameTag}>
                            <Text style={[styles.gameTagText, { color: C.greenDark }]}>WORD & DECEPTION</Text>
                        </View>
                    </View>

                    <Text style={styles.gameTitle}>Impostor</Text>
                    <Text style={styles.gameTagline}>One word. One hidden impostor.</Text>
                    <Text style={styles.gameDescription}>
                        Everyone receives a secret word, while the impostor may
                        receive a related word, a hint, or no word at all depending
                        on the chosen variation. After the cards are dealt, your
                        group discusses and votes. ALIBI reveals who was assigned
                        the impostor role when you're ready.
                    </Text>
                </View>

                <View style={styles.gameCard}>
                    <View style={styles.gameCardTop}>
                        <View style={[styles.gameSymbol, styles.mafiaSymbol]}>
                            <Text style={[styles.gameSymbolText, { color: C.purpleDark }]}>✦</Text>
                        </View>
                        <View style={styles.gameTag}>
                            <Text style={[styles.gameTagText, { color: C.purpleDark }]}>HIDDEN ROLES</Text>
                        </View>
                    </View>

                    <Text style={styles.gameTitle}>Mafia</Text>
                    <Text style={styles.gameTagline}>A town full of secrets.</Text>
                    <Text style={styles.gameDescription}>
                        ALIBI randomly deals Mafia, God, Police, Doctor and Citizen
                        role cards according to your setup. Every player privately
                        checks their role, then the special-role assignments can
                        be revealed together. God is a player role, just like the
                        others.
                    </Text>
                </View>

                <View style={styles.noteCard}>
                    <Text style={styles.noteTitle}>YOU RUN THE GAME</Text>
                    <Text style={styles.noteText}>
                        ALIBI takes care of setup, secret assignments and reveals.
                        Your group handles the conversation, discussion, voting,
                        game phases and final decisions.
                    </Text>
                </View>

                <Text style={styles.footer}>
                    MADE FOR FRIENDS, GAME NIGHTS AND A LITTLE FRIENDLY DOUBT.
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
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 38,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
    },
    backButton: {
        width: 34,
        height: 34,
        justifyContent: 'center',
    },
    backIcon: {
        color: C.ink,
        fontSize: 34,
        lineHeight: 36,
        fontWeight: '300',
    },
    topLabel: {
        marginLeft: 10,
        color: C.muted,
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
    heading: {
        marginBottom: 25,
    },
    eyebrow: {
        color: C.greenDark,
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.6,
        marginBottom: 11,
    },
    title: {
        color: C.ink,
        fontSize: 33,
        lineHeight: 39,
        fontWeight: '800',
        letterSpacing: -1,
    },
    subtitle: {
        color: C.muted,
        fontSize: 14,
        lineHeight: 22,
        marginTop: 13,
    },
    aboutCard: {
        backgroundColor: C.soft,
        borderRadius: 19,
        padding: 17,
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 31,
    },
    aboutMark: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: C.green,
        alignItems: 'center',
        justifyContent: 'center',
    },
    aboutMarkText: {
        color: C.greenDark,
        fontSize: 21,
        fontWeight: '900',
    },
    aboutCopy: {
        flex: 1,
        marginLeft: 13,
    },
    aboutTitle: {
        color: C.ink,
        fontSize: 11,
        letterSpacing: 1.2,
        fontWeight: '900',
        marginBottom: 6,
    },
    aboutText: {
        color: C.muted,
        fontSize: 12,
        lineHeight: 19,
    },
    sectionHeading: {
        marginBottom: 13,
    },
    sectionLabel: {
        color: C.muted,
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1.6,
    },
    sectionHint: {
        color: C.muted,
        fontSize: 12,
        marginTop: 5,
    },
    gameCard: {
        backgroundColor: C.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: C.border,
        padding: 18,
        marginBottom: 12,
    },
    gameCardTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    gameSymbol: {
        width: 43,
        height: 43,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    impostorSymbol: {
        backgroundColor: C.green,
    },
    mafiaSymbol: {
        backgroundColor: C.purple,
    },
    gameSymbolText: {
        fontSize: 24,
        fontWeight: '800',
    },
    gameTag: {
        backgroundColor: C.background,
        borderRadius: 20,
        paddingVertical: 7,
        paddingHorizontal: 10,
    },
    gameTagText: {
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 0.8,
    },
    gameTitle: {
        color: C.ink,
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: -0.4,
    },
    gameTagline: {
        color: C.ink,
        fontSize: 13,
        fontWeight: '700',
        marginTop: 5,
    },
    gameDescription: {
        color: C.muted,
        fontSize: 12,
        lineHeight: 19,
        marginTop: 9,
    },
    noteCard: {
        backgroundColor: C.purple,
        borderRadius: 18,
        padding: 17,
        marginTop: 8,
    },
    noteTitle: {
        color: C.purpleDark,
        fontSize: 10,
        letterSpacing: 1.4,
        fontWeight: '900',
        marginBottom: 7,
    },
    noteText: {
        color: C.ink,
        fontSize: 12,
        lineHeight: 19,
    },
    footer: {
        color: C.muted,
        fontSize: 9,
        lineHeight: 15,
        fontWeight: '800',
        letterSpacing: 0.8,
        textAlign: 'center',
        marginTop: 25,
    },
});


import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const COLORS = {
  background: '#F5F4EF',
  ink: '#20211F',
  muted: '#73756D',
  border: '#E2E1D9',
  impostor: '#E2EDCF',
  impostorDark: '#B7CC92',
  impostorAccent: '#8EA96A',
  mafia: '#E7DFF3',
  mafiaDark: '#BCA9DF',
  mafiaAccent: '#8F7AB8',
};

function ImpostorArtwork() {
  return (
      <View style={styles.artwork}>
        <View style={styles.impostorHalo} />
        <View style={styles.impostorOrbit} />

        <View style={[styles.playingCard, styles.cardBack]} />
        <View style={[styles.playingCard, styles.cardMiddle]} />

        <View style={[styles.playingCard, styles.cardFront]}>
          <View style={styles.cardInset}>
            <View style={styles.cardDiamond} />
            <View style={styles.cardLine} />
            <View style={styles.cardShortLine} />
          </View>
        </View>
      </View>
  );
}

function MafiaArtwork() {
  return (
      <View style={styles.artwork}>
        <View style={styles.mafiaHalo} />
        <View style={styles.mafiaOrbit}>
          <View style={styles.mafiaInnerCircle}>
            <View style={styles.mafiaMoon} />
            <View style={styles.mafiaMoonCutout} />
          </View>
        </View>
        <View style={styles.mafiaDot} />
      </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();

  return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.container}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>alibi</Text>

            <Pressable
                style={({ pressed }) => [
                  styles.settingsButton,
                  pressed && styles.pressed,
                ]}
                onPress={() => router.push('/settings' as never)}
            >
              <Text style={styles.settingsText}>SETTINGS</Text>
            </Pressable>
          </View>

          {/* Hero */}
          <View style={styles.hero}>
            <Text style={styles.eyebrow}>
              THE GROUP CHAT, BUT IRL
            </Text>

            <Text style={styles.heroTitle}>
              Everyone has{' '}
              <Text style={styles.heroSecondLine}>a secret.</Text>
            </Text>

            <Text style={styles.heroDescription}>
              Pass the phone. Keep a straight face.
            </Text>
          </View>

          {/* Game cards */}
          <View style={styles.gamesContainer}>

            {/* Impostor */}
            <Pressable
                onPress={() => router.push('/impostor/setup' as never)}
                style={({ pressed }) => [
                  styles.gameCard,
                  styles.impostorCard,
                  pressed && styles.cardPressed,
                ]}
            >
              <View style={styles.gameInfo}>
                <View style={styles.impostorBadge}>
                  <Text style={styles.impostorBadgeText}>
                    01  /  WORD GAME
                  </Text>
                </View>

                <Text style={styles.impostorTitle}>Impostor</Text>

                <Text style={styles.impostorDescription}>
                  One word. One outsider.
                </Text>
              </View>

              <ImpostorArtwork />

              <View style={styles.impostorArrow}>
                <Text style={styles.impostorArrowText}>↗</Text>
              </View>
            </Pressable>

            {/* Mafia */}
            <Pressable
                onPress={() => router.push('/mafia/setup' as never)}
                style={({ pressed }) => [
                  styles.gameCard,
                  styles.mafiaCard,
                  pressed && styles.cardPressed,
                ]}
            >
              <View style={styles.gameInfo}>
                <View style={styles.mafiaBadge}>
                  <Text style={styles.mafiaBadgeText}>
                    02  /  ROLE GAME
                  </Text>
                </View>

                <Text style={styles.mafiaTitle}>Mafia</Text>

                <Text style={styles.mafiaDescription}>
                  A town full of secrets.
                </Text>
              </View>

              <MafiaArtwork />

              <View style={styles.mafiaArrow}>
                <Text style={styles.mafiaArrowText}>↗</Text>
              </View>
            </Pressable>

          </View>

          {/* Footer */}
          <Text style={styles.footer}>
            MADE FOR THE PEOPLE IN THE ROOM.
          </Text>
        </ScrollView>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 54,
  },

  logo: {
    fontSize: 31,
    fontWeight: '800',
    color: COLORS.ink,
    letterSpacing: -1.5,
  },

  settingsButton: {
    height: 38,
    paddingHorizontal: 15,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  settingsText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.muted,
    letterSpacing: 0.3,
  },

  hero: {
    marginBottom: 51,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.muted,
    letterSpacing: 0.6,
    marginBottom: 24,
  },

  heroTitle: {
    fontSize: 42,
    lineHeight: 53,
    fontWeight: '800',
    color: COLORS.ink,
    letterSpacing: -1.7,
  },

  heroSecondLine: {
    fontWeight: '800',
  },

  heroDescription: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 4,
  },

  gamesContainer: {
    gap: 20,
  },

  gameCard: {
    height: 174,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 19,
    justifyContent: 'center',
    position: 'relative',
  },

  impostorCard: {
    backgroundColor: COLORS.impostor,
    borderColor: '#C6D8A7',
    shadowColor: '#75885C',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 4,
  },

  mafiaCard: {
    backgroundColor: COLORS.mafia,
    borderColor: '#CBBDE1',
    shadowColor: '#76658F',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 4,
  },

  gameInfo: {
    zIndex: 5,
    alignItems: 'flex-start',
  },

  impostorBadge: {
    backgroundColor: '#CBE49A',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    marginBottom: 16,
  },

  impostorBadgeText: {
    fontSize: 11,
    color: '#34412A',
    fontWeight: '700',
  },

  mafiaBadge: {
    backgroundColor: '#CFC1EF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    marginBottom: 16,
  },

  mafiaBadgeText: {
    fontSize: 11,
    color: '#4C4268',
    fontWeight: '700',
  },

  impostorTitle: {
    fontSize: 29,
    fontWeight: '800',
    color: '#20211F',
    letterSpacing: -0.8,
  },

  mafiaTitle: {
    fontSize: 29,
    fontWeight: '800',
    color: '#242033',
    letterSpacing: -0.8,
  },

  impostorDescription: {
    fontSize: 12,
    color: '#4F5A3E',
    marginTop: 2,
  },

  mafiaDescription: {
    fontSize: 12,
    color: '#5F5676',
    marginTop: 2,
  },

  artwork: {
    position: 'absolute',
    width: 132,
    height: 132,
    right: -2,
    top: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  impostorHalo: {
    position: 'absolute',
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: '#D2E4B5',
    opacity: 0.55,
  },

  impostorOrbit: {
    position: 'absolute',
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 1,
    borderColor: '#ABC486',
    opacity: 0.5,
  },

  playingCard: {
    position: 'absolute',
    width: 64,
    height: 91,
    borderRadius: 11,
  },

  cardBack: {
    backgroundColor: '#B7CC92',
    borderWidth: 1,
    borderColor: '#9FB77A',
    transform: [{ rotate: '13deg' }, { translateX: 17 }, { translateY: -2 }],
  },

  cardMiddle: {
    backgroundColor: '#D0E1B3',
    borderWidth: 1,
    borderColor: '#AFC58A',
    transform: [{ rotate: '-11deg' }, { translateX: -12 }, { translateY: 9 }],
  },

  cardFront: {
    width: 67,
    height: 99,
    backgroundColor: '#F5F7ED',
    borderWidth: 1,
    borderColor: '#AFC48B',
    transform: [{ rotate: '4deg' }],
    padding: 6,
    shadowColor: '#526044',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },

  cardInset: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#C6D6AA',
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  cardDiamond: {
    width: 17,
    height: 17,
    backgroundColor: COLORS.impostorAccent,
    borderRadius: 4,
    transform: [{ rotate: '45deg' }],
    marginBottom: 5,
  },

  cardLine: {
    width: 35,
    height: 2,
    backgroundColor: '#A9BE87',
    borderRadius: 2,
  },

  cardShortLine: {
    width: 25,
    height: 2,
    backgroundColor: '#C2D2A7',
    borderRadius: 2,
  },

  mafiaHalo: {
    position: 'absolute',
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: '#D8CDED',
    opacity: 0.6,
  },

  mafiaOrbit: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 1.5,
    borderColor: '#B9A9D8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  mafiaInnerCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#EDE7F7',
    borderWidth: 1,
    borderColor: '#C8B9E2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  mafiaMoon: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#BCA9DF',
    left: 14,
    top: 14,
  },

  mafiaMoonCutout: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#EDE7F7',
    left: 33,
    top: 4,
  },

  mafiaDot: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#8F7AB8',
    left: 28,
    bottom: 38,
  },

  impostorArrow: {
    position: 'absolute',
    right: 17,
    bottom: 39,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#C9DDA5',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  mafiaArrow: {
    position: 'absolute',
    right: 17,
    bottom: 39,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#CDBFE7',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  impostorArrowText: {
    color: '#263421',
    fontSize: 20,
    fontWeight: '700',
  },

  mafiaArrowText: {
    color: '#382D4C',
    fontSize: 20,
    fontWeight: '700',
  },

  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },

  pressed: {
    opacity: 0.7,
  },

  footer: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.muted,
    letterSpacing: 0.5,
    marginTop: 48,
    marginBottom: 10,
  },
});
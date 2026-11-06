import { WORD_PAIRS } from '../data/wordPairs';
import type { Difficulty, WordPair } from '../data/wordPairs';

export type ImpostorVariation =
    | 'different-word'
    | 'no-word'
    | 'hint-only';

export interface Player {
    id: number;
    name: string;
}

export interface ImpostorConfig {
    players: Player[];
    category: string;
    difficulty: Difficulty;
    impostorCount: number;
    variation: ImpostorVariation;
}

export interface PlayerAssignment {
    playerId: number;
    playerName: string;
    isImpostor: boolean;
    word: string | null;
    hint: string | null;
}

export interface ImpostorGame {
    assignments: PlayerAssignment[];
    selectedWordPair: WordPair;
    totalPlayers: number;
    totalImpostors: number;
    conversationStarter: Player;
}

function shuffle<T>(items: T[]): T[] {
    const result = [...items];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}

function selectWordPair(category: string, difficulty: Difficulty): WordPair {
    const normalizedCategory = category.trim().toLowerCase();
    const matchingPairs = WORD_PAIRS.filter(
        (pair) =>
            pair.categoryId.toLowerCase() === normalizedCategory &&
            pair.difficulty === difficulty
    );

    if (matchingPairs.length === 0) {
        throw new Error(
            `No words available for ${category} at ${difficulty} difficulty.`
        );
    }

    const randomIndex = Math.floor(Math.random() * matchingPairs.length);
    return matchingPairs[randomIndex];
}

function validateConfig(config: ImpostorConfig): void {
    if (config.players.length < 3) {
        throw new Error('At least 3 players are required.');
    }

    if (config.players.length > 20) {
        throw new Error('Maximum 20 players are allowed.');
    }

    const names = config.players.map((player) => player.name.trim().toLowerCase());

    if (names.some((name) => !name)) {
        throw new Error('All players must have names.');
    }

    if (new Set(names).size !== names.length) {
        throw new Error('Player names must be unique.');
    }

    if (
        !Number.isInteger(config.impostorCount) ||
        config.impostorCount < 1 ||
        config.impostorCount >= config.players.length
    ) {
        throw new Error('Invalid impostor count.');
    }

    if (
        !['different-word', 'no-word', 'hint-only'].includes(config.variation)
    ) {
        throw new Error('Invalid impostor variation.');
    }

    if (!['easy', 'medium', 'hard'].includes(config.difficulty)) {
        throw new Error('Invalid difficulty.');
    }

    if (!['food', 'places', 'animals', 'objects', 'movies'].includes(config.category.trim().toLowerCase())) {
        throw new Error('Invalid category.');
    }
}

export function generateImpostorGame(config: ImpostorConfig): ImpostorGame {
    validateConfig(config);

    const wordPair = selectWordPair(config.category, config.difficulty);

    // This choice is independent of the impostor selection.
    const conversationStarter = shuffle(config.players)[0];

    const shuffledPlayers = shuffle(config.players);
    const impostorIds = new Set(
        shuffledPlayers
            .slice(0, config.impostorCount)
            .map((player) => player.id)
    );

    const assignments: PlayerAssignment[] = config.players.map((player) => {
        const isImpostor = impostorIds.has(player.id);

        if (!isImpostor) {
            return {
                playerId: player.id,
                playerName: player.name,
                isImpostor: false,
                word: wordPair.normalWord,
                hint: null,
            };
        }

        switch (config.variation) {
            case 'different-word':
                return {
                    playerId: player.id,
                    playerName: player.name,
                    isImpostor: true,
                    word: wordPair.impostorWord,
                    hint: null,
                };

            case 'no-word':
                return {
                    playerId: player.id,
                    playerName: player.name,
                    isImpostor: true,
                    word: null,
                    hint: null,
                };

            case 'hint-only':
                return {
                    playerId: player.id,
                    playerName: player.name,
                    isImpostor: true,
                    word: null,
                    hint: wordPair.impostorHint,
                };
        }
    });

    return {
        assignments,
        selectedWordPair: wordPair,
        totalPlayers: config.players.length,
        totalImpostors: config.impostorCount,
        conversationStarter: { ...conversationStarter },
    };
}

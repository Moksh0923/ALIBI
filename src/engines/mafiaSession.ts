import type { MafiaGame } from './mafiaEngine';

let currentMafiaGame: MafiaGame | null = null;

export function saveMafiaGame(game: MafiaGame): void {
    currentMafiaGame = game;
}

export function getMafiaGame(): MafiaGame | null {
    return currentMafiaGame;
}

export function clearMafiaGame(): void {
    currentMafiaGame = null;
}

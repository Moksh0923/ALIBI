import type { ImpostorGame } from './impostorEngine';

let currentGame: ImpostorGame | null = null;

export function saveImpostorGame(game: ImpostorGame) {
    currentGame = game;
}

export function getImpostorGame(): ImpostorGame | null {
    return currentGame;
}

export function clearImpostorGame() {
    currentGame = null;
}
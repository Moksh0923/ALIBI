import type { Player } from './impostorEngine';

export type MafiaRole = 'mafia' | 'god' | 'police' | 'doctor' | 'citizen';

export interface MafiaConfig {
    players: Player[];
    mafiaCount: number;
    godCount: number;
    policeCount: number;
    doctorCount: number;
}

export interface MafiaAssignment {
    playerId: number;
    playerName: string;
    role: MafiaRole;
}

export interface MafiaGame {
    assignments: MafiaAssignment[];
    totalPlayers: number;
    roleCounts: Record<MafiaRole, number>;
}

function shuffle<T>(items: T[]): T[] {
    const result = [...items];

    for (let index = result.length - 1; index > 0; index--) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }

    return result;
}

function validateConfig(config: MafiaConfig): void {
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

    const counts = [
        config.mafiaCount,
        config.godCount,
        config.policeCount,
        config.doctorCount,
    ];

    if (counts.some((count) => !Number.isInteger(count) || count < 0)) {
        throw new Error('Role counts must be whole numbers and cannot be negative.');
    }

    if (config.mafiaCount < 1) {
        throw new Error('At least one Mafia role is required.');
    }

    if (config.godCount < 1) {
        throw new Error('At least one God role is required.');
    }

    const specialRoleTotal = counts.reduce((total, count) => total + count, 0);

    if (specialRoleTotal >= config.players.length) {
        throw new Error('At least one Citizen must remain.');
    }
}

export function generateMafiaGame(config: MafiaConfig): MafiaGame {
    validateConfig(config);

    const roles: MafiaRole[] = [
        ...Array<MafiaRole>(config.mafiaCount).fill('mafia'),
        ...Array<MafiaRole>(config.godCount).fill('god'),
        ...Array<MafiaRole>(config.policeCount).fill('police'),
        ...Array<MafiaRole>(config.doctorCount).fill('doctor'),
    ];

    const citizenCount = config.players.length - roles.length;
    roles.push(...Array<MafiaRole>(citizenCount).fill('citizen'));

    // Shuffle roles independently, then assign one role to each player.
    const shuffledRoles = shuffle(roles);
    const assignments: MafiaAssignment[] = config.players.map((player, index) => ({
        playerId: player.id,
        playerName: player.name,
        role: shuffledRoles[index],
    }));

    return {
        assignments,
        totalPlayers: config.players.length,
        roleCounts: {
            mafia: config.mafiaCount,
            god: config.godCount,
            police: config.policeCount,
            doctor: config.doctorCount,
            citizen: citizenCount,
        },
    };
}

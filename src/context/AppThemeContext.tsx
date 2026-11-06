import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { useColorScheme } from 'react-native';

import { loadThemeMode, saveThemeMode } from '../utils/themeStorage';

import type { ReactNode } from 'react';
import type { ThemeMode } from '../utils/themeStorage';

export interface AppColors {
    background: string;
    surface: string;
    surfaceSecondary: string;
    ink: string;
    muted: string;
    border: string;
    accent: string;
    accentText: string;
    accentSoft: string;
    danger: string;
}

const LIGHT_COLORS: AppColors = {
    background: '#F5F4EF',
    surface: '#FFFFFF',
    surfaceSecondary: '#EAE9E2',
    ink: '#20211F',
    muted: '#73756D',
    border: '#E2E1D9',
    accent: '#DDF0AA',
    accentText: '#34412A',
    accentSoft: '#EDF4DF',
    danger: '#B65D55',
};

const DARK_COLORS: AppColors = {
    background: '#171915',
    surface: '#22251F',
    surfaceSecondary: '#2B2F28',
    ink: '#F2F1EA',
    muted: '#A5A79D',
    border: '#3A3E35',
    accent: '#B7CC92',
    accentText: '#26301D',
    accentSoft: '#303B28',
    danger: '#E08A81',
};

interface AppThemeContextValue {
    themeMode: ThemeMode;
    isDark: boolean;
    colors: AppColors;
    setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
    const systemScheme = useColorScheme();
    const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

    useEffect(() => {
        let mounted = true;

        loadThemeMode().then((savedMode) => {
            if (mounted) setThemeModeState(savedMode);
        });

        return () => {
            mounted = false;
        };
    }, []);

    const setThemeMode = useCallback(async (mode: ThemeMode) => {
        setThemeModeState(mode);
        await saveThemeMode(mode);
    }, []);

    const isDark = themeMode === 'system'
        ? systemScheme === 'dark'
        : themeMode === 'dark';

    const value = useMemo<AppThemeContextValue>(() => ({
        themeMode,
        isDark,
        colors: isDark ? DARK_COLORS : LIGHT_COLORS,
        setThemeMode,
    }), [themeMode, isDark, setThemeMode]);

    return (
        <AppThemeContext.Provider value={value}>
            {children}
        </AppThemeContext.Provider>
    );
}

export function useAppTheme(): AppThemeContextValue {
    const context = useContext(AppThemeContext);

    if (!context) {
        throw new Error('useAppTheme must be used inside AppThemeProvider.');
    }

    return context;
}

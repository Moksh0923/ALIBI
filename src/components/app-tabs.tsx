import { Stack } from 'expo-router';

export default function AppTabs() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                contentStyle: {
                    backgroundColor: '#F5F4EF',
                },
            }}
        />
    );
}

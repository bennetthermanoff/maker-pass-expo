import { router } from 'expo-router';

export const clearStackGoTo = (route:any) => {
    router.dismissTo(route);
};

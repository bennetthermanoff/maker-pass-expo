import { router } from 'expo-router';

export const clearStackGoTo = (route:any) => {
    while (router.canGoBack()) { // Pop from stack until one element is left, resets the stack
        router.back();
    }
    router.replace(route);
};
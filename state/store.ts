import { configureStore } from '@reduxjs/toolkit';
import { machinesSlice } from './slices/machinesSlice';
import { makerspacesSlice } from './slices/makerspacesSlice';
import devToolsEnhancer from 'redux-devtools-expo-dev-plugin';

export const store = configureStore({
    reducer: {
        machines: machinesSlice.reducer,
        makerspaces: makerspacesSlice.reducer,
    },
    devTools: false,
    enhancers: (getDefaultEnhancers) => getDefaultEnhancers().concat(devToolsEnhancer()),
});
export type RootState = ReturnType<typeof store.getState>;
export const useAppDispatch = () => store.dispatch;
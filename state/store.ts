import { configureStore } from '@reduxjs/toolkit';
import { machinesSlice } from './slices/machinesSlice';
import { makerspacesSlice } from './slices/makerspacesSlice';

export const store = configureStore({
    reducer: {
        machines: machinesSlice.reducer,
        makerspaces: makerspacesSlice.reducer,
    },
});
export type RootState = ReturnType<typeof store.getState>;
export const useAppDispatch = () => store.dispatch;
import { configureStore } from '@reduxjs/toolkit';
import { machinesSlice } from './slices/machinesSlice';

export const store = configureStore({
    reducer: {
        machines: machinesSlice.reducer,
    },
});
export type RootState = ReturnType<typeof store.getState>;
export const useAppDispatch = () => store.dispatch;
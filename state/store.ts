import { configureStore } from '@reduxjs/toolkit';
import { machinesSlice } from './slices/machinesSlice';
import { makerspacesSlice } from './slices/makerspacesSlice';
import { permissionsSlice } from './slices/permissionsSlice';

export const store = configureStore({
    reducer: {
        machines: machinesSlice.reducer,
        makerspaces: makerspacesSlice.reducer,
        permissions: permissionsSlice.reducer,
    },
});
export type RootState = ReturnType<typeof store.getState>;
export const useAppDispatch = () => store.dispatch;
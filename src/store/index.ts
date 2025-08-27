import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import deviceRequestsReducer from './deviceRequestsSlice';
import dealersReducer from './dealerSlice';
import deviceTypesReducer from './deviceTypeSlice';
import manufacturersMockReducer from './manufacturerSliceMock';
// Use the below import when calling the actual api
//import manufacturerReducer from './manufacturerSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    deviceRequests: deviceRequestsReducer,
    dealers: dealersReducer,
    deviceTypes: deviceTypesReducer,
    manufacturers: manufacturersMockReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

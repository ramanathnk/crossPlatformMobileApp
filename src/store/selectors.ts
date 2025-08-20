import { RootState } from './index';

/**
 * Typed selectors for auth state.
 * Use these in components with useSelector(selectAuthToken) etc.
 */
export const selectAuthState = (state: RootState) => state.auth;

export const selectAuthToken = (state: RootState) => selectAuthState(state).token;
export const selectAuthLoading = (state: RootState) => selectAuthState(state).loading;
export const selectAuthError = (state: RootState) => selectAuthState(state).error;
export const selectAuthMessage = (state: RootState) => selectAuthState(state).message;
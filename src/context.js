import { createContext } from 'react';
export const AuthContext = createContext({ tick: 0, bump: () => {} });

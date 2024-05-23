import { createContext, useContext } from 'react';
import { ClientRoomData } from '../../../server/room';
import { ClientGameData, EnhancedClientGameData } from '../../../server/game';

export const RoomContext = createContext<ClientRoomData | null | undefined>(undefined);
export const GameContext = createContext<EnhancedClientGameData | null | undefined>(undefined);
export const AuthContext = createContext<{ name: string | null, setName(name: string): void }>({ name: null, setName() {} });

export const useRoom = () => useContext(RoomContext);
export const useGame = () => useContext(GameContext);
export const useAuth = () => useContext(AuthContext);
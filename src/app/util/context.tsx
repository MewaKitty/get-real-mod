import { createContext, useContext } from 'react';
import { ClientRoomData } from '../../../server/room';
import { ClientGameData } from '../../../server/game';

export const RoomContext = createContext<ClientRoomData | null>(null);
export const GameContext = createContext<ClientGameData | null>(null);

export const useRoom = () => useContext(RoomContext);
export const useGame = () => useContext(GameContext);
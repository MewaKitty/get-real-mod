import type { Server, Socket } from "socket.io";
import type { Socket as CSocket } from "socket.io-client"
import type { RoomC2SEvents, RoomS2CEvents } from "./room";
import type { AuthC2SEvents, AuthS2CEvents } from "./auth";
import { GameC2SEvents, GameS2CEvents } from "./game";

export type TypedServer = Server<C2SEvents, S2CEvents, {}, SocketData>;
export type TypedSocket = Socket<C2SEvents, S2CEvents, {}, SocketData>;
export type TypedCSocket = CSocket<S2CEvents, C2SEvents>;
export type EventCallback<T> = (returnValue: T) => void;

type C2SEvents = RoomC2SEvents & AuthC2SEvents & GameC2SEvents;
type S2CEvents = RoomS2CEvents & AuthS2CEvents & GameS2CEvents;
type SocketData = {
    playerName: string;
    playerId: string;
    authed: true | undefined;
};
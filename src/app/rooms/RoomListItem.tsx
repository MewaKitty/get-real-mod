import Skeleton from "react-loading-skeleton";
import { RoomListData } from "../../../server/room";
import { socket } from "@/socket";

export const RoomListItem = ({ room, canJoin }: { room: RoomListData | null; canJoin: boolean }) => {
	
	return (
		<article>
			<h1>{room?.name ?? <Skeleton />}</h1>
			<p>{room !== null ? `Player Count: ${room.playerCount}/${room.max}` : <Skeleton />}</p>
			<p>{room !== null ? `Owner: ${room.owner}` : <Skeleton />}</p>
			{canJoin && room !== null && <button onClick={() => socket.emit("room:join", room.name)}>Join</button>}
		</article>
	);
};

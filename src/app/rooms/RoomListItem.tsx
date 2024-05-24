import Skeleton from "react-loading-skeleton";
import { RoomListData } from "../../../server/room";

export const RoomListItem = ({room}: {room: RoomListData | null}) => {
    return <article>
        <h1>{room?.name ?? <Skeleton />}</h1>
        <p>{room !== null ? `Player Count: ${room.playerCount}/${room.max}` : <Skeleton />}</p>
        <p>{room !== null ? `Owner: ${room.owner}` : <Skeleton />}</p>
    </article>
}
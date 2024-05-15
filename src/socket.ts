"use client";

import { io } from "socket.io-client";
import { TypedCSocket } from "../server/types";

export const socket = io() as TypedCSocket;
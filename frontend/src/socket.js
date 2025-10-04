// src/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "https://alertmed.onrender.com";
export const socket = io(SOCKET_URL, { autoConnect: false }); // connect manually


import { authRoutes } from "@thebensage-dev/auth";
import { auth } from "@/server/auth";

export const { GET } = authRoutes(auth).login;

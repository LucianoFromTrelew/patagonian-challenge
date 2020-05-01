import express from "express";
import { Connection } from "typeorm";
import { getSongs, getSongById } from "./controllers/songs.controller";

export async function getApp(conn: Connection) {
  const app = express();

  app.get("/songs", getSongs(conn));
  app.get("/songs/:songId", getSongById(conn));

  return app;
}

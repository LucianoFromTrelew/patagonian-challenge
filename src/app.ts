import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { Connection } from "typeorm";
import { Artist } from "./models/artist.model";
import { Song } from "./models/song.model";

export async function getApp(conn: Connection) {
  const app = express();

  // CORS
  app.use(cors());

  app.get("/songs", async (req, res) => {
    const { artistName } = req.query;
    if (!artistName)
      return res.status(400).send({
        message: "Bad request - `artistName` query parameter must be present"
      });
    if (artistName.length < 3)
      return res.status(400).send({
        message:
          "Bad request - `artistName` query parameter should be at least 3 characters long"
      });
    const name = (artistName as string).toLowerCase();
    const artistWithSongs = await conn
      .getRepository(Artist)
      .createQueryBuilder("artist")
      .select()
      .where("artist.name ILIKE :name", { name: `%${name}%` })
      .leftJoinAndSelect("artist.songs", "song")
      .getOne();
    return res.send({
      songs: artistWithSongs?.songs.map(song => ({
        songId: song.id,
        songTitle: song.name
      }))
    });
  });
  app.get(
    "/songs/:songId",
    async (req: Request, res: Response, next: NextFunction) => {
      const { songId } = req.params;
      if (!songId)
        return res.status(400).send({
          message: "Bad request - `songId` is required"
        });
      try {
        const song = await conn.getRepository(Song).findOneOrFail(songId);
        const { available_markets, ...data } = JSON.parse(song.fullResponse);
        return res.send(data);
      } catch {
        return res.status(404).send({ message: "Song not found" });
      }
    }
  );

  return app;
}

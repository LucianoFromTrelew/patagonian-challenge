import { Request, Response } from "express";
import { Connection } from "typeorm";
import { Artist } from "../models/artist.model";
import { Song } from "../models/song.model";

export function getSongs(conn: Connection) {
  return async (req: Request, res: Response) => {
    const { artistName, limit = "50", page = "0" } = req.query;
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
    const artist = await Artist.searchByName(conn, name);
    if (!artist) return res.status(404).send({ message: `Artist not found` });
    const limitPage = parseInt(limit as string);
    const pageNumber = parseInt(page as string) * limitPage;
    try {
      const songs = await conn
        .getRepository(Song)
        .createQueryBuilder("song")
        .leftJoinAndSelect("song.artist", "artist")
        .where({ artist })
        .orderBy("song.id")
        .take(limitPage)
        .skip(pageNumber)
        .getMany();
      return res.send({
        songs: songs.map(song => ({
          songId: song.id,
          songTitle: song.name
        }))
      });
    } catch {
      return res.status(400).send({
        message:
          "Bad request - `page` or `limit` query parameter should be positive numbers"
      });
    }
  };
}

export function getSongById(conn: Connection) {
  return async (req: Request, res: Response) => {
    const { songId } = req.params;
    try {
      const song = await conn.getRepository(Song).findOneOrFail(songId);
      const { available_markets, ...data } = JSON.parse(song.fullResponse);
      return res.send(data);
    } catch {
      return res.status(404).send({ message: "Song not found" });
    }
  };
}

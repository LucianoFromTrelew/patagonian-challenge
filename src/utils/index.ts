import "reflect-metadata";
import { createConnection, Connection } from "typeorm";
import { Artist } from "../models/artist.model";
import { Album } from "../models/album.model";
import { Song } from "../models/song.model";

export function getConnection(name?: string) {
  return createConnection({
    name,
    type: "postgres",
    host: process.env.POSTGRES_HOST as string,
    port: parseInt(process.env.POSTGRES_PORT as string),
    username: process.env.POSTGRES_USER as string,
    password: process.env.POSTGRES_PASSWORD as string,
    database: process.env.POSTGRES_DB as string,
    entities: [Artist, Album, Song],
    synchronize: true,
    logging: false
  });
}

import { parse } from "dotenv";
import request from "supertest";
import { readFileSync } from "fs";
import { Connection } from "typeorm";
import { Artist } from "../models/artist.model";
import { getConnection } from "../utils";
import { Album } from "../models/album.model";
import { Song } from "../models/song.model";
import { Application } from "express";
import { getApp } from "../app";

describe("App", () => {
  let conn: Connection;
  let app: Application;

  beforeAll(async () => {
    const envConfig = parse(readFileSync(".env.test"));
    for (const key in envConfig) {
      process.env[key] = envConfig[key];
    }
    conn = await getConnection("test");
    const duaLipa = Artist.create("dua_lipa", "Dua Lipa", "", "");
    const jBalvin = Artist.create("j_balvin", "J Balvin", "", "");
    const futureNostalgia = Album.create(
      "future_nostalgia",
      "Future Nostalgia",
      "",
      "",
      duaLipa
    );
    const colores = Album.create("colores", "Colores", "", "", jBalvin);
    const duaLipasSongs = Array(100)
      .fill(0)
      .map((_: any, i: number) => {
        const id = `${String(i).padStart(3, "0")}_dua_lipa`;
        return Song.create(id, `Song ${i}`, `{"id": "${id}"}`, futureNostalgia);
      });
    const jBalvinsSongs = Array(100)
      .fill(0)
      .map((_: any, i: number) => {
        const id = `${String(i).padStart(3, "0")}_j_balvin`;
        return Song.create(id, `Song ${i}`, `{"id": "${id}"}`, colores);
      });
    await Promise.all([duaLipa, jBalvin].map(v => conn.manager.save(v)));
    await Promise.all(
      [futureNostalgia, colores].map(v => conn.manager.save(v))
    );
    await Promise.all(
      [...duaLipasSongs, ...jBalvinsSongs].map(v => conn.manager.save(v))
    );
  });

  beforeEach(async () => {
    app = await getApp(conn);
  });

  afterAll(async () => {
    await conn.dropDatabase();
    await conn.close();
  });

  describe("/songs endpoint", () => {
    test("returns status code 400 if no artist name passed as query parameter", async () => {
      const res = await request(app).get("/songs");
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/must be present/);
    });

    test("returns status code 400 if artist name is shorter than 3 characters long", async () => {
      const res = await request(app).get("/songs").query({ artistName: "du" });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/at least 3 characters long/);
    });

    test("returns artist's songs", async () => {
      const duaLipa = await conn
        .getRepository(Artist)
        .findOne({ relations: ["songs"], where: { name: "Dua Lipa" } });
      const res = await request(app).get("/songs").query({ artistName: "dua" });
      expect(res.status).toBe(200);
      expect(res.body.songs).toHaveLength(50);
    });

    test("return 404 if artist not found", async () => {
      const res = await request(app)
        .get("/songs")
        .query({ artistName: "red hot chili peppers" });
      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/not found/);
    });

    test("returns only 10 songs if limit = 10", async () => {
      const limit = 10;
      const duaLipa = await conn
        .getRepository(Artist)
        .findOne({ where: { name: "Dua Lipa" } });
      const res = await request(app)
        .get("/songs")
        .query({ artistName: "dua", limit });
      expect(res.status).toBe(200);
      expect(res.body.songs).toHaveLength(limit);
    });

    test("returns paginated data", async () => {
      const page = 1;
      const duaLipa = await conn
        .getRepository(Artist)
        .findOne({ name: "Dua Lipa" });
      const songs = ((await conn
        .getRepository(Song)
        .createQueryBuilder("song")
        .leftJoinAndSelect("song.artist", "artist")
        .where({ artist: duaLipa })
        .orderBy("song.id")
        .getMany()) as Song[]).slice(50);
      const res = await request(app)
        .get("/songs")
        .query({ artistName: "dua", page });
      expect(res.status).toBe(200);
      expect(res.body.songs[0].songId).toBe(songs[0].id);
    });

    test("returns paginated data with limit", async () => {
      const page = 2;
      const limit = 10;
      const duaLipa = await conn
        .getRepository(Artist)
        .findOne({ name: "Dua Lipa" });
      const songs = (await conn
        .getRepository(Song)
        .createQueryBuilder("song")
        .leftJoinAndSelect("song.artist", "artist")
        .where({ artist: duaLipa })
        .orderBy("song.id")
        .getMany()) as Song[];
      const res = await request(app)
        .get("/songs")
        .query({ artistName: "dua", page, limit });
      expect(res.status).toBe(200);
      expect(res.body.songs[0].songId).toBe(songs[page * limit].id);
    });

    test("returns 400 if page query param is not a number", async () => {
      const page = "somePage";
      const res = await request(app)
        .get("/songs")
        .query({ artistName: "dua", page });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Bad request/);
    });

    test("returns 400 if page query param is not a number", async () => {
      const limit = "limit";
      const res = await request(app)
        .get("/songs")
        .query({ artistName: "dua", limit });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Bad request/);
    });
  });

  describe("/songs/:songId endpoint", () => {
    test("returns 404 if song not found", async () => {
      const res = await request(app).get("/songs/someNonexistingSong");
      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/Song not found/);
    });

    test("returns song", async () => {
      const song = (await conn.getRepository(Song).findOne()) as Song;
      const { available_markets, ...data } = JSON.parse(song.fullResponse);
      const res = await request(app).get(`/songs/${song.id}`);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject(data);
    });
  });
});

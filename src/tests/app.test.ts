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
    const futureNostaliga = Album.create(
      "future_nostalgia",
      "Future Nostalgia",
      "",
      "",
      duaLipa
    );
    const colores = Album.create("colores", "Colores", "", "", jBalvin);
    const physical = Song.create(
      "physical",
      "Physical",
      '{"id": "physical"}',
      futureNostaliga
    );
    const rojo = Song.create("rojo", "Rojo", '{"id": "rojo"}', colores);
    await Promise.all([duaLipa, jBalvin].map(v => conn.manager.save(v)));
    await Promise.all(
      [futureNostaliga, colores].map(v => conn.manager.save(v))
    );
    await Promise.all([physical, rojo].map(v => conn.manager.save(v)));
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
      expect(res.body.songs).toHaveLength(duaLipa?.songs.length as number);
      expect(res.body.songs).toMatchObject([
        { songId: duaLipa?.songs[0].id, songTitle: duaLipa?.songs[0].name }
      ]);
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

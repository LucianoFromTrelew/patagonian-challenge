import { parse } from "dotenv";
import { main, getHelp } from "../load_data/main";
import { readFileSync } from "fs";
import { Connection } from "typeorm";
import { Artist } from "../models/artist.model";
import { getConnection } from "../utils";
import { Album } from "../models/album.model";
import { Song } from "../models/song.model";

describe("Data load script", () => {
  const log = console.log;
  const error = console.error;
  let conn: Connection;
  beforeAll(async () => {
    const envConfig = parse(readFileSync(".env.test"));
    for (const key in envConfig) {
      process.env[key] = envConfig[key];
    }
    conn = await getConnection("test");
  });
  beforeEach(() => {
    console.log = jest.fn();
    console.error = jest.fn();
  });
  afterEach(() => {
    console.log = log;
    console.error = error;
  });
  afterAll(async () => {
    await conn.dropDatabase();
  });
  test("Displays help if -h or --help passed as parameter", () => {
    const args = ["--help", "-h"];
    args.forEach(flag => {
      main([flag]);
      expect(console.log as jest.Mock).toHaveBeenCalledWith(getHelp());
    });
  });
  test("Throws error if no parameter passed", async done => {
    try {
      await main([]);
    } catch (e) {
      done();
    }
  });
  test("Throws error if an incorrect Artist's Spotify ID passed", async done => {
    try {
      await main(["asd"]);
      expect(console.error as jest.Mock).toHaveBeenCalled();
    } catch (e) {
      done();
    }
  });
  test("Fetches single artist, their albums, and their songs correctly", async () => {
    const duaLipaId = "6M2wZ9GZgrQXHCFfjv46we";
    await main([duaLipaId]);
    const artists = await conn.manager.find(Artist);
    const albums = await conn.manager.find(Album);
    const songs = await conn.manager.find(Song);
    expect(artists).toHaveLength(1);
    expect(albums).not.toHaveLength(0);
    expect(songs).not.toHaveLength(0);
  }, 10000);
  test("Fetches several artists, their albums, and their songs correctly", async () => {
    const duaLipaId = "6M2wZ9GZgrQXHCFfjv46we";
    const jBalvinId = "1vyhD5VmyZ7KMfW5gqLgo5";
    await main([duaLipaId, jBalvinId]);
    const artists = await conn.manager.find(Artist);
    const albums = await conn.manager.find(Album);
    const songs = await conn.manager.find(Song);
    expect(artists).toHaveLength(2);
    expect(albums).not.toHaveLength(0);
    expect(songs).not.toHaveLength(0);
  }, 10000);
});

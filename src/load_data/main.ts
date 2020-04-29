import "dotenv/config";
import * as request from "superagent";
import { getConnection } from "../utils";
import { Artist } from "../models/artist.model";
import { Album } from "../models/album.model";
import { Song } from "../models/song.model";
import { Connection } from "typeorm";

async function fetchArtists(ids: string, token: string): Promise<Artist[]> {
  console.log(`** Fetching artists [${ids}]**`);
  const headers = { Authorization: `Bearer ${token}` };
  const query = { ids };
  return request
    .get("https://api.spotify.com/v1/artists")
    .set(headers)
    .query(query)
    .then(res =>
      (res.body.artists as any[]).map(
        artist =>
          new Artist(
            artist.id,
            artist.name,
            artist.external_urls.spotify,
            artist.images[0].url
          )
      )
    )
    .catch(err => {
      console.error(`Could not fetch artists [${ids}]`);
      throw err;
    });
}
async function fetchArtistAlbums(
  artist: Artist,
  token: string
): Promise<Album[]> {
  console.log(`** Fetching ${artist.name}'s albums **`);
  const query = { include_groups: "album" };
  const headers = { Authorization: `Bearer ${token}` };
  return request
    .get(`https://api.spotify.com/v1/artists/${artist.id}/albums`)
    .set(headers)
    .query(query)
    .then(res =>
      (res.body.items as any[])
        .map(
          album =>
            new Album(
              album.id,
              album.name,
              album.external_urls.spotify,
              album.images[0].url,
              artist
            )
        )
        .filter((album, index, arr) => {
          // Delete duplicates by name
          return arr.findIndex(a => a.name === album.name) === index;
        })
    )
    .catch(err => {
      console.error(`Could not fetch ${artist.name}'s albums`);
      throw err;
    });
}
async function fetchAlbumSongs(album: Album, token: string): Promise<Song[]> {
  console.log(
    `** Fetching ${album.name}'s (by ${album.artist.name}) tracks **`
  );
  const headers = { Authorization: `Bearer ${token}` };
  const query = { limit: 50 };
  return request
    .get(`https://api.spotify.com/v1/albums/${album.id}/tracks`)
    .set(headers)
    .query(query)
    .then(res =>
      (res.body.items as any[]).map(song => new Song(song.id, song.name, album))
    )
    .catch(err => {
      console.error(
        `Could not fetch ${album.name}'s (by ${album.artist.name}) tracks`
      );
      throw err;
    });
}

interface ArtistData {
  artist: Artist;
  artistAlbums: Album[];
  artistSongs: Song[][];
}
function fetchArtistsData(
  artists: Artist[],
  token: string
): Promise<ArtistData[]> {
  return Promise.all(
    artists.map(async (artist: Artist) => {
      const artistAlbums = await fetchArtistAlbums(artist, token);
      const artistSongs = await Promise.all(
        artistAlbums.map(album => fetchAlbumSongs(album, token))
      );
      return { artist, artistAlbums, artistSongs };
    })
  );
}

function saveArtist(artist: Artist, conn: Connection) {
  return conn.manager.save(artist).catch(err => {
    console.error(`Could not save artist [${artist.name}] into the database`);
    throw err;
  });
}
function saveAlbums(albums: Album[], conn: Connection) {
  return Promise.all(albums.map(album => conn.manager.save(album))).catch(
    err => {
      console.error(
        `Could not save ${albums[0].artist.name}'s albums into the database`
      );
      throw err;
    }
  );
}
function saveSongs(songs: Song[][], conn: Connection) {
  const promises = [];
  for (const albumSongs of songs) {
    const a = albumSongs.map(song => conn.manager.save(song));
    promises.push(...a);
  }
  return Promise.all(promises).catch(err => {
    console.error(
      `Could not save ${songs[0][0].album.artist.name}'s tracks into the database`
    );
    throw err;
  });
}

function saveArtistsData(data: ArtistData[], conn: Connection) {
  return Promise.all(
    data.map(async ({ artist, artistAlbums, artistSongs }) =>
      Promise.all([
        await saveArtist(artist, conn),
        await saveAlbums(artistAlbums, conn),
        await saveSongs(artistSongs, conn)
      ])
    )
  ).catch(err => {
    console.error("Could not save artist data");
    throw err;
  });
}

async function loadArtistsTracksIntoDb(artistIds: string, token: string) {
  console.log(`** TOKEN ${token}**`);
  const artists = await fetchArtists(artistIds, token);
  const data = await fetchArtistsData(artists, token);
  const conn = await getConnection();
  await saveArtistsData(data, conn);
  conn.close();
}

function getSpotifyToken(
  clientId: string,
  clientSecret: string
): Promise<string> {
  const base64encoded = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );
  return request
    .post("https://accounts.spotify.com/api/token")
    .set("Authorization", `Basic ${base64encoded}`)
    .type("form")
    .send("grant_type=client_credentials")
    .then(res => res.body.access_token as string)
    .catch(err => {
      console.log(err);
      throw err;
    });
}

export function getHelp(): string {
  return "Some help";
}

export async function main(args: string[]) {
  if (!args.length) {
    console.log(getHelp());
    throw new Error();
  }
  if (args[0] === "-h" || args[0] === "--help") {
    console.log(getHelp());
    return;
  }

  const ids = args.join(",");
  const token = await getSpotifyToken(
    process.env.SPOTIFY_CLIENT_ID as string,
    process.env.SPOTIFY_CLIENT_SECRET as string
  );
  await loadArtistsTracksIntoDb(ids, token);
  console.log("Job done!");
}

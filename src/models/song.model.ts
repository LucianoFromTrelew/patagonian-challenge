import { Entity, PrimaryColumn, Column, ManyToOne } from "typeorm";
import { Album } from "./album.model";
import { Artist } from "./artist.model";
@Entity()
export class Song {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column("text")
  fullResponse: string;

  @ManyToOne(() => Album)
  album: Album;

  @ManyToOne(() => Artist, artist => artist.songs)
  artist: Artist;

  constructor(
    id: string = "",
    name: string = "",
    fullResponse: string = "",
    album: Album,
    artist: Artist
  ) {
    this.id = id;
    this.name = name;
    this.fullResponse = fullResponse;
    this.album = album;
    this.artist = artist;
  }
}

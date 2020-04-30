import { Entity, PrimaryColumn, Column, ManyToOne } from "typeorm";
import { Album } from "./album.model";
import { Artist } from "./artist.model";
@Entity()
export class Song {
  @PrimaryColumn()
  id!: string;

  @Column()
  name!: string;

  @Column("text")
  fullResponse!: string;

  @ManyToOne(() => Album)
  album!: Album;

  @ManyToOne(() => Artist, artist => artist.songs)
  artist!: Artist;

  static create(
    id: string = "",
    name: string = "",
    fullResponse: string = "",
    album: Album
  ): Song {
    const obj = new Song();
    obj.id = id;
    obj.name = name;
    obj.fullResponse = fullResponse;
    obj.album = album;
    obj.artist = album.artist;
    return obj;
  }
}

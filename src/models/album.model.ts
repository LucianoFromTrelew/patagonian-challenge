import { Entity, PrimaryColumn, Column, ManyToOne } from "typeorm";
import { Artist } from "./artist.model";

@Entity()
export class Album {
  @PrimaryColumn()
  id!: string;

  @Column()
  name!: string;

  @Column()
  spotifyUrl!: string;

  @Column()
  imageUrl!: string;

  @ManyToOne(type => Artist)
  artist!: Artist;

  static create(
    id: string = "",
    name: string = "",
    spotifyUrl: string = "",
    imageUrl: string = "",
    artist: Artist
  ): Album {
    const obj = new Album();
    obj.id = id;
    obj.name = name;
    obj.spotifyUrl = spotifyUrl;
    obj.imageUrl = imageUrl;
    obj.artist = artist;
    return obj;
  }
}

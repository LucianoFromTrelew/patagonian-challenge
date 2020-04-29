import { Entity, PrimaryColumn, Column, ManyToOne } from "typeorm";
import { Artist } from "./artist.model";

@Entity()
export class Album {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  spotifyUrl: string;

  @Column()
  imageUrl: string;

  @ManyToOne(type => Artist)
  artist: Artist;

  constructor(
    id: string = "",
    name: string = "",
    spotifyUrl: string = "",
    imageUrl: string = "",
    artist: Artist
  ) {
    this.id = id;
    this.name = name;
    this.spotifyUrl = spotifyUrl;
    this.imageUrl = imageUrl;
    this.artist = artist;
  }
}

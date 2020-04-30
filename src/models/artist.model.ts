import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { Song } from "./song.model";
@Entity()
export class Artist {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  spotifyUrl: string;

  @Column()
  imageUrl: string;

  @OneToMany(type => Song, song => song.artist)
  songs!: Song[];

  constructor(
    id: string = "",
    name: string = "",
    spotifyUrl: string = "",
    imageUrl: string = ""
  ) {
    this.id = id;
    this.name = name;
    this.spotifyUrl = spotifyUrl;
    this.imageUrl = imageUrl;
  }
}

import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { Song } from "./song.model";
@Entity()
export class Artist {
  @PrimaryColumn()
  id!: string;

  @Column()
  name!: string;

  @Column()
  spotifyUrl!: string;

  @Column()
  imageUrl!: string;

  @OneToMany(type => Song, song => song.artist)
  songs!: Song[];

  static create(
    id: string = "",
    name: string = "",
    spotifyUrl: string = "",
    imageUrl: string = ""
  ): Artist {
    const obj = new Artist();
    obj.id = id;
    obj.name = name;
    obj.spotifyUrl = spotifyUrl;
    obj.imageUrl = imageUrl;
    return obj;
  }
}

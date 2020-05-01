import { Entity, PrimaryColumn, Column, OneToMany, Connection } from "typeorm";
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

  static searchByName(
    conn: Connection,
    name: string
  ): Promise<Artist | undefined> {
    return conn
      .getRepository(Artist)
      .createQueryBuilder("artist")
      .where("artist.name ILIKE :name", { name: `%${name}%` })
      .getOne();
  }
}

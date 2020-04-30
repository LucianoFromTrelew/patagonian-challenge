import { Entity, PrimaryColumn, Column, ManyToOne } from "typeorm";
import { Album } from "./album.model";
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

  constructor(
    id: string = "",
    name: string = "",
    fullResponse: string = "",
    album: Album
  ) {
    this.id = id;
    this.name = name;
    this.fullResponse = fullResponse;
    this.album = album;
  }
}

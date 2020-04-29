import { Entity, PrimaryColumn, Column, ManyToOne } from "typeorm";
import { Album } from "./album.model";
@Entity()
export class Song {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Album)
  album: Album;

  constructor(id: string = "", name: string = "", album: Album) {
    this.id = id;
    this.name = name;
    this.album = album;
  }
}

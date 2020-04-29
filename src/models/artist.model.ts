import { Entity, PrimaryColumn, Column } from "typeorm";
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

import { Entity, EntitySchema, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class BlackList {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  walletAddress: string;
}

export const BlackListSchema = new EntitySchema<BlackList>({
  name: 'BlackList',
  target: BlackList,
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    walletAddress: {
      type: String,
    },
  },
});

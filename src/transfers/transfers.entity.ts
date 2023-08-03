import {
  Entity,
  EntitySchema,
  Column,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';

@Entity()
@Index(['block', 'amount', 'sender', 'reciever', 'date'], { unique: true })
export class Transfer {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  block: number;

  @Column()
  amount: string;

  @Column()
  sender: string;

  @Column()
  reciever: string;

  @Column()
  date: Date;
}

export const TransferSchema = new EntitySchema<Transfer>({
  name: 'Transfer',
  target: Transfer,
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    block: {
      type: Number,
    },
    amount: {
      type: String,
    },
    sender: {
      type: String,
    },
    reciever: {
      type: String,
    },
    date: {
      type: Date,
    },
  },
});

/* eslint-disable prettier/prettier */
import { 
    Entity, 
    Column, 
    PrimaryGeneratedColumn, 
    CreateDateColumn, 
    UpdateDateColumn, 
    Index 
} from 'typeorm';

@Entity('fxql_entries')
@Index('IDX_CURRENCY_PAIR', ['source_currency', 'destination_currency'], { unique: true })
export class FxqlEntry {
    @PrimaryGeneratedColumn({ name: 'entry_id' })
    entry_id: number;

    @Column({ name: 'source_currency', length: 3 })
    source_currency: string;

    @Column({ name: 'destination_currency', length: 3 })
    destination_currency: string;

    @Column('decimal', { name: 'buy_price', precision: 10, scale: 4 })
    buy_price: number;

    @Column('decimal', { name: 'sell_price', precision: 10, scale: 4 })
    sell_price: number;

    @Column('integer', { name: 'cap_amount' })
    cap_amount: number;

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;
}
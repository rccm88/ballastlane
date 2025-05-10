import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('drug_indications')
export class DrugIndication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  drugName: string;

  @Column('text')
  title: string;

  @Column('text')
  text: string;

  @Column({ nullable: true })
  icd10_code: string;

  @Column({ type: 'text', nullable: true })
  icd10_description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

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

  @Column()
  brandName: string;

  @Column('text')
  indication: string;

  @Column('simple-array')
  icd10Codes: string[];

  @Column('simple-array', { nullable: true })
  synonyms: string[];

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    source: string;
    confidence: number;
    lastUpdated: Date;
    version: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
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

  @BeforeInsert()
  @BeforeUpdate()
  transformDrugName() {
    if (this.drugName) {
      this.drugName = this.drugName
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
  }
}

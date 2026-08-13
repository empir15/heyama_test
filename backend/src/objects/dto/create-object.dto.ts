import { IsNotEmpty, IsString } from 'class-validator';

export class CreateObjectDto {
  @IsNotEmpty({ message: 'Le titre est requis' })
  @IsString()
  title: string;

  @IsNotEmpty({ message: 'La description est requise' })
  @IsString()
  description: string;
}

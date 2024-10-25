import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class LoginCredential {
  /**
   * User email
   */
  @IsNotEmpty()
  readonly email: string;

  /**
   * 4-12 char long password
   */
  @MinLength(4)
  @MaxLength(24)
  readonly password: string;
}

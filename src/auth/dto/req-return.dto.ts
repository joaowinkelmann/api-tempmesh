export class ReqReturnDto {
  user: {
    sub: string;
    email: string;
    iat: number;
    exp: number;
  };
}

import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from "@nestjs/common";
import * as jwt from "jsonwebtoken";

@Injectable()
export class AuthGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        if(!request.headers.authorization){
            return false;
        }
        request.user = await this.ValidateToken(request.headers.authorization);
        return true;
    }

    async ValidateToken(auth: string){
        if(auth.split(' ')[0] != 'Bearer'){
            throw new HttpException("Invalid Token", HttpStatus.FORBIDDEN);
        }
        const token = auth.split(' ')[1];
        try{
            var decoded = await jwt.verify(token, process.env.SECRET);
            return decoded;
        }catch(e){
            const msg = "Token Error " + (e.message || e.name);
            throw new HttpException(msg, HttpStatus.FORBIDDEN);
        }
    }
}
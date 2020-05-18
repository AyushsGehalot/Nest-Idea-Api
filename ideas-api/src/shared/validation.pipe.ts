import { Injectable, PipeTransform, ArgumentMetadata, BadGatewayException, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";

@Injectable()
export class ValidationPipe implements PipeTransform{
    async transform(value: any, metadata: ArgumentMetadata) {
        if( value instanceof Object && this.isEmpty(value)){
            throw new HttpException('Validation Failed: No body submitted', HttpStatus.BAD_REQUEST);
        }

        const { metatype } = metadata;
        if(!metatype || !this.toValidate(metatype)){
            return value;
        }
        const object = plainToClass(metatype, value);
        const errors = await validate(object);
        if(errors.length > 0){
            throw new HttpException(`Validation Failed: ${this.formatError(errors)}`, HttpStatus.BAD_GATEWAY);
        }
        return value;
    }

    private toValidate(metatype): boolean {
        const type = [String, Boolean, Number, Array, Object];
        return !type.find(type => metatype === type);
    }

    private formatError(errors: any[]){
        Logger.log(errors);
        return errors.map(err => {
            for (let property in err.constraints) {
                return err.constraints[property];
            }
        }).join(', ');
    }

    private isEmpty(values: any){
        if(Object.keys(values).length > 0){
            return false;
        }
        return true;
    }
}  
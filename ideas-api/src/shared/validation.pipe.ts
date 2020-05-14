import { Injectable, PipeTransform, ArgumentMetadata } from "@nestjs/common";

@Injectable()
export class ValidationPipe implements PipeTransform{
    transform(value: any, metadata: ArgumentMetadata) {
        const { metatype } = metadata;
        if(!metatype || !this.toValidate(metatype)){
            
        }
    }

    private toValidate(metatype): boolean {
        const type = [String, Boolean, Number, Array, Object];
        return !type.find(type => metatype === type);
    }
} 
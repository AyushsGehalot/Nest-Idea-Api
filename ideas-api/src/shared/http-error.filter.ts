import { Catch, ExceptionFilter, ArgumentsHost, HttpException, Logger, HttpStatus } from "@nestjs/common";

@Catch()
export class HttpErrorFilter implements ExceptionFilter{
    catch(exception: HttpException, host: ArgumentsHost){
        const ctx = host.switchToHttp();
        const req = ctx.getRequest();
        const res = ctx.getResponse();
        const status = exception.getStatus ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

        const errorResponse = {
            code: status,
            timestamp: new Date().toLocaleDateString(),
            path: req.url,
            method: req.method,
            message: (status !== HttpStatus.INTERNAL_SERVER_ERROR ) ? (exception.message || null) : "Internal Server error",
        };

        if(status === HttpStatus.INTERNAL_SERVER_ERROR ){
            console.error(exception);
        }
        
        Logger.error(`${req.method} ${req.url}`, JSON.stringify(errorResponse), 'ExceptionFilter');

        res.status(status).json(errorResponse);
    }
}
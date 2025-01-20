import { StatusCodes } from "http-status-codes";

export class CustomError extends Error {
    constructor(message, comingFrom) {
      super(message);
  
      this.statusCode = undefined; 
      this.status = 'error'; 
      this.comingFrom = comingFrom;
  
      // Capture the stack trace
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, CustomError);
      }
    }
  
    serializeErrors() {
      return {
        message: this.message,
        statusCode: this.statusCode,
        status: this.status,
        comingFrom: this.comingFrom,
      };
    }
  }


  export class BadRequestError extends CustomError {
    statusCode = StatusCodes.BAD_REQUEST;
  
    constructor(message, comingFrom) {
      super(message, comingFrom);
    }
  }

  export class NotAuthenticated extends CustomError {
    statusCode = StatusCodes.UNAUTHORIZED;
    constructor(message,comingFrom){
        super(message,comingFrom)
    }
  }

  export class FileTooLarge extends CustomError {
    statusCode = StatusCodes.REQUEST_TOO_LONG;
    constructor(message,comingFrom ){
        super(message,comingFrom)
    }
  }

  export class NotFoundError extends CustomError {
    statusCode = StatusCodes.NOT_FOUND;
    constructor(message,comingFrom){
        super(message,comingFrom)
    }
  }
  
  
//API error handler 

class ApiError extends Error{

    constructor (
        statusCode,
        message = "Something went Wrong",
        errors = [],
        stack = ""

    ){

        //override use call super 
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if(stack){
            this.stack = stack 
        }else{
            Error.captureStackTrace(this,this.costructor)
        }


    }


}

export{ApiError}
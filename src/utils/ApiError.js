//API error handler 

class ApiError extends Error{

    constructor (
        statusCode,
        message = "Something went Wrong",
        errors = [],
        statck = ""

    ){

        //override use call super 
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if(statck){
            this.stack = statck 
        }else{
            Error.captureStackTrace(this,this.costructor)
        }


    }


}

export{ApiError}
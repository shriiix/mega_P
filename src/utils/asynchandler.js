//promises

// const asyncHandler =(requestHandler)=>{
//     return (req, res, next)=>{
//          Promise.resolve(requestHandler(req,res,next)).catch((error)=> next(error))
//      }
//  }
 
 
//  export default asyncHandler

const asyncHandler = (requestHandler) => {
    return async (req, res, next) => {
        try {
            await Promise.resolve(requestHandler(req, res, next));
        } catch (error) {
            const statusCode = error.statusCode || 500;
            const errorMessage = error.message || "Internal Server Error";
            await res.status(statusCode).json({
                success: false,
                error: errorMessage
            });
        }
    };
};
export default asyncHandler;


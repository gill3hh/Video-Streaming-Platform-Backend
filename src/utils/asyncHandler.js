const asyncHandler = (requestHandler)=>{
   return (req, res, next) => {
      Promise.resolve(requestHandler(req, res, next)).catch((err)=>next(err))
   }
}
 






export {asyncHandler}


// const asyncHandler = () => {}
// const asyncHandler = (func) => {() => {}}  // so basically what is happening is i am first passing a functiona and then passing that 
// // function to next arrow function, now in production we dont use {} for 2nd arrow function and write directly as in line 13.
// const asyncHandler = (func) => () => {} // now we want to make it async function 
// const asyncHandler = (func) => async () => {} // nnow we made it async function 



// this is how we do it in try catch but above we will see the way of promise and i will comment this now.


// const asyncHandler = (fn) => async (req,res,next) => {
//    try{
//       await fn(req, res, next)

//    } catch(error){
//       res.status(err.code || 500).json({
//          success: false,
//          message: err.message
//       })

//    }
// }
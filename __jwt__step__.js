/**
 * Simple but not the best way
 * 1. from client side sent information
 * 2. Generate token jwt.sign()
 * 3. on the client side set token to the localstorage
 */

/**
 * using http only cookies
 * 1. from client side send the information(email, better: firebase er auth token) to generate token
 * 2. on the server side accept user information and if neeeded validate
 * 3. generate token in the server side using secret and expiresIn
 * 
 * ----------
 * Set The cookies
 * 4. While calling th api tell to use withCredenteial
 *  axios.post("http://localhost:3000/jwt", userData, {
                    withCredentials : true
                })
    or fetch fetch(`http://localhost:3000/applications?email=${email}`,{
        credentials : "include"
    })
 * 5. in the cors setting set credentials and origin
 *  app.use(cors({
            origin : ["http://localhost:5173"],
            credential : true
            }))   
 * 6. after generating the token set it to the cookies and with some option
 * app.post("/jwt", async(req, res)=>{
         const userData = req.body 
         const token = await jwt.sign(userData, process.env.JWT_ACCESS_SEC, {expiresIn : "1d"})
         // set token in the cookies
         res.cookie("token",token,{
           httpOnly : true,
           secure : false
         })
 
         res.send({ success : true})
     })
-----------------------------------------
 * 7. one time: use cookie parser as the middleware
 * 8. for every api you want to verify token: in the client side: if using axios withCredentials : true, for fetch: credentials include
 *--------------------------
 * Verify Token
 * 9. Check token exist it no return return status 401 and message Unauthorized
 * 10. jwt.verify function, if error return status 401 and message Unauthorized
 * 11. if token is thevalid set decoded value to the req object
 * 12. if data asking for does not match with the owner or bearer of the token >>403>> forbidden access
*/
# ways2go
Social networking rideshare solution for your daily commute.

***
# **MODELS**
***
### _User_
This is the entry point for the ways2go interface. In order to interact with most of the features, each individual will be asked to provide a unique `username`, `password` and `email` address. This information will be stored securely and used to verify individuals each time they visit the site. ways2go leverages the [bcrypt](https://github.com/kelektiv/node.bcrypt.js) module to safely encrypt and match user passwords.
```
{
    username: "cool_commuter",
    password: "<super salty bcrypt password string>",
    email: "ray_tomlinson@arpa.net",
    timeStamp: "<default to document when account was created>",
    _id: "<supplied by MongoDB when document is created>"
}
```

### _Profile_
This will be the customizable home base for each individual user. The Profile `._id` provided by [Mongodb](https://docs.mongodb.com/manual/core/document/) will serve as the tether that loosely binds the individual to their Ways, Messages and Reviews.
```
{
    userID: "<will be populated with user._id when document is created>",
    displayName: "Rollin with my Homies",
    fullName: " ",
    address: " ",
    bio: " ",
    avgRating: " ",
    timeStamp: " ",
    reviews: [{<array of MongoDB IDs with>}]
}
```
***
# ROUTES
***
### **POST:**  _/api/user_
This is the endpoint to hit to sign up a new user.
##### Request
There are three required components to the request that every user must provide in order to create an account:
 - username
 - password
 - email

The request should be made in JSON format:
```
{ "username": "helloworld", "password": "notpassword", "email": "valid@email.com" }
```
##### Response
The response object *(res.text)* will contain a randomly generated 32 byte string that will serve as the new user's token for signing in to create a profile.
Example
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6IjVhNTFiZmI1YTlkYzJjYzY0MGRkODljODIwZjZkZWZjY2RiMGNmOTc2NGI4YjZkYTUwNDk4NzljOGNjOWZmNDIiLCJpYXQiOjE0ODk1OTIzMjB9.vfM9xh4iFZFOU_aFpWz_z4SbTAwjbAkuRCgnyyhgnEk
```

### **GET:** _/api/user_

This is the endpoint to hit for a user to sign in.
User will be asked to enter `username` and `password`.
ways2go uses the bcrypt npm module to create and verify encypted passwords.
##### Request
Authorization Header: ` req.headers.authorization `
Format: `username:password`
##### Response
`res.text` will contain the authentication token that will allow the user to create or access their profile and all other routes.
**Token:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6IjVhNTFiZmI1YTlkYzJjYzY0MGRkODljODIwZjZkZWZjY2RiMGNmOTc2NGI4YjZkYTUwNDk4NzljOGNjOWZmNDIiLCJpYXQiOjE0ODk1OTIzMjB9.vfM9xh4iFZFOU_aFpWz_z4SbTAwjbAkuRCgnyyhgnEk
```
### **PUT:** _/api/user_
This endpoint will allow users to update their `username` or `password`.
##### Request
User must be signed in and provide token in `Authorization Header`
`'Bearer <token>'` *\(single space between fields required*
The property to be updated should be sent in JSON format within the `req.body`.
`{ "password": "newpassword" }`
##### Response
The `res.text` property of the response object will contain a status code and message. If successful:
```sh
201
password updated successfully
```
### **DELETE** _/api/user_
This endpoint will allow a user to remove their account.
##### Request
User must be signed in and provide token in `Authorization Header` to access this route.
`'Bearer <token>'` *\(single space between fields required*
##### Response
Upon success:
`res.status` => 200
`res.text` => account removed
### **POST** _/api/profile_

##### *Request*

##### Response

### GET /api/profile/:id

##### Request

##### Response

### GET /api/profile

##### Request

##### Response

### PUT /api/profile

##### Request

##### Response

### DELETE /api/profile

##### Request

##### Response

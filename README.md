[![Build Status](https://travis-ci.org/dkulp23/ways2go.svg?branch=master)](https://travis-ci.org/dkulp23/ways2go)
[![Coverage Status](https://coveralls.io/repos/github/dkulp23/ways2go/badge.svg?branch=staging)](https://coveralls.io/github/dkulp23/ways2go?branch=staging)

# ways2go
Social networking rideshare solution for your daily commute.

[Models](#models) | [Routes](#routes) | [Testing](#testing) | [About Us](#about-us)

***
# **MODELS**
[User](#user) | [Profile](#profile) | [Reviews](#review) | [Way](#way) | [Message](#message) |
***
### _User_
This is the entry point for the ways2go interface. In order to interact with most of the features, each individual will be asked to provide a unique `username`, `password` and `email` address. This information will be stored securely and used to verify individuals each time they visit the site. ways2go leverages the [bcrypt](https://github.com/kelektiv/node.bcrypt.js) module to safely encrypt and match user passwords.
```javascript
{
    username: "cool_commuter",
    password: "<super salty bcrypt password string>",
    email: "ray_tomlinson@arpa.net",
    timeStamp: <Date supplied by default when document is created>,
    _id: { Object supplied by MongoDB when document is created }
}
```

### _Profile_
This will be the customizable home base for each individual user. The Profile `._id` provided by [Mongodb](https://docs.mongodb.com/manual/core/document/) will serve as the tether that loosely binds the individual to their Ways, Messages and Reviews.
```javascript
{
    userID: {Object},
    displayName: "Rollin with my Homies",
    fullName: "Joe Driver",
    address: "2909 3rd Ave, Seattle, WA 98103",
    bio: "Who says that the ride to work can't be fun?!",
    avgRating: Number,
    timeStamp: Date,
    reviews: [{Object}]
}
```
- Notes
    - `userID` automatically created with `user._id` when Profile is created
    - `avgRating` is generated from aggregate of review ratings
    - `timeStamp` is automatically generated when Profile is created
    - `reviews` is an array of review._id objects for reviews of Profile owner

### _Review_
This feature will give users the ability to leave feedback for each other. When they are considering a ride with a particular person (or people) they can simply go to particular user's profile and see all Reviews that were left for that user. The fields each Review will contain are: `_id` - provided by [Mongodb](https://docs.mongodb.com/manual/core/document/),  `rating`, `comment`, `timestamp`- set automatically, `user id`, `way id`, and `reviewed user id`.

```Javascript
{
  rating: { type: Number, required: true },
  comment: { type: String, required: false },
  timestamp: { type: Date, required: true, default: Date.now },
  userID: { type: Schema.Types.ObjectId, required: true },
  wayID: { type: Schema.Types.ObjectId, required: true},
  reviewedUserID: { type: Schema.Types.ObjectId, required: true }
}
```
***
# **ROUTES**
***
## User  |  [top](#ways2go)
### **POST:**  _/api/user_
This is the endpoint to hit to sign up a new user.
##### Request
There are three required components to the request that every user must provide in order to create an account:
 - username
 - password
 - email

The request should be made in JSON format:
```json
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
Authorization Header: `req.headers.authorization`
Format: `username:password`
##### Response
**IMPORTANT**
`res.text` will contain the authentication token that will allow the user to **create or access their profile and all other routes**.
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
```javascript
201
password updated successfully
```
### **DELETE:** _/api/user_
This endpoint will allow a user to remove their account.
##### Request
User must be signed in and provide token in `Authorization Header` to access this route.
`'Bearer <token>'` *\(single space between fields required*
##### Response
Upon success:
`res.status` => 200
`res.text` => account removed
## Profile  |  [top](#ways2go)
### **POST:** _/api/profile_
This endpoint will allow a signed in user with a valid token to create a Profile.
##### Request
There are four components on the `req.body` that can be provided by the user to create a profile:
- displayName - unique handle displayed when interacting with features of the app
- fullName - <optional> user's name
- address - <optional> user's home address
- bio - <optional> allows user to provide bio info (will be expanded in future iteration)
Should be sent in JSON format:
```json
{ "displayName": "Rollin with my Homies", "fullName": "Joe Driver",
"address": "2909 3rd Ave, Seattle, WA 98103",
"bio": "Who says that the ride to work can't be fun?" }
```
##### Response
If successful, `res.status` will be `200` and `res.body` will be:
```json
{ "userID": "<user._id>", "displayName": "Rollin with my Homies", "fullName": "Joe Driver",
"address": "2909 3rd Ave, Seattle, WA 98103",
"bio": "Who says that the ride to work can't be fun?", "avgRating": "<avg score>", "timeStamp": "<time profile created>", "reviews": "[]" }
```
- `reviews` will be an empty array when profile is created
### **GET:** _/api/profile/:id_
This enpoint will allow a registered user, with a token, read access to a single, specific profile.
##### Request
`http://ways2go.herokuapp.com/api/profile/<valid 24 character id>`
##### Response
The requested profile on `res.body` in JSON format.
```javascript
{ "userID": "<user._id>", "displayName": "Rollin with my Homies", "fullName": "Joe Driver",
"address": "2909 3rd Ave, Seattle, WA 98103",
"bio": "Who says that the ride to work can't be fun?", "avgRating": "<avg score>", "timeStamp": "<time profile created>", "reviews": "[{array of Review objects}]" }
```
### **GET:** _/api/profile_
Without specifying an ID, this endpoint returns an array of all profiles which can then be sorted or filtered by client side methods.
##### Request
[GET](http://ways2go.herokuapp.com/api/profile)
`Authorization Header`: `'Bearer <token>'`
##### Response
The `res.body` will contain an array of all user profile objects:
```javascript
[{profile}, {profile1}, {profile2}]
```
### PUT /api/profile
Hitting this endpoint will allow a logged in user, with a token, to update their profile information:
##### Request
`http://ways2go.herokuapp.com/api/profile`
- `req.body`
  `{ "displayName": "speed_racer" }`
##### Response
The response body will contain the profile object and properties can be accessed individually:
`res.body.<key>`
### **DELETE:** _/api/profile_
This endpoint will allow a user to remove their profile from the database. In order to keep the database clean, the 'pre' hook middleware of Mongoose is leveraged to also remove any resources related to the profile.
##### Request
`http://ways2go.herokuapp.com/api/profile`

##### Response
If profile is successfully removed, `res.status` will equal `204`.
There will be no `res.body`.
## Review |  [top](#ways2go)
### **POST:** _/api/wayerz/:wayerzID/review_
This endpoint will allow user to leave reviews for people with whom he/she just shared a ride, one at a time. Only signed in and authorized users can perform this operation.
##### Request
There are two properties a user will be able to add to a review body:
- rating
- comment

They may choose to provide both or only submit a rating, which is allowed by our model.
##### Response
Will send a new Review to the database and update a `reviews` property on the reviewed user's profile.
## **GET:** _/api/wayerz/:wayerzID/review_
To have access to this endpoint a user will need to be signed in and choose a user they wish to see reviews for, the Reviews will then be pulled from that user's profile.
##### Request
Will look for the data for a particular way and must contain an `_id` for the user being reviewed.
##### Response
Will return all reviews left for a particular user.
## **PUT:** _/api/review/:id_
This endpoint will allow a user to edit a Review they previously left for a user. Only signed in and authorized users will be able to perform this operation.
##### Request
A rating and a comment will be sent in the `req.body`, where `req.body.rating` is required and `req.body.comment` is optional.
##### Response
An updated Review with an updated `res.body` will then be sent to the database.
### **DELETE:** _/api/review/:id_
This endpoint will allow an authorized user to delete a Review they've previously written.
##### Request
The request needs to contain an `_id` for that Review.
##### Response
Will return a `204 status` to confirm a successful deletion.
***
### **DEPENDENCIES** |  [top](#ways2go)
_Without this wizardry, there would be no ways2go._
***
* [Node](https://nodejs.org/api/)
* [Express](http://expressjs.com/en/4x/api.html)
* [Mongoose](http://mongoosejs.com/docs/api.html)
* [bcrypt](https://github.com/kelektiv/node.bcrypt.js)
* [Bluebird](http://bluebirdjs.com/docs/api-reference.html)
* [Morgan](https://github.com/expressjs/morgan)
* [Cors](https://github.com/expressjs/cors)
* [JWT](https://github.com/auth0/node-jsonwebtoken)
* [HTTP-Errors](https://github.com/jshttp/http-errors)
* [Body-Parser](https://github.com/expressjs/body-parser)
* [dot-env](https://github.com/motdotla/dotenv)
* [parse-address](https://github.com/hassansin/parse-address)
***
### **TESTING** |  [top](#ways2go)
***
* [Mocha Test Framework](https://mochajs.org/)
* [Chai Assertion Library](http://chaijs.com/api/bdd/)
* [Superagent](https://visionmedia.github.io/superagent/)
* [Gulp](https://github.com/gulpjs/gulp/blob/master/docs/API.md)
* [Coveralls](https://coveralls.zendesk.com/hc/en-us/articles/201769715-Javascript-Node)
* [Debug](https://github.com/visionmedia/debug)

***
### **INTEGRATION** |  [top](#ways2go)
***
[Travis CI](https://docs.travis-ci.com/)
***
### **DEPLOYMENT** |  [top](#ways2go)
***
[Heroku](https://devcenter.heroku.com/)

***
# ABOUT US |  [top](#ways2go)
***
### **Anna Ulanova** - Full Stack Developer - [@annaul](https://github.com/annaul)
### **Darcy McCabe** - Full Stack Developer - [@darms](https://github.com/darms)
### **Remil Marzan** - Full Stack Developer - [@remilonwheels](https://github.com/remilonwheels)
### **Dana Kulp** - Full Stack Developer - [@dkulp23](https://github.com/dkulp23)

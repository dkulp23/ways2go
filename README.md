[![Build Status](https://travis-ci.org/dkulp23/ways2go.svg?branch=master)](https://travis-ci.org/dkulp23/ways2go)
[![Coverage Status](https://coveralls.io/repos/github/dkulp23/ways2go/badge.svg?branch=master)](https://coveralls.io/github/dkulp23/ways2go?branch=master)


# Ways2Go
Social networking rideshare solution for your daily commute.

[Models](#models) | [Routes](#routes) | [Testing](#testing) | [About Us](#about-us)

![Ways2GO](./Ways2goDiagram.png)

***
# **MODELS**
[User](#user) | [Profile](#profile) | [Reviews](#review) | [Way](#way) | [Message](#message) |
***
### _User_
This is the entry point for the Ways2Go interface. In order to interact with most of the features, each individual will be asked to provide a unique `username`, `password` and `email` address. This information will be stored securely and used to verify individuals each time they visit the site. Ways2Go leverages the [bcrypt](https://github.com/kelektiv/node.bcrypt.js) module to safely encrypt and match user passwords.
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
    profileID: {Object},
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
    - `profileID` automatically created with `user._id` when Profile is created
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
  profileID: { type: Schema.Types.ObjectId, required: true },
  wayID: { type: Schema.Types.ObjectId, required: true},
  reviewedprofileID: { type: Schema.Types.ObjectId, required: true }
}
```
### _Message_
This feature is only available to authorized members of the Ways2Go community.  Unregistered members see routes, but can only contact them about sharing rides once they've been accepted into the community. By requiring membership we are able to better foster a community of trust for our users.This information is linked back to users through the profile model, via the toProfileID and fromProfileID properties.
```javascript
{
    toProfileID:{ type: Schema.Types.ObjectId, required: true },
  fromProfileID: { type: Schema.Types.ObjectId, required: true },
  timestamp: { type: Date, default: Date.now },
  text : { type: String, required: true }
}
```
- Notes
    - `toProfileID` automatically created with `user._id` when Profile is created
    - `fromProfileID` is generated from aggregate of review ratings
    - `timeStamp` is automatically generated when Message is created
    - `text` the body of the message being sent by the user
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
Ways2Go uses the bcrypt npm module to create and verify encypted passwords.
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
{ "profileID": "<user._id>", "displayName": "Rollin with my Homies", "fullName": "Joe Driver",
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
{ "profileID": "<user._id>", "displayName": "Rollin with my Homies", "fullName": "Joe Driver",
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
### **PUT:** _/api/review/:id_
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
## WAY  |  [top](#ways2go)
***
### **POST:**  _/api/way_
This is the endpoint for an authorized user to create a new Way.
##### Request
There are five components on the `req.body` that can be provided by the user to create a way, two of which are required:
 - startLocation
 - endLocation
 - recurringDayOfWeek <optional>
 - startTime <optional>
 - oneTimeDate <optional>

The request body should be made in JSON format:

```json
{ "startLocation": "123 N Jump St Seattle WA 9812",
  "endLocation": "99 Problems Ave Seattle WA 98108" }
```
##### Response
If successful, `res.status` will be `200` and `res.body` will be the Way that was saved to the database:
Example
```json
{ "profileID": "58cb5469422bbb001115c74f",
  "startLocation": "58cb6af2422bbb001115c758",
  "endLocation": "58cb6af2422bbb001115c759",
  "_id": "58cb6af2422bbb001115c75a",
  "recurringDayOfWeek": [],
  "timestamp": "2017-03-17T04:49:54.925Z",
  "wayerz": [ "58cb5469422bbb001115c74f" ] }
```

### **GET:**  _/api/way/:id_
This is the endpoint to return a Way of a specified `_id` property. If the ID is not specified, an array of all Way objects. ***NOTE:*** This endpoint does not require authorization and is publically available.
##### Request
No additional parameters required for this endpoint
##### Response
If successful, `res.status` will be `200` and `res.body` will be Way returned from the database:
Example
```json
{
    "__v": 1,
    "_id": "58cb6af2422bbb001115c75a",
    "endLocation": {
        "__v": 0,
        "_id": "58cb6af2422bbb001115c759",
        "city": "Seattle",
        "number": "99",
        "state": "WA",
        "street": "Problems",
        "timestamp": "2017-03-17T04:49:54.909Z",
        "type": "Ave",
        "zip": "98108"
    },
    "profileID": "58cb5469422bbb001115c74f",
    "recurringDayOfWeek": [],
    "startLocation": {
        "__v": 0,
        "_id": "58cb6af2422bbb001115c758",
        "city": "Seattle",
        "number": "123",
        "prefix": "N",
        "state": "WA",
        "street": "Jump",
        "timestamp": "2017-03-17T04:49:54.906Z",
        "type": "St",
        "zip": "98121"
    },
    "timestamp": "2017-03-17T04:49:54.925Z",
    "wayerz": [
        {
            "__v": 0,
            "_id": "58cb5469422bbb001115c74f",
            "displayName": "ayowayer",
            "reviews": [],
            "timeStamp": "2017-03-17T03:13:45.018Z",
            "profileID": "58cb4aaddb9f2e0011bc74b3"
        }
    ]
}
```

### **PUT:**  _/api/way/:id_
This is the endpoint for an authorized user to update Way of a specified `_id` property. The authorized user is required to have the associated `profileID` to the Way to successfully update.
##### Request
There are five components on the `req.body` that can be provided by the user to update a way:
 - startLocation
 - endLocation
 - recurringDayOfWeek
 - startTime
 - oneTimeDate

The request body should be made in JSON format:

```json
{  "startTime":630,
  "recurringDayOfWeek":[1,2,3] }
```
##### Response
If successful, `res.status` will be `200` and `res.body` will be the updated Way that was saved to the database:
Example
```json
{ "_id":"58cb6af2422bbb001115c75a",
  "profileID":"58cb5469422bbb001115c74f",
  "startLocation":"58cb6af2422bbb001115c758",
  "endLocation":"58cb6af2422bbb001115c759",
  "__v":1,
  "startTime":630,
  "recurringDayOfWeek":[1,2,3]
  ,"timestamp":"2017-03-17T04:49:54.925Z",
  "wayerz":["58cb5469422bbb001115c74f"] }
```

### **DELETE:**  _/api/way/:id_
This is the endpoint for an authorized user to remove a Way of a specified `_id` property. The authorized user is required to have the associated `profileID` to the Way to successfully delete.

##### Request
User must be signed in and provide token in `Authorization Header` to access this route.
`'Bearer <token>'` *\(single space between fields required*)
##### Response
Upon success:
`res.status` => 204

### **POST:**  _/api/way/:wayID/wayerz/:wayerID_
This is the endpoint for an authorized user to add another user(`wayerID`) to members of the rideshare(wayerz).
##### Request
Although that this request is a POST, a body is not to be provided in this request. The `wayerID` provided as a request url parameter will be the associated `profileID` for the user that is to be added to the `wayerz` of a specified `wayID`.

User must be signed in and provide token in `Authorization Header` to access this route.
`'Bearer <token>'` *\(single space between fields required*)
##### Response
If successful, `res.status` will be `200` and `res.body` will be the Way with an updated wayers property that was saved to the database:
Example
```json
{ "_id":"58cb6af2422bbb001115c75a",
  "profileID":"58cb5469422bbb001115c74f",
  "startLocation":"58cb6af2422bbb001115c758",
  "endLocation":"58cb6af2422bbb001115c759",
  "__v":2,
  "startTime":630,
  "recurringDayOfWeek":[1,2,3],
  "timestamp":"2017-03-17T04:49:54.925Z",
  "wayerz":["58cb5469422bbb001115c74f","58cb81c0a766d40011ec1c34"] }
```

### **DELETE:**  _/api/way/:wayID/wayerz/:wayerID_
This is the endpoint for an authorized user to remove another user(`wayerID`) from the members of the rideshare(wayerz).
##### Request
User must be signed in and provide token in `Authorization Header` to access this route.
`'Bearer <token>'` *\(single space between fields required*)
##### Response
If successful, `res.status` will be `200` and `res.body` will be the Way with an updated wayers property that was saved to the database:
Example
```json
{ "_id":"58cb6af2422bbb001115c75a",
  "profileID":"58cb5469422bbb001115c74f",
  "startLocation":"58cb6af2422bbb001115c758",
  "endLocation":"58cb6af2422bbb001115c759",
  "__v":2,
  "startTime":630,
  "recurringDayOfWeek":[1,2,3],
  "timestamp":"2017-03-17T04:49:54.925Z",
  "wayerz":["58cb5469422bbb001115c74f"] }
```

## MESSAGE  |  [top](#ways2go)
### **POST:**  _/api/profile/:profileID/message_
This is the endpoint for a user to create a new message.
##### Request
The request should be made in JSON format:
```json
{ "profileID": 6789, "password": "notpassword", "email": "valid@email.com" }
```
##### Response
Will either indicate success or failure in creating a new message
```javascript
200
Allows user to post a message
```
```javascript
400
Invalid Body, unable to create a message
```
### **GET:** _/api/message/:id_
This is the endpoint for a user to retrieve their messages.
User will be asked to enter `username` and `password`.
Ways2Go uses the bcrypt npm module to create and verify encypted passwords.
##### Request
Authorization Header: `req.headers.authorization`
Format: `username:password`
##### Response
`res.text` will contain the authentication token that will allow the user to access their messages.
```javascript
200
Allows user to review previous messages
```
```javascript
404
Not Found
```
### **PUT:** _/api/message/:id_
This endpoint will allow users to update the`text` in a message.
##### Request
User must be signed in and provide token in `Authorization Header`
`'Bearer <token>'` *\(single space between fields required*
The property to be updated should be sent in JSON format within the `req.body`.
`{ "password": "newpassword" }`
##### Response
The `res.text` property of the response object will contain a status code and message. If successful:
```javascript
200
Including any updated text from the user
```
```javascript
400
Bad request
```
```javascript
401
Unauthorized to make any updates
```
### **DELETE** _/api/message/:id_
This endpoint will allow a user to remove a message they have sent.
##### Request
User must be signed in and provide token in `Authorization Header` to access this route.
`'Bearer <token>'` *\(single space between fields required*)
##### Response
Upon success:
`res.status` => 200
Upon failure:
`res.status` => 401
`res.text`: Sorry, you do not have access to these messages

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

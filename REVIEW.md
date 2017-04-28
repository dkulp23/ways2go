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

##### _Review Routes_
## **POST:** _/api/wayerz/:wayerzID/review_
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

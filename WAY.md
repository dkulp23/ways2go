
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

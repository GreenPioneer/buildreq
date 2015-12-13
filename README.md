# BuildREQ

[![npm][npm-image]][npm-url]
[![downloads][downloads-image]][downloads-url]
[![dependencies](https://david-dm.org/greenpioneer/buildreq.svg)](https://david-dm.org/greenpioneer/buildreq)
[![npm-issues](https://img.shields.io/github/issues/GreenPioneer/buildreq.svg)](https://github.com/GreenPioneer/buildreq/issues)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

[npm-image]: https://img.shields.io/npm/v/buildreq.svg?style=flat
[npm-url]: https://npmjs.org/package/buildreq
[downloads-image]: https://img.shields.io/npm/dm/buildreq.svg?style=flat
[downloads-url]: https://npmjs.org/package/buildreq

## What is Build Response,Routing,Error & Query?
It is currently a Mongoose & Express dependent module. It can be used in a different ways. It is most useful when used as a middleware with expressjs  in conjunction with your api.


## Init & Config
``` javascript
<!-- Init -  require('../buildreq')() -->
var build = require('../buildreq')(<!-- Config option #1 {console: false}-->) 
build.config(<!-- Config option #2 {console: false}-->)
```

## R - Response Builder - WORKING 

The next common way to use this module is to have it build your api response so that you have a consistent format. This response is dynamic enough right off the bat to do logic based on actions you wish to give your frontend. Great thing is if you don’t like some of the fields you can delete them in the configs. 

``` javascript
build.response(res, {
    method: 'json',
    query: req.queryParameters,
    hostname: req.get('host') + req.path,
    route: req.route,
    data: 'no data'
  })
``` 

Configs
``` javascript
build.config({
  response: {
  //configs go here
  }
})
```

Key | Description | Default Value
--- | --- | ---
`method` | uses the GET method by default | `get`
`data` | uses empty object by default | `{}`
`user` | uses empty object by default | `{}`
`count` | uses zero by default | `0`
`hostname` | uses empty string by default | `''`
`query` | uses empty object by default | `{}`
`type` | uses empty string by default | `''`
`actions.prev` | turns on action.prev by default | `true`
`actions.next` | turns on action.next by default | `true`
`actions.reload` | turns on action.reload by default | ` true`
`delete` | deletes response objects | `[] `

## R - Routing Builder - Working

It is a optional routing builder . what it does is it creates CRUD routes and interacts with the database based off of the shcema from mongoose. More to come on it later.

``` javascript
var blogSchema = mongoose.Schema({
  created: {
    type: Date,
    default: Date.now
  }
})
Blog = mongoose.model('Blog', blogSchema)
//var route = build.routing(app)
//console.log(route)
//or
build.routing({
    app:app,
    mongoose: mongoose
},function(error,data){
    console.log(data)
})

// Routes that will be created for you
// http://localhost:3000/api/v1/blog - GET,POST | GETALL - CREATE 
// http://localhost:3000/api/v1/blog/id/:blogId - PUT,DELETE,GET | UPDATE DELETE VIEWONE
// http://localhost:3000/api/v1/blog/aggregate - GET | USE AGGREGATION FRAMEWORK
// http://localhost:3000/api/v1/blog/fields/ - GET | GETS ALL FIELDS IN SCHEMA
// http://localhost:3000/api/v1/blog/options/ - GET | GETS ALL OPTIONS IN SCHEMA
// http://localhost:3000/api/v1/blog/_indexes/ - GET | GETS ALL INDEXES IN SCHEMA

//You Can Inject mongoose in your routing if need be
//You can also wait for the connection to openbefore injecting it
var mongoose = require('mongoose')

  mongoose.connection.onOpen(function(){
    //console.log(mongoose.connection)
    console.log('open')
    //console.log(mongoose.models)
    build.routing(app,mongoose)
  })


// OR you can  build it on your end by setting the config to not build
var build = require('buildreq')(
    routing: {
        schema: true,
        url: '/api/v1/',
        build: false
    }
)

_.forEach(build.routing(app, mongoose), function (m) {
  app.use(m.route, m.app)
})
``` 

Configs
``` javascript
build.config({
  routing: {
  //configs go here
  }
})
```

Key | Description | Default Value
--- | --- | ---
`schema` | uses mongoose schema by default - N/A taken out for now | []
`url` | change the default url that the routing is built with | '/api/v1/'
`build` | change the default to false to manually mount the routing | 'true'
`middleware` | change the default to false to manually mount the routing | `{ auth: [], noauth: [], all: [] }`
`remove` | remove mongoose models by name if you dont want them routed ex `['Users'] | `[]`


## E - Error - N/A
``` javascript
app.use(build.error())
``` 


## Q - Query Builder - WORKING

The most common used way is as a dynamic query builder as express middleware. It watches on the “req.query “ to see how you users interacting with it. Once it captures the data it will then check it again all of you defined mongoose schemas. By doing that it allows the builder to know what to allow and what not to all. This will give you a dynamic api query handler with out having to code anything at all . All you need to do is to tell express to use the module as middleware “app.use(buildReq.query);”

``` javascript
app.use(build.query())
``` 

Configs
``` javascript
build.config({
  query: {
  //configs go here
  }
})
```

Key | Description | Default Value
--- | --- | ---
`sort` | uses created field by default | `'-created'`
`filter` | uses empty object by default otherwise it finds dynamically based of schema | `{}`
`limit` | uses empty string by default | `20`
`select` | uses empty string by default | `''`
`populateId` | uses empty string by default | `''`
`populateItems` | uses empty string by default | `''`
`lean` | uses empty string by default | `''`
`skip` | uses empty string by default | `0`
`where` | uses empty string by default | `''`
`gt:` | uses where for GreaterThan | `false`
`gte:` | uses where for GreaterThanEqual | `false`
`lte:` | uses where for LessThanEqual | `false`
`lt:` | uses where for LessThan | `false`
`in:` | uses where for IN array | `false`
`ne:` | uses where for NE Not Equal | `false`
`nin:` | uses where for NIN not in array | `false`
`regex:` | uses where with options for regex | `false`
`options:` | uses where regex required | `false`
`size:` | uses where for SIZE of array | `false`
`all:` | uses where for ALL | `false`
`find:` | uses where for FIND | `false`
`equals:` | uses where for EQUALS | `false`
`aggregate:`| uses Aggregation Framework with object you send| `false`
`errorMessage` | uses string by default when user passes bad value | `Unknown Value`
`delete` | uses empty array by default | `[]`
`mongoose` | uses boolean to use mongoose to to have custom | `true`
`schema` | uses empty [] if you dont use a custom schema | `[]`


Key | Example urls
--- | ---
gt & lt | `http://localhost:3000/api/v1/campaigns?where=created&gt=2015-11-17&lt=2015-12-30`
equals | `http://localhost:3000/api/v1/campaigns?where=email&equals=john@greenpioneersolutions.com`
in | `http://localhost:3000/api/v1/campaigns?where=emails&in=javier@greenpioneersolutions.com`
ne | `http://localhost:3000/api/v1/campaigns?where=email&ne=john@greenpioneersolutions.com`
nin | `http://localhost:3000/api/v1/campaigns?where=emails&nin=javier@greenpioneersolutions.com`
regex & options| `http://localhost:3000/api/v1/campaigns?where=email&regex=\/com\/&options=%3Coptions%3E`
size | `http://localhost:3000/api/v1/campaigns?where=emails&size=2`
all | `http://localhost:3000/api/v1/campaigns?where=email&all=shawn@greenpioneersolutions.com`
find | `http://localhost:3000/api/v1/campaigns?where=email&find=shawn@`
aggregate | `http://localhost:3000/api/v1/campaigns/task/aggregated?aggregate[$unwind]=$donations&aggregate[$group][_id]=$_id&aggregate[$group][balance][$sum]=$donations.amount`
  

Created by ![Green Pioneer](http://greenpioneersolutions.com/img/icons/apple-icon-180x180.png)
### Simple Examples - One with mongoose and one with mongoose
``` javascript
//WITH MONGOOSE
'use strict';
var express = require('express')
var mongoose = require('mongoose')
var build = require('../buildreq')()
var app = express();
mongoose.connect('mongodb://localhost/mean-dev');
var blogSchema = mongoose.Schema({
    created: {
        type: Date,
        default: Date.now
    },
    title: {
        type: String,
        required: true,
        trim: true,
        default: "testtitle"
    }
});
var Blog = mongoose.model('Blog', blogSchema);
app.use(build.query());
//builds a complete api based of shcemas
// http://localhost:3000/api/v1/blog - GET , CREATE  - http://localhost:3000/api/v1/blog/:blogId - PUT DELETE GET
// http://localhost:3000/api/v1/users - GET , CREATE  - http://localhost:3000/api/v1/users/:blogId - PUT DELETE GET
build.routing(app);
app.get('/', function (req, res) {
    res.json(req.queryParameters);
})
app.listen(3000, function () {
    console.log("Express server listening on port 3000");
});
``` 
``` javascript
//WITHOUT MONGOOSE
'use strict';
var express = require('express')
var build = require('../buildreq')()
build.config({
    query: {
        schema: ['created', 'name', 'data', 'title']
    }
})
var app = express();
app.use(build.query());
app.get('/', function (req, res) {
    res.json(req.queryParameters);
})
app.listen(3000, function () {
    console.log("Express server listening on port 3000");
});
``` 



### Future
 -Add Error Builder
 -Add Refactor
 -Add Get Production Ready
 -gulp 
 -testing - super agent
 -more docs
 -build BUILDREQ Schema
 - fix reload action
 - promises bluebird
 -debug

### Contributing
Looking for anyone that could have a use for this module in his or her daily life to help contribute .

### RUN EXAMPLE CODE - 
``` bash
cd /YOURDIRECTORY/
npm install buildreq
cd ex/
node app.js
``` 


### RESPONSE LOOKS LIKE THIS IF I USE THIS URL -
//http://localhost:3000/?created=GPS&sort=created&populateItems=author%20content%20author,created
```javascript
    {
        "actions": {
            "reload": {
                "allowed": ["get"],
                "ref": "localhost:3000/?sort=created&created=GPS&populateId=Blog%20Users&populateItems=author%20content%20created"
            }
        },
        "query": {
            "error": {},
            "filter": {
                "created": "GPS"
            },
            "skip": 0,
            "where": "",
            "gt": 1,
            "lt": 0,
            "in": [],
            "lean": false,
            "sort": "created",
            "limit": 30,
            "select": "",
            "populateId": "Blog Users ",
            "populateItems": "author content created "
        },
        "count": 0,
        "itemPerPage": 0,
        "data": [],
        "user": {},
        "type": "",
        "error": {},
        "success": true
    }
```

### RESPONSE LOOKS LIKE THIS IF I USE THIS URL -
//http://localhost:3000/
```javascript
    {
        "actions": {
            "reload": {
                "allowed": ["get"],
                "ref": "localhost:3000/"
            }
        },
        "query": {
            "error": {},
            "filter": {},
            "skip": 0,
            "where": "",
            "gt": 1,
            "lt": 0,
            "in": [],
            "lean": false,
            "sort": "-created",
            "limit": 30,
            "select": "",
            "populateId": "Blog Users ",
            "populateItems": "created title content author _id id __v name email username "
        },
        "count": 0,
        "itemPerPage": 0,
        "data": [],
        "user": {},
        "type": "",
        "error": {},
        "success": true
    }
```

### CHECKOUT THE EXAMPLE IN /EX/APP.JS


#### This is [on GitHub](https://github.com/GreenPioneer/buildreq)
#### Find us [on GitHub](https://github.com/GreenPioneer)
#### Find us [on Twitter](https://twitter.com/greenpioneerdev)
#### Find us [on Facebook](https://www.facebook.com/Green-Pioneer-Solutions-1023752974341910)
#### Find us [on The Web](http://greenpioneersolutions.com/)
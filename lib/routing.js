var _ = require('lodash')
var express = require('express')
var chalk = require('chalk')
var bodyParser = require('body-parser')
var methodOverride = require('method-override')
var helmet = require('helmet')
var compression = require('compression')
// var async = require('async')
var auto = require('run-auto')
var debug = require('debug')('buildreq:routing')

function routing (setup) {
  var settings = setup()
  var apps = {}
  var mountRoutes = {}
  _.forEach(settings.models, function (n) {
    apps[n] = express() // the sub app
    // body parsing middleware.
    apps[n].use(bodyParser.json())
    // Lets you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it.
    apps[n].use(methodOverride())
    // well-known web vulnerabilities
    apps[n].use(helmet())
    // Gzip compressing
    apps[n].use(compression())
    // ERROR middleware - still need to develop
    apps[n].use(settings.error())
    // Deep Populate
    var deepPopulate = require('mongoose-deep-populate')(settings.mongoose)
    settings.mongoose.modelSchemas[n].plugin(deepPopulate, settings.options.routing.deepPopulateOptions)
    // GET all
    // NEED TO UPDATE THE POPULATE

    debug('middleware noauth', settings.middleware.noauth)
    debug('middleware auth', settings.middleware.auth)
    debug('middleware all', settings.middleware.all)
    if (settings.middleware.noauth)apps[n].get('/', settings.middleware.noauth)
    if (settings.middleware.all)apps[n].get('/', settings.middleware.all)
    apps[n].get('/', function (req, res, next) {
      auto({
        get: function (cb) {
          settings.mongoose.model([n])
            .find(req.queryParameters.filter || '')
            .where(req.queryParameters.where || '')
            .sort(req.queryParameters.sort || '')
            .select(req.queryParameters.select || '')
            .limit(req.queryParameters.limit || '')
            .skip(req.queryParameters.skip || '')
            .deepPopulate(req.queryParameters.deepPopulate || '')
            .populate(req.queryParameters.populateId || '', req.queryParameters.populateItems || '')
            .exec(cb)
        },
        count: function (cb) {
          settings.mongoose.model([n])
            .find(req.queryParameters.filter || '')
            .where(req.queryParameters.where || '')
            .count()
            .exec(cb)
        }
      }, function (err, results) {
        if (err) return next(err)
        debug('end get ', n)
        return settings.response(res, {
          count: results.count,
          method: 'json',
          query: req.queryParameters,
          hostname: req.get('host') + req.baseUrl,
          originalUrl: req.get('host') + req.originalUrl,
          originalQuery: req.query,
          route: req.route,
          data: results.get,
          type: n
        })
      })
    })
    // CREATE new
    if (settings.middleware.auth)apps[n].post('/', settings.middleware.auth)
    if (settings.middleware.all)apps[n].post('/', settings.middleware.all)
    apps[n].post('/', function (req, res, next) {
      var data = settings.mongoose.model([n])
      data
        .create(req.body)
        .then(function (thenData) {
          settings.response(res, {
            method: 'json',
            query: req.queryParameters,
            hostname: req.get('host') + req.path,
            originalUrl: req.get('host') + req.originalUrl,
            originalQuery: req.query,
            route: req.route,
            data: thenData,
            type: n
          })
        })
        .catch(function (err) {
          return next(err)
        })
    })

    // UPDATE by ID
    if (settings.middleware.auth)apps[n].put('/:' + n + 'Id', settings.middleware.auth)
    if (settings.middleware.all)apps[n].put('/:' + n + 'Id', settings.middleware.all)
    apps[n].put('/:' + n + 'Id', function (req, res, next) {
      var data = req[apps[n]]
      data = _.merge(data, req.body)
      data.save().then(function (thenData) {
        settings.response(res, {
          method: 'json',
          query: req.queryParameters,
          hostname: req.get('host') + req.path,
          originalUrl: req.get('host') + req.originalUrl,
          originalQuery: req.query,
          route: req.route,
          data: thenData,
          type: n
        })
      }).catch(function (err) {
        return next(err)
      })
    })

    // PATCH by ID patch
    if (settings.middleware.auth)apps[n].patch('/:' + n + 'Id', settings.middleware.auth)
    if (settings.middleware.all)apps[n].patch('/:' + n + 'Id', settings.middleware.all)
    apps[n].patch('/:' + n + 'Id', function (req, res, next) {
      var data = req[apps[n]]
      data = _.merge(data, req.body)
      data.save().then(function (thenData) {
        settings.response(res, {
          method: 'json',
          query: req.queryParameters,
          hostname: req.get('host') + req.path,
          originalUrl: req.get('host') + req.originalUrl,
          originalQuery: req.query,
          route: req.route,
          data: thenData,
          type: n
        })
      }).catch(function (err) {
        return next(err)
      })
    })

    // DELETE by ID
    if (settings.middleware.auth)apps[n].delete('/:' + n + 'Id', settings.middleware.auth)
    if (settings.middleware.all)apps[n].delete('/:' + n + 'Id', settings.middleware.all)
    apps[n].delete('/:' + n + 'Id', function (req, res, next) {
      var data = req[apps[n]]
      data.remove().then(function (thenData) {
        settings.response(res, {
          method: 'json',
          query: req.queryParameters,
          hostname: req.get('host') + req.path,
          originalUrl: req.get('host') + req.originalUrl,
          originalQuery: req.query,
          route: req.route,
          data: thenData,
          type: n
        })
      }).catch(function (err) {
        return next(err)
      })
    })

    // SHOW by ID
    if (settings.middleware.noauth)apps[n].get('/:' + n + 'Id', settings.middleware.noauth)
    if (settings.middleware.all)apps[n].get('/:' + n + 'Id', settings.middleware.all)
    apps[n].get('/:' + n + 'Id', function (req, res) {
      settings.response(res, {
        method: 'json',
        query: req.queryParameters,
        hostname: req.get('host') + req.path,
        originalUrl: req.get('host') + req.originalUrl,
        originalQuery: req.query,
        route: req.route,
        data: req[apps[n]],
        type: n
      })
    })
    // PARAM of the ID
    apps[n].param(n + 'Id', function (req, res, next, id) {
      if (!settings.mongoose.Types.ObjectId.isValid(id)) {
        return res.status(500).send('Parameter passed is not a valid Mongo ObjectId')
      } else {
        try {
          settings.mongoose.model([n])
            .findOne({
              _id: id
            })
            .deepPopulate(req.queryParameters.deepPopulate || '')
            .populate(req.queryParameters.populateId || '', req.queryParameters.populateItems || '')
            .exec()
            .then(function (thenData) {
              req[apps[n]] = thenData
              next()
            })
            .catch(function (err) {
              if (err) return next(err)
            })
        } catch (err) {
          req[apps[n]] = {}
          next(err)
        }
      }
    })
    // use aggregation framework
    if (settings.middleware.auth)apps[n].get('/task/aggregate/', settings.middleware.auth)
    if (settings.middleware.all)apps[n].get('/task/aggregate/', settings.middleware.all)
    if (settings.middleware.admin)apps[n].get('/task/aggregate/', settings.middleware.admin)
    apps[n].get('/task/aggregate/', function (req, res, next) {
      if (req.queryParameters.aggregate) {
        settings.mongoose.model([n]).aggregate(req.queryParameters.aggregate || '').exec(function (err, results) {
          if (err) return next(err)
          settings.response(res, {
            count: results.length,
            method: 'json',
            query: req.queryParameters,
            hostname: req.get('host') + req.get('host') + req.path,
            originalUrl: req.originalUrl,
            originalQuery: req.query,
            route: req.route,
            data: results,
            type: n
          })
        })
      } else {
        settings.response(res, {
          method: 'json',
          query: req.queryParameters,
          hostname: req.get('host') + req.path,
          originalUrl: req.get('host') + req.originalUrl,
          originalQuery: req.query,
          route: req.route,
          data: {error: 'no data object for aggregate'},
          type: n
        })
      }
    })
    // show count
    if (settings.middleware.auth)apps[n].get('/task/count/', settings.middleware.auth)
    if (settings.middleware.all)apps[n].get('/task/count/', settings.middleware.all)
    apps[n].get('/task/count/', function (req, res, next) {
      settings.mongoose.model([n]).count(req.queryParameters.filter || '').then(function (totalCount) {
        settings.response(res, {
          count: totalCount,
          method: 'json',
          query: req.queryParameters,
          hostname: req.get('host') + req.path,
          originalUrl: req.get('host') + req.originalUrl,
          originalQuery: req.query,
          route: req.route,
          data: {count: totalCount},
          type: n
        })
      }).catch(function (err) {
        return next(err)
      })
    })

    // show fields
    if (settings.middleware.auth)apps[n].get('/task/fields/', settings.middleware.auth)
    if (settings.middleware.all)apps[n].get('/task/fields/', settings.middleware.all)
    if (settings.middleware.admin)apps[n].get('/task/fields/', settings.middleware.admin)
    apps[n].get('/task/fields/', function (req, res) {
      var fields = _.remove(_.keys(settings.mongoose.model([n]).schema.tree), function (f) {
        if (f === '_id') return false
        else if (f === 'id') return false
        else if (f === '__v') return false
        else return true
      })
      var treePath = settings.mongoose.model([n]).schema.paths
      var tree = {}
      _.forEach(treePath, function (t, k) {
        if (k !== 'id' && k !== '__v' && k !== '_id') {
          tree[k] = {
            instance: t.instance,
            isRequired: t.isRequired || false
          }
        }
      })
      settings.response(res, {
        method: 'json',
        query: req.queryParameters,
        hostname: req.get('host') + req.path,
        originalUrl: req.get('host') + req.originalUrl,
        originalQuery: req.query,
        route: req.route,
        data: {
          fields: fields,
          tree: tree
        },
        type: n
      })
    })
    // options
    if (settings.middleware.auth)apps[n].get('/task/options/', settings.middleware.auth)
    if (settings.middleware.all)apps[n].get('/task/options/', settings.middleware.all)
    if (settings.middleware.admin)apps[n].get('/task/options/', settings.middleware.admin)
    apps[n].get('/task/options/', function (req, res) {
      settings.response(res, {
        method: 'json',
        query: req.queryParameters,
        hostname: req.get('host') + req.path,
        originalUrl: req.get('host') + req.originalUrl,
        originalQuery: req.query,
        route: req.route,
        data: _.keys(settings.mongoose.model([n]).schema.options),
        type: n
      })
    })
    // _indexes
    if (settings.middleware.auth)apps[n].get('/task/_indexes/', settings.middleware.auth)
    if (settings.middleware.all)apps[n].get('/task/_indexes/', settings.middleware.all)
    if (settings.middleware.admin)apps[n].get('/task/_indexes/', settings.middleware.admin)
    apps[n].get('/task/_indexes/', function (req, res) {
      settings.response(res, {
        method: 'json',
        query: req.queryParameters,
        hostname: req.get('host') + req.path,
        originalUrl: req.get('host') + req.originalUrl,
        originalQuery: req.query,
        route: req.route,
        data: _.keys(settings.mongoose.model([n]).schema._indexes),
        type: n
      })
    })
    // Mount the routes'/api/v1/'
    if (settings.options.console && settings.options.routing.build && settings.app)console.log(chalk.blue('Routes Built: ' + settings.options.routing.url + n))
    if (settings.options.routing.build && settings.app)settings.app.use(settings.options.routing.url + n, apps[n])
    mountRoutes[n] = {}
    mountRoutes[n].app = apps[n]
    mountRoutes[n].route = settings.options.routing.url + n
  })
  if (typeof (settings.callback) === 'function') {
    return settings.callback(null, mountRoutes)
  } else {
    return {
      error: null,
      data: mountRoutes
    }
  }
}
module.exports = routing

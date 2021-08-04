'use strict';
module.exports = function(app) {
  var visitorController = require('../controllers/visitorController');

  // Route to get visitor stats
  app.route('/api/visitors').get(visitorController.get_visitor_stats)
};
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Status = mongoose.model('Status'),
    moment = require('moment'),
    utility = require('../data/Utility');

exports.getProfile = function(req, res) {
    var userID = req.params.userID;
    User.findOne({
            _id: userID
        },
        function(err, data) {
            if (err) {
                return utility.handleError(res, err);
            } else {
                return res.send(data);
            }
        });
}

exports.test = function(req, res) {
    return res.send({
        test: "successful"
    });
}

exports.UpdateOrSavePetProfile = function(req, res) {
    var userID = req.params.userID;
    console.log('req.body is: ', req.body);
    var upsertData = {
        pet: req.body
    };

    // var updateOptions = {
    //     upsertData: false,
    //     new: true
    // };


    var updateOptions = {
        $set: {
            pet: req.body
        }
    };

    User.update({
            _id: userID
        },
        updateOptions,
        function(err, data) {
            if (err) {
                return utility.handleError(res, err);
            } else {
                return res.send(data);
            }
        });
}


exports.getMyPosts = function(req, res) {
    var userID = req.params.userID;

    Status.find({
            _Owner: userID
        },
        function(err, data) {
            if (err) {
                return utility.handleError(res, err);
            } else {
                return res.send(data);
            }
        });
}

exports.makeNewPost = function(req, res) {
    var userID = req.params.userID;
    console.log('user is: ', userID);
    //assigns the user as the donor
    var updateObj = req.body;
    updateObj._Owner = userID;
    console.log('b4 create');
    Status.create(updateObj, function(err, results) {
        if (err) {
            console.log('in err', err);
            return utility.handleError(res, err);
        } else {
            console.log('in else');
            return res.send(results);
        }
    });
}

exports.getMoments = function(req, res) {
    console.log('get moments');
    var userID = req.body.userID;
    var query = Status.find({}).populate('_Owner');
    //     _Owner: {
    //         '$ne': userID
    //     }
    // });

    //get statuses in the last 4 hours

    // created >= now - 4 hours
    // query.where('createdDate').gte(moment().subtract(4, 'hours'));


    var location = req.body.location;
    var rad = req.body.rad;
    //use 4/1/2015 as default date

    //if the location is set, find all wishes that are within (rad) miles within (location)
    if (location && rad) {
        console.log('got location and rad');
        console.log('loc is: ', location);
        // console.log('loc split is: ', location.split(','));
        // //convert location to number array

        // var locArray = location.split(',').map(function(item) {
        //     return parseFloat(item);
        // });

        // console.log('locArray is: ', locArray);
        var area = {
            center: location,
            radius: utility.milesToRadians(rad),
            unique: true,
            spherical: true
        };
        query.where('location').within().circle(area);

    }

    query.exec(function(err, data) {
        if (err) {
            return utility.handleError(res, err);
        } else {
            return res.send(data);
        }
    });
}

var express = require('express');
<<<<<<< HEAD
var router = express.Router();
var Bird = require('../models/bird');

/* GET home page  */
router.get('/', function(req, res, next) {

    Bird.find().select( { name: 1, description : 1 } ).sort( { name: 1 } )
        .then( ( docs ) => {
            //console.log(docs);  // not required, but useful to see what is returned
            res.render('index', { title: 'All Birds', birds: docs });
        }).catch( (err) => {
        next(err)
    });

});


/* POST to create new bird in birds collection  */
router.post('/addBird', function(req, res, next) {

    // use form data to make a new Bird; save to DB
    var bird = Bird(req.body);

    // Have to re-arrange the form data to match our nested schema.
    // Form data can only be key-value pairs.
    bird.nest = {
        location: req.body.nestLocation,
        materials: req.body.nestMaterials
    }

    bird.save()
        .then( (doc) => {
            //console.log(doc);
            res.redirect('/')
        })
        .catch( (err) => {

            if (err.name === 'ValidationError') {
                // Check for validation errors, e.g. negative eggs or missing name
                // There may be more than one error. All messages are combined into
                // err.message, but you may access each ValidationError individually
                req.flash('error', err.message);
                res.redirect('/');
            }

            else {
                // Not either of these? Pass to generic error handler to display 500 error
                next(err);
            }
        });
});


/* GET info about one bird */
router.get('/bird/:_id', function(req, res, next){

    Bird.findOne( { _id: req.params._id })
        .then( (doc) => {
            if (doc) {

                // If array is unsorted or not sorted in desired way, can sort in code
                /* doc.datesSeen = doc.datesSeen.sort( function(a, b) {
                   if (a && b) {
                     return a.getTime() - b.getTime();
                   }
                 });   */

                res.render('bird', { bird: doc });
            } else {
                res.status(404);
                next(Error("Bird not found"));  // 404 error handler
            }
        })
        .catch( (err) => {
            next(err);
        });
});


/* POST to add a new sighting for a bird. Bird _id expected in body */
router.post('/addSighting', function(req, res, next){

    // Push new date onto datesSeen array and then sort in date order.
    Bird.findOneAndUpdate( {_id : req.body._id}, { $push : { datesSeen : { $each: [req.body.date], $sort: 1} } }, {runValidators : true})
        .then( (doc) => {
            if (doc) {
                res.redirect('/bird/' + req.body._id);   // Redirect to this bird's info page
            }
            else {
                res.status(404);  next(Error("Attempt to add sighting to bird not in database"))
            }
        })
        .catch( (err) => {

            console.log(err);

            if (err.name === 'CastError') {
                req.flash('error', 'Date must be in a valid date format');
                res.redirect('/bird/' + req.body._id);
            }
            else if (err.name === 'ValidationError') {
                req.flash('error', err.message);
                res.redirect('/bird/' + req.body._id);
            }
            else {
                next(err);
            }
        });

});



module.exports = router;


// if (!req.body.date) {
//   req.flash('error', 'Enter a sighting date');
//   res.redirect('bird/' + req.body._id);  // back to the page this request came from
// }
//

=======
var router = express.Router()

var Bird = require('../models/bird');

/* GET home page. */
router.get('/', function(req, res, next) {
    Bird.find(function(err, birds){
        if (err) {
            return next(err);
        }

        res.render('index', { birds: birds });
    })
});

/* POST to home page - handle form submit */
router.post('/', function(req, res, next){

    // Make a copy of non-blank fields from req.body

    var birdData = {};

    for (var field in req.body) {
        if (req.body[field]) {      // Empty strings are false
            birdData[field] = req.body[field];
        }
    }

    // If either of the nest attributes provided, add them to birdData
    if (birdData.nestLocation || birdData.nestMaterials) {
        birdData.nest = {
            location: birdData.nestLocation,
            materials: birdData.nestMaterials
        };
    }

    // Remove non-nested data
    delete(birdData.nestLocation); delete(birdData.nestMaterials);

    // Extract the date, set to Date.now() if not present
    var date = birdData.dateSeen || Date.now();
    birdData.datesSeen = [ date ];  // A 1-element array
    delete(birdData.dateSeen);   // remove dateSeen, don't need

    console.log(birdData);

    var bird = Bird(birdData);  //Create new Bird from req.body

    bird.save(function(err, newbird){

        if (err) {

            if (err.name == 'ValidationError') {

                //Loop over error messages and add the message to messages array
                var messages = [];
                for (var err_name in err.errors) {
                    messages.push(err.errors[err_name].message);
                }

                req.flash('error', messages);
                return res.redirect('/')
            }

            //For other errors we have not anticipated, send to generic error handler
            return next(err);
        }

        console.log(newbird);
        return res.redirect('/')
    })
});

router.post('/addDate', function(req, res, next){

    if (!req.body.dateSeen) {
        req.flash('error', 'Please provide a date for your sighting of ' + req.body.name);
        return res.redirect('/');
    }

    // Find the bird with the given ID, and add this new date to the datesSeen array
    Bird.findById( req.body._id, function(err, bird) {

        if (err) {
            return next(err);
        }

        if (!bird) {
            res.statusCode = 404;
            return next(new Error('Not found, bird with _id ' + req.body._id));
        }

        console.log('date saved = ' + req.body.dateSeen);

        bird.datesSeen.push(req.body.dateSeen);  // Add new date to datesSeen array

        console.log(bird.datesSeen)

        // And sort datesSeen
        bird.datesSeen.sort(function(a, b) {
            if (a.getTime() < b.getTime()) { return 1;  }
            if (a.getTime() > b.getTime()) { return -1; }
            return 0;
        });


        bird.save(function(err){
            if (err) {
                if (err.name == 'ValidationError') {
                    //Loop over error messages and add the message to messages array
                    var messages = [];
                    for (var err_name in err.errors) {
                        messages.push(err.errors[err_name].message);
                    }
                    req.flash('error', messages);
                    return res.redirect('/')
                }
                return next(err);   // For all other errors
            }

            return res.redirect('/');  //If saved successfully, redirect to main page
        })
    });
});


module.exports = router;
>>>>>>> origin/master

<<<<<<< HEAD
var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

/* Information about a bird species, and dates this bird was seen */

var birdSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Bird name is required.'],
        unique: true,
        uniqueCaseInsensitive: true,
        validate: {
            validator: function(n) {
                return n.length >= 2;
            },
            message: '{VALUE} is not valid, bird name must be at least 2 letters'
        }
    },             // species name e.g. Great Horned Owl. Required and must be unique, and at least 2 letters long.
    description: String,                                       // e.g. "Large brown owl"
    averageEggs: {
        type: Number,
        min: [1, 'Should be at least 1 egg.'],
        max: [50, 'Should not be more than 50 eggs.'] },    // At least 1, no more than 50
    endangered: { type: Boolean, default: false },        // Is bird species threatened with extinction?
    datesSeen: [ {
        type: Date,
        requred: true,
        validate: {
            validator: function(d) {
                if (!d) { return false; }
                return d.getTime() <= Date.now();
            },
            message: 'Date must be a valid date. Date must be now or in the past.'
        }
    } ],  // An array of dates a bird of this species was seen. Must be now, or in the past
    nest: {
        location: String,
        materials: String
    }
});

var Bird = mongoose.model('Bird', birdSchema);
birdSchema.plugin(uniqueValidator);

module.exports = Bird;
=======
var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');


/* Represents a bird species */
var birdSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, uniqueCaseInsensitive: true },
    description: String,
    averageEggsLaid: {type: Number, min: 1, max: 50 },
    threatened: { type: Boolean, default: false },   // Is species endangered?
    datesSeen: [ { type: Date, default: Date.now, validate: {
        validator : function(date) {
            //return false if date is in the future
            return (date.getTime() < Date.now()) ; //time is less than now, in past
        }, message: '{VALUE} is not a valid sighting date. Date must be in the past'
    }} ],
    nest: { location: String, materials: String }
});

var Bird = mongoose.model('Bird', birdSchema);
birdSchema.plugin(uniqueValidator);

module.exports = Bird;
>>>>>>> origin/master

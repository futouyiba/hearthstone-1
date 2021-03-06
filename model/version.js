/**
 * Manage card versions.
 *
 * @author tim.tang
 */

// Model for version.
// --------------"use strict";
module.exports = function(mongoose) {

    var Schema = mongoose.Schema,
        ObjectId = Schema.ObjectId;

    // Version to control cards sync and import.
    var versionSchema = new Schema({

        version_no: {
            type: Number,
            default: 0
        },
        card_ids: [ObjectId],
        update_at: {
            type: Date,
            default: Date.now
        }
    });
    return versionSchema;
};

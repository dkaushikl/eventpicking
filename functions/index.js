/**
 * @author Daniel Sogl, Dennis Maurer
 */
'use strict';
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// Function modules
const imageModule = require('./transform-image.js');
const eventModule = require('./events.js');
const cleanUpModule = require('./clean-up.js');

/**
 * Transform Image
 * @author Daniel Sogl, Dennis Maurer
 */
exports.transformImage = functions.storage
  .object('events/{eventID}')
  .onChange(imageModule.transformImageHandler);

/**
 * Delete Image
 * @author Daniel Sogl, Dennis Maurer
 */
exports.deleteImage = functions.firestore
  .document('public-images/{imageID}')
  .onDelete(cleanUpModule.deleteImageHandler);

/**
 * Decrease events left counter
 * @author Daniel Sogl, Dennis Maurer
 */
exports.decreaseEventsLeft = functions.firestore
  .document('events/{eventID}')
  .onCreate(eventModule.decreaseEventsLeftHandler);

/**
 * Increase events left counter
 * @author Daniel Sogl, Dennis Maurer
 */
exports.increaseEventsLeft = functions.firestore
  .document('events/{eventID}')
  .onDelete(eventModule.increaseEventsLeftHandler);

/**
 * Delete user from DB including events
 * @author Daniel Sogl, Dennis Maurer
 */
exports.deleteUserFromDB = functions.auth
  .user()
  .onDelete(cleanUpModule.deleteUserFromDBHandler);

/**
 * Delete user from firebase
 * @author Daniel Sogl, Dennis Maurer
 */
exports.deleteUserFromFirebase = functions.firestore
  .document('users/{userID}')
  .onDelete(cleanUpModule.deleteuserFromFirebaseHandler);

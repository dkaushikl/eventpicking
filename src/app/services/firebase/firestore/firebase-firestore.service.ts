import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument
} from 'angularfire2/firestore';
import { Log } from 'ng2-logger';

import { Event } from '../../../classes/event';
import { User } from '../../../classes/user';

/**
 * Ein Service für die Kommunikation mit der Firebase Datenbank
 * @author Daniel Sogl
 */
@Injectable()
export class FirebaseFirestoreService {
  private log = Log.create('FirebaseFirestoreService');

  /**
   * @param  {AngularFirestore} afs AngularFire Datenbank
   */
  constructor(private afs: AngularFirestore) {
    this.log.color = 'green';
    this.log.d('Service injected');
  }

  updateUserData(user: any): Promise<void> {
    console.log('USer to safe into the db', user);
    // Sets user data to firestore on login
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(
      `users/${user.uid}`
    );
    if (!user.roles) {
      user = new User(user);
    }
    if (user.shopurl) {
      console.log('User has shopurl');
      this.afs.doc(`shopurls/${user.shopurl}`).set({ uid: user.uid });
    }
    return userRef.set(JSON.parse(JSON.stringify(user)));
  }

  getUser(uid: string): AngularFirestoreDocument<User> {
    return this.afs.doc<User>(`users/${uid}`);
  }

  checkDisplayname(shopUrl: string) {
    shopUrl = shopUrl.toLowerCase();
    return this.afs.doc(`shopurls/${shopUrl}`);
  }

  getEvent(uid: string): AngularFirestoreDocument<Event> {
    const eventRef: AngularFirestoreDocument<Event> = this.afs.doc(
      `events/${uid}`
    );
    return eventRef;
  }

  getPhotographerEvents(uid: string): AngularFirestoreCollection<Event[]> {
    const eventRef: AngularFirestoreCollection<Event[]> = this.afs.collection(
      'events',
      ref => ref.where('photographerUid', '==', uid)
    );
    return eventRef;
  }
}

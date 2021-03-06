import { inject, TestBed } from '@angular/core/testing';
import { FirebaseApp } from 'angularfire2';
import {
  AngularFirestore,
  AngularFirestoreModule
} from 'angularfire2/firestore';

import { FirebaseFirestoreService } from '../firestore/firebase-firestore.service';
import { FirebaseStorageService } from './firebase-storage.service';
import {
  AngularFireStorage,
  AngularFireStorageModule
} from 'angularfire2/storage';

describe('FirebaseStorageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FirebaseStorageService,
        FirebaseFirestoreService,
        { provide: AngularFireStorage, depends: AngularFireStorageModule },
        { provide: AngularFirestore, depends: AngularFirestoreModule }
      ]
    });
  });

  it(
    'should be created',
    inject([FirebaseStorageService], (service: FirebaseStorageService) => {
      expect(service).toBeTruthy();
    })
  );
});

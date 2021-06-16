import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { delay, map, switchMap, take, tap } from 'rxjs/operators';
import { Key } from 'selenium-webdriver';

import { AuthService } from '../auth/auth.service';
import { Booking } from './booking.model';


interface BookingData {
  bookedFrom: string;
  bookedTo: string;
  firstName: string;
  guestNumber: number;
  lastName: string;
  placeId: string;
  placeImage: string;
  placeTitle: string;
  userId: string;


}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private _bookings = new BehaviorSubject<Booking[]>([]);

  get bookings() {
    // eslint-disable-next-line no-underscore-dangle
    return this._bookings.asObservable();
  }

  constructor(private authService: AuthService, private http: HttpClient) {}

  addBooking(
    placeId: string,
    placeTitle: string,
    placeImage: string,
    firstName: string,
    lastName: string,
    guestNumber: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    let generatedId: string;
    const newBooking = new Booking(
      Math.random().toString(),
      placeId,
      this.authService.userId,
      placeTitle,
      placeImage,
      firstName,
      lastName,
      guestNumber,
      dateFrom,
      dateTo
    );
    return this.http
      .post<{ name: string }>(
        'https://ionic-galleryapp-default-rtdb.firebaseio.com/bookings.json',
        { ...newBooking, id: null }
      )
      .pipe(
        switchMap(resData => {
          generatedId = resData.name;
          return this.bookings;
        }),
        take(1),
        tap(bookings => {
          newBooking.id = generatedId;
          // eslint-disable-next-line no-underscore-dangle
          this._bookings.next(bookings.concat(newBooking));
        })
      );
  }

  cancelBooking(bookingId: string) {
    return this.http.delete(`https://ionic-galleryapp-default-rtdb.firebaseio.com/bookings/${bookingId}.json`
    ).pipe(
      switchMap(() =>this.bookings),
      take(1),
      tap(bookings => {
      // eslint-disable-next-line no-underscore-dangle
      this._bookings.next(bookings.filter(b => b.id !== bookingId));
    })
    );
  }

  fetchBookings( ) {
   return this.http
    .get<{[key: string]: BookingData}>(`https://ionic-galleryapp-default-rtdb.firebaseio.com/bookings.json?orderBy ="userId"&equalTo ="${
      this.authService.userId
    }"`
      ).pipe(
        map(
        bookingsData => {
          const bookings =[];
          for ( const key in bookingsData) {
            if(bookingsData.hasOwnProperty(key)){
              bookings.push(new Booking(
                key,
                bookingsData[key].placeId,
                bookingsData[key].userId,
                bookingsData[key].placeTitle,
                bookingsData[key].placeImage,
                bookingsData[key].firstName,
                bookingsData[key].lastName,
                bookingsData[key].guestNumber,
                new Date(bookingsData[key].bookedFrom),
                new Date(bookingsData[key].bookedTo)
                )
              );
            }
          }
          return bookings;
       }), tap(bookings =>{
         // eslint-disable-next-line no-underscore-dangle
         this._bookings.next(bookings);
       })
    );
  }
}

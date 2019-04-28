import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Booking} from './bookings.model';
import {BehaviorSubject} from 'rxjs';
import {AuthService} from '../auth/auth.service';
import {delay, map, switchMap, take, tap} from 'rxjs/operators';


interface BookingData {
  bookedFrom: string;
  bookedTo: string;
  firstName: string;
  lastName: string;
  guestNumber: number;
  placeId: string;
  placeImage: string;
  placeTitle: string;
  userId: string;

}



@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private _bookings =  new BehaviorSubject<Booking[]>( []);

  constructor(private authService: AuthService, private http: HttpClient) { }

  get bookings() {
    return this._bookings.asObservable();
  }



  addBooking(
      placeId: string,
      placeTitle: string,
      placeImage: string,
      firstName: string,
      lastName: string,
      guestNumber: number,
      dateFrom: Date,
      dateTo: Date) {
    let generatedId: string;
    const newBoking = new Booking(
        Math.random().toString(),
        placeId,
        this.authService.userId,
        placeTitle,
        placeImage,
        firstName,
        lastName,
        guestNumber,
        dateFrom,
        dateTo );

    return this.http.post<{name: string}>(
            'https://ionic-angular-b6ea1.firebaseio.com/bookings.json',
            {...newBoking, id: null}
            ).pipe( switchMap(responseData => {
              generatedId = responseData.name;
              return this.bookings;
        }) ,
        take(1),
        tap(bookings => {
      newBoking.id = generatedId;
      this._bookings.next(bookings.concat(newBoking));
    }));


    // return this.bookings.pipe(
    //     take(1),
    //     delay(1500),
    //     tap(bookings => {
    //        this._bookings.next(bookings.concat(newBoking));
    // }));

  }


  cancelBooking(bookingId: string) {

    return  this.http.delete(
        `https://ionic-angular-b6ea1.firebaseio.com/bookings/${bookingId}.json`
    ).pipe(
        switchMap(() => {
          return this.bookings;
        }),
        take(1),
        tap(bookings => {
          this._bookings.next(bookings.filter(b => b.id !== bookingId));
        })
    );


    // return this.bookings.pipe(
    //     take(1),
    //     delay(1500),
    //     tap(bookings => {
    //       this._bookings.next(bookings.filter(b => b.id !== bookingId));
    //     }));
  }

  //
  fetchBookings() {
      return this.http.
      get<{[key: string]: BookingData}>
      (`https://ionic-angular-b6ea1.firebaseio.com/bookings.json?orderBy="userId"&equalTo="${this.authService.userId}"`)
          .pipe(map(bookingData => {
            const bookings = [];
            for (const key in bookingData) {
              if (bookingData.hasOwnProperty(key)) {
                bookings.push(
                    new Booking(
                        key,
                        bookingData[key].placeId,
                        bookingData[key].userId,
                        bookingData[key].placeTitle,
                        bookingData[key].placeImage,
                        bookingData[key].firstName,
                        bookingData[key].lastName,
                        bookingData[key].guestNumber,
                        new Date(bookingData[key].bookedFrom),
                        new Date(bookingData[key].bookedTo),

                    )
                );
              }
            }
            return bookings;
          }), tap(bookings => {
               this._bookings.next(bookings);
              })
          );
  }

}

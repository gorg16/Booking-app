import {Component, OnDestroy, OnInit} from '@angular/core';
import {BookingService} from './booking.service';
import {Booking} from './bookings.model';
import {IonItemSliding, LoadingController} from '@ionic/angular';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit, OnDestroy {
  isLoading = false;
  loadedBookings: Booking[];
  private bookingSubscription: Subscription;

  constructor(private bookingsService: BookingService, private loadingCtrl: LoadingController) {
  }

  ngOnInit() {
    this.bookingSubscription = this.bookingsService.bookings.subscribe(bookings => {
      this.loadedBookings = bookings;
    });
  }


  ionViewWillEnter() {
    this.isLoading = true;
    this.bookingsService.fetchBookings().subscribe(() => {
      this.isLoading = false;
    });
  }


  onCancelBooking(bookingId: string, slidingEl: IonItemSliding) {
    slidingEl.close();
    // cancel booking with offerID
    this.loadingCtrl.create({message: 'Canceling'}).then(loadingEl => {
      loadingEl.present();
      this.bookingsService.cancelBooking(bookingId).subscribe(() => {
        loadingEl.dismiss();
      });
    });


  }


  ngOnDestroy(): void {

    if (this.bookingSubscription) {
      this.bookingSubscription.unsubscribe();
    }
  }

}

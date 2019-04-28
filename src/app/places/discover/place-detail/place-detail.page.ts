import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ActionSheetController, AlertController, LoadingController, ModalController, NavController} from '@ionic/angular';
import {CreateBookingComponent} from '../../../bookings/create-booking/create-booking.component';
import {Place} from '../../place.model';
import {PlacesService} from '../../places.service';
import {Subscription} from 'rxjs';
import {BookingService} from '../../../bookings/booking.service';
import {AuthService} from '../../../auth/auth.service';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  isLoading = false;
  place: Place;
  isbookable = false;
  private placeSub: Subscription;

  constructor(
      private activatedRoute: ActivatedRoute,
      private navCtrl: NavController,
      private modalCtrl: ModalController,
      private placesService: PlacesService,
      private actionSheetController: ActionSheetController,
      private bookingService: BookingService,
      private loadingCtrl: LoadingController,
      private authService: AuthService,
      private alertCtrl: AlertController,
      private router: Router
             ) {
  }

   ngOnInit() {
       this.activatedRoute.paramMap.subscribe(paramMap => {
           if (!paramMap.has('placeId')) {
               this.navCtrl.navigateBack('/places/tabs/discover');
               return;
           }
           this.isLoading = true;
          this.placeSub =  this.placesService.getPlaces(paramMap.get('placeId')).subscribe(place => {
                this.place = place;
                this.isbookable = place.userId !== this.authService.userId;
                this.isLoading = false;
            }, error => {
              this.alertCtrl
                  .create(
                      {
                          header: 'An Error occurred',
                          message: 'Could not load place',
                          buttons: [
                              {
                                  text: 'OK',
                                  handler: () => {
                                      this.router.navigate(['/places/tabs/discover']);
                                  }
                              }
                                  ]
                      }
                      ).then(alertEl => {
                          alertEl.present();
              });
          });
       });
       console.log('aaa');
   }

   ngOnDestroy(): void {
      if (this.placeSub) {
          this.placeSub.unsubscribe();
      }
   }

    // ionViewWillEnter() {
   //     console.log('bbb');
   //
   //     this.activatedRoute.paramMap.subscribe(paramMap => {
   //         if (!paramMap.has('placeId')) {
   //             this.navCtrl.navigateBack('/places/tabs/discover');
   //             return;
   //         }
   //         this.place = this.placesService.getPlaces(paramMap.get('placeId'));
   //     });
   // }


  onBookPlace() {
      // this.router.navigate( ['/places/tabs/discover']);
      // this.navCtrl.navigateBack('/places/tabs/discover');
      // this.navCtrl.pop();

      this.actionSheetController.create({
          header: 'Choose an Action',
          buttons: [
              {
                  text: 'Selected Date',
                  handler: () => {
                      this.openBookingMOdal('select');
                  },
              },
              {
                  text: 'Random Date',
                  handler: () => {
                      this.openBookingMOdal('random');
                  }
              },
              {
                  text: 'Cancel',
                  role: 'cancel'
              }
          ]
      }).then(actionSheetEl => {
          actionSheetEl.present();
      });

  }
      openBookingMOdal(mode: 'select' | 'random') {
          console.log(mode);
          this.modalCtrl
              .create({
                  component: CreateBookingComponent,
                  componentProps: {selectedPlace: this.place, selectedMode: mode}
              })
              .then(modalEl => {
                  modalEl.present();
                  return modalEl.onDidDismiss();
              })
              .then(resultData => {
                  console.log(resultData.data, resultData.role);

                  if (resultData.role === 'confirm') {
                      this.loadingCtrl
                          .create({ message: 'Booking Place...'})
                          .then(loadingEl => {
                              loadingEl.present();
                              const data = resultData.data.bookingData;
                              console.log(data);
                              this.bookingService.addBooking(
                                  this.place.id,
                                  this.place.title,
                                  this.place.imamgeUrl,
                                  data.firstName,
                                  data.lastName,
                                  data.guestNumber,
                                  data.startDate,
                                  data.endDate
                              ).subscribe(() => {
                                  loadingEl.dismiss();
                              });

              });
      }

    });

}

}

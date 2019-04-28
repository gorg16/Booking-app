import { Component, OnInit } from '@angular/core';
import {ModalController} from '@ionic/angular';
import {MapModalComponent} from '../../map-modal/map-modal.component';
import {HttpClient} from '@angular/common/http';
import {map, switchMap} from 'rxjs/operators';
import {PlaceLocation} from '../../../places/location.model';
import {originalPositionFor} from '@angular/compiler/testing/src/output/source_map_util';
import {of} from 'rxjs';

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss'],
})
export class LocationPickerComponent implements OnInit {

  constructor(private modalCtrl: ModalController, private http: HttpClient) { }

  ngOnInit() {}


  onPickLocation() {
    this.modalCtrl.create({component: MapModalComponent}).then(modalEL => {
      modalEL.onDidDismiss().then(modalData => {
        if (!modalData) {
          return;
        }
        const pickedLocation: PlaceLocation = {
          lat: modalData.data.lat,
          lng: modalData.data.lng,
          staticMapImageUrl: null,
          address: null,
        };
        this.getAddress(modalData.data.lat, modalData.data.lng).
          pipe(
              switchMap(addres => {
                  pickedLocation.address = addres;
                  return of(this.getMapImage(pickedLocation.lat, pickedLocation.lng, 14));
              })).subscribe(staticMapImageUrl => {
                pickedLocation.staticMapImageUrl = staticMapImageUrl;
        });
        console.log(modalData.data);
      });
      modalEL.present();
    });
  }

  private getAddress(lat: number, lng: number) {
  return   this.http.get<any>(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=`).
      pipe(map((geoData: any) => {
        if (!geoData || !geoData.results || geoData.results.length === 0) {
          return null;
        }
        return  geoData.results[0].formatted_addres;
    }));
  }


  private getMapImage(lat: number, lng: number, zoom: number) {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=500x300&maptype=roadmap
&markers=color:red%7Clabel:PlaceS%7C${lat},${lng}
&key=`;
  }


}

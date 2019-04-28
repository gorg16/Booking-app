import {AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {mergeWebPlugin} from '@capacitor/core';
import {reject} from 'q';

@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss'],
})
export class MapModalComponent implements OnInit, AfterViewInit {

  @ViewChild('map') mapElementRef: ElementRef;

  constructor(private modalCtrl: ModalController, private rentera: Renderer2) { }

  ngOnInit() {}

  onCancel() {
    this.modalCtrl.dismiss();
  }

  ngAfterViewInit(): void {
  this.getGoogleMaps().then(googleMaps => {
    const mapEl = this.mapElementRef.nativeElement;
    const map = new googleMaps.Map(mapEl, {
      center: {lat: 40.226556, lng: 44.528192},
      zoom: 10
    });

    googleMaps.event.addListenerOnce(map, 'idle', () => {
        this.rentera.addClass(mapEl, 'visible');
    });

    map.addListener('click', event => {
      const selectedCoords = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      this.modalCtrl.dismiss(selectedCoords);
    });
  }).catch(err => {
    console.log(err);
  });

  }

  private getGoogleMaps(): Promise<any> {
    const win = window as any;
    const googleModule = win.google;
    if (googleModule && googleModule.maps) {
      return Promise.resolve(googleModule.maps);
    }
    return new Promise((resolve, reject1) => {
      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        const loadedGoogleModule = win.google;
        if (loadedGoogleModule && loadedGoogleModule.maps) {
          resolve(loadedGoogleModule.maps);
        } else {
          reject1('Google maps SDK not available.');
        }
      };
    });
  }


}

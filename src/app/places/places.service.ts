import { Injectable } from '@angular/core';
import {Place} from './place.model';
import {AuthService} from '../auth/auth.service';
import {BehaviorSubject, of} from 'rxjs';
import {delay, map, switchMap, take, tap} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {el} from '@angular/platform-browser/testing/src/browser_util';

// [
//     new Place(
//         'p1',
//         'Manhattan Mansion',
//         'In the heart of New Yourk City',
//         './assets/1.jpg',
//         149.99,
//         new Date('2019-01-01'),
//         new Date('2019-12-31'),
//         'abc'
//     ),
//     new Place(
//         'p2',
//         'L\'Amour Toujours',
//         ' A romantic place in Paris',
//         './assets/2.jpeg',
//         189.99,
//         new Date('2019-01-01'),
//         new Date('2019-12-31'),
//         'abc'
//     ),
//     new Place(
//         'p3',
//         'The Foggy Palace',
//         ' Not your avarage city trip!',
//         './assets/3.jpg',
//         99.99,
//         new Date('2019-01-01'),
//         new Date('2019-12-31'),
//         'abc'
//     )
// ]



interface PlaceData {
    availableFrom: string;
    availableTo: string;
    description: string;
    imamgeUrl: string;
    price: number;
    title: string;
    userId: string;

}

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([]);

  get places() {
    return this._places.asObservable();
  }
  constructor(private authService: AuthService, private http: HttpClient) { }



  fetchPlaces () {
      return this.http.get<{[key: string]: PlaceData }>('https://ionic-angular-b6ea1.firebaseio.com/offered-places.json')
          .pipe( map(resData => {
              const places = [];
              for (const key in resData) {
                  if (resData.hasOwnProperty(key)) {
                      places.push(
                          new Place(
                              key,
                              resData[key].title,
                              resData[key].description,
                              resData[key].imamgeUrl ,
                              resData[key].price ,
                              new Date(resData[key].availableFrom),
                              new Date(resData[key].availableTo),
                              resData[key].userId
                          )
                      );
                  }
              }
              return places;
             // return [];
          }),
              tap(places => {
                  this._places.next(places);
              })


          );
  }

  getPlaces(id: string) {
    // return {...this._places.find(p => p.id === id)};
    // return  this.places.pipe(take(1), map(places => {
    //     return {...places.find(p => p.id === id)};
    // }));

      return this.http
          .get<PlaceData>(
          `https://ionic-angular-b6ea1.firebaseio.com/offered-places/${id}.json`
      ).pipe(
          map(placeData => {
                return new Place(
                    id,
                    placeData.title,
                    placeData.description,
                    placeData.imamgeUrl,
                    placeData.price,
                    new Date(placeData.availableFrom),
                    new Date(placeData.availableTo),
                    placeData.userId)
          })
      );


  }

  addPlace(title: string, description: string, price: number, dateFrom: Date, dateTo: Date) {

      let generatedId: string;
      const newPlace = new Place(
          Math.random().toString(),
          title,
          description,
          './assets/3.jpg',
          price,
          dateFrom,
          dateTo,
          this.authService.userId);
      return this.http.post<{name: string}>(
          'https://ionic-angular-b6ea1.firebaseio.com/offered-places.json',
          {...newPlace, id: null}).
           pipe(
                   switchMap(resData => {
                       generatedId = resData.name;
                       return this.places;
                   }),
                   take(1),
                   tap(places => {
                       newPlace.id = generatedId;
                           this._places.next(places.concat(newPlace));
                   })
            );

      // return this.places.pipe(
      //     take(1),
      //     delay(10000),
      //     tap(places => {
      //             this._places.next(places.concat(newPlace));
      //     })
      // );

  }

  upDatePlace(placeId: string, title: string, description: string) {
      let updatedPlaces: Place[];

       return this.places.pipe(
          take(1),
           switchMap( places => {
               if (!places || places.length <= 0) {
                   return this.fetchPlaces();
               } else {
                   return of(places);
               }
          }),
           switchMap( places => {
               const updatedPlaceIndex = places.findIndex(pl => pl.id === placeId);
               updatedPlaces = [...places];
               const oldPlace = updatedPlaces[updatedPlaceIndex];
               updatedPlaces[updatedPlaceIndex] = new Place(
                   oldPlace.id,
                   title,
                   description,
                   oldPlace.imamgeUrl,
                   oldPlace.price,
                   oldPlace.availableFrom,
                   oldPlace.availableTo,
                   oldPlace.userId
               );

               return this.http.put(`https://ionic-angular-b6ea1.firebaseio.com/offered-places/${placeId}.json`, {
                   ...updatedPlaces[updatedPlaceIndex],
                   id: null
               });

           }),
           tap(() => {
          this._places.next(updatedPlaces);
      })
       );


}
     //  this.http.put(`https://ionic-angular-b6ea1.firebaseio.com/offered-places/${placeId}.json`,)
     //
     // return  this.places.pipe(
     //     take(1),
     //     delay(1000),
     //     tap(places => {
     //     const updatedPlaceIndex = places.findIndex(pl => pl.id === placeId);
     //     const updatedPlaces = [...places];
     //     const oldPlace = updatedPlaces[updatedPlaceIndex];
     //     updatedPlaces[updatedPlaceIndex] = new Place(
     //         oldPlace.id,
     //         title,
     //         description,
     //         oldPlace.imamgeUrl,
     //         oldPlace.price,
     //         oldPlace.availableFrom,
     //         oldPlace.availableTo,
     //         oldPlace.userId
     //     );
     //     this._places.next(updatedPlaces);
     // }));


}

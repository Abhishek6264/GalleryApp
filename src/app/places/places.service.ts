import { Injectable } from '@angular/core';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
import { BehaviorSubject, generate, of } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Place } from './place.model';
import { HttpClient } from '@angular/common/http';
import { Key } from 'selenium-webdriver';
import { PlaceLocation } from './location.model';

interface PlaceData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
  location: PlaceLocation;
}

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([]);
  //   [
  //   new Place(
  //     'p1',
  //     'Manhattan Mansion',
  //     'In the heart of New York City.',
  //     'https://lonelyplanetimages.imgix.net/mastheads/GettyImages-538096543_medium.jpg?sharp=10&vib=20&w=1200',
  //     149.99,
  //     new Date('2019-01-01'),
  //     new Date('2019-12-31'),
  //     'abc'
  //   ),
  //   new Place(
  //     'p2',
  //     'L\'Amour Toujours',
  //     'A romantic place in Paris!',
  //     'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Paris_Night.jpg/1024px-Paris_Night.jpg',
  //     189.99,
  //     new Date('2019-01-01'),
  //     new Date('2019-12-31'),
  //     'abc'
  //   ),
  //   new Place(
  //     'p3',
  //     'The Foggy Palace',
  //     'Not your average city trip!',
  //     'https://upload.wikimedia.org/wikipedia/commons/0/01/San_Francisco_with_two_bridges_and_the_fog.jpg',
  //     99.99,
  //     new Date('2019-01-01'),
  //     new Date('2019-12-31'),
  //     'abc'
  //   )
  // ]

  get places() {
    // eslint-disable-next-line no-underscore-dangle
    return this._places.asObservable();
  }

  constructor(
    private authService: AuthService,
    private http: HttpClient
    ) {}

    fetchPlaces() {
     return this.http.get<{[Key: string]: PlaceData}>('https://ionic-galleryapp-default-rtdb.firebaseio.com/offered-places.json')
      .pipe(map(resData => {
        const places =  [];
        for(const key in resData) {
          if(resData.hasOwnProperty(key)) {
            places.push(
              new Place(
                key,
                resData[key].title,
                resData[key].description,
                resData[key].imageUrl,
                resData[key].price,
                new Date(resData[key].availableFrom),
                new Date(resData[key].availableTo),
                resData[key].userId,
                resData[key].location
                 )
              );
          }
        }
        return places;
        // return [];
      }),
      tap(places =>{
        // eslint-disable-next-line no-underscore-dangle
        this._places.next(places);
      })
    );
  }

  getPlace(id: string) {
  return this.http.get<PlaceData>(`https://ionic-galleryapp-default-rtdb.firebaseio.com/offered-places/${id}.json`
  ).pipe(
      map(placeData => new Place(
        id,
        placeData.title,
        placeData.description,
        placeData.imageUrl,
        placeData.price,
        new Date(placeData.availableFrom),
        new Date(placeData.availableTo),
        placeData.userId,
        placeData.location
        ))
    );
  }

  addPlace(
    title: string,
    description: string,
    price: number,
    dateFrom: Date,
    dateTo: Date,
    location: PlaceLocation
  ) {
      let generatedId: string;
      const newPlace = new Place(
      Math.random().toString(),
      title,
      description,
      'https://upload.wikimedia.org/wikipedia/commons/0/01/San_Francisco_with_two_bridges_and_the_fog.jpg',
      price,
      dateFrom,
      dateTo,
      this.authService.userId,
      location
      );

      return this.http
      .post<{name: string}>('https://ionic-galleryapp-default-rtdb.firebaseio.com/offered-places.json', {
        ...newPlace,
        id:null
      })
      .pipe(
        switchMap(resData =>{
          generatedId = resData.name;
           return this.places;
          }),
        take(1),
        tap(places => {
          newPlace.id = generatedId;
          // eslint-disable-next-line no-underscore-dangle
          this._places.next(places.concat(newPlace));
        })
      );
      // return this.places.pipe(
      //   take(1),
      //   delay(100),
      //   tap(places =>{
      //     // eslint-disable-next-line no-underscore-dangle
      //     this._places.next(places.concat(newPlace));
      //   })
      // );
  }

  updatePlace(placeId: string, title: string, description: string) {
    let updatedPlaces: Place[];
     return this.places.pipe(
      take(1),
      switchMap(places => {
        if(!places || places.length <=0){
          return this.fetchPlaces();
        } else {
          return of(places );
        }
      }),
      switchMap(places =>{
        const updatedPlaceIndex = places.findIndex(pl => pl.id === placeId);
        updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = new Place(
        oldPlace.id,
        title,
        description,
        oldPlace.imageUrl,
        oldPlace.price,
        oldPlace.availableFrom,
        oldPlace.availableTo,
        oldPlace.userId,
        oldPlace.location
        );
        return this.http.put(`https://ionic-galleryapp-default-rtdb.firebaseio.com/offered-places/${placeId}.json`,
        {...updatedPlaces[updatedPlaceIndex], id: null}
        );
      }),
       tap(()=> {
        // eslint-disable-next-line no-underscore-dangle
           this._places.next(updatedPlaces);
        })
      );
  }
}

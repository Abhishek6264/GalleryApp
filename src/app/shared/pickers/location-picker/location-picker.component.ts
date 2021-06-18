import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ModalController, NumericValueAccessor } from '@ionic/angular';
import { of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { PlaceLocation } from 'src/app/places/location.model';

import { environment } from 'src/environments/environment';
import { MapModalComponent } from '../../map-modal/map-modal.component';

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss']
})
export class LocationPickerComponent implements OnInit {
  @Output() locationPick = new EventEmitter<PlaceLocation>();
  selectedLocationImage: string;
  isLoading = false;

  constructor(
    private modalCtrl: ModalController,
    private http: HttpClient
    ) {}

  ngOnInit() {}

  onPickLocation() {
    this.modalCtrl.create({ component: MapModalComponent }).then(modalEl => {
      modalEl.onDidDismiss().then(modalData => {
        console.log(modalData.data);
        if (!modalData.data) {
          return;
        }
        const pickLocation: PlaceLocation = {
          lat: modalData.data.lat,
          lng: modalData.data.lng,
          address: null,
          staticMapImageUrl: null
        };
        this.isLoading =true;
        this.getAddress(modalData.data.lat, modalData.data.lng).pipe(
          switchMap(address => {
            pickLocation.address =address;
            return of(this.getMapImage(pickLocation.lat, pickLocation.lng, 14));
          })
        ).subscribe(staticMapImageUral =>{
          pickLocation.staticMapImageUrl = staticMapImageUral;
          this.selectedLocationImage = staticMapImageUral;
          this.isLoading =false;
          this.locationPick.emit(pickLocation);
        });

        // this.getAddress(modalData.data.lat, modalData.data.lng).subscribe(
        //   address => {
        //     console.log(address);
        //   }
        // );
      });
      modalEl.present();
    });
  }

  private getAddress(lat: number, lng: number) {
    return this.http
      .get<any>(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${
          environment.googleMapsApiKey
        }`
      )
      .pipe(
        map(geoData => {
          console.log(geoData);
          if (!geoData || !geoData.results || geoData.results.length === 0) {
            return null;
          }
          return geoData.results[0].formatted_address;
        })
      );
  }

  private getMapImage(lat: number, lng: number, zoom: number) {
   return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=500x300&maptype=roadmap
    &markers=color:red%7Clabel:Place%7C${lat},${lng}
    &key=${environment.googleMapsApiKey}`;
  }
}

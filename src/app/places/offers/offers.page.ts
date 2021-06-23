import { Component, OnDestroy, OnInit } from '@angular/core';
import { IonItemSliding, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { PlacesService } from '../places.service';
import { Place } from '../place.model';
import { BookingService } from 'src/app/bookings/booking.service';

// @Component({
//   selector: 'app-offers',
//   templateUrl: './offers.page.html',
//   styleUrls: ['./offers.page.scss'],
// })
// export class OffersPage implements OnInit {
//   offers: Place[];
//   constructor(private placesService: PlacesService, private router: Router) { }

//   ngOnInit() {
//     this.offers = this.placesService.places;
//   }
//   // This can be used when Click listener is added
//   // onEdit(offerId: string, slidingItem: IonItemSliding) {
//   //   slidingItem.close();
//   //   this.router.navigate(['/','places', 'tabs', 'offers', 'edit', offerId]);
//   //   console.log('Editing item', offerId);
//   // }


// }

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss']
})
export class OffersPage implements OnInit, OnDestroy {
  offers: Place[];
  isLoading = false;
  private placesSub: Subscription;

  constructor(
    private placesService: PlacesService,
    private router: Router,
    private bookingService: BookingService,
    private loadingCtrl: LoadingController
    ) {}

  ngOnInit() {
    // this.offers = this.placesService.places;
    this.placesSub = this.placesService.places.subscribe(places => {
      this.offers = places;
    });
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.placesService.fetchPlaces().subscribe();
    this.isLoading = false;

  }

  onEdit(offerId: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.router.navigate(['/', 'places', 'tabs', 'offers', 'edit', offerId]);
    console.log('Editing item', offerId);
  }

  newOfferDelete(offerId: string, slidingEl: IonItemSliding) {
    console.log(offerId);
    slidingEl.close();
    this.loadingCtrl.create({message:'Cancelling...'}).then(loadingEl =>{
      loadingEl.dismiss();
    });
    this.bookingService.cancelBooking(offerId).subscribe();
    // cancel booking wiht id offerId
  }

  ngOnDestroy() {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }
}


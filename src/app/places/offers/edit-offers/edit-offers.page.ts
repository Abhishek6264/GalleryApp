import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, NavController } from '@ionic/angular';

import { PlacesService } from '../../places.service';
import { Place } from '../../place.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-offers',
  templateUrl: './edit-offers.page.html',
  styleUrls: ['./edit-offers.page.scss'],
})
export class EditOffersPage implements OnInit, OnDestroy {
  place: Place;
  placeId: string;
  form: FormGroup;
  isLoading = false;
  private placeSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private placesService: PlacesService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/offers');
        return;
      }
        this.placeId = paramMap.get('placeId');
        this.isLoading = true;
        this.placeSub = this.placesService.getPlace(paramMap.get('placeId')).subscribe(place =>{
        this.place = place;
        this.form = new FormGroup({
            title: new FormControl(this.place.title, {
            updateOn: 'blur',
            validators: [Validators.required]
          }),
            description: new FormControl(this.place.description, {
            updateOn: 'blur',
            validators: [Validators.required, Validators.maxLength(180)]
          })
        });
        this.isLoading = false;
      }, error => {
        this.alertCtrl.create({
          header: 'An Error occurred!',
          message: 'Place couldn\'t be fetched',
          buttons: [{text: 'Okay', handler: ()=>{
            this.router.navigate(['/places/tabs/offers']);
          }}]
        }).then(alertEl =>{
          alertEl.present();
        });
      });
      });
  }
  onEditOffer() {
    if(!this.form.valid){
      return;
    }
    console.log(this.form);
    this.loadingCtrl.create({
      message: 'Updating Place...'
    }).then(loadingEl =>{
      loadingEl.present();
        this.placesService.updatePlace(
        this.place.id,
        this.form.value.title,
        this.form.value.description
      ).subscribe(()=> {
        loadingEl.dismiss();
        this.form.reset();
        this.router.navigate(['/places/tabs/offers' ]);
      });
    });

  }

  ngOnDestroy() {
    if(this.placeSub){
      this.placeSub.unsubscribe();
    }
  }
}

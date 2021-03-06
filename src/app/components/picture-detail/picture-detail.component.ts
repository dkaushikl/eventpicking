import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import * as localforage from 'localforage';
import { ModalDirective } from 'ng-mdb-pro/free/modals/modal.directive';
import { Log } from 'ng2-logger';

import { PriceList } from '../../classes/price-list';
import { PRINTTYPE } from '../../enums/print-type';
import { SHOPPINGCARTITEMTYPE } from '../../enums/shopping-cart-item-type';
import { Alert } from '../../interfaces/alert';
import { EventPicture } from '../../interfaces/event-picture';
import { PrintingHouse } from '../../interfaces/printing-house';
import { PrintingHouseArticle } from '../../interfaces/printing-house-article';
import { ShoppingCartItem } from '../../interfaces/shopping-cart-item';
import { AlertService } from '../../services/alert/alert.service';
import { EventUserComponent } from '../event-user/event-user.component';

/**
 * Picture detail modal component
 * @author Daniel Sogl, Tim Kriessler
 */
@Component({
  selector: 'app-picture-detail',
  templateUrl: './picture-detail.component.html',
  styleUrls: ['./picture-detail.component.scss']
})
export class PictureDetailComponent implements OnInit {
  /** Logger */
  private log = Log.create('PictureDetailComponent');

  /** Create new event modal */
  @ViewChild('pictureModal') public pictureModal: ModalDirective;
  /** TemplateRef download */
  @ViewChild('download') download: TemplateRef<any>;
  /** TemplateRef print */
  @ViewChild('print') print: TemplateRef<any>;

  /** Template ref  */
  public templateType: TemplateRef<any>;

  /** Parent Component */
  public eventUserComponent: EventUserComponent;

  /** Image */
  public image: EventPicture = {
    event: '',
    info: { height: 0, size: 0, type: '', width: 0 },
    name: '',
    preview: '',
    ratings: 0,
    thumbnail: '',
    id: '',
    selected: false
  };

  /** index of images array */
  public imageIndex: number;
  /** length of images array */
  public imagesLength: number;
  /** previous image flag */
  public previousFlag: boolean;
  /** next image flag */
  public nextFlag: boolean;

  /** Printing house */
  public printingHouse: PrintingHouse;
  /** Images */
  public images: EventPicture[];
  /** Price list */
  public priceList: PriceList;
  /** define certain price list for simplicity */
  public printPicturePriceList: PrintingHouseArticle[];
  /** price of actual image */
  public price: number;
  /** format of actual image */
  public format: string;
  /** define which register is preselected */
  public radioModel = 'left';

  /**
   * Constructor
   * @param  {AlertService} service AlertService
   */
  constructor(private service: AlertService) {}

  /**
   * Initalize component
   */
  ngOnInit() {
    this.log.color = 'orange';
    this.log.d('Component initialized');
    this.templateType = this.download;
    this.imagesLength = 0;
    this.previousFlag = false;
    this.nextFlag = false;
  }

  /**
   * Show modal
   * @param  {EventPicture} image Image
   */
  showModal(
    image: EventPicture,
    imageIndex: number,
    imagesLength: number,
    eventUserComponent: EventUserComponent,
    priceList: PriceList
  ) {
    this.log.d('Open picture modal');
    this.image = image;
    this.imageIndex = imageIndex;
    this.imagesLength = imagesLength;
    this.eventUserComponent = eventUserComponent;
    this.priceList = priceList;
    this.previousFlag = false;
    this.nextFlag = false;

    this.createPrintPicturePriceList();

    /** deactivate previous button if selected first picture */
    if (this.imageIndex === 0) {
      this.previousFlag = true;
    }
    /** deactivate next button if selected last picture */
    if (this.imageIndex + 1 === this.imagesLength) {
      this.nextFlag = true;
    }

    this.pictureModal.show();
  }

  /**
   * @param  {EventPicture} image
   */
  rateImage(image: EventPicture) {
    this.eventUserComponent.rateImage(image);
  }

  /**
   * @param  {EventPicture} image
   */
  reportImage(image: EventPicture) {
    this.eventUserComponent.reportImage(image);
  }

  /**
   * load previous image of event-images array for modal-gallery
   */
  loadPreviousImage() {
    this.nextFlag = false;
    if (this.imageIndex > 0) {
      this.imageIndex--;
      this.image = this.eventUserComponent.getFollowingImage(this.imageIndex);
    }
    // hide previous button if last picture is reached
    if (this.imageIndex === 0) {
      this.previousFlag = true;
    }
  }

  /**
   * load next image of event-images array for modal-gallery
   */
  loadNextImage() {
    this.previousFlag = false;

    // hide next button if last picture is reached
    if (
      this.eventUserComponent.getFollowingImage(this.imageIndex + 2) ===
      undefined
    ) {
      this.nextFlag = true;
    }
    this.imageIndex++;
    this.image = this.eventUserComponent.getFollowingImage(this.imageIndex);
  }

  /**
   *  create array to save print-picture pricelist
   */
  createPrintPicturePriceList() {
    for (let i = 0; i < this.priceList.printingHouseItems.length; i++) {
      if (this.priceList.printingHouseItems[i].name === PRINTTYPE.PICTURE) {
        this.printPicturePriceList = this.priceList.printingHouseItems[
          i
        ].articles;
      }
    }
  }

  /**
   * radio button Listener for updating price if other format is selected
   * @param  {string} type type
   * @param  {string} formatName format name
   */
  changeFormat(type: string, formatName: string) {
    if (type === 'print') {
      for (let i = 0; i < this.printPicturePriceList.length; i++) {
        if (formatName === this.printPicturePriceList[i].name) {
          this.format = this.printPicturePriceList[i].name;
          this.price = this.printPicturePriceList[i].price;
        }
      }
    }
    if (type === 'download') {
      for (let i = 0; i < this.priceList.downloadItems.length; i++) {
        if (formatName === this.priceList.downloadItems[i].name) {
          this.format = this.priceList.downloadItems[i].name;
          this.price = this.priceList.downloadItems[i].price;
        }
      }
    }
  }

  /**
   * add image to shopping cart
   */
  addToShoppingCart() {
    if (this.format === undefined) {
      const alert: Alert = {
        title: 'Kein Format ausgewählt!'
      };
      this.service.showError(alert);

      this.log.info('No format selected');
    } else {
      this.log.info('addtoShoppingCart: ' + this.radioModel);
      let itemType: SHOPPINGCARTITEMTYPE;
      if (this.radioModel === 'left') {
        itemType = SHOPPINGCARTITEMTYPE.DOWNLOAD;
      }
      if (this.radioModel === 'right') {
        itemType = SHOPPINGCARTITEMTYPE.PRINT;
      }
      this.log.info('itemType: ' + itemType);
      // Load items from local storage
      const shoppingCartItem: ShoppingCartItem = {
        eventname: this.image.event,
        name: this.image.name,
        // TODO: differentiation between Download and Print
        info: this.image.info,
        format: this.format,
        itemType: itemType,
        amount: 1,
        totalPrice: 0,
        preview: this.image.preview,
        thumbnail: this.image.thumbnail,
        price: this.price,
        photographer: this.eventUserComponent.event.photographerUid
      };

      localforage.getItem<ShoppingCartItem[]>('cart-items').then(items => {
        if (items) {
          items.push(shoppingCartItem);
        } else {
          items = [];
          items.push(shoppingCartItem);
        }
        localforage
          .setItem('cart-items', items)
          .then(() => {
            this.log.d('Saved item to cart');
          })
          .catch(err => {
            this.log.er('Error saving item', err);
          });
      });
      const alert: Alert = {
        title: 'Bild zum Warenkorb hinzugefügt'
      };
      this.service.showSuccess(alert);
    }
  }
}

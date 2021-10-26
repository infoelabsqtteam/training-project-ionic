import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { from, Observable, } from 'rxjs';
import { Injectable } from '@angular/core';

import { map, switchMap, take } from 'rxjs/operators';
import { StorageService, EnvService, CoreUtilityService } from '@core/ionic-core';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(
        private storageService: StorageService,
        private envService:EnvService,
        private coreUtilService:CoreUtilityService
    ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        const idToken: string = this.storageService.GetIdToken();
        if (idToken) {
            const url = req.url;
            const authUrl = this.envService.getBaseUrl() + "login";
            const medSearch = this.coreUtilService.getMediceaSearchUrl('MED_SEARCH');
            if (url.indexOf("/rest/public") != -1 || (url.startsWith(authUrl)) || url.startsWith(medSearch)) {
                return next.handle(req);
            } else {
                req = req.clone({ headers: req.headers.set('Authorization', 'Bearer ' + idToken) });
            }
        }
        return next.handle(req);

    }
}
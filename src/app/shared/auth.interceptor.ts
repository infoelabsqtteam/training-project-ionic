import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { from, Observable, } from 'rxjs';
import { Injectable } from '@angular/core';

import { StorageService, EnvService} from '@core/web-core';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(
        private storageService: StorageService,
        private envService:EnvService,
    ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        const idToken: string = this.storageService.GetIdToken();
        if (idToken) {
            const url = req.url;
            const authUrl = this.envService.getBaseUrl() + "login";
            // const medSearch = this.envService.getMediceaSearchUrl('MED_SEARCH');
            if (url.indexOf("/rest/public") != -1 || (url.startsWith(authUrl))) {
                return next.handle(req);
            } else {
                req = req.clone({ headers: req.headers.set('Authorization', 'Bearer ' + idToken) });
            }
        }
        return next.handle(req);

    }
}
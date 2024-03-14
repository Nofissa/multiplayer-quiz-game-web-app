import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class RoutingDependenciesProvider {
    constructor(
        private readonly activatedRouteDep: ActivatedRoute,
        private readonly routerDep: Router,
    ) {}

    get activatedRoute(): ActivatedRoute {
        return this.activatedRouteDep;
    }

    get router(): Router {
        return this.routerDep;
    }
}

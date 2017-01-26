import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../../shared.service';
import { Observable, Subscription } from 'rxjs';
import { UserService } from '../users.service';
import { UserComponent } from '../user/user.component';
import { User } from '../user';
import { routerTransition} from '../../animation/router.animation';

@Component({
    selector: 'users',
    templateUrl: './users.component.html',
    providers: [UserService],
    animations: [routerTransition()],
    host: { '[@routerTransition]': '' }
})

export class UsersComponent implements OnInit, AfterViewInit {
    users: User[];
    users$: Observable<User[]>;
    isFavoritedFilterActive: boolean = false;
    searchbox: string = '';
    currentSubscription: Subscription;

    @ViewChild('typeahead') input: ElementRef;

    constructor(private _service: UserService, private _sharedService: SharedService, private router: Router) { }

    ngOnInit() {
        this._sharedService.cancelAllRequests();
        // this.users$ = this._service.getUsers();

        let users$ = this._service.getUsers();
        this._sharedService.currentSubscription = users$.subscribe(
            usersResponse => {
                console.log("list of users", usersResponse);
                this.users = usersResponse;
            },
            (error) => { console.log("error on users$.subscribe", error) },
            () => { console.log("load all users completed") }
        );
        console.log("service current subscription", this._sharedService.currentSubscription);
    }

    ngAfterViewInit() {

        const search$ = Observable.fromEvent(this.input.nativeElement, 'keyup')
            .switchMap(() => this._service.getUsersByName(this.input.nativeElement.value));

        search$.subscribe(
            (users) => this.users = users
        );

    }

    toggleFavoritedFilter() {
        this.isFavoritedFilterActive = !this.isFavoritedFilterActive;
    }

    setFavorite(isFavorite: boolean, user: User): void {
        user.isFavorited = isFavorite;
    }

    deleteUserAndReload(reloadedUsers$: Observable<User[]>): void {

        // this.users$ = reloadedUsers$;

        this._sharedService.currentSubscription = reloadedUsers$.subscribe(
            reloadedUsersResponse => this.users = reloadedUsersResponse,
            (error) => { console.log("error on reloadedUsers$.subscribe()", error) },
            () => { console.log("event received and subscribed") }
        )
    }

    newUser() {
        this.router.navigate(['/users/new']);
    }
}

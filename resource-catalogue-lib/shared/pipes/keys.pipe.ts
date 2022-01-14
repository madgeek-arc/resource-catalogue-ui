/**
 * Created by stefania on 8/4/17.
 */

import {Pipe, PipeTransform} from "@angular/core";

@Pipe({name: "keys"})
export class KeysPipe implements PipeTransform {
    transform(value, args: string[]): any {
        return Object.keys(value);
    }
}

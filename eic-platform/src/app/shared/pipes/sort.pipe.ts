/**
 * Created by spyroukostas on 27/6/18.
 */

import {Pipe, PipeTransform} from "@angular/core";
import {isNullOrUndefined} from "util";


@Pipe({
    name: "sort"
})
export class StringArraySortPipe implements PipeTransform {
    transform(array: Array<String>, args: string): Array<String> {
        if (isNullOrUndefined(array)) {
            return undefined;
        }
        array.sort();
        return array;
    }
}

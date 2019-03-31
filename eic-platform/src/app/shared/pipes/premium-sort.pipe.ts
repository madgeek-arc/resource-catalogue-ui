
import {Pipe, PipeTransform} from "@angular/core";

@Pipe({name: "premiumsort"})
export class PremiumSortPipe implements PipeTransform {
    transform(arr: string[], weights: string[]): any {
        let ret = (arr || []).sort((a, b): number => {
            let ret = 0;
            let weightA = weights.indexOf(a);
            let weightB = weights.indexOf(b);
            if (weightA !== -1 && weightB !== -1) {
                ret = weightA - weightB;
            } else if (weightA !== -1) {
                ret = -1;
            } else if (weightB !== -1) {
                ret = 1;
            } else {
                ret = a.localeCompare(b);
            }
            return ret;
        });
        return ret;
    }
}


import {Pipe, PipeTransform} from "@angular/core";

@Pipe({name: "lookup"})
export class LookUpPipe implements PipeTransform {
    transform(keys: any[], dictionary: any): any {
        if(keys instanceof Array) {
            return (keys || []).map(e => dictionary[e] || e);
        } else {
            return dictionary[<string>keys];
        }
    }
}

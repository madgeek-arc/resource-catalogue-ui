import { Pipe, PipeTransform } from '@angular/core';
import {uniqBy} from "lodash";

@Pipe({name: 'unique', pure: false})

export class UniquePipe implements PipeTransform {
  transform(value: any, type: string): any {
    if(value!== undefined && value!== null){
      return uniqBy(value, type);
    }
    return value;
  }
}

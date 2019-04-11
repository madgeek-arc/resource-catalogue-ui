import {AbstractControl} from '@angular/forms';

export function URLValidator(control: AbstractControl) {
    return PatternValidator(control, /^(https?:\/\/.+){0,1}$/);
}

export function URLListValidator(control: AbstractControl) {
    if (control.value.split) {
        return validateArray(control.value.split('\n'), /https?:\/\/.+/);
    } else {
        return null;
    }
}

export function PatternValidator(control: AbstractControl, pattern: RegExp) {
    return ('' + control.value).match(pattern) ? null : {validationFailed: true};
}

export function CommaSeparatedPatternValidator(control: AbstractControl, pattern: RegExp) {
    return validateArray(('' + control.value).split(','), pattern);
}

export function validateArray(array: Array<string>, pattern: RegExp) {
    let ret = null;
    for (let e of array) {
        if (('' + e).match(pattern) === null) {
            ret = {validationFailed: true};
            break;
        }
    }
    return ret;
}
``
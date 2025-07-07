import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class pidHandler {
  customEncodeURIComponent(id: string): string {
    // console.trace('customEncodeURIComponent called with id:', id);
    if (id.includes('/')) {
      return encodeURIComponent(id);
    }
    return id;
  }

  customDecodeURIComponent(id: string): string {
    // console.trace('customDecodeURIComponent called with id:', id);
    if (id.includes('%')) {
      return decodeURIComponent(id);
    }
    return id;
  }
}

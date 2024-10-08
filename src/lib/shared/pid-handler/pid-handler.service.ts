import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class pidHandler {
  customEncodeURIComponent(id: string): string {
    if (id.includes('/')) {
      return encodeURIComponent(id);
    }
    return id;
  }

  customDecodeURIComponent(id: string): string {
    if (id.includes('%')) {
      return decodeURIComponent(id);
    }
    return id;
  }
}

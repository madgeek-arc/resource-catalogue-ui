export function getCookie(name: string): string {
  const ca: Array<string> = document.cookie.split(';');
  const caLen: number = ca.length;
  const cookieName = `${name}=`;
  let c: string;
  for (let i = 0; i < caLen; i += 1) {
    c = ca[i].replace(/^\s+/g, '');
    if (c.indexOf(cookieName) === 0) {
      return c.substring(cookieName.length, c.length);
    }
  }
  return null;
}

export function deleteCookie(name) {
  document.cookie = name+'=; Max-Age=-99999999;';
  // setCookie(name, '', -1);
}

export function setCookie(name: string, value: string, expireDays: number, path: string = '') {
  const d: Date = new Date();
  d.setTime(d.getTime() + expireDays * 24 * 60 * 60 * 1000);
  const expires = `expires=${d.toUTCString()}`;
  const cpath = path ? `; path=${path}` : '';
  document.cookie = `${name}=${value}; ${expires}${cpath}`;
}

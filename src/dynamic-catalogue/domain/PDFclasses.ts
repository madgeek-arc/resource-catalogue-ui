export class DocDefinition {
  header: Content;
  content: any[];
  styles: object;
  images: object;
  info: PdfMetadata;
  defaultStyle: object;
  // pageMargins: [ 40, 60, 40, 60 ];
  // pageSize: 'A4';
  footer(currentPage, pageCount) {
    return {
      layout: "noBorders",
      fontSize: 8,
      margin: [25, 20, 5, 0],
      columns: [
        { text: currentPage.toString() + " of " + pageCount, alignment: 'right' },
      ]
    }
  }

  constructor() {
    this.header = null;
    this.content = [];
    this.styles = {
      title: {
        bold: true,
        alignment: 'center',
        fontSize: 24,
        margin: [0, 15, 0, 10]
      },
      chapterHeader: {
        bold: true,
        fontSize: 18,
        alignment: 'center',
        margin: [0, 30, 0, 10]
      },
      tabHeader: {
        bold: true,
        fontSize: 15,
        alignment: 'center',
        decoration: 'underline',
        margin: [0, 20, 0, 15]
      },
      link: {
        color: 'blue',
      },
      mt_1: {
        margin: [0, 2, 0, 0]
      },
      mt_3: {
        margin: [0, 8, 0, 0]
      },
      mt_5: {
        margin: [0, 25, 0, 0]
      },
      mx_1: {
        margin: [0, 2, 0, 2]
      },
      mx_3: {
        margin: [0, 8, 0, 8]
      },
      ms_1: {
        margin: [3, 0, 0, 0]
      },
      ms_5: {
        margin: [20, 0, 0, 0]
      },
      marginTopCheckBox: {
        margin: [0, 3, 0, 0]
      }
    };
    this.images = {
      radioChecked: ' data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAD/klEQVRoQ+2Zj3HVMAzG2wmACUgnoExAmAA6AY8JgAkIEwATkE4ATECYgDIB6QTABKBfse5UP9uy8/7AO6o73UtiW9b3SZadvOOjA5fjA/f/6AbA347gNiNwKmAeifait0W5t3IhNz9Ep6CftwF+UwA4+kx0Jdo1OjRL/w+irwKwxuF/ui8FoI4/D2wvmjwMIipvRN8uAbIEwGOZ6HWC8Z+BUVIEdlXxk+igAGc8eitCDZCnwUY1Ia0AXorlIbJOLvMMx1ukD+MeRIOwRVpVSS0AmIP1lbF6Ge5bHY8dAwgpdM80jHL9QpSoFKUWwLvI+XO5J//dCTwHQjsEAeJJBIKU2hjAIBZIHRXCy7NdSPNcXgRYbO/35LxOE4M4kwbKbVJKAAjrN1F+EdJmtQvaEzZHeabpRJqeiCbTtQTAMvFVDPQ5IxlQcXVp2XkhbRLVhZ1N2xyAmP2HwaAXgE46sF5IPY2cjoFB3Xlnz1Ag7FPol41CDgAVgSMCAnOw70lqj8iNGaShptYTBY0kOzWV75rkAJD7XehZw35cZj2wtI+iXpmEOI3CLNesBReAHcTxIE6F2IaNVo3jtk9NSSZ99NixRmYqAoRX675XeYgS0dpEYBV2c0KktCKtAU4BmGSA5l2xBks/a3wpCI8kuxetrccUgC/iyWnwxsv/7xUp5gEjRe4UOvXSpuvgQq7v274pAL9Mh1J4rWHPSa+9RBRkQqrKNZ89AKWNbl8AcNyS+n8BOMgUYqHoGcRbxLZGe3mea/f2GpuqnMm0wFzZ88ooO+VY8Iw2+xKyBIRXRldilJ0e+ShKWU2v6PB0kN9/dSPjNZOdvwjAli2vRmPIAm6NQM1Rwu417AGkeBEAjbPo3dDLWwd0G0VbU8lLHez2orqJXcp1FzOUq/OW1UkGAcKTlkjUMM98OA8IJDkmB4ATKFHIngIzaGAIICy0+MOVfviiHdue4Liyz1hsr71WlnZayygTkn/J99KMJ8qcNk+ex6YdAjk+4DSSjVgJAEZYMLoWeB3kdLoP4UuIlktyn8KSJK8EAEftUZb75GvdlhENYs9+h1r8WUX94j2Uz4oq1GHq8S4kfq9eq/vxpF4EtP8oF7ZMkk7s0i1rogSYdGW3tbtsTZmt/n+ACWDegphDJACzifTB+c4YwXki7xJUGwG1HacTz6cAjnNKi+A4KcOvldo94mpMKwDGEGaiodVJJ4ctogGgWZTards+VYR9oQsOY4OoWqH/KtiImvK3SwBgjcmJBhpvWNWTh444DiGomzKx8aUA1I4Cgbk4Ih4Q6jsRG5Y4rsY3BWCdJE1IDX47UfuPC/14GYHhyagH0m3fJgB3sl10uAGwC1ZbbB58BH4DHK/eMUOdTWMAAAAASUVORK5CYII=',
      radioUnchecked: ' data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAADeUlEQVRoQ+2Zi5HUMAyG7yoAKmCpgKMCQgVABYQKgAoIFQAVsFQAVECogKMCchUAFYA+sGZ0jh3b2SS+HU4zmmwSW9avl+Xs6cmR0+mR639yDaC2B5f0wJmAeSjcCN8U5t7Sudz8FO4df1kC/KEAUPSZcCu8K1RokPEfhV85YIXT/w2fC0AVf+6sPWtxNwmvvBF+OwfIHACPZKHXAYv/chYlRLCuMnriHRjgzIdveKgB8tTJyDZIKYCXIrnzpBPLPEPxEmrcvPveJGQRVlmUCwDLYfXWSL1w96WK+4oBhBC6a17s5fcLYbwySbkA3nnKv5d74j+5QEoB9x4DAeKJB4KQOhhAJxIIHSXcy7M1qHitlAdItg8bKa/L+CAeywvKbZCmAODW78JcIcKmXcPsAZl7eabhRJjeEQ6G6xQAa4lvIqCJCVkBFEbrhTWxo2EbA+Bb/4ETuIKuUZEY7LN7G/VCDAAVgRYBos4jrAbhBd0n2KmpfJcoBoDY37mRNayvSlovDPKQXEgCsJNoDzSJa3iANQkfbTtGxgx5oJMJWve3rDwxA+3lhVakUTKHANi4m6zBG7nE7kWjfAwB+CqKnV2B+A/lwbk8vGcNFwLw2wwgaUiemoQxMarSJZ1TAFKtxlbArFH/LwBHGUIkivYgNTexUBLTk2mB+fs+VUY5UFCHa1Iri3Oggj4JU1bDGe2ednK9qhsZx0z6tEkAtmyxjd+qaX5Z+4ewtjPsAYT4JABeDsK33aiaedCIDtpSX8jvnW/MWJ23YdTLJEDUIJQHBBQ81EwdaPBCtAvcAI21Pl0x1h8dK6d2WusFwBB/S31GSeEn5mkfNGSC1kfIFACEkDCaC3wZoDvdgvgSouWS2KewFB/qUdS2stwHj3ULI7KeR/TszyqqF+dQPisqUYepx2uQ/+11VPf9RXO7zb1MtJ/9CCd26aVygnBlt7W7bNZpMBcAC2B5C2JwngDMIdQ45XdGCMrj+aSBcgHEwonnvQNHn1JCKE7IcLUUrTgh4aUAkIGb8YZWJ5WLtfAGgAZhardu+1QR9pSdUxgZ2h7ofMa3Tka2IeYAQDiL42LY/6cle3E3EMUxCJwMGV/4XAAqR4FgOd8jKSDUdzzWzVFchR8KwCpJmBAaXAkV+48L4ziMYOHecApk8v2SAJKLrTHgGsAaVi2RefQe+APW/7QxCYAvyQAAAABJRU5ErkJggg==',
      checked: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAQAAACROWYpAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAF+2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTktMTItMzBUMDE6Mzc6MjArMDE6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDE5LTEyLTMwVDAxOjM4OjI4KzAxOjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDE5LTEyLTMwVDAxOjM4OjI4KzAxOjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMSIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9IkRvdCBHYWluIDIwJSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDowNzVjYjZmMy1jNGIxLTRiZjctYWMyOS03YzUxMWY5MWJjYzQiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDo5ZTM1YTc3ZC0zNDM0LTI5NGQtYmEwOC1iY2I5MjYyMjBiOGIiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowYzc2MDY3Ny0xNDcwLTRlZDUtOGU4ZS1kNTdjODJlZDk1Y2UiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjBjNzYwNjc3LTE0NzAtNGVkNS04ZThlLWQ1N2M4MmVkOTVjZSIgc3RFdnQ6d2hlbj0iMjAxOS0xMi0zMFQwMTozNzoyMCswMTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKE1hY2ludG9zaCkiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjA3NWNiNmYzLWM0YjEtNGJmNy1hYzI5LTdjNTExZjkxYmNjNCIgc3RFdnQ6d2hlbj0iMjAxOS0xMi0zMFQwMTozODoyOCswMTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+jHsR7AAAAUNJREFUOMvN1T9Lw0AYx/EviLVFxFH8M3USgyAFoUsQ0UV8F6Ui4qCTbuJg34HgptBdUATrUoxiqYMgiOBoIcW9BVED+jgkntGm9i6CmN+Sg/vAcc89dwBd5Clzj6uZGg7LJAC62UFipEgKcmroaeZj/gpcIAhl5rE1M0cJQbiCOsIrs5h8WZ4R6j72yBrhcRo+dhE8bCOcoYng/hFOMxAXb/DAHTNxcCGo7JE5LqhjsW2KP6nDcGecCv1vRdC2eJQDLllooach2hbvIghvLJJgM0QHdeq8F0x/5ETRM4b0DonF7be+Pf+y4A4bZnETok4E/XG3xxR3WhasUWeLCg2OGYnXGP1MkPwnLRmJf3UN+RfgtBGe5MnHVQShxBQZzdgcIgjXsKSu/KZmXgKxBkmKsZ6bffoAelilQs3goauyTi+8A8mhgeQlxdNWAAAAAElFTkSuQmCC',
      unchecked: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAQAAACROWYpAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAF+2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTktMTItMzBUMDE6Mzc6MjArMDE6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDE5LTEyLTMwVDAxOjM4OjU3KzAxOjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDE5LTEyLTMwVDAxOjM4OjU3KzAxOjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMSIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9IkRvdCBHYWluIDIwJSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpjMGUyMmJhZC1lY2VkLTQzZWUtYjIzZC1jNDZjOTNiM2UzNWMiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDo5M2FhOTEzYy1hZDVmLWZmNGEtOWE5Ny1kMmUwZjdmYzFlYmUiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDozYmY2ODFlMy1hMTRhLTQyODMtOGIxNi0zNjQ4M2E2YmZlNjYiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjNiZjY4MWUzLWExNGEtNDI4My04YjE2LTM2NDgzYTZiZmU2NiIgc3RFdnQ6d2hlbj0iMjAxOS0xMi0zMFQwMTozNzoyMCswMTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKE1hY2ludG9zaCkiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmMwZTIyYmFkLWVjZWQtNDNlZS1iMjNkLWM0NmM5M2IzZTM1YyIgc3RFdnQ6d2hlbj0iMjAxOS0xMi0zMFQwMTozODo1NyswMTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+6AB6cQAAAPxJREFUOMvF1b1Kw1AYBuAnFf8QL8WlIHQJIriIdyEu4qCTXop7dwenTgUHpYvgJVhob8AuakE+h9hapJqcFDXvFDgPIXlzvgNLjnQ9GlRM340TK7DsUtRI2zqH09txxUzWn3IrhK4DecXs6wjhnqHwZk/K1fIiDAs81krCW54KPBDG8iTcNBIGf4ND1MWTdmrgqIOL5TM0S8SRhmMu1dAo+2DZ57t9eWajtKrvN1GVnrMK9HewhbBy+nPPJbTsJwmymOn8P7fkfLzQGCoG4G4S3vZc4J4QOnY0KyZ3LYQHjqcjf1Qxrx/inDXtWsfNlU1YdeZOP+Gg67mwwTvIDqR1iAowgQAAAABJRU5ErkJggg==',
    }
    this.defaultStyle = {
      font: 'Roboto',
      fontSize: 12,
      color: 'black',
    }
  }

}

export class Content {
  text: string;
  style: string[];
  width: number;

  constructor(text: string, style: string[], width?: number) {
    this.text = text;
    this.style = style;
    if (width)
      this.width = width;
  }
}

export class Columns {
  columns: any[];
  style: string[];

  constructor(style?: string[]) {
    this.columns = [];
    if (style)
        this.style = style;
  }
}

export class PdfImage {
  image: string;
  height: number;
  width: number;
  style: string[];

  constructor(image: string, height: number, width: number, style: string[]) {
    this.image = image;
    this.height = height;
    this.width = width;
    this.style = style;
  }
}

export class PdfTable {
  table: TableDefinition;
  styles: string[];
  // layout = {
  //   paddingLeft(i, node) { return 2},
  //   paddingTop(i, node) { return 8},
  //   paddingRight(i, node) { return 2},
  //   paddingBottom(i, node) { return 8}
  // };

  constructor(table: TableDefinition, styles: string[]) {
    this.table = table;
    this.styles = styles;
  }
}

export class TableDefinition {
  body: any[][];
  widths: string[];
  heights: number[];

  constructor(body: any[][], widths: string[], heights?: number[]) {
    this.body = body;
    this.widths = widths;
    if (heights)
      this.heights = heights;
  }
}

export class PdfUnorderedList {
  ul: string[];
  type: string;
  markerColor: string;
  color: string;

  constructor(ul: string[], type?: string) {
    this.ul = ul;
    if (type)
      this.type = type;
  }
}

export class PdfMetadata {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  producer: string;
  creationDate: any;
  modDate: any;
  trapped: any;

  constructor(title: string) {
    this.title = title;
  }
}

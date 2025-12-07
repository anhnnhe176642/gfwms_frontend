declare module 'colorthief' {
  class ColorThief {
    getColor(img: HTMLImageElement | string, quality?: number): Promise<[number, number, number]>;
    getPalette(
      img: HTMLImageElement | string,
      colorCount?: number,
      quality?: number
    ): Promise<Array<[number, number, number]>>;
  }

  export default ColorThief;
}

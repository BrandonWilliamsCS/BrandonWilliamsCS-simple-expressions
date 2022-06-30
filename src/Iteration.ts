export class Iteration<T> {
  public get atEnd() {
    return this.position >= this.items.length;
  }

  public get current() {
    if (this.atEnd) {
      throw new Error("Cannot access item at or beyond end of iteration");
    }
    return this.items[this.position];
  }

  public constructor(
    public readonly items: ReadonlyArray<T>,
    public readonly position = 0,
  ) {}

  public advance(count = 1) {
    return new Iteration(this.items, this.position + count);
  }
}

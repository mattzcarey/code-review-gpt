type QueueItem<T> = {
  priority: number;
  item: T;
}

class PriorityQueue<T> {
  constructor(private items: QueueItem<T>[] = []) {}

  public enqueue(item: T, priority: number): void {
    const queueItem = { priority, item };
    this.items.push(queueItem);
    this.items.sort((a, b) => a.priority - b.priority);
  }

  public dequeue(): T | undefined {
    return this.items.shift()?.item;
  }

  public size(): number {
    return this.items.length;
  }

  public peek(): QueueItem<T> | undefined {
    return this.items[0];
  }

  public getItems(): T[] {
    return this.items.map((item) => item.item);
  }
}

export default PriorityQueue;

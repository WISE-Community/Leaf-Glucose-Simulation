import { Subject, Observable } from 'rxjs';

export class EventBus {
  private subjects: { [key: string]: Subject<any> } = {};

  emit(event: string, data?: any): void {
    if (!this.subjects[event]) {
      this.subjects[event] = new Subject<any>();
    }
    this.subjects[event].next(data);
  }

  on(event: string): Observable<any> {
    if (!this.subjects[event]) {
      this.subjects[event] = new Subject<any>();
    }
    return this.subjects[event].asObservable();
  }
}

export const eventBus = new EventBus();

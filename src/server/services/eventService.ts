let broadcast = (_event: unknown) => {};

export function setEventPublisher(publisher: (event: unknown) => void): void {
  broadcast = publisher;
}

export function publishEvent(event: unknown): void {
  broadcast(event);
}


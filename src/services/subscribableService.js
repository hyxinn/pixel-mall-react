class SubscribableService {
  listeners = new Set();

  revision = 0;

  subscribe(listener) {
    if (typeof listener !== 'function') {
      return () => {};
    }

    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getRevision() {
    return this.revision;
  }

  notify() {
    this.revision += 1;
    this.listeners.forEach((listener) => {
      listener();
    });
  }
}

export default SubscribableService;

let current: HTMLMediaElement | null = null;

export function registerMedia(el: HTMLMediaElement) {
  if (current && current !== el) {
    current.pause();
  }
  current = el;
}

export function unregisterMedia(el: HTMLMediaElement) {
  if (current === el) current = null;
}

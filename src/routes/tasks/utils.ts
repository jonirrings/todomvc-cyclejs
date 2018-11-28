import { Stream } from 'xstream';

export const ENTER_KEY = 13;
export const ESC_KEY = 27;

export function id(): string {
    return Math.random()
        .toString(34)
        .slice(2);
}

export function anchorExtractor(evt: Event): string {
    const target = evt.target as HTMLAnchorElement;
    if (target) {
        return target.hash;
    }
    return '';
}

export function textBoxExtractor(evt: Event): string {
    const target = evt.target as HTMLInputElement;
    if (target) {
        return target.value;
    }
    return '';
}

export function checkBoxExtractor(evt: Event): boolean {
    const target = evt.target as HTMLInputElement;
    if (target) {
        return target.checked;
    }
    return false;
}

export function redirect(link$: Stream<any>, path: string): Stream<string> {
    return link$.mapTo(path);
}

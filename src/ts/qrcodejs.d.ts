declare class QRCode {
    static readonly CorrectLevel: {
        L: number;
        M: number;
        Q: number;
        H: number;
    };
    constructor(element: HTMLElement | string, options: {
        text: string;
        width?: number;
        height?: number;
        colorDark?: string;
        colorLight?: string;
        correctLevel?: number;
    });
    makeCode(text: string): void;
}
export interface Printer {
    info(message: string): void;
}

export class ConsolePrinter implements Printer {
    info(message: string): void {
        console.log(message);
    }
}

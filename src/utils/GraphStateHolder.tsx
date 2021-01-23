export class GraphStateHolder {
    static lastPlotted: number = 0;

    static update() {
        this.lastPlotted++;
    }
}

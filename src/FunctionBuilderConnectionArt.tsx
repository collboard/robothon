import * as React from 'react';
import { BoundingBox, IVector, Vector } from 'xyzt';
import { Abstract2dArt } from '../../71-arts/26-Abstract2dArt';
import { functionBuilderFormatTitle } from './utils/functionBuilderFormatTitle';
import './style.css';
import { translate } from '../../50-systems/TranslationsSystem/translate';
import { plot } from './utils/plot';

export class FunctionBuilderConnectionArt extends Abstract2dArt {
    public end: IVector;

    constructor(public start: IVector, color: string) {
        super();
        this.end = start;
    }

    acceptedAttributes = [];

    // Just to implement, this is unnecessary
    get topLeftCorner() {
        return new Vector(Math.min(this.start.x!, this.end.x!), Math.min(this.start.y!, this.end.y!));
    }
    get bottomRightCorner() {
        return new Vector(Math.max(this.start.x!, this.end.x!), Math.max(this.start.y!, this.end.y!));
    }

    // Recalculated relative points
    get p1() {
        return Vector.subtract(this.start, this.topLeftCorner);
    }
    get p2() {
        return Vector.subtract(this.end, this.topLeftCorner);
    }

    render() {
        return (
            <svg
                style={{
                    width: this.bottomRightCorner.subtract(this.topLeftCorner).x,
                    height: this.bottomRightCorner.subtract(this.topLeftCorner).y,
                    position: 'absolute',
                    left: this.topLeftCorner.x,
                    top: this.topLeftCorner.y,
                }}
            >
                <line x1={this.p1.x} y1={this.p1.y} x2={this.p2.x} y2={this.p2.y} />
            </svg>
        );
    }
}

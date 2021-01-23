import * as React from 'react';
import { BoundingBox, IVector, Vector } from 'xyzt';
import { AbstractArtPlugin } from '../../50-systems/PluginStore/AbstractArtPlugin';
import { internalPlugin } from '../../50-systems/PluginStore/IPluginManifest';
import { Abstract2dArt } from '../../71-arts/26-Abstract2dArt';
import { functionBuilderFormatTitle } from './utils/functionBuilderFormatTitle';
import { FunctionBuilderFunction } from './interfaces/FunctionBuilderFunction';
import './style.css';
import { translate } from '../../50-systems/TranslationsSystem/translate';
import { plot } from './utils/plot';
import { functionBuilderDefinitions } from './functionBuilderDefinitions';

/**
 *
 * Note: In future this file will we in indipendent repository as external plugin.
 *
 */
export class FunctionBuilderArtPlugin extends AbstractArtPlugin {
    manifest = {
        internalPlugin,
        name: 'FunctionBuilderArt',
        // Note: ArtPlugin is invisible, and so there is no need to create a massive manifest for them. Write everything into the corresponding tool plugin.
    };
    public artSerializeRule = { name: 'FunctionBuilder', class: FunctionBuilderArt };
}

export class FunctionBuilderArt extends Abstract2dArt {
    private privateSize: IVector = new Vector(230, 280);

    constructor(public shift: IVector, private funct: string) {
        super();
    }

    acceptedAttributes = [];

    // The size of BB is reduced because of the connection events (should be eventually fixed)
    get topLeftCorner() {
        return Vector.add(this.shift, Vector.box(10));
    }
    get bottomRightCorner() {
        return Vector.subtract(Vector.add(this.shift, this.privateSize), Vector.box(10));
    }

    private get functionDefinition(): FunctionBuilderFunction | null {
        return functionBuilderDefinitions[this.funct];
    }

    render() {
        return (
            <div
                className="block functionBuilderArt"
                style={{
                    width: this.privateSize.x || 0,
                    height: this.privateSize.y || 0,
                    position: 'absolute',
                    left: this.shift.x || 0,
                    top: this.shift.y || 0,
                    transform: 'rotate(' + this.rotation + 'deg)',
                }}
            >
                <div className="functionTitle">
                    {this.functionDefinition ? functionBuilderFormatTitle(this.functionDefinition) : 'Error'}
                </div>
                <div className="inputs">
                    {this.functionDefinition &&
                        Object.values(this.functionDefinition.variables).map((variable, index) => (
                            <div className="connection" key={index}>
                                <div className="connectionPoint" />
                                <div className="connectionTitle">
                                    {translate('FunctionBuilderArt / Input', 'Vstup') + ' '}
                                    <i>
                                        {variable.title} {variable.note && `(${variable.note})`}
                                    </i>
                                </div>
                            </div>
                        ))}
                </div>
                <div className="outputs">
                    <div
                        className="connection"
                        onClick={(event) => {
                            event.stopPropagation();
                            //alert(123);
                        }}
                        onPointerDown={(event) => {
                            event.stopPropagation();
                            console.log('tahám');
                        }}
                        onPointerMove={(event) => {
                            event.stopPropagation();
                        }}
                    >
                        <div
                            className="connectionPoint" /* TODO: this should share color of connection style={{ background: '#F3921F' }}*/
                        />
                        <div className="connectionTitle">{translate('FunctionBuilderArt / Output', 'Výstup')}</div>
                    </div>
                </div>
                <div className="graphWrapper">
                    <canvas
                        className="graph"
                        width={202}
                        height={166}
                        ref={(canvas) => {
                            if (canvas) {
                                if (!this.functionDefinition || canvas.hasAttribute('plotted')) return;
                                canvas.setAttribute('plotted', 'true');
                                plot({
                                    canvas,
                                    func: (x) => this.functionDefinition!.func(x, { a: x }),
                                    // func: (x) => Math.sin(x),
                                    boundingBox: BoundingBox.one(),
                                    // TODO: objects: {},
                                });
                            }
                        }}
                    />
                </div>
            </div>
        );
    }
}

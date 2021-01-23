import * as React from 'react';
import { IVector, Vector } from 'xyzt';
import { AbstractArtPlugin } from '../../../50-systems/PluginStore/AbstractArtPlugin';
import { internalPlugin } from '../../../50-systems/PluginStore/IPluginManifest';
import { SystemsContainer } from '../../../50-systems/SystemsContainer';
import { translate } from '../../../50-systems/TranslationsSystem/translate';
import { AbstractArt } from '../../../71-arts/20-AbstractArt';
import { Abstract2dArt } from '../../../71-arts/26-Abstract2dArt';
import { DEFAULT_PLOT_BOUNDINGBOX } from '../config';
import { functionBuilderDefinitions } from '../definitions/functionBuilderDefinitions';
import { FunctionBuilderFunction } from '../interfaces/FunctionBuilderFunction';
import '../style.css';
import { functionBuilderColors } from '../utils/colors';
import { functionBuilderFormatTitle } from '../utils/functionBuilderFormatTitle';
import { GraphStateHolder } from '../utils/GraphStateHolder';
import { plot } from '../utils/plot';
import { renderPath } from '../utils/renderPath';



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
    // __Underscored variables don't get serialized
    public __mouseOverOutput: boolean = false;
    public __mouseOverInput: { [key: string]: boolean } = {};

    private __outputRef = React.createRef<HTMLDivElement>();
    private __inputRefs: { [key: string]: React.RefObject<HTMLDivElement> } = {};

    private __lastPlotted: number = -1;

    public connections: { [key: string]: string | null };
    private privateSize: IVector = new Vector(230, 280);
    public color: string;

    constructor(public shift: IVector, private funct: string) {
        super();

        this.color = functionBuilderColors[Math.floor(Math.random() * functionBuilderColors.length)];

        this.connections = {};

        if (this.functionDefinition) {
            Object.keys(this.functionDefinition.variables).forEach((variable) => {
                this.__mouseOverInput[variable] = false;
                this.connections[variable] = null;
                this.__inputRefs[variable] = React.createRef();
            });
        }
    }

    acceptedAttributes = [];

    // The size of BB is reduced because of the connection events (should be eventually fixed)
    get topLeftCorner() {
        return Vector.add(this.shift, Vector.box(10));
    }
    get bottomRightCorner() {
        return Vector.subtract(Vector.add(this.shift, this.privateSize), Vector.box(10));
    }

    public get functionDefinition(): FunctionBuilderFunction | null {
        return functionBuilderDefinitions[this.funct];
    }

    public registerInputIfOver(sourceId: string) {
        return Object.keys(this.__mouseOverInput)
            .filter((key) => this.__mouseOverInput[key])
            .map((key) => {
                this.connections[key] = sourceId;
                GraphStateHolder.update();
                //console.log('Created connection from ' + sourceId + ' to ' + this.artId + ' (input ' + key + ')');
            });
    }

    private locateRef(target: React.RefObject<HTMLDivElement>, systemsContainer: SystemsContainer) {
        if (target && target.current) {
            const bb = target.current.getBoundingClientRect();
            return systemsContainer.collSpace.pickPoint(new Vector(bb.x, bb.y)).point.add(Vector.box(12)); // 12 is radius of circle
        }
        return Vector.add(this.shift, Vector.scale(this.privateSize, 0.5));
    }

    public getOutputPosition(systemsContainer: SystemsContainer) {
        return this.locateRef(this.__outputRef, systemsContainer);
    }

    public getInputPosition(key: string, systemsContainer: SystemsContainer) {
        return this.locateRef(this.__inputRefs[key], systemsContainer);
    }

    public evaluate(x: number, seenNodes: string[], systemsContainer: SystemsContainer): number | null {
        if (seenNodes.includes(this.artId)) return null;
        if (!this.functionDefinition) return null;

        let sources: { [key: string]: FunctionBuilderArt | null } = {};
        Object.keys(this.connections).forEach((key) => {
            if (this.connections[key] === null) {
                sources[key] = null;
                return;
            }

            const foundArts = systemsContainer.artVersionSystem.materialArts.filter(
                (art: AbstractArt) => art.artId === this.connections[key],
            );
            if (foundArts.length === 0) {
                sources[key] = null;
                return;
            }

            sources[key] = foundArts[0] as FunctionBuilderArt;
        });

        let variables: { [key: string]: number | null } = {};
        Object.keys(sources).forEach((key) => {
            if (sources[key] === null) {
                variables[key] = 0;
                return;
            }

            variables[key] = sources[key]!.evaluate(x, [...seenNodes, this.artId], systemsContainer);
        });

        if (Object.values(variables).reduce((prev, curr) => prev || curr === null, false)) return null;

        return this.functionDefinition.func(x, variables as { [key: string]: number });
    }

    render(_selected: boolean, systemsContainer: SystemsContainer) {
        if (Object.keys(this.connections).length !== Object.keys(this.__inputRefs).length) {
            if (this.functionDefinition) {
                Object.keys(this.functionDefinition.variables).forEach((variable) => {
                    this.__inputRefs[variable] = React.createRef();
                });
            }
        }

        let sources: { [key: string]: FunctionBuilderArt | null } = {};
        Object.keys(this.connections).forEach((key) => {
            if (this.connections[key] === null) {
                sources[key] = null;
                return;
            }

            const foundArts = systemsContainer.artVersionSystem.materialArts.filter(
                (art: AbstractArt) => art.artId === this.connections[key],
            );
            if (foundArts.length === 0) {
                // Object got deleted
                sources[key] = null;
                this.connections[key] = null;
                GraphStateHolder.update();
                return;
            }

            sources[key] = foundArts[0] as FunctionBuilderArt;
        });

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
                        Object.keys(this.functionDefinition.variables).map((key) => (
                            <div className="connection" key={key}>
                                <div
                                    className="connectionPoint"
                                    onMouseOver={() => {
                                        this.__mouseOverInput[key] = true;
                                    }}
                                    onMouseOut={() => {
                                        this.__mouseOverInput[key] = false;
                                    }}
                                    style={sources[key] ? { background: sources[key]!.color } : {}}
                                    ref={this.__inputRefs[key]}
                                />
                                <div className="connectionTitle">
                                    {translate('FunctionBuilderArt / Input', 'Vstup') + ' '}
                                    <i>
                                        {this.functionDefinition!.variables[key].title}{' '}
                                        {this.functionDefinition!.variables[key].note &&
                                            `(${this.functionDefinition!.variables[key].note})`}
                                    </i>
                                </div>
                            </div>
                        ))}
                </div>
                <div className="outputs">
                    <div className="connection">
                        <div
                            className="connectionPoint"
                            onMouseOver={() => {
                                this.__mouseOverOutput = true;
                            }}
                            onMouseOut={() => {
                                this.__mouseOverOutput = false;
                            }}
                            ref={this.__outputRef}
                            style={{ background: this.color }}
                        />
                        <div className="connectionTitle">{translate('FunctionBuilderArt / Output', 'Výstup')}</div>
                    </div>
                </div>
                <div className="graphWrapper">
                    <canvas
                        className="graph"
                        width={202}
                        height={166}
                        id={this.artId}
                        ref={(canvas) => {
                            if (canvas) {
                                if (!this.functionDefinition) return;
                                if (GraphStateHolder.lastPlotted === this.__lastPlotted) return;

                                this.__lastPlotted = GraphStateHolder.lastPlotted;
                                plot({
                                    canvas,
                                    func: (x) => this.evaluate(x, [], systemsContainer),
                                    // func: (x) => Math.sin(x),
                                    boundingBox: DEFAULT_PLOT_BOUNDINGBOX,
                                    // TODO: objects: {},
                                });
                            }
                        }}
                    />
                </div>
                {Object.keys(sources)
                    .filter((key) => sources[key] !== null)
                    .map((key) => {
                        return renderPath(
                            sources[key]!.getOutputPosition(systemsContainer),
                            this.getInputPosition(key, systemsContainer),
                            sources[key]!.color,
                            undefined, // Here can be label
                            this.shift,
                            key,
                        );
                    })}
            </div>
        );
    }
}

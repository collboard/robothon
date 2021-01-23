import { observable } from 'mobx';
import * as React from 'react';
import { Vector } from 'xyzt';
import { Icon } from '../../../30-components/menu/Icon';
import { classNames } from '../../../40-utils/classNames';
import { AbstractToolPlugin } from '../../../50-systems/PluginStore/AbstractToolPlugin';
import { Authors } from '../../../50-systems/PluginStore/Authors';
import { inDevelopmentPublishedAsExperimental, internalPlugin } from '../../../50-systems/PluginStore/IPluginManifest';
import { SystemsContainer } from '../../../50-systems/SystemsContainer';
import { IIcon } from '../../../50-systems/ToolbarSystem/IconsToolbar';
import { AbstractTool } from '../../../72-tools/AbstractTool';
import { functionBuilderDefinitions } from '../definitions/functionBuilderDefinitions';
import { FunctionBuilderConnectionArt } from '../utils/FunctionBuilderConnectionArt';
import { functionBuilderFormatTitle } from '../utils/functionBuilderFormatTitle';
import { GraphStateHolder } from '../utils/GraphStateHolder';
import { FunctionBuilderArt } from './FunctionBuilderArtPlugin';


/**
 *
 * Note: In future this file will we in indipendent repository as external plugin.
 *
 */

export class FunctionBuilderPlugin extends AbstractToolPlugin {
    manifest = {
        internalPlugin,
        inDevelopmentPublishedAsExperimental,
        name: 'FunctionBuilder',
        title: { en: 'TODO: Function Builder', cs: 'TODO: Nástroj na konstrukci funkcí' },
        description: {
            en: 'TODO',
            cs: 'TODO',
        },
        keywords: [],
        categories: ['Math'],
        icon: '/assets/icons/group.svg', // TODO
        screenshots: [
            /*TODO:*/
        ],
        contributors: [Authors.rosecky, Authors.hejny],
        internalDependencies: ['SelectionTool'],
    };

    icon: IIcon = {
        name: 'functionBuilder',
        order: 61,
        section: 0,
        icon: 'group', // TODO
        boardCursor: 'default',
        menu: () => (
            <>
                <Icon
                    icon="cursor"
                    active={this.manipulating}
                    onClick={() => {
                        this.manipulating = true;
                    }}
                />

                {/* TODO: add icons */}

                {Object.keys(functionBuilderDefinitions).map((funct) => (
                    <div
                        className={classNames(
                            'textIcon',
                            !this.manipulating && this.selectedFunction === funct && 'active',
                        )}
                        onClick={() => {
                            this.selectedFunction = funct;
                            this.manipulating = false;
                        }}
                    >
                        {functionBuilderFormatTitle(functionBuilderDefinitions[funct])}
                    </div>
                ))}
            </>
        ),
    };

    tool: FunctionBuilderTool = new FunctionBuilderTool(this);

    @observable selectedFunction: string = Object.keys(functionBuilderDefinitions)[0];

    @observable manipulating: boolean = false;

    async activateSelectionTool() {
        this.manipulating = true;
    }
}

class FunctionBuilderTool extends AbstractTool {
    createSubscription() {
        const plugin = this.plugin as FunctionBuilderPlugin;

        return this.plugin.touchController.touches.subscribe(async (touch) => {
            if (!this.plugin.amISelected) return;

            if (plugin.manipulating) {
                // Dragging new connection
                const overOutputs = plugin.artVersionSystem.artsPlaced.filter(
                    (art) => art instanceof FunctionBuilderArt && (art as FunctionBuilderArt).__mouseOverOutput,
                );

                if (overOutputs.length > 0) {
                    const source = overOutputs[0] as FunctionBuilderArt;

                    const arrow = new FunctionBuilderConnectionArt(
                        source.getOutputPosition((this.plugin as any) as SystemsContainer),
                        source.color,
                    );

                    plugin.artVersionSystem.registerVirtualArts(arrow);
                    touch.frames.subscribe({
                        next: (touchFrame) => {
                            arrow.end = this.plugin.collSpace.pickPoint(touchFrame.position).point;
                            plugin.artVersionSystem.updateVirtualArts(arrow);
                        },
                        complete: () => {
                            const toUpdate = plugin.artVersionSystem.artsPlaced.filter(
                                (art) =>
                                    art instanceof FunctionBuilderArt &&
                                    (art as FunctionBuilderArt).registerInputIfOver(source.artId),
                            );

                            plugin
                                .createOperation('Connection updated')
                                .takeArts(...toUpdate)
                                .update(...toUpdate)
                                .persist();

                            plugin.artVersionSystem.unregisterVirtualArts(arrow);
                        },
                    });
                    return;
                }

                // Editing old connection
                const overInputs = plugin.artVersionSystem.artsPlaced.filter(
                    (art) =>
                        art instanceof FunctionBuilderArt &&
                        Object.values((art as FunctionBuilderArt).__mouseOverInput).reduce(
                            (prev, curr) => prev || curr,
                            false,
                        ),
                );

                if (overInputs.length > 0) {
                    const oldChild = overInputs[0] as FunctionBuilderArt;
                    const inputId = Object.keys(oldChild.__mouseOverInput).filter(
                        (key) => oldChild.__mouseOverInput[key],
                    )[0]; // Must exist because filtering

                    // Nothing connected there
                    if (!oldChild.connections[inputId]) return;

                    const possibleSources = plugin.artVersionSystem.artsPlaced.filter(
                        (art) => art.artId === oldChild.connections[inputId],
                    );

                    // Source no longer exists
                    if (possibleSources.length === 0) return;

                    oldChild.connections[inputId] = null;
                    GraphStateHolder.update();

                    const source = possibleSources[0];

                    const arrow = new FunctionBuilderConnectionArt(
                        source.getOutputPosition((this.plugin as any) as SystemsContainer),
                        source.color,
                    );

                    plugin.artVersionSystem.registerVirtualArts(arrow);
                    touch.frames.subscribe({
                        next: (touchFrame) => {
                            arrow.end = this.plugin.collSpace.pickPoint(touchFrame.position).point;
                            plugin.artVersionSystem.updateVirtualArts(arrow);
                        },
                        complete: () => {
                            plugin.artVersionSystem.artsPlaced.forEach(
                                (art) =>
                                    art instanceof FunctionBuilderArt &&
                                    (art as FunctionBuilderArt).registerInputIfOver(source.artId),
                            );

                            plugin.artVersionSystem.unregisterVirtualArts(arrow);
                        },
                    });
                    return;
                }

                // Dragging whole boxes (supply selection tool)
                // TODO: Make some reusable code from movetool not to implement dragging in every spetial tool
                let dragging: FunctionBuilderArt;

                const draggable = this.plugin.artVersionSystem.materialArtsPlaced.filter(
                    (art) =>
                        art.isNear(this.plugin.collSpace.pickPoint(touch.firstFrame.position).point) &&
                        art instanceof FunctionBuilderArt &&
                        !art.locked,
                ) as FunctionBuilderArt[];
                if (!draggable.length) {
                    this.plugin.appState.selected = [];
                    return;
                }

                dragging = draggable[draggable.length - 1];
                this.plugin.appState.selected = [dragging];

                const operation = this.plugin.createOperation('Dragging').takeArts(dragging);

                let lastPosition = this.plugin.collSpace.pickPoint(touch.firstFrame.position).point;

                this.registerAdditionalSubscription(
                    touch.frames.subscribe(
                        (frame) => {
                            // TODO: If not move just select

                            operation.updateWithCallback((art) => {
                                art.move(
                                    this.plugin.collSpace
                                        .pickPoint(frame.positionRelative)
                                        .point.subtract(lastPosition),
                                );

                                lastPosition = this.plugin.collSpace.pickPoint(frame.position).point;
                                return art;
                            });
                        },
                        () => {},
                        () => {
                            operation.persist();
                        },
                    ),
                );
                return;
            } else {
                const pointOnBoard = this.plugin.collSpace.pickPoint(touch.firstFrame.position).point;

                const newArt = new FunctionBuilderArt(
                    pointOnBoard.subtract(new Vector(115, 140)),
                    plugin.selectedFunction,
                );

                const operation = this.plugin.createOperation('FunctionBuilderNew');
                operation.newArts(newArt);
                operation.persist();

                plugin.activateSelectionTool();
            }
        });
    }
}

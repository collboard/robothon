import { observable } from 'mobx';
import * as React from 'react';
import { Icon } from '../../30-components/menu/Icon';
import { classNames } from '../../40-utils/classNames';
import { AbstractToolPlugin } from '@collboard/modules-sdk'; //'../../50-systems/PluginStore/AbstractToolPlugin';
import { Authors } from '../../50-systems/PluginStore/Authors';
import { internalPlugin, inDevelopmentPublishedAsExperimental } from '../../50-systems/PluginStore/IPluginManifest';
import { IIcon } from '../../50-systems/ToolbarSystem/IconsToolbar';
import { AbstractTool } from '../../72-tools/AbstractTool';
import { FunctionBuilderArt } from './FunctionBuilderArtPlugin';
import { FunctionBuilderConnectionArt } from './FunctionBuilderConnectionArt';
import { functionBuilderDefinitions } from './functionBuilderDefinitions';
import { functionBuilderFormatTitle } from './utils/functionBuilderFormatTitle';

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
                    icon="link"
                    active={this.drawingConnections}
                    onClick={() => {
                        this.drawingConnections = true;
                    }}
                />

                {/* TODO: add icons */}

                {Object.keys(functionBuilderDefinitions).map((funct) => (
                    <div
                        className={classNames(
                            'textIcon',
                            !this.drawingConnections && this.selectedFunction === funct && 'active',
                        )}
                        onClick={() => {
                            this.selectedFunction = funct;
                            this.drawingConnections = false;
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

    @observable drawingConnections: boolean = false;

    async activateSelectionTool() {
        const selectionTool = await this.pluginStore.getPlugin('SelectionTool');

        if (selectionTool) {
            (selectionTool as AbstractToolPlugin).makeSelected();
        }
    }
}

class FunctionBuilderTool extends AbstractTool {
    createSubscription() {
        const plugin = this.plugin as FunctionBuilderPlugin;

        return this.plugin.touchController.touches.subscribe(async (touch) => {
            if (!this.plugin.amISelected) return;

            if (plugin.drawingConnections) {
                // TADY!!!

                const arrow = new FunctionBuilderConnectionArt(
                    this.plugin.collSpace.pickPoint(touch.firstFrame.position).point,
                );

                plugin.artVersionSystem.registerVirtualArts(arrow);
                touch.frames.subscribe({
                    next: (touchFrame) => {
                        arrow.end = this.plugin.collSpace.pickPoint(touchFrame.position).point;
                    },
                    complete: () => {
                        plugin.artVersionSystem.unregisterVirtualArts(arrow);
                    },
                });
            } else {
                const pointOnBoard = this.plugin.collSpace.pickPoint(touch.firstFrame.position).point;

                const newArt = new FunctionBuilderArt(pointOnBoard, plugin.selectedFunction);

                const operation = this.plugin.createOperation('FunctionBuilderNew');
                operation.newArts(newArt);
                operation.persist();

                plugin.activateSelectionTool();
            }
        });
    }
}

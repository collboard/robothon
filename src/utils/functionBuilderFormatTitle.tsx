import * as React from 'react';
import { FunctionBuilderFunction } from '../interfaces/FunctionBuilderFunction';

export function functionBuilderFormatTitle(definition: FunctionBuilderFunction): JSX.Element {
    const raw = definition.title;
    const varsIds = Object.keys(definition.variables);

    let result = raw;
    varsIds.forEach(
        (varId) =>
            (result = (result as any).replaceAll('$' + varId, '<i>' + definition.variables[varId].title + '</i>')),
    );

    return <span dangerouslySetInnerHTML={{ __html: result }} />;
}

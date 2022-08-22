import { ComponentType, useCallback, useRef } from 'react';

import { usePopupsContext } from './usePopupsContext';
import { PopupGroup } from '../components/PopupGroup';
import { DefaultPopup } from '../types/DefaultPopup';
import { OptionalParamFunction } from '../types/OptionalParamFunction';
import { PopupIdentifier } from '../types/PopupIdentifier';
import { uuid } from '../utils/uuid';

export type UsePopupBag<P, K extends keyof P> = [
    open: OptionalParamFunction<Omit<P, K>, void>,
    close: () => void
];

export const usePopup = <P, K extends keyof P>(
    PopupComponent: ComponentType<P>,
    props: Pick<P, K>,
    group: PopupGroup
): UsePopupBag<P, K> => {
    const { mount, close: closePopup, getPopup } = usePopupsContext();

    const popupIdentifier = useRef<PopupIdentifier>({
        id: uuid(),
        groupId: group.groupId,
    });

    const open = useCallback<OptionalParamFunction<Omit<P, K>, void>>(
        (omittedProps?: Omit<P, K>) => {
            const popup =
                getPopup(popupIdentifier.current) ??
                new DefaultPopup(
                    PopupComponent as ComponentType<{}>,
                    {},
                    popupIdentifier.current
                );
            popup.setProps({ ...props, ...omittedProps });

            mount(popup!);
        },
        [PopupComponent, mount, props, getPopup]
    );

    const close = useCallback(() => {
        closePopup(popupIdentifier.current);
    }, [closePopup]);

    return [open, close];
};

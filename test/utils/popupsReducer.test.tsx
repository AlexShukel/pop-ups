import React, { useReducer } from 'react';
import { act, renderHook } from '@testing-library/react';

import { createPopupGroup } from '../../src/components/PopupGroup';
import { DefaultPopup } from '../../src/types/DefaultPopup';
import { Popup } from '../../src/types/Popup';
import { ControlledPopupIdentifier } from '../../src/types/PopupIdentifier';
import { ActionType, popupsReducer } from '../../src/utils/popupsReducer';
import { uuid } from '../../src/utils/uuid';

const group = createPopupGroup();
const getNewPopupIdentifier = (): ControlledPopupIdentifier => ({
    id: uuid(),
    groupId: group.groupId,
    type: 'controlled',
});

const PopupComponent: React.FC = () => {
    return <div>simple popup</div>;
};

describe('State reducer of popups', () => {
    it('should mount popup', () => {
        const { result } = renderHook(() =>
            useReducer(popupsReducer, { popups: {} })
        );

        const [state, dispatch] = result.current;

        const popupIdentifier = getNewPopupIdentifier();
        const popup = new DefaultPopup(
            PopupComponent,
            {},
            popupIdentifier,
            () => {
                // do nothing
            }
        );

        act(() => {
            dispatch({
                type: ActionType.MOUNT,
                payload: {
                    popup,
                },
            });
        });

        expect(state.popups[popupIdentifier.groupId][popupIdentifier.id]).toBe(
            popup
        );
    });

    it('should unmount popup', () => {
        const { result } = renderHook(() =>
            useReducer(popupsReducer, {
                popups: {
                    [group.groupId]: {
                        0: {} as Popup<object>,
                        1: {} as Popup<object>,
                        2: {} as Popup<object>,
                    },
                },
            })
        );

        const [state, dispatch] = result.current;

        act(() => {
            dispatch({
                type: ActionType.UNMOUNT,
                payload: {
                    popupIdentifier: {
                        groupId: group.groupId,
                        id: 1,
                        type: 'controlled',
                    },
                },
            });
        });

        const popupsKeys = Object.keys(state.popups[group.groupId]);
        expect(popupsKeys.length).toBe(2);
        expect(popupsKeys.includes('1')).toBeFalsy();
    });
});

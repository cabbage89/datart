/**
 * Datart
 *
 * Copyright 2021
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'types';
import { boardInit } from '.';
import { getLayoutWidgets } from '../../../utils/widget';
import { Widget, WidgetInfo } from './types';

export const selectPropsId = (_: unknown, id: string) => id;

export const boardState = (state: RootState) => state.board || boardInit;
export const selectBoardRecord = createSelector(
  [boardState],
  state => state.boardRecord,
);

export const selectBoardInfoRecord = createSelector(
  [boardState],
  state => state?.boardInfoRecord,
);
export const selectBoardInfoById = createSelector(
  [selectBoardInfoRecord, selectPropsId],
  (BoardInfoMap, id) => BoardInfoMap[id],
);
export const selectBoardWidgetMap = createSelector(
  [boardState],
  state => state.widgetRecord,
);
export const selectWidgetInfoGroupMap = createSelector(
  [boardState],
  state => state.widgetInfoRecord,
);

export const selectBoardById = createSelector(
  selectBoardRecord,
  selectPropsId,
  (selectBoards, id) => {
    return selectBoards[id] || undefined;
  },
);

export const selectBoardWidgetMapById = createSelector(
  selectBoardWidgetMap,
  selectPropsId,
  (widgetRecord, id) => widgetRecord[id] || {},
);

export const selectWidgetBy2Id = createSelector(
  selectBoardWidgetMap,
  selectPropsId,
  (_1, _2, wid: string) => wid,
  (boardWidgetRecord, recordId, widgetId) => {
    try {
      return boardWidgetRecord[recordId][widgetId];
    } catch (error) {
      return undefined;
    }
  },
);

export const selectLayoutWidgetMapById = () =>
  createSelector(selectBoardWidgetMap, selectPropsId, (widgetRecord, id) => {
    if (!widgetRecord[id]) return {};
    const allWidgetMap = widgetRecord[id];
    const layoutWidgets = getLayoutWidgets(allWidgetMap);
    const LayoutWidgetMap: Record<string, Widget> = {};
    layoutWidgets.forEach(w => {
      LayoutWidgetMap[w.id] = allWidgetMap[w.id];
    });
    return LayoutWidgetMap;
  });

export const selectWidgetInfoMap = createSelector(
  selectWidgetInfoGroupMap,
  selectPropsId,
  (widgetInfoGroupMap, id) => widgetInfoGroupMap[id] || {},
);

export const selectWidgetInfoBy2Id = createSelector(
  selectWidgetInfoGroupMap,
  selectPropsId,
  (_, bId: string, wId: string) => wId,
  (widgetInfoGroupMap, boardId, widgetId) => {
    try {
      return widgetInfoGroupMap[boardId][widgetId];
    } catch (error) {
      return undefined;
    }
  },
);
export const selectLayoutWidgetInfoMapById = createSelector(
  selectBoardWidgetMap,
  selectWidgetInfoGroupMap,
  selectPropsId,
  (allWidgetMap, allWidgetInfoMap, id) => {
    if (!allWidgetMap[id]) return {};
    if (!allWidgetInfoMap[id]) return {};

    const layoutWidgets = getLayoutWidgets(allWidgetMap[id]);
    const widgetInfoMap = allWidgetInfoMap[id];
    const layoutWidgetsInfo: Record<string, WidgetInfo> = {};

    layoutWidgets.forEach(w => {
      layoutWidgetsInfo[w.id] = widgetInfoMap[w.id];
    });
    return layoutWidgetsInfo;
  },
);

export const makeSelectBoardConfigById = () =>
  createSelector(selectBoardRecord, selectPropsId, (boardRecord, id) => {
    if (boardRecord[id]) {
      return boardRecord[id];
    } else {
      return undefined;
    }
  });

export const makeSelectBoardFullScreenPanelById = () =>
  createSelector(
    selectBoardInfoRecord,
    selectPropsId,
    (BoardInfoRecord, id) => BoardInfoRecord[id].fullScreenItemId,
  );

export const selectDataChartMap = createSelector(
  [boardState],
  state => state.dataChartMap,
);

export const selectDataChartById = createSelector(
  [selectDataChartMap, (_, chartId: string) => chartId],
  (dataChartMap, id) => dataChartMap[id],
);

export const selectViewMap = createSelector(
  [boardState],
  state => state.viewMap,
);

// dataChartMap
export const selectWidgetDataById = createSelector(
  [boardState, selectPropsId],
  (state, wid) =>
    state.widgetDataMap[wid] || {
      id: '',
      columns: [],
      rows: [],
    },
);

//  share
export const selectShareBoard = createSelector([boardState], state => {
  return Object.values(state?.boardRecord)[0] || undefined;
});
export const selectShareBoardInfo = createSelector([boardState], state => {
  return Object.values(state?.boardInfoRecord)[0] || undefined;
});

import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  ContainerWidgetContent,
  ControllerWidgetContent,
  getDataOption,
  VizRenderMode,
  Widget,
} from 'app/pages/DashBoardPage/pages/Board/slice/types';
import { getControlOptionQueryParams } from 'app/pages/DashBoardPage/utils/widgetToolKit/chart';
import { FilterSearchParams } from 'app/pages/MainPage/pages/VizPage/slice/types';
import { shareActions } from 'app/pages/SharePage/slice';
import { ExecuteToken, ShareVizInfo } from 'app/pages/SharePage/slice/types';
import ChartDataset from 'app/types/ChartDataset';
import { RootState } from 'types';
import { request } from 'utils/request';
import { errorHandle, getErrorMessage } from 'utils/utils';
import { boardActions } from '.';
import { getChartWidgetRequestParams } from '../../../utils';
import { handleServerBoardAction } from './asyncActions';
import { selectBoardById, selectBoardWidgetMap } from './selector';
import { BoardState, ServerDashboard, WidgetData } from './types';

/**
 * @param ''
 * @description '先拿本地缓存，没有缓存再去服务端拉数据'
 */
export const getBoardDetail = createAsyncThunk<
  null,
  {
    dashboardRelId: string;
    filterSearchParams?: FilterSearchParams;
    vizToken?: ExecuteToken;
  }
>(
  'board/getBoardDetail',
  async (params, { getState, dispatch, rejectWithValue }) => {
    // 1 在 内存里找到就返回
    const dashboard = selectBoardById(
      getState() as { board: BoardState },
      params?.dashboardRelId,
    );
    if (dashboard) {
      return null;
    }
    if (params.vizToken) {
      await dispatch(
        fetchBoardDetailInShare({ ...params, vizToken: params.vizToken }),
      );
    } else {
      await dispatch(fetchBoardDetail(params));
    }
    return null;
  },
);

export const fetchBoardDetail = createAsyncThunk<
  null,
  { dashboardRelId: string; filterSearchParams?: FilterSearchParams }
>('board/fetchBoardDetail', async (params, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await request<ServerDashboard>(
      `/viz/dashboards/${params?.dashboardRelId}`,
    );

    await dispatch(
      handleServerBoardAction({
        data,
        renderMode: 'read',
        filterSearchMap: { params: params?.filterSearchParams },
      }),
    );
    return null;
  } catch (error) {
    errorHandle(error);
    throw error;
  }
});

export const fetchBoardDetailInShare = createAsyncThunk<
  null,
  {
    dashboardRelId: string;
    vizToken: ExecuteToken;
    filterSearchParams?: FilterSearchParams;
  }
>(
  'board/fetchBoardDetailInShare',
  async (params, { dispatch, rejectWithValue }) => {
    try {
      const { vizToken } = params;
      const { data } = await request<ShareVizInfo>({
        url: '/share/viz',
        method: 'GET',
        params: {
          shareToken: vizToken.token,
          password: vizToken.password,
        },
      });
      dispatch(
        shareActions.setExecuteTokenMap({
          executeToken: data.executeToken,
        }),
      );
      const serverBoard = data.vizDetail as ServerDashboard;
      dispatch(
        handleServerBoardAction({
          data: serverBoard,
          renderMode: 'share',
          filterSearchMap: {
            params: params.filterSearchParams,
            isMatchByName: true,
          },
        }),
      );

      return null;
    } catch (error) {
      errorHandle(error);
      throw error;
    }
  },
);
export const renderedWidgetAsync = createAsyncThunk<
  null,
  { boardId: string; widgetId: string; renderMode?: VizRenderMode },
  { state: { board: BoardState } }
>(
  'board/renderedWidgetAsync',
  async ({ boardId, widgetId, renderMode }, { getState, dispatch }) => {
    const widgetMapMap = selectBoardWidgetMap(getState());
    const widgetMap = widgetMapMap[boardId];
    const curWidget = widgetMap[widgetId];
    if (!curWidget) return null;
    // 1 widget render
    dispatch(boardActions.renderedWidgets({ boardId, widgetIds: [widgetId] }));
    // 2 widget getData
    dispatch(
      getWidgetData({ boardId: boardId, widget: curWidget, renderMode }),
    );
    if (curWidget.config.type === 'container') {
      const content = curWidget.config.content as ContainerWidgetContent;
      let subWidgetIds: string[] = [];
      subWidgetIds = Object.values(content.itemMap)
        .map(item => item.childWidgetId)
        .filter(id => !!id);
      // 1 widget render
      dispatch(
        boardActions.renderedWidgets({ boardId, widgetIds: subWidgetIds }),
      );
      // 2 widget getData
      subWidgetIds.forEach(wid => {
        dispatch(
          getWidgetData({
            boardId: boardId,
            widget: widgetMap[wid],
            renderMode,
          }),
        );
      });
    }

    return null;
  },
);

export const getWidgetData = createAsyncThunk<
  null,
  {
    boardId: string;
    widget: Widget;
    renderMode: VizRenderMode | undefined;
    option?: getDataOption;
  },
  { state: RootState }
>(
  'board/getWidgetData',
  ({ widget, renderMode, option }, { getState, dispatch }) => {
    const boardId = widget.dashboardId;
    dispatch(boardActions.renderedWidgets({ boardId, widgetIds: [widget.id] }));
    const widgetId = widget.id;
    switch (widget.config.type) {
      case 'chart':
        dispatch(
          getChartWidgetDataAsync({ boardId, widgetId, renderMode, option }),
        );
        return null;
      case 'controller':
        dispatch(getControllerOptions({ boardId, widgetId, renderMode }));
        return null;
      default:
        return null;
    }
  },
);
export const getChartWidgetDataAsync = createAsyncThunk<
  null,
  {
    boardId: string;
    widgetId: string;
    renderMode: VizRenderMode | undefined;
    option?: getDataOption;
  },
  { state: RootState }
>(
  'board/getChartWidgetDataAsync',
  async ({ boardId, widgetId, renderMode, option }, { getState, dispatch }) => {
    dispatch(boardActions.renderedWidgets({ boardId, widgetIds: [widgetId] }));
    const boardState = getState() as { board: BoardState };

    const widgetMapMap = boardState.board.widgetRecord;
    const widgetInfo =
      boardState.board?.widgetInfoRecord?.[boardId]?.[widgetId];
    const widgetMap = widgetMapMap[boardId];
    const curWidget = widgetMap[widgetId];

    if (!curWidget) return null;
    const viewMap = boardState.board.viewMap;
    const dataChartMap = boardState.board.dataChartMap;
    const boardLinkFilters =
      boardState.board.boardInfoRecord?.[boardId]?.linkFilter;

    let requestParams = getChartWidgetRequestParams({
      widgetId,
      widgetMap,
      viewMap,
      option,
      widgetInfo,
      dataChartMap,
      boardLinkFilters,
    });
    if (!requestParams) {
      return null;
    }
    let widgetData;
    try {
      if (renderMode === 'read') {
        const { data } = await request<WidgetData>({
          method: 'POST',
          url: `data-provider/execute`,
          data: requestParams,
        });
        widgetData = { ...data, id: widgetId };
      } else {
        const executeTokenMap = (getState() as RootState)?.share
          ?.executeTokenMap;
        const dataChart = dataChartMap[curWidget.datachartId];
        const viewId = viewMap[dataChart.viewId].id;
        const executeToken = executeTokenMap?.[viewId];
        const { data } = await request<WidgetData>({
          method: 'POST',
          url: `share/execute`,
          params: {
            executeToken: executeToken?.token,
            password: executeToken?.password,
          },
          data: requestParams,
        });
        widgetData = { ...data, id: widgetId };
      }
      dispatch(boardActions.setWidgetData(widgetData as WidgetData));
      dispatch(
        boardActions.changePageInfo({
          boardId,
          widgetId,
          pageInfo: widgetData.pageInfo,
        }),
      );
      dispatch(
        boardActions.setWidgetErrInfo({
          boardId,
          widgetId,
          errInfo: undefined,
        }),
      );
    } catch (error) {
      dispatch(
        boardActions.setWidgetErrInfo({
          boardId,
          widgetId,
          errInfo: getErrorMessage(error),
        }),
      );

      dispatch(
        boardActions.setWidgetData({
          id: widgetId,
          columns: [],
          rows: [],
        } as WidgetData),
      );
    }
    dispatch(
      boardActions.addFetchedItem({
        boardId,
        widgetId,
      }),
    );
    return null;
  },
);

// 根据 字段获取 Controller 的options
export const getControllerOptions = createAsyncThunk<
  null,
  { boardId: string; widgetId: string; renderMode: VizRenderMode | undefined },
  { state: RootState }
>(
  'board/getControllerOptions',
  async ({ boardId, widgetId, renderMode }, { getState, dispatch }) => {
    dispatch(
      boardActions.renderedWidgets({
        boardId: boardId,
        widgetIds: [widgetId],
      }),
    );
    const boardState = getState() as { board: BoardState };
    const viewMap = boardState.board.viewMap;
    const widgetMapMap = boardState.board.widgetRecord;
    const widgetMap = widgetMapMap[boardId];
    const widget = widgetMap[widgetId];
    if (!widget) return null;
    const content = widget.config.content as ControllerWidgetContent;
    const config = content.config;
    if (!Array.isArray(config.assistViewFields)) return null;
    if (config.assistViewFields.length !== 2) return null;

    const executeTokenMap = (getState() as RootState)?.share?.executeTokenMap;

    const [viewId, viewField] = config.assistViewFields;

    const executeToken = executeTokenMap?.[viewId];

    const view = viewMap[viewId];
    if (!view) return null;
    const requestParams = getControlOptionQueryParams({
      view,
      field: viewField,
      curWidget: widget,
      widgetMap,
    });

    if (!requestParams) {
      return null;
    }
    let widgetData;
    try {
      if (executeToken && renderMode !== 'read') {
        const { data } = await request<ChartDataset>({
          method: 'POST',
          url: `share/execute`,
          params: {
            executeToken: executeToken?.token,
            password: executeToken?.password,
          },
          data: requestParams,
        });
        widgetData = { ...data, id: widget.id };
        dispatch(boardActions.setWidgetData(widgetData as WidgetData));
      } else {
        const { data } = await request<WidgetData>({
          method: 'POST',
          url: `data-provider/execute`,
          data: requestParams,
        });
        widgetData = { ...data, id: widget.id };
        dispatch(boardActions.setWidgetData(widgetData as WidgetData));
      }
      dispatch(
        boardActions.setWidgetErrInfo({
          boardId,
          widgetId,
          errInfo: undefined,
        }),
      );
    } catch (error) {
      dispatch(
        boardActions.setWidgetErrInfo({
          boardId,
          widgetId,
          errInfo: getErrorMessage(error),
        }),
      );
    }
    dispatch(
      boardActions.addFetchedItem({
        boardId,
        widgetId,
      }),
    );
    return null;
  },
);

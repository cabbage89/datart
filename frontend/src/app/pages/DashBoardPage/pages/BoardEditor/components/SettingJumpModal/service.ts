import { Widget } from 'app/pages/DashBoardPage/pages/Board/slice/types';
import { VizType } from 'app/pages/MainPage/pages/VizPage/slice/types';
import { ChartConfig, ChartDataSectionType } from 'app/types/ChartConfig';
import { ChartDataViewFieldType } from 'app/types/ChartDataView';
import { getColumnRenderName } from 'app/utils/chartHelper';
import { request } from 'utils/request';
import { errorHandle } from 'utils/utils';
import { ControlOptionItem } from './types';
const FILTER_MENU = [ChartDataViewFieldType.STRING];
const computedDashboardControllers = (data): ControlOptionItem[] => {
  const widgets = data?.widgets || [];
  widgets.forEach(item => {
    item.config = item.config ? JSON.parse(item.config) : undefined;
  });
  const filterWidgets = widgets.filter((v: Widget) => {
    const _isFilter = v?.config?.type === 'controller';
    // TODO fix about jump xld
    // isDateOrStr = FILTER_MENU.includes(v?.config?.content?.fieldValueType);
    // return _isFilter && isDateOrStr;
    return _isFilter;
  });
  const filterOptions = filterWidgets.map(v => ({
    label: v?.config?.name,
    value: v?.id,
    filterType: v?.config?.content?.fieldValueType,
  }));
  return filterOptions;
};
// TODO fix about jump
export const fetchDashboardControllers = async (id: string) => {
  const { data } = await request<any>(`/viz/dashboards/${id}`);
  return computedDashboardControllers(data);
};
const computedDataChartFilters = data => {
  if (data?.config) {
    data.config = JSON.parse(data.config);
    const chartConfig = data?.config?.chartConfig as ChartConfig;
    const newFilters = (chartConfig?.datas || [])
      .filter(c => c.type === ChartDataSectionType.FILTER)
      .flatMap(c => c.rows || [])
      .filter(item => FILTER_MENU.includes(item.type));
    const options = newFilters.map(v => {
      const _label = getColumnRenderName(v);
      return {
        label: _label as string,
        value: v?.uid as string,
      };
    });
    return options;
  } else {
    return [];
  }
};
export const fetchDatachartFilters = async (id: string) => {
  try {
    const { data } = await request<any>(`/viz/datacharts/${id}`);
    return computedDataChartFilters(data);
  } catch (error) {
    errorHandle(error);
    throw error;
  }
};
export const fetchGlobalControllerOptions = async (
  id: string,
  relType: VizType,
) => {
  if (relType === 'DASHBOARD') {
    const res1 = await fetchDashboardControllers(id);
    return res1;
  } else if (relType === 'DATACHART') {
    const res2 = await fetchDatachartFilters(id);
    return res2;
  } else {
    return [];
  }
};

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

import {
  ValueOptionType,
  ValueOptionTypes,
} from 'app/pages/DashBoardPage/constants';
import {
  DEFAULT_VALUE_DATE_FORMAT,
  VariableValueTypes,
} from 'app/pages/MainPage/pages/VariablePage/constants';
import {
  ChartDataViewFieldCategory,
  ChartDataViewFieldType,
} from 'app/types/ChartDataView';
import {
  ControllerFacadeTypes,
  ControllerFacadeTypes as Opt,
  TimeFilterValueCategory,
} from 'app/types/FilterControlPanel';
import moment, { Moment } from 'moment';
import { FilterSqlOperator } from '../../../../../../../globalConstants';
import {
  DateControllerTypes,
  NumericalControllerTypes,
  RangeControlTypes,
} from './constants';
import { ControllerConfig, PickerType } from './types';

export const getStringFacadeOptions = (type: ValueOptionType) => {
  switch (type) {
    case 'common':
      return [
        Opt.MultiDropdownList,
        Opt.DropdownList,
        Opt.RadioGroup,
        // Opt.Tree,
      ];
    case 'custom':
      return [Opt.MultiDropdownList, Opt.DropdownList, Opt.RadioGroup];
    default:
      return [];
  }
};

export const getNumberFacadeOptions = (
  category: ChartDataViewFieldCategory,
) => {
  switch (category) {
    case ChartDataViewFieldCategory.Field:
      // return [Opt.RangeValue, Opt.Slider, Opt.Value];
      return [Opt.Slider, Opt.Value];
    case ChartDataViewFieldCategory.Variable:
      return [Opt.Value];
    default:
      return [Opt.Slider, Opt.Value];
  }
};
export const getDateFacadeOptions = (category: ChartDataViewFieldCategory) => {
  switch (category) {
    case ChartDataViewFieldCategory.Field:
      return [Opt.RangeTime];
    case ChartDataViewFieldCategory.Variable:
      return [Opt.Time];
    default:
      return [Opt.Time];
  }
};
// 展示前处理
export const preformatControlConfig = (
  preConfig: ControllerConfig,
  controllerType: ControllerFacadeTypes,
) => {
  let config = preConfig;
  if (DateControllerTypes.includes(controllerType)) {
    config = formatControlDateToMoment(JSON.parse(JSON.stringify(config)));
  }
  return config;
};
// 设置后处理
export const postControlConfig = (
  config: ControllerConfig,
  controllerType: ControllerFacadeTypes,
) => {
  if (config.valueOptions.length > 0) {
    config.controllerValues = config.valueOptions
      .filter(ele => ele.isSelected)
      .map(ele => ele.key);
  }

  if (DateControllerTypes.includes(controllerType)) {
    config = formatControlDateToStr(config);
  }
  if (!Array.isArray(config.controllerValues)) {
    config.controllerValues = [config.controllerValues];
  }

  return config;
};
export const formatControlDateToMoment = (config: ControllerConfig) => {
  if (config.controllerDate) {
    const filterDate = config.controllerDate;
    if (filterDate.startTime && filterDate.startTime.exactValue) {
      if (typeof filterDate.startTime.exactValue === 'string') {
        let exactTime = filterDate.startTime.exactValue;
        let newExactTime = moment(exactTime, DEFAULT_VALUE_DATE_FORMAT);
        config.controllerDate.startTime.exactValue = newExactTime;
      }
    }
    if (filterDate.endTime && filterDate.endTime.exactValue) {
      if (typeof filterDate.endTime.exactValue === 'string') {
        let exactTime = filterDate.endTime.exactValue;
        let newExactTime = moment(exactTime, DEFAULT_VALUE_DATE_FORMAT);
        config.controllerDate.endTime!.exactValue = newExactTime;
      }
    }
  }
  return config;
};

export const formatControlDateToStr = (config: ControllerConfig) => {
  if (config.controllerDate) {
    const filterDate = config.controllerDate;
    if (filterDate.startTime && filterDate.startTime.exactValue) {
      if ((filterDate.startTime.exactValue as Moment).format) {
        let exactTime = filterDate.startTime.exactValue as Moment;
        let newExactTime = exactTime.format(DEFAULT_VALUE_DATE_FORMAT);
        config.controllerDate.startTime.exactValue = newExactTime;
      }
    }
    if (filterDate.endTime && filterDate.endTime.exactValue) {
      if ((filterDate.endTime.exactValue as Moment).format) {
        let exactTime = filterDate.endTime.exactValue as Moment;
        let newExactTime = exactTime.format(DEFAULT_VALUE_DATE_FORMAT);
        config.controllerDate.endTime!.exactValue = newExactTime;
      }
    }
  }
  return config;
};

export const getInitWidgetController = (
  type: ControllerFacadeTypes = ControllerFacadeTypes.DropdownList,
) => {
  switch (type) {
    case ControllerFacadeTypes.MultiDropdownList:
      return getMultiDropdownListControllerConfig();
    case ControllerFacadeTypes.Time:
      return getTimeControllerConfig();
    case ControllerFacadeTypes.RangeTime:
      return getRangeTimeControllerConfig();
    case ControllerFacadeTypes.RangeValue:
      return getRangeValueControllerConfig();
    case ControllerFacadeTypes.RangeSlider:
      return getRangeSliderControllerConfig();
    case ControllerFacadeTypes.RadioGroup:
      return getRadioGroupControllerConfig();
    case ControllerFacadeTypes.CheckboxGroup:
      return getCheckboxGroupControllerConfig();
    case ControllerFacadeTypes.Slider:
      return getSliderControllerConfig();
    case ControllerFacadeTypes.DropdownList:
    default:
      return getInitControllerConfig();
  }
};
export const getInitControllerConfig = () => {
  const config: ControllerConfig = {
    valueOptionType: ValueOptionTypes.Common, //
    assistViewFields: [],
    visibility: {
      visibilityType: 'show',
    },
    required: false,
    canChangeSqlOperator: false,
    minValue: 1,
    maxValue: 2,
    sqlOperator: FilterSqlOperator.Equal,
    controllerValues: [],
    valueOptions: [],
  };
  return config;
};

export const getTimeControllerConfig = () => {
  const config = getInitControllerConfig();
  config.controllerDate = {
    pickerType: 'date',
    startTime: {
      relativeOrExact: TimeFilterValueCategory.Exact,
      exactValue: null,
    },
  };
  return config;
};
export const getRangeTimeControllerConfig = () => {
  const config = getInitControllerConfig();
  config.sqlOperator = FilterSqlOperator.Between;
  config.controllerDate = {
    pickerType: 'date',
    startTime: {
      relativeOrExact: TimeFilterValueCategory.Exact,
      exactValue: null,
    },
    endTime: {
      relativeOrExact: TimeFilterValueCategory.Exact,
      exactValue: null,
    },
  };
  return config;
};
export const getMultiDropdownListControllerConfig = () => {
  const config = getInitControllerConfig();
  config.sqlOperator = FilterSqlOperator.In;
  return config;
};
export const getCheckboxGroupControllerConfig = () => {
  const config = getInitControllerConfig();
  config.sqlOperator = FilterSqlOperator.In;
  return config;
};
export const getRadioGroupControllerConfig = () => {
  const config = getInitControllerConfig();
  config.sqlOperator = FilterSqlOperator.Equal;
  config.radioButtonType = 'default';
  return config;
};
export const getSliderControllerConfig = () => {
  const config = getInitControllerConfig();
  config.sqlOperator = FilterSqlOperator.Equal;
  config.minValue = 1;
  config.maxValue = 100;
  config.controllerValues = [1];
  config.sliderConfig = {
    step: 1,
    range: false,
    vertical: false,
    showMarks: false,
  };
  return config;
};
export const getRangeSliderControllerConfig = () => {
  const config = getInitControllerConfig();
  config.sqlOperator = FilterSqlOperator.Between;
  config.minValue = 1;
  config.maxValue = 100;
  config.sliderConfig = {
    step: 1,
    range: true,
    vertical: false,
    showMarks: false,
  };
  return config;
};

export const getRangeValueControllerConfig = () => {
  const config = getInitControllerConfig();
  config.sqlOperator = FilterSqlOperator.Between;
  return config;
};

export const filterValueTypeByControl = (
  controlType: ControllerFacadeTypes,
  valueType: any,
) => {
  if (NumericalControllerTypes.includes(controlType)) {
    return [VariableValueTypes.Number, ChartDataViewFieldType.NUMERIC].includes(
      valueType,
    );
  }
  if (DateControllerTypes.includes(controlType)) {
    return [VariableValueTypes.Date, ChartDataViewFieldType.DATE].includes(
      valueType,
    );
  }
  return true;
};

export const formatDateByPickType = (
  pickerType: PickerType,
  momentTime: Moment,
) => {
  const formatTemp = DEFAULT_VALUE_DATE_FORMAT;
  if (!momentTime) {
    return null;
  }

  switch (pickerType) {
    case 'dateTime':
      return momentTime.format(formatTemp);
    case 'date':
      return momentTime.startOf('day').format(formatTemp);
    case 'week':
      let year = String(momentTime.year());
      let week = String(momentTime.week() - 1);
      return moment(year).add(week, 'weeks').startOf('week').format(formatTemp);
    case 'quarter':
    case 'month':
      return momentTime.startOf('month').format(formatTemp);
    case 'year':
      return momentTime.startOf('year').format(formatTemp);
    default:
      return null;
  }
};

export const isRangeTypeController = (type: ControllerFacadeTypes) => {
  return RangeControlTypes.includes(type);
};

export const rangeNumberValidator = async (_, values: any[]) => {
  if (!values?.[0] && !values?.[1]) {
  }
  function hasValue(value) {
    if (value === 0) {
      return true;
    }
    return !!value;
  }
  const startHasValue = hasValue(values?.[0]);
  const endHasValue = hasValue(values?.[1]);
  if (!startHasValue && !endHasValue) {
    return Promise.resolve(values);
  }
  if (!startHasValue && endHasValue) {
    return Promise.reject(new Error('请填写 起始值'));
  }
  if (startHasValue && !endHasValue) {
    return Promise.reject(new Error('请填写 结束值'));
  }
  if (values?.[0] - values?.[1] > 0) {
    return Promise.reject(new Error(' 起始值 不该小于 结束值'));
  }
  return Promise.resolve(values);
};

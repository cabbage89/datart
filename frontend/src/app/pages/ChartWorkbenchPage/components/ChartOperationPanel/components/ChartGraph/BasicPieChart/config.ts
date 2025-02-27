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

import { ChartConfig } from 'app/types/ChartConfig';

const config: ChartConfig = {
  datas: [
    {
      label: 'dimension',
      key: 'dimension',
      required: true,
      type: 'group',
      limit: [0, 1],
      actions: {
        NUMERIC: ['alias', 'colorize', 'sortable'],
        STRING: ['alias', 'colorize', 'sortable'],
      },
    },
    {
      label: 'metrics',
      key: 'metrics',
      required: true,
      type: 'aggregate',
      limit: [1, 999],
    },
    {
      label: 'filter',
      key: 'filter',
      type: 'filter',
      allowSameField: true,
    },
    {
      label: 'info',
      key: 'info',
      type: 'info',
    },
  ],
  styles: [
    {
      label: 'label.title',
      key: 'label',
      comType: 'group',
      rows: [
        {
          label: 'label.showLabel',
          key: 'showLabel',
          default: true,
          comType: 'checkbox',
        },
        {
          label: 'label.position',
          key: 'position',
          comType: 'select',
          default: 'outside',
          options: {
            items: [
              { label: '外侧', value: 'outside' },
              { label: '内部', value: 'inside' },
              { label: '中心', value: 'center' },
            ],
          },
        },
        {
          label: 'font',
          key: 'font',
          comType: 'font',
          default: {
            fontFamily: 'PingFang SC',
            fontSize: '12',
            fontWeight: 'normal',
            fontStyle: 'normal',
            color: '#495057',
          },
        },
        {
          label: 'label.showName',
          key: 'showName',
          default: true,
          comType: 'checkbox',
        },
        {
          label: 'label.showValue',
          key: 'showValue',
          default: false,
          comType: 'checkbox',
        },
        {
          label: 'label.showPercent',
          key: 'showPercent',
          default: true,
          comType: 'checkbox',
        },
      ],
    },
    {
      label: 'legend.title',
      key: 'legend',
      comType: 'group',
      rows: [
        {
          label: 'legend.showLegend',
          key: 'showLegend',
          default: true,
          comType: 'checkbox',
        },
        {
          label: 'legend.type',
          key: 'type',
          comType: 'select',
          default: 'scroll',
          options: {
            items: [
              { label: '普通', value: 'plain' },
              { label: '滚动', value: 'scroll' },
            ],
          },
        },
        {
          label: 'legend.selectAll',
          key: 'selectAll',
          default: true,
          comType: 'checkbox',
        },
        {
          label: 'legend.position',
          key: 'position',
          comType: 'select',
          default: 'right',
          options: {
            items: [
              { label: '右', value: 'right' },
              { label: '上', value: 'top' },
              { label: '下', value: 'bottom' },
              { label: '左', value: 'left' },
            ],
          },
        },
        {
          label: 'font',
          key: 'font',
          comType: 'font',
          default: {
            fontFamily: 'PingFang SC',
            fontSize: '12',
            fontWeight: 'normal',
            fontStyle: 'normal',
            color: '#495057',
          },
        },
      ],
    },
    {
      label: 'margin.title',
      key: 'margin',
      comType: 'group',
      rows: [
        {
          label: 'margin.containLabel',
          key: 'containLabel',
          default: true,
          comType: 'checkbox',
        },
        {
          label: 'margin.left',
          key: 'marginLeft',
          default: '5%',
          comType: 'marginWidth',
        },
        {
          label: 'margin.right',
          key: 'marginRight',
          default: '5%',
          comType: 'marginWidth',
        },
        {
          label: 'margin.top',
          key: 'marginTop',
          default: '5%',
          comType: 'marginWidth',
        },
        {
          label: 'margin.bottom',
          key: 'marginBottom',
          default: '5%',
          comType: 'marginWidth',
        },
      ],
    },
  ],
  settings: [
    {
      label: 'paging.title',
      key: 'paging',
      comType: 'group',
      rows: [
        {
          label: 'paging.pageSize',
          key: 'pageSize',
          default: 1000,
          comType: 'inputNumber',
          options: {
            needRefresh: true,
            step: 1,
            min: 0,
          },
        },
      ],
    },
  ],
  i18ns: [
    {
      lang: 'zh-CN',
      translation: {
        section: {
          legend: '图例',
          detail: '详细信息',
        },
        common: {
          showLabel: '显示标签',
          rotate: '旋转角度',
          position: '位置',
        },
        pie: {
          title: '饼图',
          circle: '环状',
          roseType: '南丁格尔玫瑰',
        },
        label: {
          title: '标签',
          showLabel: '显示标签',
          position: '位置',
          showName: '维度值',
          showPercent: '百分比',
          showValue: '指标值',
        },
        legend: {
          title: '图例',
          showLegend: '显示图例',
          type: '图例类型',
          selectAll: '图例全选',
          position: '图例位置',
        },
        reference: {
          title: '参考线',
          open: '点击参考线配置',
        },
        tooltip: {
          title: '提示信息',
          showPercentage: '增加百分比显示',
        },
      },
    },
    {
      lang: 'en-US',
      translation: {
        section: {
          legend: 'Legend',
          detail: 'Detail',
        },
        common: {
          showLabel: 'Show Label',
          rotate: 'Rotate',
          position: 'Position',
        },
        pie: {
          title: 'Pie',
          circle: 'Circle',
          roseType: 'Rose',
        },
        label: {
          title: 'Label',
          showLabel: 'Show Label',
          position: 'Position',
          showName: 'Show Name',
          showPercent: 'Show Percentage',
          showValue: 'Show Value',
        },
        legend: {
          title: 'Legend',
          showLegend: 'Show Legend',
          type: 'Type',
          selectAll: 'Select All',
          position: 'Position',
        },
        reference: {
          title: 'Reference',
          open: 'Open',
        },
        tooltip: {
          title: 'Tooltip',
          showPercentage: 'Show Percentage',
        },
      },
    },
  ],
};

export default config;

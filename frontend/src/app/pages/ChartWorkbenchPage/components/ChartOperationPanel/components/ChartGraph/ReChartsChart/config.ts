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
      actions: ['sortable', 'alias'],
    },
    {
      label: 'metrics',
      key: 'metrics',
      rows: [],
      actions: ['format', 'aggregate'],
    },
  ],
  styles: [
    {
      label: 'label',
      key: 'label',
      comType: 'group',
      rows: [
        {
          label: 'showLabel',
          key: 'showLabel',
          default: false,
          comType: 'checkbox',
        },
        {
          label: 'showLabelBySwitch',
          key: 'showLabelBySwitch',
          default: true,
          comType: 'switch',
          watcher: {
            deps: ['showLabel'],
            action: props => {
              return {
                comType: props.showLabel ? 'checkbox' : 'switch',
                disabled: props.showLabel,
              };
            },
          },
        },
        {
          label: 'showDataColumns',
          key: 'dataColumns',
          comType: 'select',
          options: {
            getItems: cols => {
              const sections = (cols || []).filter(col =>
                ['metrics', 'dimension'].includes(col.key),
              );
              const columns = sections.reduce(
                (acc, cur) => acc.concat(cur.rows || []),
                [],
              );
              return columns.map(c => ({
                key: c.uid,
                value: c.uid,
                label:
                  c.label || c.aggregate
                    ? `${c.aggregate}(${c.colName})`
                    : c.colName,
              }));
            },
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
            color: 'black',
          },
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
        label: '标签',
        showLabel: '显示标签',
        showLabelBySwitch: '显示标签2',
        showLabelByInput: '显示标签3',
        showLabelWithSelect: '显示标签4',
        fontFamily: '字体',
        fontSize: '字体大小',
        fontColor: '字体颜色',
        rotateLabel: '旋转标签',
        showDataColumns: '选择数据列',
        legend: {
          label: '图例',
          showLabel: '图例-显示标签',
          showLabel2: '图例-显示标签2',
        },
      },
    },
    {
      lang: 'en-US',
      translation: {
        label: 'Label',
        showLabel: 'Show Label',
        showLabelBySwitch: 'Show Lable Switch',
        showLabelWithInput: 'Show Label Input',
        showLabelWithSelect: 'Show Label Select',
        fontFamily: 'Font Family',
        fontSize: 'Font Size',
        fontColor: 'Font Color',
        rotateLabel: 'Rotate Label',
        showDataColumns: 'Show Data Columns',
        legend: {
          label: 'Legend',
          showLabel: 'Show Label',
        },
      },
    },
  ],
};

export default config;

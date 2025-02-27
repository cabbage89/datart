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

import { ChartConfig, ChartDataSectionType } from 'app/types/ChartConfig';
import { curry, pipe } from 'utils/object';
import {
  isUnderUpperBound,
  mergeChartStyleConfigs,
  reachLowerBoundCount,
} from './chartHelper';

export const transferChartConfigs = (
  targetConfig?: ChartConfig,
  sourceConfig?: ChartConfig,
) => {
  if (!sourceConfig || !targetConfig) {
    return targetConfig || sourceConfig;
  }
  return pipe(
    transferChartDataConfig,
    transferChartStyleConfig,
    transferChartSettingConfig,
  )(targetConfig, sourceConfig);
};

const transferChartStyleConfig = (
  targetConfig?: ChartConfig,
  sourceConfig?: ChartConfig,
): ChartConfig => {
  if (!targetConfig) {
    return sourceConfig!;
  }
  targetConfig.styles = mergeChartStyleConfigs(
    targetConfig?.styles,
    sourceConfig?.styles,
  );
  return targetConfig;
};

const transferChartSettingConfig = (
  targetConfig?: ChartConfig,
  sourceConfig?: ChartConfig,
): ChartConfig => {
  if (!targetConfig) {
    return sourceConfig!;
  }
  targetConfig.settings = mergeChartStyleConfigs(
    targetConfig?.settings,
    sourceConfig?.settings,
  );
  return targetConfig;
};

export const transferChartDataConfig = (
  targetConfig?: ChartConfig,
  sourceConfig?: ChartConfig,
): ChartConfig => {
  return pipe(
    ...[
      ChartDataSectionType.GROUP,
      ChartDataSectionType.AGGREGATE,
      ChartDataSectionType.COLOR,
      ChartDataSectionType.INFO,
      ChartDataSectionType.MIXED,
      ChartDataSectionType.SIZE,
      ChartDataSectionType.FILTER,
    ].map(type => curry(transferDataConfigImpl)(type)),
  )(targetConfig, sourceConfig);
};

const transferDataConfigImpl = (
  sectionType: ChartDataSectionType,
  targetConfig?: ChartConfig,
  sourceConfig?: ChartConfig,
): ChartConfig => {
  const targetDataConfigs = targetConfig?.datas || [];
  const sourceDataConfigs = sourceConfig?.datas || [];
  const sourceSectionConfigRows = sourceDataConfigs
    .filter(c => c.type === sectionType)
    .flatMap(config => config.rows || []);
  const targetSectionConfigs = targetDataConfigs?.filter(
    c => c.type === sectionType,
  );
  if (!targetSectionConfigs.length) {
    return targetConfig!;
  }

  while (Boolean(sourceSectionConfigRows?.length)) {
    const row = sourceSectionConfigRows.shift();
    const minimalRowConfig = [...targetSectionConfigs]
      .filter(section => {
        return isUnderUpperBound(
          section?.limit,
          (section?.rows || []).length + 1,
        );
      })
      .sort((a, b) => {
        if (
          reachLowerBoundCount(a?.limit, a?.rows?.length) !==
          reachLowerBoundCount(b?.limit, b?.rows?.length)
        ) {
          return (
            reachLowerBoundCount(b?.limit, b?.rows?.length) -
            reachLowerBoundCount(a?.limit, a?.rows?.length)
          );
        }
        return (a?.rows?.length || 0) - (b?.rows?.length || 0);
      })?.[0];
    if (minimalRowConfig && row) {
      minimalRowConfig.rows = (minimalRowConfig.rows || []).concat([row]);
    }
  }
  return targetConfig!;
};

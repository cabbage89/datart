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
import { ControlOutlined } from '@ant-design/icons';
import { Dropdown, Menu } from 'antd';
import useI18NPrefix from 'app/hooks/useI18NPrefix';
import { BoardConfigContext } from 'app/pages/DashBoardPage/contexts/BoardConfigContext';
import { WidgetType } from 'app/pages/DashBoardPage/pages/Board/slice/types';
import { ControllerFacadeTypes } from 'app/types/FilterControlPanel';
import React, { useContext } from 'react';
import { useDispatch } from 'react-redux';
import { G60 } from 'styles/StyleConstants';
import { addControllerAction } from '../../../slice/actions/controlActions';
import { BoardToolBarContext } from '../context/BoardToolBarContext';
import { WithTipButton } from '../ToolBarItem';
export interface AddControlBtnProps {}
export interface ButtonItemType<T> {
  name?: string;
  icon: any;
  type: T;
  disabled?: boolean;
}
export const AddControlBtn: React.FC<AddControlBtnProps> = () => {
  const t = useI18NPrefix(`viz.board.action`);
  const tFilterName = useI18NPrefix(`viz.common.enum.controllerFacadeTypes`);
  const tType = useI18NPrefix(`viz.board.controlTypes`);
  const tWt = useI18NPrefix(`viz.widget.type`);
  const { boardId, boardType, showLabel } = useContext(BoardToolBarContext);
  const dispatch = useDispatch();
  const { config: boardConfig } = useContext(BoardConfigContext);
  const { hasQueryControl, hasResetControl } = boardConfig;
  const onAddControler = (info: { key: any }) => {
    dispatch(
      addControllerAction({
        type: info.key,
        boardId: boardId,
        boardType: boardType,
      }),
    );
  };
  const conventionalControllers: ButtonItemType<ControllerFacadeTypes>[] = [
    {
      icon: '',
      type: ControllerFacadeTypes.DropdownList,
    },
    {
      icon: '',
      type: ControllerFacadeTypes.MultiDropdownList,
    },
    {
      icon: '',
      type: ControllerFacadeTypes.RadioGroup,
    },
    {
      icon: '',
      type: ControllerFacadeTypes.CheckboxGroup,
    },
    {
      icon: '',
      type: ControllerFacadeTypes.Text,
    },
    // {
    //   name: '单选下拉树',
    //   icon: '',
    //   type: ControllerFacadeTypes.RadioGroup,
    //   disabled: false,
    // },
    // {
    //   name: '多选下拉树',
    //   icon: '',
    //   type: ControllerFacadeTypes.RadioGroup,
    //   disabled: false,
    // },
  ];
  const dateControllers: ButtonItemType<ControllerFacadeTypes>[] = [
    {
      icon: '',
      type: ControllerFacadeTypes.RangeTime,
    },
    {
      icon: '',
      type: ControllerFacadeTypes.Time,
    },
  ];
  const numericalControllers: ButtonItemType<ControllerFacadeTypes>[] = [
    {
      icon: '',
      type: ControllerFacadeTypes.RangeValue,
    },
    {
      icon: '',
      type: ControllerFacadeTypes.Value,
    },
    {
      icon: '',
      type: ControllerFacadeTypes.Slider,
    },
    // {
    //   name: '范围滑块',
    //   icon: '',
    //   type: ControllerFacadeTypes.RangeSlider,
    //   disabled: false,
    // },
  ];
  const buttonControllers: ButtonItemType<WidgetType>[] = [
    {
      icon: '',
      type: 'query',
      disabled: !!hasQueryControl,
    },
    {
      icon: '',
      type: 'reset',
      disabled: !!hasResetControl,
    },
  ];
  const renderTitle = (text: string) => {
    return <span style={{ color: G60, fontWeight: 500 }}>{text}</span>;
  };
  const controlerItems = (
    <Menu onClick={onAddControler}>
      <Menu.ItemGroup
        key="conventionalControllers"
        title={renderTitle(tType('common'))}
      >
        {conventionalControllers.map(({ icon, type }) => (
          <Menu.Item key={type} icon={icon}>
            {tFilterName(type)}
          </Menu.Item>
        ))}
      </Menu.ItemGroup>
      <Menu.ItemGroup key="dateControllers" title={renderTitle(tType('date'))}>
        {dateControllers.map(({ icon, type }) => (
          <Menu.Item key={type} icon={icon}>
            {tFilterName(type)}
          </Menu.Item>
        ))}
      </Menu.ItemGroup>
      <Menu.ItemGroup
        key="numericalControllers"
        title={renderTitle(tType('numeric'))}
      >
        {numericalControllers.map(({ icon, type }) => (
          <Menu.Item key={type} icon={icon}>
            {tFilterName(type)}
          </Menu.Item>
        ))}
      </Menu.ItemGroup>
      <Menu.ItemGroup
        key="buttonControllers"
        title={renderTitle(tType('button'))}
      >
        {buttonControllers.map(({ name, icon, type, disabled }) => (
          <Menu.Item key={type} icon={icon} disabled={disabled}>
            {tWt(type)}
          </Menu.Item>
        ))}
      </Menu.ItemGroup>
    </Menu>
  );
  return (
    <Dropdown
      overlay={controlerItems}
      placement="bottomLeft"
      trigger={['click']}
    >
      <WithTipButton
        icon={<ControlOutlined />}
        tip={t('controller')}
        boardId={boardId}
        boardType={boardType}
        label={showLabel ? '添加控制器' : ''}
      />
    </Dropdown>
  );
};
